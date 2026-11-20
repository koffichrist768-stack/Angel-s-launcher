/** toast.js — Notifications éphémères en bas à droite. */
import { esc } from '../services/format.js';

export function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = esc(message);
  document.getElementById('toast-root').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
