/** folders.js — Page « Dossiers & Disques » : occupation des disques, dossiers surveillés, aperçu. */
import { esc, taille, relatif, coverStyle, initiale } from '../services/format.js';
import { icon } from '../services/icons.js';

function carteDisque(d) {
  const pct = d.total ? Math.round(d.used / d.total * 100) : 0;
  return `<div class="disk"><div class="row between"><div>${icon('disk', 22)}</div><span class="chip mono">${pct} %</span></div>
    <h3 style="margin-top:10px">${esc(d.label)}</h3><div class="mono muted" style="word-break:break-all">${esc(d.mount)}</div>
    <div class="row between" style="margin:14px 0 6px"><b>${taille(d.used)} / ${taille(d.total)}</b><span class="accent mono">${taille(d.free)} libres</span></div>
    <div class="bar ${pct > 85 ? '' : 'violet'}"><i style="width:${pct}%;${pct > 90 ? 'background:var(--danger)' : ''}"></i></div></div>`;
}

export function renderFolders(state, ui) {
  const sel = state.folders.find(f => f.id === ui.selectedFolder) || state.folders[0];
  const jeuxDe = f => state.games.filter(g => g.exePath.startsWith(f.path));
  // Alerte : un disque presque plein (> 90 %)
  const plein = ui.disks.find(d => d.total && d.used / d.total > 0.9);
  const bandeau = plein
    ? `<div class="panel row" style="margin-bottom:24px;border-color:var(--danger)">${icon('disk', 22)}<div><b>${esc(plein.label)}</b> est presque plein : seulement ${taille(plein.free)} disponibles.</div></div>` : '';
  const dossiers = state.folders.map(f => {
    const n = jeuxDe(f);
    return `<div class="folder ${sel && sel.id === f.id ? 'sel' : ''}" data-action="selectFolder" data-id="${f.id}">
      <div class="row between"><div class="row">${icon('folder', 22)}<div><b>${esc(f.name)}</b>${f.autoSync ? ' <span class="chip info">Auto-sync</span>' : ''}<div class="path">${esc(f.path)}</div></div></div>
        <div style="text-align:right"><b>${n.length} titres</b><div class="mono muted">${taille(n.reduce((s, g) => s + g.sizeBytes, 0))}</div></div></div>
      <div class="row between" style="margin-top:12px"><span class="mono green">${f.lastScan ? icon('check', 13) + ' Scanné ' + relatif(f.lastScan).toLowerCase() : 'Jamais scanné'}</span>
        <div class="row"><button class="btn sm" data-action="scanFolder" data-id="${f.id}">${icon('refresh', 13)} Re-scanner</button>
          <button class="btn sm" data-action="openWatched" data-id="${f.id}">${icon('folder', 13)} Explorateur</button>
          <button class="btn sm danger" data-action="removeFolder" data-id="${f.id}">Délier</button></div></div></div>`;
  }).join('') || '<div class="empty">Aucun dossier surveillé. Ajoutez le dossier où sont installés vos jeux.</div>';

  const apercu = sel ? (() => {
    const n = jeuxDe(sel);
    return `<aside class="panel"><div class="eyebrow">Aperçu répertoire</div><h2>${esc(sel.name)} <span class="chip">${n.length} jeux</span></h2>
      <p class="muted mono" style="word-break:break-all">${esc(sel.path)}</p>
      <div class="grid-cards" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">${n.slice(0, 6).map(g => `<div class="card"><div class="cover" style="${coverStyle(g)};aspect-ratio:16/10">
        ${g.cover ? '' : `<div class="initial" style="font-size:32px">${initiale(g)}</div>`}<div class="cover-info"><h3 style="font-size:13px">${esc(g.name)}</h3><div class="mono muted">${taille(g.sizeBytes)}</div></div></div></div>`).join('')}</div>
      ${n.length ? '' : '<p class="muted">Aucun jeu dans ce dossier.</p>'}</aside>`;
  })() : '';

  return `<div class="page-head"><div><div class="eyebrow">Indexation système</div><h1>Gestionnaire de Stockage & Répertoires</h1>
      <p>Surveillez l'occupation de vos disques et synchronisez automatiquement vos dossiers de jeux.</p></div>
      <div class="row"><button class="btn" data-action="scanAll">${icon('refresh')} Scanner le système</button>
        <button class="btn primary" data-action="addFolder">${icon('plus', 16)} Ajouter un répertoire</button></div></div>
    <div class="grid-3" style="margin-bottom:24px">${ui.disks.map(carteDisque).join('') || '<div class="empty">Lecture des disques…</div>'}</div>
    ${bandeau}
    <div class="cols"><div><h2 style="margin-bottom:14px">Dossiers indexés <span class="chip">${state.folders.length} emplacement(s)</span></h2>${dossiers}
      <div class="toggle-row"><div><b>Surveillance continue des exécutables</b><p>Détecte automatiquement les nouvelles installations selon l'intervalle défini dans les paramètres.</p></div>
        <button class="toggle ${state.settings.autoDetectExe ? 'on' : ''}" data-action="toggleAutoDetect" aria-label="Surveillance"></button></div></div>${apercu}</div>`;
}
