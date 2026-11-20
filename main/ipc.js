/**
 * ipc.js — Enregistre tous les gestionnaires IPC (interface → processus principal).
 */
const { ipcMain, dialog, shell, app, net } = require('electron');
const fs = require('fs');
const path = require('path');
const lib = require('./library');
const { lancer } = require('./services/launcher');
const { listDisks } = require('./services/disks');
const covers = require('./services/covers');
const { DEFAULT_SETTINGS } = require('./services/storage');

function registerIpc(storage, getWin, onSettings = () => {}) {
  /** Pousse l'état à jour vers l'interface. */
  const diffuser = () => {
    const w = getWin();
    if (w && !w.isDestroyed()) w.webContents.send('state:changed', lib.getState(storage));
  };
  const toast = (message, type = 'info') => {
    const w = getWin();
    if (w && !w.isDestroyed()) w.webContents.send('toast', { message, type });
  };
  /** Enveloppe un gestionnaire : diffuse l'état après chaque modification. */
  const LECTURE = new Set(['state:get', 'disks:list', 'covers:search', 'covers:grids', 'covers:testKey', 'app:openExternal', 'dialog:exe', 'dialog:folder', 'dialog:image']); // sans effet sur l'état
  const h = (canal, fn) => ipcMain.handle(canal, async (_e, ...args) => {
    try { const r = await fn(...args); if (!LECTURE.has(canal)) diffuser(); return r; }
    catch (e) { return { ok: false, error: e.message }; }
  });
  const jeu = id => storage.data.games.find(g => g.id === id);

  // Service de pochettes : net.fetch utilise la pile réseau de Chromium (proxy système compris)
  covers.init({ storage, diffuser, toast, fetchImpl: (u, o) => net.fetch(u, o) });
  /** Lance la recherche des pochettes manquantes si l'option est activée. */
  const pochettesAuto = () => { if (storage.data.settings.autoCovers) covers.rechercherManquantes(); };

  h('state:get', () => lib.getState(storage));

  // ---------- Jeux ----------
  h('games:add', p => {
    const r = lib.addGame(storage, p);
    if (r.ok && !p.cover && storage.data.settings.autoCovers) covers.mettreEnFile([r.game.id]);
    return r;
  });
  h('games:remove', id => lib.removeGame(storage, id));
  h('games:update', (id, patch) => lib.updateGame(storage, id, patch));
  h('games:favorite', id => {
    const g = jeu(id); if (!g) return { ok: false };
    g.favorite = !g.favorite; storage.save(); return { ok: true, favorite: g.favorite };
  });
  h('games:openFolder', id => { const g = jeu(id); if (g) shell.showItemInFolder(g.exePath); return { ok: !!g }; });

  h('games:launch', id => {
    const g = jeu(id);
    if (!g) return { ok: false, error: 'Jeu introuvable.' };
    if (g.demo) return { ok: false, error: 'Jeu de démonstration : aucun exécutable réel à lancer.' };
    const r = lancer(g, (secondes, debut) => {
      lib.recordSession(storage, id, secondes, debut);
      diffuser();
      const w = getWin(); if (w && !w.isDestroyed()) toast(`${g.name} fermé — ${Math.round(secondes / 60)} min jouées`, 'success');
    });
    if (r.ok && storage.data.settings.closeOnLaunch) setTimeout(() => app.quit(), 1500);
    return r;
  });

  // ---------- Boîtes de dialogue ----------
  const filtreExe = process.platform === 'win32' ? [{ name: 'Exécutables', extensions: ['exe', 'bat', 'lnk'] }] : [];
  h('dialog:exe', async () => {
    const r = await dialog.showOpenDialog(getWin(), { properties: ['openFile'], filters: filtreExe });
    return r.canceled ? null : r.filePaths[0];
  });
  h('dialog:folder', async () => {
    const r = await dialog.showOpenDialog(getWin(), { properties: ['openDirectory', 'createDirectory'] });
    return r.canceled ? null : r.filePaths[0];
  });
  // Copie l'image choisie dans le dossier de données pour qu'elle survive à un déplacement du fichier d'origine
  h('dialog:image', async () => {
    const r = await dialog.showOpenDialog(getWin(), {
      properties: ['openFile'], filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
    });
    if (r.canceled) return null;
    const dossier = path.join(storage.dir, 'covers');
    fs.mkdirSync(dossier, { recursive: true });
    const dest = path.join(dossier, storage.newId('c') + path.extname(r.filePaths[0]));
    fs.copyFileSync(r.filePaths[0], dest);
    return dest;
  });

  // ---------- Dossiers surveillés ----------
  h('folders:add', p => {
    if (!p || !fs.existsSync(p)) return { ok: false, error: 'Dossier introuvable.' };
    if (storage.data.folders.some(f => f.path === p)) return { ok: false, error: 'Ce dossier est déjà surveillé.' };
    const f = { id: storage.newId('f'), name: path.basename(p) || p, path: p, autoSync: true, lastScan: null };
    storage.data.folders.push(f);
    const n = lib.scanOne(storage, f, 'initial');
    storage.save();
    pochettesAuto();
    return { ok: true, added: n };
  });
  h('folders:remove', id => {
    storage.data.folders = storage.data.folders.filter(f => f.id !== id);
    storage.save(); return { ok: true };
  });
  h('folders:scan', id => {
    const n = id ? lib.scanOne(storage, storage.data.folders.find(f => f.id === id) || { path: '' })
                 : lib.scanAll(storage);
    pochettesAuto();
    return { ok: true, added: n };
  });
  h('folders:open', id => {
    const f = storage.data.folders.find(x => x.id === id);
    if (f) shell.openPath(f.path);
    return { ok: !!f };
  });

  // Ouvre une page dans le navigateur par défaut — uniquement le site SteamGridDB, en HTTPS
  h('app:openExternal', url => {
    let u; try { u = new URL(url); } catch { return { ok: false, error: 'Adresse invalide.' }; }
    const permis = u.protocol === 'https:' && (u.hostname === 'steamgriddb.com' || u.hostname.endsWith('.steamgriddb.com'));
    if (!permis) return { ok: false, error: 'Adresse non autorisée.' };
    shell.openExternal(u.toString());
    return { ok: true };
  });

  h('disks:list', () => listDisks());

  // ---------- Réglages ----------
  h('settings:save', patch => {
    storage.data.settings = { ...storage.data.settings, ...patch };
    storage.save(); onSettings(); return { ok: true };
  });
  h('settings:reset', () => {
    storage.data.settings = { ...DEFAULT_SETTINGS, lastBackup: storage.data.settings.lastBackup };
    storage.save(); onSettings(); return { ok: true };
  });

  // ---------- Sauvegardes locales ----------
  h('backup:create', () => {
    const dossier = storage.data.settings.backupDir;
    if (!dossier) return { ok: false, error: 'Définissez d\'abord le dossier de sauvegarde.' };
    storage.flush();
    fs.mkdirSync(dossier, { recursive: true });
    const nom = 'angels-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    const dest = path.join(dossier, nom);
    fs.copyFileSync(storage.file, dest);
    storage.data.settings.lastBackup = { date: Date.now(), path: dest, size: fs.statSync(dest).size };
    storage.save();
    return { ok: true, path: dest };
  });
  h('backup:open', () => {
    const d = storage.data.settings.backupDir;
    if (d && fs.existsSync(d)) shell.openPath(d);
    return { ok: !!d };
  });

  h('demo:load', () => { const n = lib.loadDemo(storage); pochettesAuto(); return { ok: true, added: n }; });

  // ---------- Pochettes ----------
  h('covers:search', (id, q, source) => covers.chercher(id, q, source)); // source : 'sgdb' | 'steam'
  h('covers:apply', (id, appid, nom) => covers.appliquer(id, appid, nom));
  h('covers:testKey', cle => covers.testerCle(cle));
  h('covers:grids', (id, sgdbId) => covers.grilles(id, sgdbId));
  h('covers:applyGrid', (id, grille, nom) => covers.appliquerGrille(id, grille, nom));
  h('covers:auto', id => covers.auto(id));
  h('covers:setLocal', (id, p) => covers.definirLocal(id, p));
  h('covers:remove', id => covers.retirer(id));
  h('covers:fetchMissing', () => covers.rechercherManquantes({ force: true }));

  return { diffuser, toast };
}

module.exports = { registerIpc };
