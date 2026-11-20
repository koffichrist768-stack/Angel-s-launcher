/** favorites.js — Page « Favoris » : coup de cœur, grille rapide, statistiques. */
import { esc, heures, coverStyle, relatif } from '../services/format.js';
import { icon } from '../services/icons.js';
import { rechercher, trier, dossierDuJeu, tempsTotal } from '../services/selectors.js';
import { gameCard } from '../components/gameCard.js';

export function renderFavorites(state, ui) {
  const tous = state.games.filter(g => g.favorite);
  const mode = { playtime: 'playtime', name: 'name', recent: 'recent' }[ui.favSort];
  const favs = trier(rechercher(tous, ui.query), mode);
  const tab = (id, l) => `<button class="tab ${ui.favSort === id ? 'active' : ''}" data-action="setFavSort" data-id="${id}">${l}</button>`;
  const entete = `<div class="page-head"><div><div class="eyebrow">ANGEL'S // Collection • ${tous.length} titre(s) épinglé(s)</div>
      <h1>Mes Jeux Favoris</h1><p>Accédez instantanément à vos titres préférés. Cliquez sur le cœur d'une carte pour la retirer.</p></div>
      <div class="tabs">${tab('playtime', 'Plus joués')}${tab('name', 'Alphabétique')}${tab('recent', 'Récents')}</div></div>`;
  if (!favs.length) return entete + `<div class="empty"><h2>Aucun favori</h2><p>Ajoutez des jeux en favoris depuis la bibliothèque (icône ${icon('heart', 14)}).</p></div>`;

  const v = favs[0];
  const total = tempsTotal(state.games), cumul = tempsTotal(tous);
  // Répartition des favoris par dossier surveillé
  const parDossier = {};
  tous.forEach(g => { const f = dossierDuJeu(state, g); const k = f ? f.name : 'Hors dossiers'; parDossier[k] = (parDossier[k] || 0) + 1; });
  const repart = Object.entries(parDossier).map(([k, n]) =>
    `<div class="item"><span>${esc(k)}</span><span class="chip">${n} jeu(x)</span></div>`).join('');
  return `${entete}
    <section class="panel" style="display:grid;grid-template-columns:1.4fr 1fr;padding:0;overflow:hidden;margin-bottom:24px">
      <div style="min-height:260px;${coverStyle(v)};background-size:cover;background-position:center"></div>
      <div class="stack" style="padding:24px;justify-content:space-between">
        <div><span class="chip ok">Coup de cœur // prioritaire</span><h1 style="margin-top:10px">${esc(v.name)}</h1>
          <p class="muted">${esc(v.subtitle || '')}</p><div class="mono muted" style="margin-top:8px;word-break:break-all">${icon('folder', 13)} ${esc(v.exePath)}</div></div>
        <div class="row between"><div><small class="muted mono">SESSION LOCALE</small><div class="accent" style="font:700 22px var(--font-head)">${heures(v.playtime)} <span class="muted" style="font:400 13px var(--font-body)">jouées</span></div></div>
          <button class="btn primary" data-action="launch" data-id="${v.id}">${icon('play', 14)} Lancer</button></div></div></section>
    <div class="cols"><div><div class="eyebrow muted">Bibliothèque rapide</div><div class="grid-cards">${favs.map(g => gameCard(g, state)).join('')}</div></div>
      <aside class="panel"><h2>${icon('chart')} Statistiques favoris</h2>
        <div class="stat"><small class="mono">TEMPS CUMULÉ</small><b class="accent" style="font-size:34px">${heures(cumul)}</b>
          <p class="muted">Représente ${total ? Math.round(cumul / total * 100) : 0} % de votre temps total sur Angel's Launcher.</p></div>
        <div class="eyebrow muted" style="margin-top:16px">Répartition par dossier</div>${repart}
        <p class="muted mono" style="margin-top:14px">Dernier lancé : ${relatif(Math.max(...tous.map(g => g.lastPlayed || 0)))}</p></aside></div>`;
}
