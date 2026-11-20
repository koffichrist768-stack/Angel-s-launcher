/**
 * actions.js — Gestionnaires d'actions déclenchées par les attributs data-action / data-change / data-input.
 * Chaque fonction reçoit l'élément cliqué ; les données utiles sont dans ses attributs data-*.
 */
import { api } from './services/api.js';
import { store, setUi } from './store.js';
import { toast } from './components/toast.js';
import { ouvrirModale } from './components/modal.js';
import { esc, coverStyle } from './services/format.js';
import { icon } from './services/icons.js';

/** Affiche une erreur renvoyée par le processus principal ; retourne true si l'appel a réussi. */
const verifier = r => { if (r && r.ok === false) { toast(r.error || 'Opération impossible', 'error'); return false; } return true; };

/** Recharge l'occupation des disques (pages Dossiers & Paramètres). */
export async function chargerDisques() {
  const r = await api('disks:list');
  if (Array.isArray(r)) setUi({ disks: r });
}

/** Change de page ; entre dans Paramètres, on travaille sur un brouillon des réglages. */
export function naviguer(page) {
  setUi({ page, draft: page === 'settings' ? { ...store.state.settings } : null });
  if (page === 'folders') chargerDisques();
}

/** Modale d'ajout manuel d'un jeu. */
function modaleAjout() {
  let exe = '', cover = null;
  ouvrirModale({
    titre: 'Ajouter un jeu', confirmer: 'Ajouter',
    corps: `<div class="field"><label>Nom du jeu</label><input class="input" id="g-name" maxlength="60" /></div>
      <div class="field"><label>Sous-titre / édition (facultatif)</label><input class="input" id="g-sub" maxlength="60" /></div>
      <div class="field"><label>Exécutable</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="g-exe" readonly placeholder="Aucun fichier choisi" />
        <button class="btn" id="pick-exe">${icon('folder', 15)} Parcourir</button></div></div>
      <div class="field"><label>Jaquette (facultatif)</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="g-cover" readonly placeholder="Image générée automatiquement" />
        <button class="btn" id="pick-cover">${icon('image', 15)} Choisir</button></div>
        ${store.state.settings.autoCovers ? '<p class="muted">Sans image, la pochette sera recherchée automatiquement en ligne.</p>' : ''}</div>`,
    onBind: el => {
      el.querySelector('#pick-exe').onclick = async () => {
        const p = await api('dialog:exe'); if (!p) return;
        exe = p; el.querySelector('#g-exe').value = p;
        const nom = el.querySelector('#g-name');
        if (!nom.value) nom.value = p.split(/[\\/]/).pop().replace(/\.[^.]+$/, ''); // nom proposé depuis le fichier
      };
      el.querySelector('#pick-cover').onclick = async () => {
        const p = await api('dialog:image'); if (!p) return;
        cover = p; el.querySelector('#g-cover').value = p;
      };
    },
    onConfirm: async el => {
      const r = await api('games:add', { name: el.querySelector('#g-name').value, subtitle: el.querySelector('#g-sub').value, exePath: exe, cover });
      if (r.ok === false) { el.querySelector('#modal-err').textContent = r.error; return false; }
      toast('Jeu ajouté à la bibliothèque', 'success');
    }
  });
}


/**
 * Modale « Pochette » : recherche en ligne sur SteamGridDB (jeu → choix de la pochette) ou Steam (choix du titre),
 * recherche automatique, image locale, retrait.
 */
function modaleCouverture(id) {
  const g = store.state.games.find(x => x.id === id); if (!g) return;
  let source = 'sgdb';                                   // onglet actif : 'sgdb' | 'steam'
  let jeux = [];                                         // derniers résultats (pour le bouton « Retour »)
  let cleLocale = false;                                  // vrai juste après un enregistrement (l'état n'est pas encore rafraîchi)
  const cleOk = () => cleLocale || !!String(store.state.settings.steamgriddbKey || '').trim();
  const ctrl = ouvrirModale({
    titre: 'Pochette — ' + g.name, confirmer: 'Fermer', sansAnnuler: true,
    corps: `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:16px;margin-bottom:14px">
        <div class="thumb" style="${coverStyle(g)};width:90px;height:135px"></div>
        <div style="flex:1;min-width:0">
          <div class="tabs" style="margin-bottom:10px"><button class="tab active" data-src="sgdb">SteamGridDB</button><button class="tab" data-src="steam">Steam</button></div>
          <div class="field"><label>Rechercher en ligne</label>
          <div class="row" style="flex-wrap:nowrap"><input class="input" id="c-q" value="${esc(g.name)}" />
          <button class="btn" id="c-search">${icon('search', 15)} Chercher</button></div></div>
          <div id="c-results" class="muted"></div></div></div>
      <div class="row"><button class="btn" id="c-auto">${icon('refresh', 15)} Recherche automatique</button>
        <button class="btn" id="c-file">${icon('image', 15)} Image locale…</button>
        <button class="btn danger" id="c-remove">${icon('trash', 15)} Retirer</button></div>
      ${store.state.settings.autoCovers ? '' : '<p class="muted" style="margin-top:10px">La recherche automatique en arrière-plan est désactivée dans les paramètres.</p>'}`,
    onBind: el => {
      const zone = el.querySelector('#c-results'), q = el.querySelector('#c-q'), err = el.querySelector('#modal-err');
      const echec = r => { zone.textContent = ''; err.textContent = r.error || 'Opération impossible'; };
      const fini = msg => { toast(msg, 'success'); ctrl.fermer(); };

      /** SteamGridDB sans clé API : on explique comment l'obtenir ou comment utiliser le site à la main. */
      const avisCle = () => {
        zone.innerHTML = `<p style="margin-bottom:10px">SteamGridDB demande une <b>clé API gratuite</b>. Collez-la ici pour l'enregistrer :</p>
          <div class="row" style="flex-wrap:nowrap"><input class="input" id="c-keyin" type="password" placeholder="Clé API SteamGridDB" autocomplete="off" spellcheck="false" />
          <button class="btn primary" id="c-keysave">Enregistrer</button></div>
          <div class="row" style="margin-top:10px"><button class="btn sm" id="c-keyget">${icon('search', 14)} Obtenir une clé</button>
          <button class="btn sm" id="c-web">${icon('search', 14)} Ouvrir SteamGridDB</button></div>
          <p style="margin-top:10px">Sans clé : ouvrez le site, enregistrez l'image voulue, puis utilisez « Image locale… ».</p>`;
        zone.querySelector('#c-keyget').onclick = () => api('app:openExternal', 'https://www.steamgriddb.com/profile/preferences/api');
        zone.querySelector('#c-keysave').onclick = async () => {
          const v = zone.querySelector('#c-keyin').value.trim(); err.textContent = '';
          if (!v) { err.textContent = 'Collez d\'abord votre clé.'; return; }
          const t = await api('covers:testKey', v);                 // on vérifie la clé avant de l'enregistrer
          if (t.ok === false) { err.textContent = t.error; return; }
          await api('settings:save', { steamgriddbKey: v });
          toast('Clé enregistrée', 'success'); cleLocale = true; invite();
        };
        zone.querySelector('#c-web').onclick = () => api('app:openExternal', 'https://www.steamgriddb.com/search/grids?term=' + encodeURIComponent(q.value));
      };
      const invite = () => {
        if (source === 'sgdb' && !cleOk()) return avisCle();
        zone.textContent = source === 'sgdb' ? 'Lancez une recherche, choisissez le jeu, puis la pochette.' : 'Lancez une recherche, puis cliquez sur le bon titre.';
      };

      /** Liste des jeux trouvés (SteamGridDB : `sgdbId`, Steam : `appid`). */
      const afficherJeux = liste => {
        jeux = liste;
        zone.innerHTML = liste.map((x, i) => `<button class="item result" data-i="${i}"><b>${esc(x.name)}</b><small>#${x.sgdbId ?? x.appid}</small></button>`).join('');
        zone.querySelectorAll('.result').forEach(b => b.onclick = () => choisir(jeux[Number(b.dataset.i)]));
      };

      /** SteamGridDB : vignettes cliquables des pochettes du jeu choisi. */
      const afficherGrilles = async x => {
        err.textContent = ''; zone.textContent = 'Chargement des pochettes…';
        const r = await api('covers:grids', id, x.sgdbId);
        if (r.ok === false) return echec(r);
        if (!r.grids.length) { zone.textContent = 'Aucune pochette verticale pour ce jeu sur SteamGridDB.'; return; }
        zone.innerHTML = `<div class="row between" style="margin-bottom:8px"><b>${esc(x.name)}</b><button class="btn sm" id="c-back">← Résultats</button></div>
          <div class="pick-grid">${r.grids.map((gr, i) => `<button class="pick" data-i="${i}" title="${gr.width}×${gr.height}"><img src="${esc(gr.thumb)}" alt="" loading="lazy" /><small>${gr.width}×${gr.height}</small></button>`).join('')}</div>`;
        zone.querySelector('#c-back').onclick = () => afficherJeux(jeux);
        zone.querySelectorAll('.pick').forEach(b => b.onclick = async () => {
          zone.textContent = 'Téléchargement…';
          const a = await api('covers:applyGrid', id, { url: r.grids[Number(b.dataset.i)].url }, x.name);
          a.ok === false ? echec(a) : fini('Pochette appliquée');
        });
      };

      const choisir = async x => {
        if (source === 'sgdb') return afficherGrilles(x);
        zone.textContent = 'Téléchargement…';
        const a = await api('covers:apply', id, x.appid, x.name);
        a.ok === false ? echec(a) : fini('Pochette appliquée');
      };

      const chercher = async () => {
        err.textContent = '';
        if (source === 'sgdb' && !cleOk()) return avisCle();
        zone.textContent = 'Recherche en cours…';
        const r = await api('covers:search', id, q.value, source);
        if (r.ok === false) return echec(r);
        if (!r.results.length) { zone.textContent = 'Aucun résultat. Essayez un autre nom.'; return; }
        afficherJeux(r.results);
      };

      el.querySelectorAll('[data-src]').forEach(b => b.onclick = () => {
        source = b.dataset.src; err.textContent = '';
        el.querySelectorAll('[data-src]').forEach(x => x.classList.toggle('active', x === b));
        invite();
      });
      el.querySelector('#c-search').onclick = chercher;
      q.addEventListener('keydown', e => { if (e.key === 'Enter') chercher(); });
      invite();

      el.querySelector('#c-auto').onclick = async () => {
        err.textContent = ''; zone.textContent = 'Recherche automatique…';
        const r = await api('covers:auto', id);
        r.ok === false ? echec(r) : fini('Pochette trouvée : ' + (r.name || g.name));
      };
      el.querySelector('#c-file').onclick = async () => {
        const p = await api('dialog:image'); if (!p) return;
        const r = await api('covers:setLocal', id, p);
        r.ok === false ? echec(r) : fini('Pochette mise à jour');
      };
      el.querySelector('#c-remove').onclick = async () => { await api('covers:remove', id); fini('Pochette retirée'); };
    },
    onConfirm: () => {}
  });
}

export const actions = {
  nav: el => naviguer(el.dataset.page),

  // ----- Jeux -----
  launch: async el => { const r = await api('games:launch', el.dataset.id); if (verifier(r)) toast('Lancement du jeu…', 'success'); },
  fav: el => api('games:favorite', el.dataset.id),
  openFolder: el => api('games:openFolder', el.dataset.id),
  addGameModal: () => modaleAjout(),
  coverModal: el => modaleCouverture(el.dataset.id),
  toggleKey: () => setUi({ showKey: !store.ui.showKey }),
  clearKey: () => { store.ui.draft.steamgriddbKey = ''; setUi({}); toast('Clé effacée — cliquez sur « Enregistrer » pour confirmer', 'info'); },
  testKey: async () => {
    const r = await api('covers:testKey', store.ui.draft.steamgriddbKey || '');
    if (r.ok === false) toast(r.error || 'Clé non valide', 'error'); else toast('Clé valide : SteamGridDB est prêt', 'success');
  },
  openExternal: el => api('app:openExternal', el.dataset.url), // pages SteamGridDB uniquement (liste blanche côté principal)
  coversMissing: async () => {
    const r = await api('covers:fetchMissing');
    if (verifier(r)) toast(r.queued ? `Recherche de ${r.queued} pochette(s) en cours…` : 'Tous les jeux ont déjà une pochette', 'info');
  },
  delGame: el => {
    const g = store.state.games.find(x => x.id === el.dataset.id); if (!g) return;
    ouvrirModale({
      titre: 'Retirer ce jeu ?', confirmer: 'Retirer', danger: true,
      corps: `<p><b>${esc(g.name)}</b> sera retiré de la bibliothèque. Les fichiers du jeu ne sont <b>pas</b> supprimés du disque.</p>`,
      onConfirm: async () => { await api('games:remove', g.id); toast('Jeu retiré', 'success'); }
    });
  },
  loadDemo: async () => { const r = await api('demo:load'); if (verifier(r)) toast(`${r.added} jeux de démonstration ajoutés`, 'success'); },

  // ----- Filtres & tris -----
  setFilter: el => setUi({ filter: el.dataset.id }),
  setFolderFilter: el => setUi({ folderId: el.dataset.id }),
  setFavSort: el => setUi({ favSort: el.dataset.id }),

  // ----- Dossiers surveillés -----
  addFolder: async () => {
    const p = await api('dialog:folder'); if (!p) return;
    const r = await api('folders:add', p);
    if (verifier(r)) toast(`Dossier ajouté — ${r.added} jeu(x) détecté(s)`, 'success');
  },
  removeFolder: el => api('folders:remove', el.dataset.id),
  scanFolder: async el => { const r = await api('folders:scan', el.dataset.id); if (verifier(r)) toast(`${r.added} nouveau(x) jeu(x)`, 'success'); },
  scanAll: async () => { const r = await api('folders:scan', null); if (verifier(r)) toast(`Scan terminé — ${r.added} nouveau(x) jeu(x)`, 'success'); chargerDisques(); },
  openWatched: el => api('folders:open', el.dataset.id),
  selectFolder: el => setUi({ selectedFolder: el.dataset.id }),
  toggleAutoDetect: () => api('settings:save', { autoDetectExe: !store.state.settings.autoDetectExe }),
  showLogs: () => { const l = store.state.logs[0]; toast(l ? l.message : 'Aucune notification', 'info'); },

  // ----- Paramètres (travail sur le brouillon `ui.draft`) -----
  settingsTab: el => setUi({ settingsTab: el.dataset.id }),
  toggle: el => { store.ui.draft[el.dataset.key] = !store.ui.draft[el.dataset.key]; setUi({}); },
  draftValue: el => { store.ui.draft[el.dataset.key] = el.dataset.value; setUi({}); },
  pick: async el => { const p = await api('dialog:folder'); if (p) { store.ui.draft[el.dataset.key] = p; setUi({}); } },
  saveSettings: async () => { if (verifier(await api('settings:save', store.ui.draft))) toast('Réglages enregistrés', 'success'); },
  resetSettings: async () => {
    if (!verifier(await api('settings:reset'))) return;
    setUi({ draft: { ...store.state.settings } }); toast('Réglages par défaut restaurés', 'success');
  },
  createBackup: async () => {
    await api('settings:save', store.ui.draft); // le dossier choisi doit être enregistré avant la copie
    const r = await api('backup:create'); if (verifier(r)) toast('Sauvegarde créée', 'success');
    setUi({ draft: { ...store.state.settings } });
  },
  openBackup: () => api('backup:open'),
  rumble: el => {
    const pad = navigator.getGamepads()[Number(el.dataset.index)];
    if (pad?.vibrationActuator) pad.vibrationActuator.playEffect('dual-rumble', { duration: 500, strongMagnitude: 1, weakMagnitude: 1 });
    else toast('Cette manette ne gère pas la vibration', 'error');
  }
};

/** Actions liées à un changement de valeur (liste déroulante). */
export const changes = {
  setSort: el => setUi({ sort: el.value }),
  draftSelect: el => { store.ui.draft[el.dataset.key] = el.value; setUi({}); }
};
