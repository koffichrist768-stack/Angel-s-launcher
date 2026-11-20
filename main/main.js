/**
 * main.js — Point d'entrée Electron : fenêtre, instance unique, scan périodique.
 */
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { Storage } = require('./services/storage');
const covers = require('./services/covers');
const { registerIpc } = require('./ipc');
const lib = require('./library');
const { lancer } = require('./services/launcher');

let win = null;
let storage = null;
let timerScan = null;

function creerFenetre() {
  const s = storage.data.settings;
  win = new BrowserWindow({
    width: 1360, height: 860, minWidth: 980, minHeight: 640,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    backgroundColor: '#0D1117', title: "Angel's Launcher",
    fullscreen: !!s.fullscreen, // « Démarrer en plein écran / Big Picture »
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  if (process.argv.includes('--dev')) win.webContents.openDevTools({ mode: 'detach' });
  win.on('closed', () => { win = null; });
}

/** Programme le re-scan automatique selon le réglage « Intervalle de re-scan ». */
function programmerScan(api) {
  clearInterval(timerScan);
  const s = storage.data.settings;
  if (!s.autoDetectExe) return;
  if (s.rescanInterval === 'launch') return; // un seul scan, au démarrage (fait dans whenReady)
  const minutes = parseInt(s.rescanInterval, 10) || 30;
  timerScan = setInterval(() => {
    const n = lib.scanAll(storage, 'automatique');
    if (n) api.toast(`${n} nouveau(x) jeu(x) détecté(s)`, 'success');
    if (s.autoCovers) covers.rechercherManquantes();
    api.diffuser();
  }, minutes * 60 * 1000);
}

// Une seule instance de l'application à la fois
if (!app.requestSingleInstanceLock()) app.quit();
else app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  storage = new Storage(app.getPath('userData'));
  storage.load();
  let api = null;
  // Reprogramme le scan automatique dès que les réglages sont enregistrés
  api = registerIpc(storage, () => win, () => programmerScan(api));
  creerFenetre();

  // Scan au démarrage + reprogrammation à chaque changement de réglages
  if (storage.data.settings.autoDetectExe) lib.scanAll(storage, 'au démarrage');
  programmerScan(api);
  // Pochettes manquantes : recherche en arrière-plan peu après le démarrage
  if (storage.data.settings.autoCovers) setTimeout(() => covers.rechercherManquantes(), 3000);

  // Option « Lancer automatiquement le dernier jeu joué »
  if (storage.data.settings.autoLaunchLast) {
    const dernier = [...storage.data.games].filter(g => g.lastPlayed && !g.demo).sort((a, b) => b.lastPlayed - a.lastPlayed)[0];
    if (dernier) lancer(dernier, (sec, debut) => { lib.recordSession(storage, dernier.id, sec, debut); api.diffuser(); });
  }

  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) creerFenetre(); });
});

app.on('before-quit', () => { if (storage) storage.flush(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
