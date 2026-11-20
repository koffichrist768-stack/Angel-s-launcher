/**
 * covers.js — Gestion des pochettes : recherche en ligne (SteamGridDB, Steam), téléchargement, choix manuel, file d'attente.
 *
 * Sources : SteamGridDB (clé API gratuite, facultative) puis l'API publique du magasin Steam (aucune clé). Seul le NOM du jeu est envoyé.
 * Le module n'utilise pas Electron directement : le « fetch » est injecté (net.fetch en production,
 * un faux fetch dans les tests), ce qui le rend testable avec Node seul.
 */
const fs = require('fs');
const path = require('path');

/** Hôtes d'images Steam essayés tour à tour (les URL ont changé au fil du temps). */
const HOTES = [
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps',
  'https://cdn.akamai.steamstatic.com/steam/apps',
  'https://cdn.cloudflare.steamstatic.com/steam/apps'
];
/** Pochette verticale 600×900 d'abord ; à défaut, l'image d'en-tête (horizontale, rognée par la carte). */
const FICHIERS = ['library_600x900.jpg', 'header.jpg'];
const REESSAI_MS = 7 * 86400000; // un jeu introuvable n'est re-cherché automatiquement qu'après 7 jours

let ctx = null;          // { storage, diffuser, toast, fetchImpl }
const attente = [];      // ids de jeux en attente de recherche
let courant = null;      // id en cours de traitement
let actif = false;
let dernierAvertissement = 0; // évite d'afficher plusieurs fois « connexion indisponible »

/** Initialise le service avec ses dépendances. */
function init(c) { ctx = { fetchImpl: (...a) => fetch(...a), diffuser() {}, toast() {}, ...c }; }

// ======================= Nom → terme de recherche =======================

/** Normalise un titre pour la comparaison (minuscules, sans accents, sans apostrophes ni symboles). */
function normaliserTitre(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '').replace(/[™®©]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}
const MOTS_VIDES = new Set(['the', 'a', 'an', 'of', 'edition', 'complete', 'definitive', 'ultimate', 'goty', 'deluxe', 'remastered', 'digital', 'standard', 'game', 'year']);
const jetons = s => normaliserTitre(s).split(' ').filter(t => t && !MOTS_VIDES.has(t));

/** Nettoie un nom de dossier/jeu : « BaldursGate3_v1.2.0 » → « Baldurs Gate 3 ». */
function nettoyerNom(nom) {
  let s = String(nom || '').trim().replace(/\(.*?\)|\[.*?\]/g, ' ');
  const colle = !/\s/.test(s); // nom de type dossier (sans espaces) : on le « décolle »
  if (colle) s = s.replace(/_+/g, ' ');
  s = s.replace(/\bv?\d+(\.\d+){1,}\b/gi, ' '); // numéros de version
  if (colle) s = s.replace(/[._-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Za-z])(\d)/g, '$1 $2');
  return s.replace(/\s+/g, ' ').trim();
}

/** Similarité 0..1 entre deux titres. */
function similarite(a, b) {
  const na = normaliserTitre(a), nb = normaliserTitre(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const A = new Set(jetons(a)), B = new Set(jetons(b));
  if (!A.size || !B.size) return 0;
  const commun = [...A].filter(x => B.has(x)).length;
  const jaccard = commun / (A.size + B.size - commun);
  return (na.startsWith(nb) || nb.startsWith(na)) ? Math.max(jaccard, 0.85) : jaccard;
}

const PARASITES = /soundtrack|artbook|season pass|dlc|demo|beta|playtest|expansion/i;

/** Meilleur résultat pour un nom de jeu, ou null si rien d'assez proche (seuil 0,6). */
function meilleureCorrespondance(nom, resultats) {
  let best = null;
  for (const r of resultats) {
    let score = similarite(nom, r.name);
    if (PARASITES.test(r.name) && !PARASITES.test(nom)) score -= 0.25; // bande-son, DLC, démo…
    if (!best || score > best.score + 1e-9) best = { ...r, score };
  }
  return best && best.score >= 0.6 ? best : null;
}

// ======================= Réseau =======================

async function requete(url, ms = 10000, entetes = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await ctx.fetchImpl(url, { signal: ac.signal, headers: { 'User-Agent': "AngelsLauncher/1.0", ...entetes } }); }
  finally { clearTimeout(t); }
}

const erreurReseau = msg => Object.assign(new Error(msg), { reseau: true });

/** Recherche dans le magasin Steam (10 résultats maximum). */
async function rechercherSteam(terme) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(terme)}&l=french&cc=FR`;
  let res;
  try { res = await requete(url); } catch { throw erreurReseau('Connexion impossible (réseau indisponible ?)'); }
  if (!res.ok) throw Object.assign(new Error('Steam a répondu ' + res.status), { reseau: res.status >= 500 || res.status === 429 });
  const j = await res.json();
  return (j.items || []).filter(i => !i.type || i.type === 'app').map(i => ({ appid: i.id, name: i.name }));
}

/** Télécharge une image ; renvoie {buffer, ext} ou null (jette si le réseau est injoignable). */
async function telecharger(url, ms = 10000) {
  const r = await requete(url, ms);
  if (!r.ok) return null;
  const type = (r.headers.get('content-type') || '').toLowerCase();
  if (!type.startsWith('image/')) return null;
  const buffer = Buffer.from(await r.arrayBuffer());
  const ext = type.includes('png') ? '.png' : type.includes('webp') ? '.webp' : type.includes('gif') ? '.gif' : '.jpg';
  return buffer.length > 2000 ? { buffer, ext } : null;
}

/** Cherche la meilleure image disponible pour un appid. */
async function telechargerPochette(appid) {
  let echecs = 0, essais = 0;
  for (const f of FICHIERS) {
    for (const h of HOTES) {
      essais++;
      try { const img = await telecharger(`${h}/${appid}/${f}`); if (img) return img; }
      catch { echecs++; }
    }
  }
  // Dernier recours : l'API appdetails donne l'URL exacte de l'image d'en-tête
  try {
    const r = await requete(`https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`);
    if (r.ok) {
      const url = (await r.json())?.[appid]?.data?.header_image;
      if (url) { const img = await telecharger(url); if (img) return img; }
    }
  } catch { echecs++; }
  if (echecs >= essais) throw erreurReseau('Connexion impossible (réseau indisponible ?)');
  return null;
}


// ======================= SteamGridDB =======================
// API v2 : https://www.steamgriddb.com/api/v2 — clé API gratuite envoyée en « Authorization: Bearer <clé> ».
// La clé se génère sur https://www.steamgriddb.com/profile/preferences/api et se saisit dans Paramètres › Services en ligne.

const SGDB_API = 'https://www.steamgriddb.com/api/v2';
const SGDB_FORMATS = '600x900,342x482,660x930'; // formats « pochette verticale » (2:3)

const cleSGDB = () => String(ctx.storage.data.settings.steamgriddbKey || '').trim();
let dernierAvertissementCle = 0;

/** Seules les images hébergées par SteamGridDB, en HTTPS, sont téléchargées ou affichées. */
function urlSGDBValide(u) {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' && (x.hostname === 'steamgriddb.com' || x.hostname.endsWith('.steamgriddb.com'));
  } catch { return false; }
}

/** Appel authentifié de l'API ; les erreurs de clé portent `cle: true`, celles de réseau `reseau: true`. */
async function appelSGDB(chemin, cleForcee) {
  const cle = (cleForcee !== undefined ? String(cleForcee).trim() : cleSGDB());
  if (!cle) throw Object.assign(new Error('Clé API SteamGridDB manquante : ajoutez-la dans Paramètres › Services en ligne.'), { cle: true });
  let res;
  try { res = await requete(SGDB_API + chemin, 10000, { Authorization: 'Bearer ' + cle }); }
  catch { throw erreurReseau('Connexion impossible (réseau indisponible ?)'); }
  if (res.status === 401 || res.status === 403) throw Object.assign(new Error('Clé API SteamGridDB refusée : vérifiez-la dans Paramètres › Services en ligne.'), { cle: true });
  if (res.status === 404) return { data: [] }; // jeu inconnu de SteamGridDB
  if (!res.ok) throw Object.assign(new Error('SteamGridDB a répondu ' + res.status), { reseau: res.status >= 500 });
  return res.json();
}

/** Vérifie une clé API (celle saisie, enregistrée ou non) par une recherche d'essai. */
async function testerCle(cle) {
  const c = String(cle === undefined ? cleSGDB() : cle).trim();
  if (!c) return { ok: false, error: 'Aucune clé saisie.' };
  await appelSGDB('/search/autocomplete/zelda', c); // lève une erreur si la clé est refusée ou si le réseau est coupé
  return { ok: true };
}

/** Jeux de SteamGridDB correspondant au terme (10 maximum). */
async function rechercherSGDB(terme) {
  const t = String(terme || '').trim();
  if (!t) return [];
  const j = await appelSGDB('/search/autocomplete/' + encodeURIComponent(t));
  return (j.data || []).slice(0, 10).map(i => ({ sgdbId: i.id, name: i.name }));
}

/** Pochettes verticales d'un jeu SteamGridDB, les mieux notées d'abord (24 maximum). */
async function grillesSGDB(gameId) {
  if (!Number.isInteger(Number(gameId))) throw new Error('Identifiant SteamGridDB invalide.');
  const base = `/grids/game/${Number(gameId)}?types=static&nsfw=false&humor=false`;
  let liste = (await appelSGDB(`${base}&dimensions=${SGDB_FORMATS}`)).data || [];
  // À défaut de format standard, on accepte toute image plus haute que large
  if (!liste.length) liste = ((await appelSGDB(base)).data || []).filter(x => x.height > x.width);
  return liste.filter(x => urlSGDBValide(x.url))
    .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 24)
    .map(x => ({ id: x.id, url: x.url, thumb: urlSGDBValide(x.thumb) ? x.thumb : x.url, width: x.width, height: x.height, score: x.score || 0 }));
}

// ======================= Fichiers =======================

const dossierCovers = () => path.join(ctx.storage.dir, 'covers');

/** Supprime un fichier de pochette, uniquement s'il se trouve dans le dossier « covers » de l'application. */
function supprimerFichier(dirDonnees, chemin) {
  if (!chemin) return;
  const base = path.resolve(dirDonnees, 'covers') + path.sep;
  const cible = path.resolve(chemin);
  if (cible.startsWith(base)) { try { fs.unlinkSync(cible); } catch { /* déjà supprimé */ } }
}

const trouver = id => ctx.storage.data.games.find(g => g.id === id);

/** Écrit l'image dans « covers » (nom unique : évite le cache d'image), remplace l'ancienne et mémorise la source. */
function enregistrerPochette(g, img, source, titre) {
  fs.mkdirSync(dossierCovers(), { recursive: true });
  const dest = path.join(dossierCovers(), `${g.id}-${Date.now()}${img.ext}`);
  fs.writeFileSync(dest, img.buffer);
  supprimerFichier(ctx.storage.dir, g.cover);
  Object.assign(g, { cover: dest, coverSource: source, coverCheckedAt: Date.now(), coverTitle: titre || null });
  ctx.storage.save();
}

// ======================= Actions publiques =======================

/** Liste les résultats pour un jeu (ou un terme saisi à la main) ; `source` : 'steam' (défaut) ou 'sgdb' (SteamGridDB). */
async function chercher(id, terme, source = 'steam') {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  const q = (terme && terme.trim()) || nettoyerNom(g.name);
  const results = source === 'sgdb' ? await rechercherSGDB(q) : await rechercherSteam(q);
  return { ok: true, query: q, source, results };
}

/** Pochettes SteamGridDB proposées pour un jeu SteamGridDB choisi (miniatures + adresses des images). */
async function grilles(id, sgdbId) {
  if (!trouver(id)) return { ok: false, error: 'Jeu introuvable.' };
  return { ok: true, grids: await grillesSGDB(sgdbId) };
}

/** Télécharge et applique la pochette d'un appid Steam choisi. */
async function appliquer(id, appid, nomSteam = '') {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  const img = await telechargerPochette(appid);
  if (!img) {
    g.coverCheckedAt = Date.now(); ctx.storage.save();
    return { ok: false, error: 'Aucune image disponible pour ce titre.' };
  }
  enregistrerPochette(g, img, 'steam', nomSteam);
  return { ok: true, name: nomSteam };
}

/** Télécharge et applique une pochette SteamGridDB choisie (seules les adresses steamgriddb.com sont acceptées). */
async function appliquerGrille(id, grille, nom = '') {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  if (!grille || !urlSGDBValide(grille.url)) return { ok: false, error: 'Image refusée : adresse non reconnue.' };
  let img;
  try { img = await telecharger(grille.url, 30000); } catch { throw erreurReseau('Connexion impossible (réseau indisponible ?)'); }
  if (!img) return { ok: false, error: 'Téléchargement impossible pour cette image.' };
  enregistrerPochette(g, img, 'steamgriddb', nom);
  return { ok: true, name: nom };
}


/** Recherche automatique via SteamGridDB : meilleur jeu correspondant, puis pochette la mieux notée. null si rien. */
async function autoSGDB(g, propre) {
  let resultats = await rechercherSGDB(propre);
  if (!resultats.length && propre !== g.name) resultats = await rechercherSGDB(g.name);
  const choix = meilleureCorrespondance(propre, resultats);
  if (!choix) return null;
  const liste = await grillesSGDB(choix.sgdbId);
  if (!liste.length) return null;
  const r = await appliquerGrille(g.id, liste[0], choix.name);
  return r.ok ? r : null;
}

/** Recherche automatique : SteamGridDB d'abord (si une clé est saisie), puis Steam ; meilleure correspondance du nom. */
async function auto(id) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  const propre = nettoyerNom(g.name);
  if (cleSGDB()) {
    try { const r = await autoSGDB(g, propre); if (r) return r; }
    catch (e) {
      // Clé refusée : on prévient (au plus toutes les 5 min) ; toute autre panne → repli silencieux sur Steam
      if (e.cle && Date.now() - dernierAvertissementCle > 5 * 60 * 1000) { dernierAvertissementCle = Date.now(); ctx.toast(e.message, 'error'); }
    }
  }
  let resultats = await rechercherSteam(propre);
  if (!resultats.length && propre !== g.name) resultats = await rechercherSteam(g.name);
  const choix = meilleureCorrespondance(propre, resultats);
  if (!choix) {
    g.coverCheckedAt = Date.now(); ctx.storage.save(); // évite de re-chercher à chaque démarrage
    return { ok: false, error: 'Aucune pochette trouvée pour « ' + g.name + ' ».' };
  }
  return appliquer(id, choix.appid, choix.name);
}

/** Pochette choisie depuis un fichier local (déjà copié dans « covers » par la boîte de dialogue). */
function definirLocal(id, chemin) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  if (g.cover !== chemin) supprimerFichier(ctx.storage.dir, g.cover);
  Object.assign(g, { cover: chemin, coverSource: 'manual', coverTitle: null });
  ctx.storage.save();
  return { ok: true };
}

/** Retire la pochette et empêche toute recherche automatique ultérieure pour ce jeu. */
function retirer(id) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  supprimerFichier(ctx.storage.dir, g.cover);
  Object.assign(g, { cover: null, coverSource: 'none', coverTitle: null });
  ctx.storage.save();
  return { ok: true };
}

// ======================= File d'attente =======================

/** Un jeu est éligible à la recherche automatique s'il n'a pas de pochette et n'a pas été refusé/choisi à la main. */
const eligible = (g, force) => !g.cover && g.coverSource !== 'none' && g.coverSource !== 'manual'
  && (force || !g.coverCheckedAt || Date.now() - g.coverCheckedAt > REESSAI_MS);

/** Ids actuellement en cours de recherche (pour l'indicateur visuel). */
const enRecherche = () => (courant ? [courant, ...attente] : [...attente]);

const pause = ms => new Promise(r => setTimeout(r, ms));

async function traiter() {
  if (actif) return;
  actif = true;
  let trouvees = 0, total = 0, horsLigne = false;
  while (attente.length) {
    courant = attente.shift(); total++;
    ctx.diffuser();
    try { if ((await auto(courant)).ok) trouvees++; }
    catch (e) { if (e.reseau) { horsLigne = true; attente.length = 0; } } // hors-ligne : inutile d'insister
    courant = null;
    ctx.diffuser();
    if (attente.length) await pause(300); // on ménage le serveur
  }
  actif = false;
  if (horsLigne) {
    if (Date.now() - dernierAvertissement > 5 * 60 * 1000) { dernierAvertissement = Date.now(); ctx.toast('Recherche de pochettes impossible : connexion indisponible.', 'error'); }
  }
  else if (total) ctx.toast(`${trouvees} pochette(s) trouvée(s) sur ${total} jeu(x).`, trouvees ? 'success' : 'info');
}

function mettreEnFile(ids) {
  for (const id of ids) if (id !== courant && !attente.includes(id)) attente.push(id);
  traiter();
}

/** Met en file tous les jeux sans pochette. `force` ignore le délai de nouvel essai. Renvoie le nombre de jeux. */
function rechercherManquantes({ force = false } = {}) {
  const ids = ctx.storage.data.games.filter(g => eligible(g, force)).map(g => g.id);
  mettreEnFile(ids);
  return { ok: true, queued: ids.length };
}

module.exports = {
  init, testerCle, chercher, grilles, appliquer, appliquerGrille, auto, definirLocal, retirer, mettreEnFile, rechercherManquantes,
  enRecherche, supprimerFichier, nettoyerNom, normaliserTitre, similarite, meilleureCorrespondance
};
