/** gameCard.js — Carte de jeu (grille) et ligne de jeu (liste). */
import { esc, heures, coverStyle, initiale, taille, relatif } from '../services/format.js';
import { icon } from '../services/icons.js';

/** Badge d'état : en cours / prêt / non installé. */
function badge(g, enCours) {
  if (enCours) return '<span class="badge run">En cours</span>';
  return g.installed || g.demo ? '<span class="badge">Prêt</span>' : '<span class="badge off">Introuvable</span>';
}

/** Carte verticale 2:3 avec actions au survol. */
export function gameCard(g, state) {
  const enCours = state.running.includes(g.id);
  return `<article class="card">
    <div class="cover${(state.coverQueue || []).includes(g.id) ? ' searching' : ''}" style="${coverStyle(g)}">
      ${g.cover ? '' : `<div class="initial">${initiale(g)}</div>`}
      ${badge(g, enCours)}
      <div class="card-actions">
        <button class="icon-btn hov" data-action="coverModal" data-id="${g.id}" title="Pochette du jeu">${icon('image', 15)}</button>
        <button class="icon-btn hov" data-action="delGame" data-id="${g.id}" title="Retirer de la bibliothèque">${icon('trash', 15)}</button>
        <button class="icon-btn ${g.favorite ? 'on' : ''}" data-action="fav" data-id="${g.id}" title="Favori">${icon('heart', 15)}</button>
      </div>
      <div class="play-overlay"><button data-action="launch" data-id="${g.id}" title="Jouer">${icon('play', 26)}</button></div>
      <div class="cover-info">
        <div class="path" title="${esc(g.exePath)}">${esc(g.folder)}</div>
        <h3>${esc(g.name)}</h3>
        <div class="meta"><span>${icon('clock', 12)} <b>${heures(g.playtime)}</b></span><span>${esc(g.subtitle || taille(g.sizeBytes))}</span></div>
      </div>
    </div></article>`;
}

/** Ligne horizontale (page « Récemment ajoutés »). */
export function gameRow(g) {
  return `<div class="game-row">
    <div class="thumb" style="${coverStyle(g)}"></div>
    <div class="info"><h3>${esc(g.name)}</h3>
      <div class="mono"><span>Ajouté ${relatif(g.addedAt)}</span><span>${esc(g.folder)}</span></div></div>
    <span class="chip mono">${taille(g.sizeBytes)}</span>
    <button class="btn" data-action="launch" data-id="${g.id}">${icon('play', 14)} Lancer</button>
    <button class="icon-btn" data-action="openFolder" data-id="${g.id}" title="Afficher dans l'explorateur">${icon('folder')}</button>
  </div>`;
}
