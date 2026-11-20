/**
 * app.js — Point d'entrée de l'interface : rendu, délégation d'évènements, raccourcis clavier.
 */
import { store, setState, setUi, subscribe } from './store.js';
import { api, ecouter } from './services/api.js';
import { icon } from './services/icons.js';
import { renderSidebar } from './components/sidebar.js';
import { toast } from './components/toast.js';
import { renderLibrary } from './pages/library.js';
import { renderFolders } from './pages/folders.js';
import { renderRecent } from './pages/recent.js';
import { renderFavorites } from './pages/favorites.js';
import { renderSettings } from './pages/settings.js';
import { actions, changes, naviguer } from './actions.js';

const PAGES = { library: renderLibrary, folders: renderFolders, recent: renderRecent, favorites: renderFavorites, settings: renderSettings };
const ORDRE = ['library', 'folders', 'recent', 'favorites', 'settings'];
const $ = id => document.getElementById(id);

/** Redessine l'interface complète à partir du store. */
function render() {
  const { state, ui } = store;
  // Thème : le brouillon s'applique en direct dans Paramètres, sinon les réglages enregistrés
  const t = ui.page === 'settings' && ui.draft ? ui.draft : state.settings;
  document.documentElement.dataset.accent = t.accent || 'cyan';
  document.documentElement.dataset.density = t.density || 'comfortable';

  $('sidebar').innerHTML = renderSidebar(ui.page, state.settings);
  $('top-user').textContent = state.settings.playerName || 'Joueur';
  $('chip-scan').textContent = state.settings.autoDetectExe ? 'Scan auto' : 'Scan manuel';

  const vue = $('view'), defil = vue.scrollTop;
  vue.innerHTML = PAGES[ui.page](state, ui);
  vue.scrollTop = defil; // conserve la position de défilement entre deux rendus
}

async function demarrer() {
  $('ico-search').innerHTML = icon('search');
  $('btn-sync').innerHTML = icon('refresh');
  $('btn-bell').innerHTML = icon('bell');

  subscribe(render);
  ecouter('state:changed', setState);                 // l'état poussé par le processus principal
  ecouter('toast', t => toast(t.message, t.type));
  setState(await api('state:get'));

  // Délégation : un seul écouteur pour tous les boutons de l'application
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) actions[el.dataset.action](el, e);
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (el && changes[el.dataset.change]) changes[el.dataset.change](el);
  });
  document.addEventListener('input', e => {
    const el = e.target.closest('[data-input]');
    if (el && store.ui.draft) store.ui.draft[el.dataset.input] = el.value; // sans re-rendu : garde le focus
  });

  // Recherche globale : bascule vers la bibliothèque depuis une page sans liste de jeux
  $('search').addEventListener('input', e => {
    const page = ['library', 'favorites', 'recent'].includes(store.ui.page) ? store.ui.page : 'library';
    setUi({ query: e.target.value, page });
  });

  // Raccourcis clavier
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'f') { e.preventDefault(); $('search').focus(); }
    else if (e.key === 'n') { e.preventDefault(); actions.addGameModal(); }
    else if (/^[1-5]$/.test(e.key)) { e.preventDefault(); naviguer(ORDRE[Number(e.key) - 1]); }
  });

  // Les manettes n'apparaissent qu'après un appui : on rafraîchit la page Paramètres si elle est ouverte
  window.addEventListener('gamepadconnected', () => store.ui.page === 'settings' && setUi({}));
  window.addEventListener('gamepaddisconnected', () => store.ui.page === 'settings' && setUi({}));
}

demarrer();
