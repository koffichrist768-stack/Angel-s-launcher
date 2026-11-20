/**
 * disks.js — Liste des disques/volumes et de leur occupation (via fs.statfsSync).
 */
const fs = require('fs');
const os = require('os');

/** Renvoie l'occupation d'un point de montage, ou null s'il est inaccessible. */
function infoVolume(mount) {
  try {
    const s = fs.statfsSync(mount);
    const total = s.blocks * s.bsize;
    const free = s.bavail * s.bsize;
    return { mount, total, free, used: total - free };
  } catch { return null; }
}

function listDisks() {
  let points = [];
  if (process.platform === 'win32') {
    for (let c = 65; c <= 90; c++) points.push(String.fromCharCode(c) + ':\\');
  } else {
    points = ['/', os.homedir()];
    for (const base of ['/mnt', '/media', '/Volumes', '/run/media']) {
      try { for (const e of fs.readdirSync(base)) points.push(base + '/' + e); } catch { /* absent */ }
    }
  }
  const vus = new Set();
  const disques = [];
  for (const m of points) {
    if (process.platform === 'win32' && !fs.existsSync(m)) continue;
    const v = infoVolume(m);
    if (!v || !v.total) continue;
    // Évite les doublons : même capacité + même espace libre = même volume
    const cle = v.total + ':' + v.free;
    if (vus.has(cle)) continue;
    vus.add(cle);
    disques.push({ id: m, label: process.platform === 'win32' ? 'Lecteur ' + m.slice(0, 2) : m, ...v });
  }
  return disques;
}

module.exports = { listDisks, infoVolume };
