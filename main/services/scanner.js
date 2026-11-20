/**
 * scanner.js — Détection des jeux dans un répertoire.
 * Règle : chaque sous-dossier direct est considéré comme un jeu ; on y cherche
 * l'exécutable le plus volumineux (profondeur max. 3) en ignorant désinstalleurs et utilitaires.
 */
const fs = require('fs');
const path = require('path');

const EXT_EXEC = process.platform === 'win32' ? /\.exe$/i : /\.(appimage|sh|x86_64|x86)$/i;
const IGNORES = /(unins|uninstall|crash|redist|setup|vcredist|vc_redist|dxsetup|helper|updater|reporter|dotnet)/i;

/** Liste les entrées d'un dossier sans jamais lever d'exception. */
function lire(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

/** Cherche récursivement les exécutables candidats. */
function candidats(dir, profondeur, max = 3) {
  const trouves = [];
  for (const e of lire(dir)) {
    const p = path.join(dir, e.name);
    if (e.isFile() && EXT_EXEC.test(e.name) && !IGNORES.test(e.name)) {
      try { trouves.push({ path: p, size: fs.statSync(p).size }); } catch { /* fichier illisible */ }
    } else if (e.isDirectory() && profondeur < max && !e.name.startsWith('.')) {
      trouves.push(...candidats(p, profondeur + 1, max));
    }
  }
  return trouves;
}

/** Taille approximative d'un dossier (plafonnée à `cap` fichiers pour rester rapide). */
function tailleDossier(dir, cap = 20000) {
  let total = 0, vus = 0;
  const pile = [dir];
  while (pile.length && vus < cap) {
    const d = pile.pop();
    for (const e of lire(d)) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) pile.push(p);
      else if (e.isFile()) { vus++; try { total += fs.statSync(p).size; } catch { /* ignoré */ } }
    }
  }
  return total;
}

/**
 * Analyse un répertoire racine et renvoie les jeux détectés.
 * @returns {{name:string, exePath:string, folder:string, sizeBytes:number}[]}
 */
function scanFolder(root) {
  const jeux = [];
  for (const e of lire(root)) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue;
    const dossier = path.join(root, e.name);
    const liste = candidats(dossier, 0).sort((a, b) => b.size - a.size);
    if (liste.length) {
      jeux.push({ name: e.name, exePath: liste[0].path, folder: dossier, sizeBytes: tailleDossier(dossier) });
    }
  }
  return jeux;
}

module.exports = { scanFolder, tailleDossier };
