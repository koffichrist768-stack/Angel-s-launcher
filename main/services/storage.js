/**
 * storage.js — Persistance JSON de la bibliothèque (jeux, dossiers, sessions, réglages).
 * Indépendant d'Electron : le dossier de données est passé au constructeur (testable avec Node seul).
 */
const fs = require('fs');
const path = require('path');

/** Réglages par défaut (utilisés aussi par « Restaurer par défaut »). */
const DEFAULT_SETTINGS = {
  playerName: 'Joueur',
  fullscreen: false,        // Démarrer en plein écran / Big Picture
  autoLaunchLast: false,    // Relancer automatiquement le dernier jeu joué
  closeOnLaunch: false,     // Fermer le launcher au lancement d'un jeu
  autoDetectExe: true,      // Détection automatique des exécutables
  autoCovers: true,         // Recherche automatique des pochettes manquantes (en ligne)
  steamgriddbKey: '',       // Clé API SteamGridDB (facultative) : active SteamGridDB comme source de pochettes
  screenshotsDir: '',
  profilesDir: '',
  backupDir: '',
  rescanInterval: 'launch', // 'launch' | '30' | '60' (minutes)
  accent: 'cyan',           // 'cyan' | 'violet' | 'emerald'
  density: 'comfortable',   // 'comfortable' | 'compact'
  lastBackup: null          // { date, path, size }
};

class Storage {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, 'angels-data.json');
    this.data = this._defaults();
    this._timer = null;
  }

  _defaults() {
    return { games: [], folders: [], sessions: [], logs: [], settings: { ...DEFAULT_SETTINGS } };
  }

  /** Charge le fichier ; en cas d'absence ou de corruption, repart d'un état vide. */
  load() {
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      const brut = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.data = { ...this._defaults(), ...brut, settings: { ...DEFAULT_SETTINGS, ...(brut.settings || {}) } };
    } catch (e) {
      this.data = this._defaults();
    }
    return this.data;
  }

  /** Écriture différée (regroupe les modifications rapprochées). */
  save() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), 150);
  }

  /** Écriture atomique : fichier temporaire puis renommage. */
  flush() {
    clearTimeout(this._timer);
    fs.mkdirSync(this.dir, { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  /** Ajoute une ligne au journal des scans (50 entrées maximum). */
  log(message, type = 'info') {
    this.data.logs.unshift({ time: Date.now(), message, type });
    this.data.logs = this.data.logs.slice(0, 50);
  }

  newId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}

module.exports = { Storage, DEFAULT_SETTINGS };
