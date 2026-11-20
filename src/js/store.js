/** store.js — État global de l'interface : données (venant du processus principal) + état d'affichage. */
export const store = {
  state: { games: [], folders: [], sessions: [], logs: [], settings: {}, running: [], coverQueue: [] },
  ui: {
    page: 'library', query: '', filter: 'all', sort: 'recent', folderId: 'all',
    favSort: 'playtime', settingsTab: 'general', showKey: false, draft: null, selectedFolder: null, disks: []
  }
};
const abonnes = new Set();
export const subscribe = fn => abonnes.add(fn);
const notifier = () => abonnes.forEach(fn => fn(store));
export function setState(etat) { store.state = etat; notifier(); }
export function setUi(patch) { Object.assign(store.ui, patch); notifier(); }
