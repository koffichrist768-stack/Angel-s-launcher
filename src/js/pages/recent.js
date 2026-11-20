/** recent.js — Page « Récemment ajoutés » : détections groupées par période + journal des scans. */
import { esc, taille, relatif, heureFr, coverStyle, initiale } from '../services/format.js';
import { icon } from '../services/icons.js';
import { rechercher, trier } from '../services/selectors.js';
import { gameRow } from '../components/gameCard.js';

const JOUR = 86400000;

function carteSemaine(g) {
  return `<div class="panel stack" style="gap:12px">
    <div class="cover" style="${coverStyle(g)};aspect-ratio:16/9;border-radius:12px;overflow:hidden">${g.cover ? '' : `<div class="initial">${initiale(g)}</div>`}
      <div class="cover-info"><span class="mono accent">${relatif(g.addedAt).toUpperCase()}</span><h3>${esc(g.name)}</h3></div></div>
    <div class="mono muted" style="word-break:break-all">${icon('folder', 13)} ${esc(g.exePath)}</div>
    <div class="row"><button class="btn primary" style="flex:1" data-action="launch" data-id="${g.id}">${icon('play', 14)} Lancer</button>
      <button class="icon-btn" data-action="openFolder" data-id="${g.id}">${icon('folder')}</button></div></div>`;
}

export function renderRecent(state, ui) {
  const jeux = trier(rechercher(state.games, ui.query), 'added');
  const age = g => Date.now() - g.addedAt;
  const semaine = jeux.filter(g => age(g) <= 7 * JOUR), mois = jeux.filter(g => age(g) > 7 * JOUR && age(g) <= 30 * JOUR), ancien = jeux.filter(g => age(g) > 30 * JOUR);
  const section = (titre, liste, rendu, grille) => liste.length
    ? `<h2 style="margin:28px 0 14px">${titre} <span class="chip">${liste.length}</span></h2>${grille ? `<div class="grid-3">${liste.map(rendu).join('')}</div>` : liste.map(rendu).join('')}` : '';
  const logs = state.logs.slice(0, 5).map(l => `<div class="log"><span class="accent">[${heureFr(l.time)}]</span><span>${esc(l.message)}</span></div>`).join('')
    || '<p class="muted">Aucun scan effectué pour le moment.</p>';
  return `<section class="panel row between" style="margin-bottom:8px"><div><div class="eyebrow">${semaine.length} nouveau(x) jeu(x) cette semaine</div>
      <h1>Récemment ajoutés</h1><p class="muted">Jeux et exécutables détectés lors des derniers scans ou ajoutés manuellement.</p></div>
      <button class="btn primary" data-action="scanAll">${icon('refresh', 16)} Forcer un scan complet</button></section>
    <div class="row mono muted" style="margin:14px 0"><span class="chip ok">${taille(state.games.reduce((s, g) => s + g.sizeBytes, 0))} indexés</span><span class="chip">${state.games.length} jeu(x)</span></div>
    ${jeux.length ? '' : '<div class="empty">Aucun jeu à afficher.</div>'}
    ${section('Cette semaine', semaine, carteSemaine, true)}${section('Ce mois-ci', mois, gameRow)}${section('Plus ancien', ancien, gameRow)}
    <div class="panel" style="margin-top:28px"><h2>${icon('history')} Journal des derniers scans</h2>${logs}
      <p class="muted mono" style="margin-top:12px">Surveillance : ${state.settings.autoDetectExe ? 'active' : 'désactivée'} • ${state.folders.length} dossier(s) surveillé(s)</p></div>`;
}
