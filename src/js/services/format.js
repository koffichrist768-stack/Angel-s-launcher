/** format.js — Utilitaires de mise en forme (échappement HTML, durées, tailles, dates, jaquettes). */

/** Échappe le HTML : à utiliser sur TOUTE donnée utilisateur injectée dans un gabarit. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const heures = sec => Math.floor((sec || 0) / 3600) + 'h';

/** 8040 s → « 2h 14m » */
export function duree(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

/** Tailles en unités françaises (Mo, Go, To). */
export function taille(octets) {
  if (!octets) return '—';
  const go = octets / 1e9;
  if (go >= 1000) return (go / 1000).toFixed(2).replace('.', ',') + ' To';
  if (go >= 1) return go.toFixed(1).replace('.', ',') + ' Go';
  return Math.round(octets / 1e6) + ' Mo';
}

/** Date relative : Aujourd'hui, Hier, Il y a N jours… */
export function relatif(ts) {
  if (!ts) return 'Jamais';
  const j = Math.floor((Date.now() - ts) / 86400000);
  if (j <= 0) return "Aujourd'hui";
  if (j === 1) return 'Hier';
  if (j < 30) return `Il y a ${j} jours`;
  return new Date(ts).toLocaleDateString('fr-FR');
}
export const dateFr = ts => ts ? new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';
export const heureFr = ts => new Date(ts).toLocaleTimeString('fr-FR');

/** Teinte stable (0-359) calculée depuis le nom du jeu, pour les jaquettes générées. */
export function teinte(nom) {
  let h = 0; for (const c of String(nom)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** Chemin de fichier local → URL file:// utilisable dans le CSS. */
export const fileUrl = p => 'file:///' + encodeURI(String(p).replace(/\\/g, '/').replace(/^\//, '')).replace(/'/g, '%27');

/** Style CSS de la jaquette : image choisie, sinon dégradé généré. */
export function coverStyle(jeu) {
  if (jeu.cover) return `background-image:url('${fileUrl(jeu.cover)}')`;
  const h = teinte(jeu.name);
  return `background-image:linear-gradient(160deg,hsl(${h} 55% 28%),hsl(${(h + 60) % 360} 60% 14%))`;
}
export const initiale = jeu => esc((jeu.name || '?').trim().charAt(0).toUpperCase());
