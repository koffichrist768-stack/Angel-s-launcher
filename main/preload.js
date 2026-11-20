/**
 * preload.js — Pont sécurisé entre l'interface (renderer) et le processus principal.
 * Seuls les canaux de la liste blanche sont accessibles (contextIsolation activé).
 */
const { contextBridge, ipcRenderer } = require('electron');

const CANAUX = [
  'state:get', 'games:add', 'games:remove', 'games:update', 'games:favorite', 'games:launch',
  'games:openFolder', 'dialog:exe', 'dialog:folder', 'dialog:image',
  'folders:add', 'folders:remove', 'folders:scan', 'folders:open',
  'covers:search', 'covers:apply', 'covers:grids', 'covers:applyGrid', 'covers:testKey', 'covers:auto', 'covers:setLocal', 'covers:remove', 'covers:fetchMissing',
  'app:openExternal',
  'disks:list', 'settings:save', 'settings:reset', 'backup:create', 'backup:open', 'demo:load'
];

contextBridge.exposeInMainWorld('angels', {
  /** Appelle une action du processus principal et renvoie sa réponse. */
  invoke: (canal, ...args) => {
    if (!CANAUX.includes(canal)) return Promise.reject(new Error('Canal non autorisé : ' + canal));
    return ipcRenderer.invoke(canal, ...args);
  },
  /** Écoute les évènements poussés par le processus principal (ex. 'state:changed'). */
  on: (canal, cb) => {
    if (!['state:changed', 'toast'].includes(canal)) return;
    ipcRenderer.on(canal, (_e, donnees) => cb(donnees));
  }
});
