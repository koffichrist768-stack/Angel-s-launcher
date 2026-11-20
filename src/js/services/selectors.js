/** selectors.js — Recherche, tri et regroupements sur la liste de jeux. */

/** Minuscules + suppression des accents, pour une recherche tolérante. */
export const normaliser = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function rechercher(jeux, q) {
  const n = normaliser(q).trim();
  return n ? jeux.filter(g => normaliser(`${g.name} ${g.subtitle} ${g.exePath}`).includes(n)) : jeux;
}

/** Modes : recent | name | playtime | added */
export function trier(jeux, mode) {
  const c = {
    recent: (a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0),
    name: (a, b) => a.name.localeCompare(b.name, 'fr'),
    playtime: (a, b) => b.playtime - a.playtime,
    added: (a, b) => b.addedAt - a.addedAt
  }[mode] || (() => 0);
  return [...jeux].sort(c);
}

/** Dossier surveillé qui contient le jeu (ou undefined). */
export const dossierDuJeu = (state, g) => state.folders.find(f => g.exePath.startsWith(f.path));

/** Jeu mis en avant : dernier jeu joué, sinon le premier de la liste. */
export const jeuMisEnAvant = jeux => trier(jeux, 'recent')[0] || null;

export const tempsTotal = jeux => jeux.reduce((s, g) => s + g.playtime, 0);
