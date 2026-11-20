/** settings.js — Page « Paramètres » : onglets Général, Affichage, Manettes, Raccourcis, Sauvegardes. */
import { esc, taille, heureFr } from '../services/format.js';
import { icon } from '../services/icons.js';

const TABS = [['general', 'Général', 'sliders'], ['online', 'Services en ligne', 'image'], ['display', 'Affichage & Thème', 'monitor'], ['pads', 'Contrôleurs & Manettes', 'gamepad'],
  ['keys', 'Audio & Raccourcis', 'volume'], ['saves', 'Sauvegardes locales', 'save']];

const bascule = (cle, d, titre, desc, note = '') =>
  `<div class="toggle-row"><div><b>${titre}</b> ${note ? `<span class="chip mono">${note}</span>` : ''}<p>${desc}</p></div>
   <button class="toggle ${d[cle] ? 'on' : ''}" data-action="toggle" data-key="${cle}" aria-label="${titre}"></button></div>`;

const chemin = (cle, d, titre) =>
  `<div class="field"><label>${titre}</label><div class="row" style="flex-wrap:nowrap"><input class="input" readonly value="${esc(d[cle] || 'Non défini')}" title="${esc(d[cle])}" />
   <button class="btn" data-action="pick" data-key="${cle}">${icon('folder', 15)} Parcourir</button></div></div>`;

function general(d) {
  return `<div class="cols" style="grid-template-columns:1fr 1fr">
    <div class="panel"><h2>${icon('power')} Comportement du launcher</h2>
      <div class="field"><label>Nom du joueur</label><input class="input" data-input="playerName" value="${esc(d.playerName)}" maxlength="24" /></div>
      ${bascule('fullscreen', d, 'Démarrer en plein écran / Big Picture', 'Ouvre directement la fenêtre en plein écran au prochain démarrage.')}
      ${bascule('autoLaunchLast', d, 'Lancer automatiquement le dernier jeu joué', 'Relance votre dernière session dès l\'ouverture du launcher.')}
      ${bascule('closeOnLaunch', d, 'Fermer le launcher lors du lancement d\'un jeu', 'Libère de la mémoire (le temps de jeu n\'est alors plus comptabilisé).', 'RAM boost')}
      ${bascule('autoDetectExe', d, 'Détection automatique des exécutables', 'Scanne les dossiers surveillés au démarrage et à intervalle régulier.')}
      ${bascule('autoCovers', d, 'Recherche automatique des pochettes', 'Télécharge les pochettes manquantes depuis SteamGridDB (si une clé API est saisie) puis Steam. Seul le nom du jeu est envoyé ; désactivez pour rester 100 % hors-ligne.', 'En ligne')}
      <p class="muted">La clé API SteamGridDB se saisit dans l'onglet « Services en ligne ».</p></div>
    <div class="panel"><h2>${icon('folder')} Répertoires & chemins</h2>
      ${chemin('screenshotsDir', d, 'Répertoire des captures d\'écran et clips')}${chemin('profilesDir', d, 'Dossier de sauvegarde des profils de manette')}
      <div class="field"><label>Intervalle de re-scan des disques locaux</label><select class="input" data-change="draftSelect" data-key="rescanInterval">
        ${[['launch', 'Au lancement du launcher uniquement'], ['30', 'Toutes les 30 minutes'], ['60', 'Toutes les heures']]
          .map(([v, l]) => `<option value="${v}" ${d.rescanInterval === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div></div>`;
}

/** Onglet « Services en ligne » : clé API SteamGridDB (saisie, affichage, test, effacement). */
function enLigne(d, state, ui) {
  const cle = String(d.steamgriddbKey || '').trim();
  const enregistree = String(state.settings.steamgriddbKey || '').trim();
  return `<div class="panel"><h2>${icon('image')} SteamGridDB — pochettes de jeux
      <span class="chip ${cle ? 'ok' : ''}">${cle ? (cle === enregistree ? 'Clé enregistrée' : 'Clé à enregistrer') : 'Aucune clé'}</span></h2>
    <p class="muted" style="margin-bottom:14px">Une clé API gratuite permet de chercher les pochettes sur SteamGridDB (recherche manuelle et automatique).
      Sans clé, l'application utilise uniquement Steam.</p>
    <div class="field"><label>Clé API SteamGridDB</label>
      <div class="row" style="flex-wrap:nowrap">
        <input class="input" type="${ui.showKey ? 'text' : 'password'}" data-input="steamgriddbKey" value="${esc(d.steamgriddbKey || '')}"
          placeholder="Collez votre clé API ici" autocomplete="off" spellcheck="false" />
        <button class="btn" data-action="toggleKey" title="Afficher / masquer la clé">${ui.showKey ? 'Masquer' : 'Afficher'}</button></div></div>
    <div class="row">
      <button class="btn" data-action="testKey">${icon('check', 15)} Tester la clé</button>
      <button class="btn danger" data-action="clearKey">${icon('trash', 15)} Effacer</button>
      <button class="btn" data-action="openExternal" data-url="https://www.steamgriddb.com/profile/preferences/api">${icon('search', 15)} Obtenir une clé</button>
      <button class="btn primary" data-action="saveSettings">${icon('check', 15)} Enregistrer</button></div>
    <ol class="muted" style="margin:16px 0 0 18px;line-height:22px">
      <li>Cliquez sur « Obtenir une clé » et connectez-vous à SteamGridDB.</li>
      <li>Sur la page « API », copiez votre clé.</li>
      <li>Collez-la ci-dessus, cliquez sur « Tester la clé », puis sur « Enregistrer ».</li></ol>
    <p class="muted" style="margin-top:12px">La clé reste sur cet ordinateur (fichier de données local, et sauvegardes JSON). Elle n'est envoyée qu'à steamgriddb.com.</p></div>`;
}

function affichage(d) {
  const sw = (id, couleur) => `<button class="swatch ${d.accent === id ? 'sel' : ''}" style="background:${couleur}" data-action="draftValue" data-key="accent" data-value="${id}" title="${id}"></button>`;
  return `<div class="panel"><h2>${icon('monitor')} Affichage & thème</h2>
    <div class="field"><label>Couleur d'accent</label><div class="row">${sw('cyan', '#4cd7f6')}${sw('violet', '#a078ff')}${sw('emerald', '#4edea3')}</div></div>
    <div class="field"><label>Densité de l'interface</label><select class="input" style="max-width:280px" data-change="draftSelect" data-key="density">
      <option value="comfortable" ${d.density === 'comfortable' ? 'selected' : ''}>Confortable</option><option value="compact" ${d.density === 'compact' ? 'selected' : ''}>Compacte</option></select></div>
    <p class="muted">L'aperçu est immédiat ; cliquez sur « Enregistrer les modifications » pour le conserver.</p></div>`;
}

/** Les manettes viennent de l'API Gamepad du navigateur (aucun accès natif nécessaire). */
function manettes() {
  const pads = [...(navigator.getGamepads?.() || [])].filter(Boolean);
  return `<div class="panel"><h2>${icon('gamepad')} Contrôleurs détectés <span class="chip">${pads.length} actif(s)</span></h2>
    ${pads.map(p => `<div class="item"><div><b>${esc(p.id)}</b><div class="mono muted">${p.buttons.length} boutons • ${p.axes.length} axes</div></div>
      <button class="btn sm" data-action="rumble" data-index="${p.index}">Tester la vibration</button></div>`).join('')
      || '<p class="muted">Aucune manette détectée. Branchez-en une puis appuyez sur un bouton pour qu\'elle apparaisse.</p>'}</div>`;
}

function raccourcis() {
  const l = [['Ctrl + F', 'Aller à la recherche'], ['Ctrl + N', 'Ajouter un jeu'], ['Ctrl + 1 … 5', 'Bibliothèque, Dossiers, Récents, Favoris, Paramètres'], ['Échap', 'Fermer la fenêtre ouverte']];
  return `<div class="panel"><h2>${icon('volume')} Raccourcis clavier</h2><table class="keys">${l.map(([k, t]) => `<tr><td><kbd>${k}</kbd></td><td>${t}</td></tr>`).join('')}</table></div>`;
}

function sauvegardes(d, state) {
  const b = d.lastBackup;
  return `<div class="panel"><h2>${icon('save')} Sauvegardes locales <span class="chip">${state.games.length} jeu(x)</span></h2>
    <p class="muted" style="margin-bottom:14px">Copie la bibliothèque (jeux, dossiers, sessions, réglages) dans un fichier JSON daté.</p>
    ${chemin('backupDir', d, 'Emplacement des sauvegardes')}
    <div class="stat">${b ? `<small>Dernière sauvegarde</small><b style="font-size:16px">${new Date(b.date).toLocaleDateString('fr-FR')} ${heureFr(b.date)} • ${taille(b.size)}</b><div class="mono muted" style="word-break:break-all">${esc(b.path)}</div>` : '<small>Aucune sauvegarde effectuée</small>'}</div>
    <div class="row" style="margin-top:14px"><button class="btn primary" data-action="createBackup">${icon('save', 15)} Créer une sauvegarde</button>
      <button class="btn" data-action="openBackup">${icon('folder', 15)} Ouvrir le dossier</button></div></div>`;
}

export function renderSettings(state, ui) {
  const d = ui.draft || state.settings;
  const corps = { general, online: enLigne, display: affichage, pads: manettes, keys: raccourcis }[ui.settingsTab]?.(d, state, ui) || sauvegardes(d, state);
  return `<div class="page-head"><div><div class="eyebrow">Configuration • Système nominal • Sandbox locale</div><h1>Paramètres du Hub</h1>
      <p>Personnalisez le comportement du launcher, les répertoires, l'affichage et les périphériques.</p></div>
      <div class="row"><button class="btn" data-action="resetSettings">${icon('refresh', 15)} Restaurer par défaut</button>
        <button class="btn primary" data-action="saveSettings">${icon('check', 15)} Enregistrer les modifications</button></div></div>
    <div class="tabs" style="margin-bottom:20px">${TABS.map(([id, l, i]) => `<button class="tab ${ui.settingsTab === id ? 'active' : ''}" data-action="settingsTab" data-id="${id}">${icon(i, 15)} ${l}</button>`).join('')}</div>
    ${corps}`;
}
