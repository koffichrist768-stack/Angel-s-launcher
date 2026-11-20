/**
 * smoke.test.js — Test rapide des services principaux (sans Electron) : node tests/smoke.test.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { Storage } = require('../main/services/storage');
const { scanFolder } = require('../main/services/scanner');
const { listDisks } = require('../main/services/disks');
const lib = require('../main/library');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'angels-'));
const ext = process.platform === 'win32' ? '.exe' : '.sh';

// Faux dossier de jeux : 2 jeux + 1 désinstalleur à ignorer
fs.mkdirSync(path.join(tmp, 'jeux', 'Alpha', 'bin'), { recursive: true });
fs.mkdirSync(path.join(tmp, 'jeux', 'Beta'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'jeux', 'Alpha', 'bin', 'alpha' + ext), 'x'.repeat(500));
fs.writeFileSync(path.join(tmp, 'jeux', 'Alpha', 'unins000' + ext), 'x');
fs.writeFileSync(path.join(tmp, 'jeux', 'Beta', 'beta' + ext), 'x'.repeat(100));

const st = new Storage(path.join(tmp, 'data')); st.load();

assert.strictEqual(scanFolder(path.join(tmp, 'jeux')).length, 2, 'le scan doit trouver 2 jeux');

const f = { id: 'f1', name: 'jeux', path: path.join(tmp, 'jeux') };
st.data.folders.push(f);
assert.strictEqual(lib.scanOne(st, f), 2, 'ajout de 2 jeux');
assert.strictEqual(lib.scanOne(st, f), 0, 'pas de doublon au second scan');

const r = lib.addGame(st, { name: 'Manuel', exePath: '/x/manuel.exe' });
assert.ok(r.ok && lib.addGame(st, { name: 'Manuel', exePath: '/x/manuel.exe' }).ok === false, 'doublon refusé');
assert.strictEqual(lib.addGame(st, { name: '', exePath: '/y' }).ok, false, 'nom obligatoire');

lib.recordSession(st, r.game.id, 3600, Date.now());
assert.strictEqual(st.data.games.find(g => g.id === r.game.id).playtime, 3600);
assert.ok(lib.removeGame(st, r.game.id).ok);

st.flush();
const st2 = new Storage(path.join(tmp, 'data')); st2.load();
assert.strictEqual(st2.data.games.length, 2, 'persistance sur disque');

assert.ok(Array.isArray(listDisks()));
// ---------- Pochettes (réseau simulé) ----------
const covers = require('../main/services/covers');
(async () => {
  assert.strictEqual(covers.nettoyerNom('BaldursGate3_v1.2.0'), 'Baldurs Gate 3', 'nettoyage du nom de dossier');
  assert.strictEqual(covers.nettoyerNom('Hades II'), 'Hades II', 'un nom normal reste intact');
  const res = [{ appid: 2, name: 'ELDEN RING Soundtrack' }, { appid: 1, name: 'ELDEN RING' }];
  assert.strictEqual(covers.meilleureCorrespondance('Elden Ring', res).appid, 1, 'bande-son écartée');
  assert.strictEqual(covers.meilleureCorrespondance('Baldurs Gate 3', [{ appid: 9, name: "Baldur's Gate 3" }]).appid, 9, 'apostrophes ignorées');
  assert.strictEqual(covers.meilleureCorrespondance('Zzz', [{ appid: 1, name: 'Totalement autre chose' }]), null, 'pas de faux positif');

  const json = o => ({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => o });
  const image = n => ({ ok: true, status: 200, headers: { get: () => 'image/jpeg' }, arrayBuffer: async () => new Uint8Array(n).buffer });
  const faux = routes => async url => { for (const [m, rep] of routes) if (url.includes(m)) return rep(url); throw new Error('hors-ligne'); };
  const dir = path.join(tmp, 'data2'); const s3 = new Storage(dir); s3.load();
  const g1 = lib.addGame(s3, { name: 'Elden Ring', exePath: '/a/er.exe' }).game;
  const g2 = lib.addGame(s3, { name: 'Jeu Inconnu XYZ', exePath: '/a/x.exe' }).game;

  // 1) trouvé + téléchargé
  covers.init({ storage: s3, fetchImpl: faux([['storesearch', () => json({ items: [{ id: 1245620, type: 'app', name: 'ELDEN RING' }] })], ['/1245620/library_600x900.jpg', () => image(5000)]]) });
  let r = await covers.auto(g1.id);
  assert.ok(r.ok && fs.existsSync(g1.cover) && g1.coverSource === 'steam', 'pochette téléchargée');
  const ancien = g1.cover;
  // 2) repli sur header.jpg quand la pochette verticale n'existe pas
  covers.init({ storage: s3, fetchImpl: faux([['storesearch', () => json({ items: [{ id: 5, type: 'app', name: 'ELDEN RING' }] })], ['/5/header.jpg', () => image(4000)]]) });
  r = await covers.auto(g1.id);
  assert.ok(r.ok && !fs.existsSync(ancien), 'ancienne image supprimée au remplacement');
  // 3) introuvable → date de vérification enregistrée
  covers.init({ storage: s3, fetchImpl: faux([['storesearch', () => json({ items: [] })]]) });
  r = await covers.auto(g2.id);
  assert.ok(!r.ok && g2.coverCheckedAt, 'introuvable mémorisé');
  // 4) hors-ligne → erreur réseau, rien de mémorisé (nouvel essai possible)
  const g3 = lib.addGame(s3, { name: 'Autre', exePath: '/a/o.exe' }).game;
  covers.init({ storage: s3, fetchImpl: faux([]) });
  await assert.rejects(() => covers.auto(g3.id), e => e.reseau === true);
  assert.ok(!g3.coverCheckedAt, 'hors-ligne ne marque pas le jeu comme vérifié');
  // 5) retrait : plus de recherche automatique pour ce jeu
  covers.retirer(g1.id);
  assert.ok(g1.cover === null && g1.coverSource === 'none');
  assert.strictEqual(covers.rechercherManquantes({ force: true }).queued, 2, 'g1 (retirée) exclue, g2+g3 éligibles');

  // ---------- SteamGridDB ----------
  const dir4 = path.join(tmp, 'data4'); const s4 = new Storage(dir4); s4.load();
  const g4 = lib.addGame(s4, { name: 'Hades II', exePath: '/a/h2.exe' }).game;
  const appels = [];
  const fauxSGDB = async (url, opts = {}) => {
    appels.push({ url, auth: (opts.headers || {}).Authorization });
    if (url.includes('/search/autocomplete/')) return json({ success: true, data: [{ id: 77, name: 'Hades II' }, { id: 78, name: 'Hades II Soundtrack' }] });
    if (url.includes('/grids/game/77') && url.includes('dimensions=')) return json({ success: true, data: [
      { id: 1, score: 1, url: 'https://cdn2.steamgriddb.com/grid/a.png', thumb: 'https://cdn2.steamgriddb.com/thumb/a.jpg', width: 600, height: 900 },
      { id: 2, score: 9, url: 'https://cdn2.steamgriddb.com/grid/b.png', thumb: 'https://cdn2.steamgriddb.com/thumb/b.jpg', width: 600, height: 900 },
      { id: 3, score: 99, url: 'https://evil.example.com/c.png', thumb: 'https://evil.example.com/c.jpg', width: 600, height: 900 }] });
    if (url === 'https://cdn2.steamgriddb.com/grid/b.png') return { ok: true, status: 200, headers: { get: () => 'image/png' }, arrayBuffer: async () => new Uint8Array(6000).buffer };
    if (url.includes('storesearch')) return json({ items: [] });
    throw new Error('hors-ligne');
  };
  // 1) sans clé : la recherche SteamGridDB est refusée avec un message clair, sans appel réseau
  covers.init({ storage: s4, fetchImpl: fauxSGDB });
  await assert.rejects(() => covers.chercher(g4.id, 'Hades', 'sgdb'), e => /Clé API/.test(e.message) && e.cle === true);
  assert.strictEqual(appels.length, 0, 'aucune requête sans clé');
  // 2) avec clé : recherche + liste des pochettes triées par note, adresses étrangères écartées
  s4.data.settings.steamgriddbKey = 'cle-de-test';
  r = await covers.chercher(g4.id, 'Hades', 'sgdb');
  assert.ok(r.ok && r.results[0].sgdbId === 77 && r.source === 'sgdb');
  assert.strictEqual(appels[0].auth, 'Bearer cle-de-test', 'clé envoyée en Bearer');
  const gr = await covers.grilles(g4.id, 77);
  assert.deepStrictEqual(gr.grids.map(x => x.id), [2, 1], 'tri par note, hôte étranger écarté');
  // 3) application d'une pochette choisie + refus d'une adresse étrangère
  r = await covers.appliquerGrille(g4.id, { url: gr.grids[0].url }, 'Hades II');
  assert.ok(r.ok && g4.coverSource === 'steamgriddb' && g4.cover.endsWith('.png') && fs.existsSync(g4.cover), 'pochette SteamGridDB enregistrée');
  assert.strictEqual((await covers.appliquerGrille(g4.id, { url: 'https://evil.example.com/c.png' })).ok, false, 'hôte non autorisé refusé');
  assert.strictEqual((await covers.appliquerGrille(g4.id, { url: 'http://cdn2.steamgriddb.com/grid/b.png' })).ok, false, 'HTTP refusé');
  // 4) recherche automatique : SteamGridDB d'abord
  covers.retirer(g4.id); g4.coverSource = undefined;
  r = await covers.auto(g4.id);
  assert.ok(r.ok && g4.coverSource === 'steamgriddb', 'auto : SteamGridDB prioritaire');
  // 5) clé refusée (401) : repli sur Steam (ici sans résultat), pas d'exception
  covers.retirer(g4.id); g4.coverSource = undefined; g4.cover = null;
  covers.init({ storage: s4, toast() {}, fetchImpl: async url => url.includes('steamgriddb.com') ? { ok: false, status: 401, headers: { get: () => '' } } : json({ items: [] }) });
  r = await covers.auto(g4.id);
  assert.ok(r.ok === false, 'clé refusée : repli sur Steam sans planter');

  // ---------- Test de clé API ----------
  covers.init({ storage: s4, fetchImpl: async (url, o = {}) => (o.headers || {}).Authorization === 'Bearer bonne' ? json({ data: [] }) : { ok: false, status: 401, headers: { get: () => '' } } });
  assert.strictEqual((await covers.testerCle('bonne')).ok, true, 'clé valide acceptée');
  await assert.rejects(() => covers.testerCle('mauvaise'), e => e.cle === true, 'clé refusée détectée');
  assert.strictEqual((await covers.testerCle('  ')).ok, false, 'clé vide refusée');

  console.log('✔ Tous les tests passent');
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
})().catch(e => { console.error('✘', e); process.exit(1); });
