/** library.js — Page « Ma Bibliothèque » : héros, filtres, grille de jeux, widgets latéraux. */
import { esc, heures, duree, coverStyle, taille, relatif, heureFr } from '../services/format.js';
import { icon } from '../services/icons.js';
import { rechercher, trier, dossierDuJeu, jeuMisEnAvant, tempsTotal } from '../services/selectors.js';
import { gameCard } from '../components/gameCard.js';

function hero(g, state) {
  const enCours = state.running.includes(g.id);
  const dernier = state.sessions.find(s => s.gameId === g.id);
  return `<section class="hero" style="${coverStyle(g)}">
    <div class="row"><span class="chip mono" title="${esc(g.exePath)}">${icon('folder', 13)} ${esc(g.folder)}</span>
      <span class="chip ${g.installed || g.demo ? 'ok' : ''}">${g.installed || g.demo ? icon('check', 13) + ' Vérifié & prêt' : 'Exécutable introuvable'}</span></div>
    <div class="eyebrow">Mise en avant • Reprendre la partie</div>
    <h1>${esc(g.name)}</h1>${g.subtitle ? `<div class="sub">${esc(g.subtitle)}</div>` : ''}
    <div class="row mono muted"><span>${icon('clock', 14)} ${heures(g.playtime)} jouées</span>
      <span>• Dernière session : ${g.lastPlayed ? relatif(g.lastPlayed) + (dernier ? ', ' + heureFr(dernier.end).slice(0, 5) : '') : 'jamais'}</span></div>
    <div class="row"><button class="btn primary xl" data-action="launch" data-id="${g.id}">${icon('play', 16)} ${enCours ? 'En cours…' : 'Jouer'}</button>
      <button class="btn" data-action="openFolder" data-id="${g.id}">${icon('folder')} Gérer les fichiers</button>
      <button class="btn" data-action="coverModal" data-id="${g.id}">${icon('image')} Pochette</button></div>
  </section>`;
}

function filtres(state, ui, nbTotal, nbAffiches) {
  const puces = state.folders.map(f =>
    `<button class="chip ${ui.folderId === f.id ? 'active' : ''}" data-action="setFolderFilter" data-id="${f.id}">${icon('disk', 13)} ${esc(f.name)}</button>`).join('');
  const tab = (id, l) => `<button class="tab ${ui.filter === id ? 'active' : ''}" data-action="setFilter" data-id="${id}">${l}</button>`;
  return `<div class="panel"><div class="eyebrow muted">Répertoires scannés</div>
      <div class="row"><button class="chip ${ui.folderId === 'all' ? 'active' : ''}" data-action="setFolderFilter" data-id="all">Tous (${nbTotal})</button>${puces}</div></div>
    <div class="row between"><div><b>${nbAffiches}</b> jeu(x) affiché(s) <span class="muted mono">• ${taille(state.games.reduce((s, g) => s + g.sizeBytes, 0))} alloués</span></div>
      <div class="row">
        <select class="input" style="flex:none;width:180px" data-change="setSort">
          ${[['recent', 'Récemment joués'], ['name', 'Nom (A-Z)'], ['playtime', 'Temps de jeu'], ['added', 'Date d\'ajout']]
            .map(([v, l]) => `<option value="${v}" ${ui.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <div class="tabs">${tab('all', 'Tous')}${tab('installed', 'Installés')}${tab('fav', 'Favoris')}</div>
        <button class="btn primary sm" data-action="addGameModal">${icon('plus', 14)} Ajouter un jeu</button></div></div>`;
}

function aside(state, vedette) {
  const manquantes = state.games.filter(g => !g.cover && g.coverSource !== 'none').length; // jeux sans pochette
  const total = tempsTotal(state.games);
  const plus = [...state.games].sort((a, b) => b.playtime - a.playtime)[0];
  const sessions = state.sessions.slice(0, 3).map(s => `<div class="item"><div><b>${esc(s.name)}</b><div class="mono muted">${relatif(s.end)}</div></div><span class="chip ok">${duree(s.seconds)}</span></div>`).join('')
    || '<p class="muted">Aucune session enregistrée pour le moment.</p>';
  return `<aside class="stack">
    <div class="panel"><h2>${icon('chart')} Statistiques locales</h2>
      <div class="row"><div class="stat" style="flex:1"><small>Temps total</small><b>${heures(total)}</b></div>
        <div class="stat" style="flex:1"><small>Favoris</small><b>${state.games.filter(g => g.favorite).length}</b></div></div>
      ${plus && plus.playtime ? `<div class="item"><div><b>Jeu le plus joué</b><div class="mono muted">${esc(plus.name)}</div></div><span class="chip info">${heures(plus.playtime)}</span></div>` : ''}</div>
    <div class="panel"><h2>${icon('history')} Sessions récentes</h2>${sessions}</div>
    <div class="panel"><h2>${icon('sliders')} Accès rapide local</h2>
      ${vedette ? `<button class="item" data-action="openFolder" data-id="${vedette.id}"><span>${icon('folder')} Ouvrir le dossier d'installation</span>${icon('chevron')}</button>` : ''}
      ${manquantes ? `<button class="item" data-action="coversMissing"><span>${icon('image')} Rechercher les pochettes manquantes (${manquantes})</span>${icon('chevron')}</button>` : ''}
      <button class="item" data-action="addGameModal"><span>${icon('plus')} Ajouter un jeu manuellement</span>${icon('chevron')}</button>
      <button class="item" data-action="nav" data-page="settings"><span>${icon('save')} Gestionnaire de sauvegardes</span>${icon('chevron')}</button></div>
  </aside>`;
}

export function renderLibrary(state, ui) {
  if (!state.games.length) {
    return `<div class="empty"><h2>Votre bibliothèque est vide</h2>
      <p>Ajoutez un jeu, surveillez un dossier d'installation, ou chargez des jeux de démonstration.</p>
      <div class="row" style="justify-content:center;margin-top:18px">
        <button class="btn primary" data-action="addGameModal">${icon('plus', 14)} Ajouter un jeu</button>
        <button class="btn" data-action="addFolder">${icon('folder')} Surveiller un dossier</button>
        <button class="btn" data-action="loadDemo">Charger la démo</button></div></div>`;
  }
  let jeux = rechercher(state.games, ui.query);
  if (ui.folderId !== 'all') {
    const f = state.folders.find(x => x.id === ui.folderId);
    jeux = jeux.filter(g => f && dossierDuJeu(state, g) === f);
  }
  if (ui.filter === 'installed') jeux = jeux.filter(g => g.installed || g.demo);
  if (ui.filter === 'fav') jeux = jeux.filter(g => g.favorite);
  jeux = trier(jeux, ui.sort);
  const vedette = jeuMisEnAvant(state.games);
  return `${hero(vedette, state)}
    <div class="cols"><div class="stack">${filtres(state, ui, state.games.length, jeux.length)}
      ${jeux.length ? `<div class="grid-cards">${jeux.map(g => gameCard(g, state)).join('')}</div>`
                    : '<div class="empty">Aucun jeu ne correspond à votre recherche.</div>'}</div>
    ${aside(state, vedette)}</div>`;
}
