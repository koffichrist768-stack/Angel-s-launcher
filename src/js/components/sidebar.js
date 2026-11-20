/** sidebar.js — Barre latérale de navigation + carte profil. */
import { icon } from '../services/icons.js';
import { esc } from '../services/format.js';

const NAV = [
  ['library', 'Ma Bibliothèque', 'library'], ['folders', 'Dossiers & Disques', 'disk'],
  ['recent', 'Récemment ajoutés', 'history'], ['favorites', 'Favoris', 'heart']
];

export function renderSidebar(page, settings) {
  const item = ([id, label, ico]) =>
    `<button class="nav-item ${page === id ? 'active' : ''}" data-action="nav" data-page="${id}" title="${label}">${icon(ico, 20)}<span>${label}</span></button>`;
  return `
    <div class="brand"><div class="brand-logo">A</div><div><b>ANGEL'S<br>LAUNCHER</b><small>OS • LOCAL HUB</small></div></div>
    <div class="nav-title">Plateforme</div>
    ${NAV.map(item).join('')}
    <div class="nav-title">Configuration</div>
    ${item(['settings', 'Paramètres', 'sliders'])}
    <div class="profile"><div class="avatar">${icon('user')}</div>
      <div><b>${esc(settings.playerName || 'Joueur')}</b><small>Bibliothèque locale</small></div></div>`;
}
