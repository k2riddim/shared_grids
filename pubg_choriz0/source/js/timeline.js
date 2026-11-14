'use strict';
// ═════════════════════════ MASTER TIMELINE ═════════════════════════
const T = {
  intro: [0, 2.4],
  map: [2.4, 6.3],
  kills: [6.3, 11.6],
  crate: [11.6, 15.6],
  revive: [15.6, 20.6],
  final: [20.6, 22.9],
  end: [22.9, 27.7],
};
const DURATION = 27.7, LOOP_A = 25.3, LOOP_P = 2.4;

// enemy names
const EN = ['BushCamper', 'xX_Kevin_Xx', 'TryHard_FPP', 'Le_Campeur', 'RushB_Rambo', 'SniperDu93', 'PochinkiKing', 'FPP_Enjoyer', 'TTV_Kevin', 'Ninja_du_77', 'Bush_Wookie', 'GhillieMan', 'ZoneRunner', 'LastStand_42', 'CrateThief', 'Rusher_Bob'];
// ── kill feed + my kills ──
const KF = [];
const MYK = []; // my kills in order {t, victim, weapon, hs, show}
function myKill(t, victim, weapon, hs = false, show = true) { MYK.push({ t, victim, weapon, hs, show }); KF.push({ t, killer: 'choriz0', kcol: C.p1, victim, weapon, hs, mine: true }); }
function otherKill(t, killer, kcol, victim, weapon, o = {}) { KF.push({ t, killer, kcol, victim, weapon, ...o }); }
// featured kills
myKill(8.86, 'BushCamper', 'kar98k', true);
myKill(9.86, 'xX_Kevin_Xx', 'm416');
myKill(10.32, 'TryHard_FPP', 'm416', true);
myKill(10.8, 'Le_Campeur', 'm416');
// teammates covering the crate
otherKill(13.95, 'jiomi', C.p2, 'CrateThief', 'm416');
otherKill(14.45, 'dotvav', C.p4, 'Rusher_Bob', 'kar98k', { hs: true });
// montage burst (time passes)
myKill(15.0, 'RushB_Rambo', 'm416', false, false);
myKill(15.13, 'SniperDu93', 'awm', true, false);
myKill(15.26, 'PochinkiKing', 'm416', false, false);
myKill(15.39, 'FPP_Enjoyer', 'awm', true, false);
// ambush knocks
otherKill(15.74, 'TTV_Kevin', '#ff8a7a', 'jiomi', 'm416', { knock: true, vcol: C.p2 });
otherKill(15.92, 'TTV_Kevin', '#ff8a7a', 'mochard', 'm416', { knock: true, vcol: C.p3 });
otherKill(16.1, 'Ninja_du_77', '#ff8a7a', 'dotvav', 'kar98k', { knock: true, vcol: C.p4 });
// the pan
myKill(19.96, 'TTV_Kevin', 'PAN');
// final
myKill(22.02, 'LastStand_42', 'awm', true);
KF.forEach(e => { if (e.weapon === 'PAN') e.weapon = 'pan'; });
MYK[0].msgT = 8.99;
MYK.forEach(e => { e.wname = { kar98k: 'Kar98k', m416: 'M416', awm: 'AWM', PAN: 'PAN', pan: 'PAN' }[e.weapon]; });
const killsAt = t => MYK.filter(k => k.t <= t).length;
function killPopAt(t) { let p = 0; for (const k of MYK) { const a = t - k.t; if (a >= 0 && a < 0.5) p = Math.max(p, Math.exp(-a * 7)); } return p; }
const SCENE_BOUNDS = [6.3, 11.6, 15.6, 20.6, 22.9];
function killMsgAt(t) {
  let m = null;
  MYK.forEach((k, i) => {
    const mt = k.msgT ?? k.t; let end = mt + 1.6;
    for (const b of SCENE_BOUNDS) if (b > mt) { end = Math.min(end, b + 0.3); break; }
    if (k.show && t >= mt && t < end) m = { t: mt, end, n: i + 1, victim: k.victim, weapon: k.wname, hs: k.hs };
  });
  return m;
}

// ── alive count ──
const ALIVE_STEPS = [[0, 41], [7.4, 40], [8.86, 39], [9.86, 38], [10.32, 37], [10.8, 36], [12.5, 34], [13.95, 33], [14.45, 32], [15.0, 31], [15.13, 30], [15.26, 29], [15.39, 28], [17.3, 25], [18.6, 22], [19.96, 21], [20.75, 9], [20.9, 5], [22.02, 4]];
function aliveAt(t) { let v = 41; for (const [tt, a] of ALIVE_STEPS) if (t >= tt) v = a; return v; }

// ── captions (voice comms) ──
const CAPS = [
  { t0: 2.72, t1: 4.2, who: 0, parts: [['La zone va tirer'], ['NORD-EST.', 1], ['On rotate'], ['MAINTENANT.', 1]] },
  { t0: 4.3, t1: 5.1, who: 1, parts: [['Attends…'], ['comment il sait ça ?!', 1]] },
  { t0: 5.18, t1: 6.25, who: 0, parts: [['Ils vont devoir traverser.'], ['On les attend.', 1]] },
  { t0: 6.42, t1: 7.85, who: 0, parts: [['Quatre dans le champ,'], ['255.', 1], ['Je prends le premier.']] },
  { t0: 10.86, t1: 11.6, who: 3, parts: [['QUATRE ?!', 1], ['Le monstre.']] },
  { t0: 11.82, t1: 13.15, who: 0, parts: [['Crate pour nous.'], ['Couvrez-moi,', 1], ['je la prends.']] },
  { t0: 13.25, t1: 14.1, who: 2, parts: [['Je couvre la crate !', 1]] },
  { t0: 15.66, t1: 16.85, who: 0, parts: [['SMOKE !', 1], ['Je vous relève, un par un.']] },
  { t0: 18.92, t1: 19.78, who: 0, parts: [['Personne ne meurt'], ['ce soir.', 1]] },
  { t0: 20.05, t1: 20.7, who: 1, parts: [['LA POÊLE ?!', 1]] },
  { t0: 20.82, t1: 21.86, who: 0, parts: [['Dernier.'], ['310.', 1], ['Il est à moi.']] },
];
let CAP_FROM = -1e9; // captions that started before the current clip are hidden
const capAt = t => CAPS.find(c => c.t0 >= CAP_FROM && t >= c.t0 && t <= c.t1) || null;

// ── squad state ──
function squadAt(t) {
  const talk = [0, 0, 0, 0]; const c = capAt(t); if (c && t < c.t1 - 0.25) talk[c.who] = 0.5 + 0.5 * Math.abs(Math.sin((t - c.t0) * 12));
  const kn = [15.74, 15.92, 16.1], rv = [17.6, 18.56, 19.52];
  const st = SQUAD.map((m, i) => ({ hp: [1, 0.86, 1, 0.72][i], knocked: 0, talking: talk[i], boost: 0, flash: 0 }));
  // choriz0 takes chip damage in the ambush, then boosts
  st[0].hp = 1 - 0.36 * ep(t, 15.65, 16.0) + 0.3 * ep(t, 19.6, 22, Ease.inOutQuad);
  st[0].boost = ep(t, 19.5, 20.3) * 0.7;
  for (let k = 0; k < 3; k++) {
    const i = k + 1;
    if (t >= kn[k] && t < rv[k]) { st[i].knocked = 1 - 0.55 * prog(t, kn[k], rv[k]); }
    if (t >= rv[k]) { st[i].hp = 0.1 + 0.62 * ep(t, rv[k] + 0.2, rv[k] + 2.5, Ease.inOutQuad); st[i].boost = 0.6 * ep(t, rv[k], rv[k] + 0.4); st[i].flash = Math.exp(-(t - rv[k]) * 7) * 0.9; }
    if (t >= kn[k] && t < kn[k] + 0.25) st[i].flash = Math.max(st[i].flash, (1 - (t - kn[k]) / 0.25) * 0.8);
  }
  return st;
}
// ── heading per scene (compass) ──
const HEAD_KEYS = [[0, 52], [6.25, 52], [6.45, 255], [11.3, 255], [11.75, 28], [15.5, 28], [15.65, 118], [20.5, 118], [20.8, 310], [23, 310]];
function headingAt(t) {
  for (let i = 0; i < HEAD_KEYS.length - 1; i++) {
    const [ta, a] = HEAD_KEYS[i], [tb, b] = HEAD_KEYS[i + 1];
    if (t >= ta && t <= tb) { const d = angDiff(a, b); return wrap360(a + d * Ease.inOutCubic(prog(t, ta, tb))); }
  }
  return HEAD_KEYS[HEAD_KEYS.length - 1][1];
}
// ── weapon / gear state ──
function vitalsAt(t) {
  const sq = squadAt(t);
  const v = { hp: sq[0].hp, dmg: sq[0].hp, boost: sq[0].boost, heal: 0, helm: 2, vest: 2, pack: 2, gearFlash: 0, weapon: 'Kar98k', mag: 5, res: 15, mode: 'SINGLE', wFlash: 0 };
  // chip damage trail
  if (t > 15.65 && t < 16.6) v.dmg = Math.min(1, v.hp + 0.36 * (1 - ep(t, 16.0, 16.6)));
  if (t >= 8.05) v.mag = 4;
  if (t >= 9.3) { v.weapon = 'M416'; v.mode = 'AUTO'; v.res = 120; v.mag = 30 - Math.floor(clamp((t - 9.6) / 1.3) * 19); }
  if (t >= 14.42) { v.weapon = 'AWM'; v.mag = 5; v.res = 20; v.mode = 'SINGLE'; v.wFlash = Math.exp(-(t - 14.42) * 4); }
  if (t >= 14.6) { v.helm = 3; v.vest = 3; v.pack = 3; v.gearFlash = Math.exp(-(t - 14.6) * 4); }
  if (t >= 15.6 && t < 19.8) { v.weapon = 'M416'; v.mode = 'AUTO'; v.mag = 30 - Math.floor(clamp((t - 15.7) / 0.6) * 9); v.res = 112; v.wFlash = 0; }
  if (t >= 19.8 && t < 20.6) { v.weapon = 'PAN'; v.mag = 1; v.res = 0; v.mode = 'MELEE'; v.wFlash = Math.exp(-(t - 19.8) * 5); }
  if (t >= 20.6) { v.weapon = 'AWM'; v.mode = 'SINGLE'; v.mag = t >= 21.92 ? 4 : 5; v.res = 15; v.wFlash = 0; }
  if (t >= 19.6) v.heal = 0.25 * Math.exp(-(t - 19.6) * 3);
  return v;
}
// ── zone (for minimap) ──
function zoneAt(t) {
  if (t < 6.3) return { blue: { x: 4.7, y: 3.3, r: 2.4 }, white: { x: 4.9, y: 3.0, r: 1.15 }, timer: '1:' + String(Math.max(0, 52 - Math.floor(t * 2))).padStart(2, '0') };
  if (t < 15.6) return { blue: { x: 5.0, y: 2.8, r: lerp(1.6, 1.0, prog(t, 6.3, 15.6)) }, white: { x: 5.35, y: 2.42, r: 0.6 }, timer: '0:' + String(Math.max(0, 58 - Math.floor((t - 6.3) * 5))).padStart(2, '0') };
  if (t < 20.6) return { blue: { x: 5.3, y: 2.45, r: lerp(0.7, 0.42, prog(t, 15.6, 20.6)) }, white: { x: 5.45, y: 2.38, r: 0.22 }, timer: '0:' + String(Math.max(0, 45 - Math.floor((t - 15.6) * 7))).padStart(2, '0') };
  return { blue: { x: 5.45, y: 2.4, r: lerp(0.2, 0.09, prog(t, 20.6, 22.9)) }, white: { x: 5.47, y: 2.41, r: 0.05 }, timer: '0:0' + Math.max(0, 9 - Math.floor((t - 20.6) * 4)) };
}
function playerPosAt(t) {
  if (t < 6.3) return [4.25, 2.95];
  if (t < 11.6) return [5.33, 2.44];
  if (t < 15.6) return [5.42, 2.5];
  if (t < 20.6) return [5.4, 2.4];
  return [5.46, 2.42];
}
