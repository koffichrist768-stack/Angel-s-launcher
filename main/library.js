/**
 * library.js — Logique métier de la bibliothèque (ajout, suppression, scan, sessions).
 * Fonctions pures vis-à-vis d'Electron : elles ne touchent que l'objet Storage.
 */
const fs = require('fs');
const path = require('path');
const { scanFolder } = require('./services/scanner');
const { idsEnCours } = require('./services/launcher');
const covers = require('./services/covers');

/** État complet envoyé à l'interface (les jeux sont enrichis de `installed`). */
function getState(storage) {
  const d = storage.data;
  return {
    games: d.games.map(g => ({ ...g, installed: !!g.exePath && fs.existsSync(g.exePath) })),
    folders: d.folders,
    sessions: d.sessions.slice(0, 100),
    logs: d.logs,
    settings: d.settings,
    running: idsEnCours(),
    coverQueue: covers.enRecherche() // jeux dont la pochette est en cours de recherche
  };
}

/** Ajoute un jeu (refuse les doublons d'exécutable). */
function addGame(storage, p) {
  const name = String(p.name || '').trim();
  if (!name) return { ok: false, error: 'Le nom du jeu est obligatoire.' };
  if (!p.exePath) return { ok: false, error: 'Choisissez l\'exécutable du jeu.' };
  if (storage.data.games.some(g => g.exePath === p.exePath)) {
    return { ok: false, error: 'Ce jeu est déjà dans la bibliothèque.' };
  }
  const jeu = {
    id: storage.newId('g'), name, subtitle: String(p.subtitle || '').trim(),
    exePath: p.exePath, folder: p.folder || path.dirname(p.exePath),
    cover: p.cover || null, coverSource: p.cover ? 'manual' : null, coverCheckedAt: null,
    favorite: false, playtime: 0, lastPlayed: null,
    addedAt: Date.now(), sizeBytes: p.sizeBytes || 0, demo: !!p.demo
  };
  storage.data.games.push(jeu);
  storage.save();
  return { ok: true, game: jeu };
}

function removeGame(storage, id) {
  const cible = storage.data.games.find(g => g.id === id);
  if (cible) covers.supprimerFichier(storage.dir, cible.cover); // supprime aussi l'image téléchargée
  const avant = storage.data.games.length;
  storage.data.games = storage.data.games.filter(g => g.id !== id);
  storage.data.sessions = storage.data.sessions.filter(s => s.gameId !== id);
  storage.save();
  return { ok: storage.data.games.length < avant };
}

function updateGame(storage, id, patch) {
  const g = storage.data.games.find(x => x.id === id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  // Seuls ces champs sont modifiables depuis l'interface
  for (const k of ['name', 'subtitle', 'favorite']) if (k in patch) g[k] = patch[k];
  storage.save();
  return { ok: true };
}

/** Enregistre la fin d'une session de jeu. */
function recordSession(storage, id, secondes, debut) {
  const g = storage.data.games.find(x => x.id === id);
  if (!g) return;
  g.playtime += secondes;
  g.lastPlayed = Date.now();
  storage.data.sessions.unshift({ gameId: id, name: g.name, start: debut, end: Date.now(), seconds: secondes });
  storage.data.sessions = storage.data.sessions.slice(0, 200);
  storage.save();
}

/** Scanne un dossier surveillé et ajoute les nouveaux jeux. Retourne le nombre d'ajouts. */
function scanOne(storage, folder, declencheur = 'manuel') {
  if (!fs.existsSync(folder.path)) {
    storage.log('Dossier introuvable : ' + folder.path, 'error');
    return 0;
  }
  let ajoutes = 0;
  for (const j of scanFolder(folder.path)) {
    const r = addGame(storage, { ...j });
    if (r.ok) ajoutes++;
  }
  folder.lastScan = Date.now();
  storage.log(`Scan ${declencheur} de ${folder.path} : ${ajoutes} nouveau(x) jeu(x)`, ajoutes ? 'success' : 'info');
  storage.save();
  return ajoutes;
}

function scanAll(storage, declencheur = 'manuel') {
  return storage.data.folders.reduce((n, f) => n + scanOne(storage, f, declencheur), 0);
}

/** Jeux de démonstration (sans exécutable réel) pour tester l'interface. */
function loadDemo(storage) {
  const demo = [
    ['Cyberpunk 2077', 'Phantom Liberty', 142 * 3600, 68.4], ['Elden Ring', 'Shadow of the Erdtree', 188 * 3600, 49.2],
    ['Hades II', 'Early Access', 42 * 3600, 9.8], ['Starfield', '', 61 * 3600, 139.8],
    ['Baldur\'s Gate 3', 'Campagne Acte III', 94 * 3600, 122.4], ['Hollow Knight', '', 28 * 3600, 8.4]
  ];
  let n = 0;
  demo.forEach(([name, subtitle, playtime, go], i) => {
    const r = addGame(storage, { name, subtitle, exePath: `/demo/${name}.exe`, folder: '/demo', sizeBytes: go * 1e9, demo: true });
    if (r.ok) {
      Object.assign(r.game, { playtime, favorite: i < 3, lastPlayed: Date.now() - i * 86400000, addedAt: Date.now() - i * 3 * 86400000 });
      n++;
    }
  });
  storage.save();
  return n;
}

module.exports = { getState, addGame, removeGame, updateGame, recordSession, scanOne, scanAll, loadDemo };
