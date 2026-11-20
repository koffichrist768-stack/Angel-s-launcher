/** api.js — Appels vers le processus principal (via le pont du preload). */
export const api = (canal, ...args) => window.angels.invoke(canal, ...args);
export const ecouter = (canal, cb) => window.angels.on(canal, cb);
