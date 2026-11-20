/**
 * launcher.js — Lancement d'un jeu et suivi de la session (durée de jeu).
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const enCours = new Map(); // gameId -> { pid, start }

/**
 * Lance l'exécutable d'un jeu.
 * @param {object} jeu     jeu de la bibliothèque
 * @param {function} onFin rappel (durée en secondes, début en ms) appelé à la fermeture du jeu
 */
function lancer(jeu, onFin) {
  if (!jeu.exePath || !fs.existsSync(jeu.exePath)) {
    return { ok: false, error: 'Exécutable introuvable : ' + jeu.exePath };
  }
  if (enCours.has(jeu.id)) return { ok: false, error: 'Ce jeu est déjà en cours d\'exécution.' };
  try {
    const enfant = spawn(jeu.exePath, jeu.args || [], {
      cwd: path.dirname(jeu.exePath), detached: true, stdio: 'ignore'
    });
    const debut = Date.now();
    enCours.set(jeu.id, { pid: enfant.pid, start: debut });
    enfant.on('error', () => { enCours.delete(jeu.id); onFin(0, debut); });
    enfant.on('exit', () => {
      enCours.delete(jeu.id);
      onFin(Math.round((Date.now() - debut) / 1000), debut);
    });
    enfant.unref(); // le jeu continue même si le launcher se ferme
    return { ok: true, pid: enfant.pid, start: debut };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const idsEnCours = () => [...enCours.keys()];

module.exports = { lancer, idsEnCours };
