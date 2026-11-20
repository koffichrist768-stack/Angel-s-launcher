/** modal.js — Fenêtre modale générique (Échap ou clic hors zone pour fermer). */
import { esc } from '../services/format.js';

/**
 * @param {object} o  { titre, corps (HTML), confirmer (libellé), danger, sansAnnuler, onBind(el), onConfirm(el) → false pour rester ouverte }
 */
export function ouvrirModale(o) {
  const racine = document.getElementById('modal-root');
  racine.innerHTML = `<div class="modal-bg"><div class="modal" role="dialog">
    <h2>${esc(o.titre)}</h2><div id="modal-body">${o.corps}</div><div class="err" id="modal-err"></div>
    <div class="actions">${o.sansAnnuler ? '' : '<button class="btn" id="modal-cancel">Annuler</button>'}
    <button class="btn ${o.danger ? 'danger' : 'primary'}" id="modal-ok">${esc(o.confirmer || 'Valider')}</button></div></div></div>`;
  const fermer = () => { racine.innerHTML = ''; document.removeEventListener('keydown', surTouche); };
  const surTouche = e => { if (e.key === 'Escape') fermer(); };
  document.addEventListener('keydown', surTouche);
  const bg = racine.firstElementChild;
  bg.addEventListener('mousedown', e => { if (e.target === bg) fermer(); });
  const annuler = racine.querySelector('#modal-cancel'); if (annuler) annuler.onclick = fermer;
  racine.querySelector('#modal-ok').onclick = async () => {
    const r = await o.onConfirm?.(racine);
    if (r === false) return;
    fermer();
  };
  o.onBind?.(racine);
  racine.querySelector('input')?.focus();
  return { fermer, erreur: m => { racine.querySelector('#modal-err').textContent = m; } };
}
