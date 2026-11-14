'use strict';
let CLIPCTX = {};
// ── headshot impact (end of bullet cam) ──
function headshotImpact(ctx, t) {
  const a = t - 8.86; if (a < 0) return;
  const bx = 470 + 175, by = 540;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, softDot('#fff1d0', 128), bx + 40, by - 40, 380 * (1 + a * 3), Math.exp(-a * 9));
  for (let i = 0; i < 26; i++) { const an = -Math.PI * 0.9 + R(i, 91) * Math.PI * 1.3, sp = 900 + 1700 * R(i, 92); const d = sp * a, L = 30 + 80 * R(i, 93); ctx.strokeStyle = `rgba(255,${180 + 60 * R(i, 94) | 0},120,${Math.exp(-a * 7)})`; ctx.lineWidth = 2 + 3 * R(i, 95); ctx.beginPath(); ctx.moveTo(bx + Math.cos(an) * d, by - 40 + Math.sin(an) * d); ctx.lineTo(bx + Math.cos(an) * (d + L), by - 40 + Math.sin(an) * (d + L)); ctx.stroke(); }
  ctx.restore();
  // helmet flying off
  ctx.save(); ctx.translate(bx + 120 + a * 1300, by - 160 - a * 900 + a * a * 1500); ctx.rotate(a * 9);
  ctx.fillStyle = '#2a2024'; ctx.beginPath(); ctx.moveTo(-120, 40); ctx.bezierCurveTo(-130, -110, 40, -160, 120, -120); ctx.bezierCurveTo(180, -80, 190, 0, 170, 40); ctx.closePath(); ctx.fill();
  ctx.restore();
  // red mist
  for (let i = 0; i < 46; i++) { const an = -0.7 + R(i, 97) * 1.6, d = (180 + 700 * R(i, 98)) * a; drawSprite(ctx, softDot(i % 3 ? '#9e1610' : '#d8402a', 32), bx + 60 + Math.cos(an) * d, by - 30 + Math.sin(an) * d, 5 + 14 * R(i, 99) + 30 * a, Math.max(0, 0.55 - a * 3.5)); }
  // HEADSHOT slam
  const k = ep(a, 0, 0.09, Ease.outBack);
  ctx.save(); ctx.translate(W / 2 - 40, 360); ctx.rotate(-0.05); ctx.scale(lerp(1.8, 1, k), lerp(1.8, 1, k)); ctx.globalAlpha = clamp(a * 18);
  text(ctx, 'HEADSHOT', 0, 0, { size: 150, fam: 'osw', w: 700, align: 'center', color: '#ffffff', stroke: '#ff2a1a', lw: 10, shadow: 'rgba(0,0,0,0.6)', sb: 30, sy: 8 });
  text(ctx, 'HEADSHOT', 0, 0, { size: 150, fam: 'osw', w: 700, align: 'center', color: '#ffffff' });
  ctx.restore();
}

// ═════════════════════════ S3 — CARE PACKAGE ═════════════════════════
const DROP = { tExit: 11.88, tChute: 12.12, tLand: 13.36, landAx: 17.2, landAy: 3.9 };
function planeAx(t) { return 34 - 30 * (t - 11.45); }
const PLANE_AY = -14.6, PLANE_LEN = 21; // degrees
function crateWorld(t) {
  const rampAx = planeAx(DROP.tExit) + PLANE_LEN * 0.82, rampAy = PLANE_AY + 0.6;
  if (t < DROP.tExit) return null;
  if (t < DROP.tChute) { const d = t - DROP.tExit; return { ax: rampAx - 6 * d, ay: rampAy + 0.5 * 46 * d * d, open: 0, sway: 0 }; }
  const d0 = DROP.tChute - DROP.tExit, ax0 = rampAx - 6 * d0, ay0 = rampAy + 0.5 * 46 * d0 * d0;
  const u = prog(t, DROP.tChute, DROP.tLand);
  const ay = lerp(ay0, DROP.landAy, Ease.inOutQuad(u) * 0.35 + u * 0.65);
  const ax = lerp(ax0, DROP.landAx, Ease.outCubic(u));
  const open = ep(t, DROP.tChute, DROP.tChute + 0.55, Ease.lin);
  const sway = Math.sin((t - DROP.tChute) * 4.2) * 0.13 * Math.exp(-(t - DROP.tChute) * 0.7) * (t < DROP.tLand ? 1 : 0);
  return { ax: t < DROP.tLand ? ax : DROP.landAx, ay: t < DROP.tLand ? ay : DROP.landAy, open, sway };
}
const CRATE_W = 2.2, CHUTE_S = 6.2;
function crateView(t) {
  let v = { ax: 16, ay: -10.2, s: 26 };
  const c = crateWorld(t);
  if (c) {
    const follow = ep(t, 12.3, 12.75, Ease.inOutCubic);
    v.ay = lerp(-10.2, Math.min(c.ay + 4.6, 3.2), follow);
    v.ax = lerp(16, c.ax + 3, follow * 0.6);
  }
  if (t > 13.3) {
    const k = ep(t, 13.38, 14.4, Ease.inOutCubic);
    const s = lerp(26, 44, k);
    v = { ax: lerp(v.ax, DROP.landAx - (760 - 540) / s, k), ay: lerp(v.ay, DROP.landAy - 1.5 + (1 - k) * 0, k), s };
  }
  // late drift
  v.ax += (t - 13) * 0.05;
  return v;
}
function redSmoke(ctx, v, t, x0w, y0w, strength = 1) {
  // thick billowing plume emitted from the crate after landing; rises and drifts right
  const tl = DROP.tLand + 0.05; if (t < tl) return;
  const N = 120, rate = 34; // puffs per second
  ctx.save();
  for (let i = 0; i < N; i++) {
    const birth = tl + i / rate; const age = t - birth; if (age < 0) continue;
    const life = 3.2 + 1.4 * R(i, 401); if (age > life) continue;
    const k = age / life;
    const rise = (1.6 + 1.6 * R(i, 403)) * age + 0.55 * age * age;
    const drift = (0.5 + 0.9 * R(i, 404)) * age + 0.5 * age * age + Math.sin(age * 2.2 + i) * 0.18 * age;
    const ax = x0w + drift + (R(i, 407) - 0.5) * 0.5, ay = y0w - rise;
    const [x, y] = P2S(v, ax, ay);
    const r = (0.55 + 2.4 * Math.sqrt(k) + 0.5 * R(i, 405)) * v.s;
    const a = Math.min(1, age * 5) * Math.pow(1 - k, 1.3) * 0.8 * strength;
    const tone = R(i, 408);
    const spr = smokeSprite(1 + (i % 4), 128, tone < 0.3 ? '#9c2e2a' : tone < 0.65 ? '#c9453d' : tone < 0.9 ? '#de6258' : '#eb9088');
    ctx.globalAlpha = a; ctx.save(); ctx.translate(x, y); ctx.rotate(R(i, 406) * TAU + age * 0.35 * (R(i, 409) - 0.5)); ctx.drawImage(spr, -r, -r, r * 2, r * 2); ctx.restore();
  }
  ctx.globalAlpha = 1;
  const [sx, sy] = P2S(v, x0w, y0w);
  ctx.globalCompositeOperation = 'lighter'; drawSprite(ctx, softDot('#ff4a30', 64), sx, sy + 0.4 * v.s, 1.6 * v.s, 0.22 * strength * ep(t, tl, tl + 0.4)); ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
const LOOT = [
  { name: 'AWM', sub: 'Sniper · .300 Magnum', icon: 'awm', gold: true },
  { name: '.300 Magnum', sub: 'Munitions', qty: '×20', icon: 'ammo' },
  { name: 'Helmet (Lv.3)', sub: 'Spetsnaz', icon: 'helmet', l3: true },
  { name: 'Military Vest (Lv.3)', sub: 'Gilet pare-balles', icon: 'vest', l3: true },
  { name: 'Ghillie Suit', sub: 'Tenue', icon: 'ghillie' },
  { name: 'Adrenaline Syringe', sub: 'Boost', icon: 'syringe' },
  { name: 'Med Kit', sub: 'Soin', icon: 'medkit' },
];
function lootPanel(ctx, t) {
  const t0 = 13.72; if (t < t0) return;
  const x = 40, y = 172, w = 476, rh = 70;
  const open = ep(t, t0, t0 + 0.25, Ease.outCubic), close = ep(t, 14.88, 15.1, Ease.inCubic);
  if (close >= 1) return;
  ctx.save(); ctx.globalAlpha = open * (1 - close); ctx.translate(-(1 - open) * 60 - close * 80, 0);
  const H0 = 62 + LOOT.length * rh + 14;
  rr(ctx, x, y, w, H0, 10); ctx.fillStyle = 'rgba(12,14,16,0.72)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke();
  // header
  crate(ctx, x + 36, y + 47, 34, {});
  text(ctx, 'CARE PACKAGE', x + 70, y + 41, { size: 30, fam: 'bar', w: 800, ls: 3, color: '#fff' });
  text(ctx, String(LOOT.length), x + w - 22, y + 41, { size: 26, fam: 'raj', w: 700, align: 'right', color: 'rgba(255,255,255,0.6)' });
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(x + 16, y + 58, w - 32, 1.5);
  LOOT.forEach((it, i) => {
    const ti = t0 + 0.12 + i * 0.075, tp = 14.36 + i * 0.07;
    const k = ep(t, ti, ti + 0.25, Ease.outCubic), pick = ep(t, tp, tp + 0.22, Ease.inCubic);
    if (k <= 0) return;
    const ry = y + 66 + i * rh;
    ctx.save(); ctx.globalAlpha *= k * (1 - pick); ctx.translate((1 - k) * -40 + pick * 120, 0);
    if (it.gold) {
      const g = ctx.createLinearGradient(x + 12, 0, x + w - 12, 0); g.addColorStop(0, 'rgba(255,198,41,0.35)'); g.addColorStop(1, 'rgba(255,198,41,0.04)');
      rr(ctx, x + 12, ry, w - 24, rh - 8, 6); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = rgba(C.gold, 0.85); ctx.lineWidth = 2; ctx.stroke();
    } else { rr(ctx, x + 12, ry, w - 24, rh - 8, 6); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); }
    // icon box
    rr(ctx, x + 22, ry + 7, 92, rh - 22, 5); ctx.fillStyle = it.gold ? 'rgba(255,198,41,0.18)' : 'rgba(0,0,0,0.35)'; ctx.fill();
    const icx = x + 68, icy = ry + 7 + (rh - 22) / 2, col = it.gold ? C.gold2 : '#fff';
    if (it.icon === 'awm') gun(ctx, 'awm', icx - 40, icy + 2, 80, 0, col);
    else ({ ammo: icoAmmo, helmet: icoHelmet, vest: icoVest, ghillie: icoGhillie, syringe: icoSyringe, medkit: icoMedkit })[it.icon](ctx, icx, icy, 38, it.l3 ? C.gold2 : col, 3);
    text(ctx, it.name, x + 130, ry + 32, { size: 27, fam: 'bar', w: 700, color: it.gold ? C.gold2 : '#fff' });
    text(ctx, it.sub, x + 130, ry + 54, { size: 18, fam: 'bar', w: 600, ls: 1, color: 'rgba(255,255,255,0.55)' });
    if (it.qty) text(ctx, it.qty, x + w - 28, ry + 40, { size: 24, fam: 'raj', w: 700, align: 'right', color: '#fff' });
    if (it.l3 || it.gold) text(ctx, it.gold ? 'CRATE' : 'LV.3', x + w - 28, ry + 40, { size: 18, fam: 'bar', w: 800, ls: 2, align: 'right', color: C.gold });
    // pick flash
    if (pick > 0) { rr(ctx, x + 12, ry, w - 24, rh - 8, 6); ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - pick)})`; ctx.fill(); }
    ctx.restore();
  });
  ctx.restore();
}
function sCrate(ctx, t) {
  const v = crateView(t);
  const c = crateWorld(t);
  drawVista(ctx, v, {
    t, fg: false,
    near: (cx, vv) => {
      if (!c) return;
      const [x, y] = P2S(vv, c.ax, c.ay);
      const w = CRATE_W * vv.s;
      // landing dust ring
      const da = t - DROP.tLand;
      if (da > 0 && da < 1.2) for (let i = 0; i < 26; i++) { const an = R(i, 301) * TAU, d = (1 - Math.exp(-da * 4)) * (1.6 + 1.6 * R(i, 302)) * vv.s; drawSprite(cx, softDot('#d9b07a', 64), x + Math.cos(an) * d * 1.4, y - 4 + Math.sin(an) * d * 0.3, (0.4 + 1.2 * da) * vv.s, (1 - da / 1.2) * 0.55); }
      // collapsed chute after landing
      if (t >= DROP.tLand) {
        const cp = ep(t, DROP.tLand, DROP.tLand + 0.8, Ease.inOutCubic);
        if (cp < 1) { cx.save(); cx.globalAlpha = 1 - ep(t, DROP.tLand + 0.35, DROP.tLand + 0.8); parachute(cx, x + cp * 3 * vv.s, y - w * 0.74 + cp * 2.2 * vv.s, CHUTE_S * vv.s * (1 - 0.35 * cp), 1 - cp * 0.8, 0.25 + cp * 1.0); cx.restore(); }
      }
      const squash = t > DROP.tLand ? 1 - 0.12 * Math.exp(-(t - DROP.tLand) * 10) * Math.cos((t - DROP.tLand) * 30) : 1;
      cx.save(); cx.translate(x, y); cx.rotate(c.sway); cx.scale(1 / squash, squash);
      if (t < DROP.tLand) parachute(cx, 0, -w * 0.74, CHUTE_S * vv.s, c.open, 0);
      crate(cx, 0, 0, w, { beacon: (Math.sin(t * 10) > 0.2 ? 1 : 0.15) });
      cx.restore();
      redSmoke(cx, vv, t, c.ax + 0.2, c.ay - 1.4);
    },
    props: (cx, vv) => {
      // the plane flies over (in the sky layer, before field props)
      const px = planeAx(t); if (t > 11.3 && t < 13.2) { const [sx, sy] = P2S(vv, px, PLANE_AY); c130(cx, sx, sy, PLANE_LEN * vv.s, t, { blink: Math.sin(t * 12) > 0 ? 1 : 0.2 }); }
    },
  });
  // free-fall blur streak before chute opens
  lootPanel(ctx, t);
  // off-screen fights during looting (muzzle flicker)
  for (const ft of [13.95, 14.45, 15.0, 15.13, 15.26, 15.39]) { const a = impulse(t, ft, 25) * (t >= ft ? 1 : 0); if (a > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawSprite(ctx, softDot('#ffb060', 128), ft < 14.9 ? 120 : 980, 900, 380, a * 0.6); ctx.restore(); } }
  for (const ft of [15.0, 15.13, 15.26, 15.39]) hudHitmarker(ctx, W / 2, H / 2, t - ft, true);
}

// ═════════════════════════ S4 — AMBUSH, SMOKE & REVIVES, THE PAN ═════════════════════════
const KNOCKS = [15.74, 15.92, 16.1], REVS = [[16.9, 17.6], [17.86, 18.56], [18.82, 19.52]];
const SMOKE_POP = 16.62, PAN_HIT = 19.96;
function reviveView(t) {
  const sh = 0.06 * Math.sin(t * 0.9);
  return { ax: -21.5 + sh + (t - 15.6) * 0.06, ay: 2.4, s: 40 };
}
function tracers(ctx, t) {
  const list = [15.64, 15.7, 15.76, 15.83, 15.9, 15.97, 16.04, 16.1, 16.17];
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  list.forEach((t0, i) => {
    const a = t - t0; if (a < 0 || a > 0.09) return;
    const y0 = 380 + R(i, 601) * 300, y1 = 520 + R(i, 602) * 420; const u = a / 0.09;
    const x0 = W + 40 - u * 900, x1 = x0 - 260;
    const g = ctx.createLinearGradient(x0, y0, x1, lerp(y0, y1, 0.3)); g.addColorStop(0, 'rgba(255,240,180,0.95)'); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, lerp(y0, y1, u)); ctx.lineTo(x1, lerp(y0, y1, u) - 30); ctx.stroke();
  });
  ctx.restore();
  // impacts on the ground / hay bales
  list.forEach((t0, i) => { const a = t - t0 - 0.06; if (a < 0 || a > 0.5) return; const x = 260 + R(i, 603) * 560, y = 640 + R(i, 604) * 260; for (let k = 0; k < 5; k++) drawSprite(ctx, softDot('#d8b27a', 32), x + (R(k, i) - 0.5) * 80 * a * 4, y - a * 120 * R(k, i + 3), 10 + 50 * a, (1 - a / 0.5) * 0.6); });
}
function damageIndicator(ctx, t) {
  let a = 0; for (const k of [15.66, 15.8, 15.95, 16.1]) a = Math.max(a, impulse(t, k, 6) * (t >= k ? 1 : 0));
  if (a < 0.02) return;
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.75); g.addColorStop(0, 'rgba(200,0,0,0)'); g.addColorStop(1, `rgba(200,10,0,${0.55 * a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = `rgba(255,40,30,${0.9 * a})`; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 150, -0.45, 0.45); ctx.stroke();
  ctx.restore();
}
function smokeCloud(ctx, t) {
  if (t < SMOKE_POP) return 0;
  const age = t - SMOKE_POP, fade = 1 - ep(t, 19.45, 20.0, Ease.inOutQuad);
  const N = 72; const ox = 560, oy = 600;
  ctx.save();
  for (let i = 0; i < N; i++) {
    const an = R(i, 701) * TAU, sp = 0.55 + 0.9 * R(i, 702);
    const reach = (1 - Math.exp(-age * (2.2 + 1.5 * R(i, 703)))) * (260 + 420 * R(i, 704)) * sp;
    const disperse = ep(t, 19.45, 20.1, Ease.inQuad) * 500 * (0.5 + R(i, 707));
    const x = ox + Math.cos(an) * (reach + disperse) * 1.25, y = oy + Math.sin(an) * (reach + disperse) * 0.75 - age * 22 * R(i, 705);
    const r = (120 + 260 * R(i, 706)) * (0.25 + 0.75 * (1 - Math.exp(-age * 2.5)));
    const spr = smokeSprite(5 + (i % 4), 160, i % 3 === 0 ? '#bdb8b2' : i % 3 === 1 ? '#ecE9e4'.toLowerCase() : '#d9d5cf');
    ctx.globalAlpha = 0.9 * fade * Math.min(1, age * 5); ctx.save(); ctx.translate(x, y); ctx.rotate(R(i, 708) * TAU + age * 0.15 * (R(i, 709) - 0.5)); ctx.drawImage(spr, -r, -r, r * 2, r * 2); ctx.restore();
  }
  ctx.globalAlpha = 1;
  // overall veil (thick smoke) with warm sunset tint from the left
  const veil = ep(t, SMOKE_POP + 0.15, SMOKE_POP + 0.5) * fade;
  if (veil > 0) {
    ctx.fillStyle = `rgba(214,210,204,${0.5 * veil})`; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgba(255,170,110,${0.28 * veil})`); g.addColorStop(0.6, 'rgba(255,170,110,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { const x = fract(R(i, 711) + t * 0.05 * (R(i, 712) - 0.3)) * (W + 400) - 200, y = 60 + R(i, 713) * 960; const r = 180 + 260 * R(i, 714); ctx.globalAlpha = (i % 3 ? 0.55 : 0.35) * veil; ctx.drawImage(smokeSprite(9 + (i % 3), 160, '#f4f2ee'), x - r, y - r, r * 2, r * 2); }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return veil;
}
function reviveUI(ctx, t) {
  if (t < REVS[0][0] - 0.25 || t > 19.75) return;
  const A = ep(t, REVS[0][0] - 0.25, REVS[0][0]) * (1 - ep(t, 19.55, 19.75));
  ctx.save(); ctx.globalAlpha = A;
  // current revive index
  let k = 0; for (let i = 0; i < 3; i++) if (t >= REVS[i][0] - 0.14) k = i;
  for (let i = 0; i < 3; i++) {
    const [a, b] = REVS[i];
    const pb = i > 0 ? REVS[i - 1][1] : 0;
    const enter = i === 0 ? ep(t, a - 0.22, a + 0.02, Ease.outCubic) : ep(t, pb + 0.19, pb + 0.34, Ease.outCubic), leave = i < 2 ? ep(t, b + 0.05, b + 0.19, Ease.inCubic) : 0;
    if (enter <= 0 || leave >= 1) continue;
    const m = SQUAD[i + 1];
    const x = W / 2 + (1 - enter) * 300 - leave * 300, al = Math.min(enter, 1 - leave);
    ctx.save(); ctx.globalAlpha *= al;
    const p = prog(t, a, b);
    text(ctx, p >= 1 ? 'REVIVED' : 'REVIVING', x, 330, { size: 28, fam: 'bar', w: 800, ls: 6, align: 'center', color: p >= 1 ? m.col : '#ffffff', shadow: 'rgba(0,0,0,0.6)', sb: 8 });
    const nw = tw(ctx, m.name, 54, 'bar', 800) + 56;
    badge(ctx, x - nw / 2 + 20, 375, 38, m.n, m.col);
    text(ctx, m.name, x - nw / 2 + 52, 394, { size: 54, fam: 'bar', w: 800, color: '#fff', shadow: 'rgba(0,0,0,0.6)', sb: 10 });
    const pop = p >= 1 ? 1 + 0.15 * Math.exp(-(t - b) * 8) * Math.cos((t - b) * 30) : 1;
    hudReviveRing(ctx, x, 540, p, m, 1, 1.25 * pop);
    if (p < 1) { rr(ctx, x - 20, 640, 40, 40, 6); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill(); text(ctx, 'F', x, 670, { size: 30, fam: 'raj', w: 700, align: 'center', color: '#111' }); text(ctx, '▶▶', x + 34, 668, { size: 18, fam: 'raj', w: 700, color: 'rgba(255,255,255,0.8)' }); }
    ctx.restore();
  }
  // progress chips 1/3 2/3 3/3
  const cw = 196, gap = 16, x0 = W / 2 - (cw * 3 + gap * 2) / 2;
  for (let i = 0; i < 3; i++) {
    const m = SQUAD[i + 1], done = t >= REVS[i][1], active = t >= REVS[i][0] && !done;
    const x = x0 + i * (cw + gap), y = 740;
    rr(ctx, x, y, cw, 46, 6); ctx.fillStyle = done ? rgba(m.col, 0.28) : 'rgba(0,0,0,0.5)'; ctx.fill();
    if (active) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    badge(ctx, x + 24, y + 23, 26, m.n, m.col);
    text(ctx, m.name, x + 46, y + 32, { size: 24, fam: 'bar', w: 700, color: '#fff' });
    text(ctx, done ? '✓' : active ? '…' : '', x + cw - 16, y + 33, { size: 26, fam: 'raj', w: 700, align: 'right', color: done ? m.col : '#fff' });
  }
  ctx.restore();
}
const PANS = { P: [110, 1120], panL: 430, t0: 19.8 };
function attackerAt(t) {
  // close-range rusher, feet below frame
  const run = ep(t, 19.52, PAN_HIT, Ease.outQuad), hit = t >= PAN_HIT ? ep(t, PAN_HIT, PAN_HIT + 0.55, Ease.lin) : 0;
  return { x: lerp(1380, 770, run) + hit * 420, y: 1270 + hit * 60, h: 900, ph: Math.min(t, PAN_HIT) * 10, hit };
}
function panTarget() { const A = attackerAt(PAN_HIT - 0.001); const J = poseJoints({ type: 'run', ph: A.ph }); return [A.x - J.head[0] * A.h, A.y + J.head[1] * A.h]; }
function panAngle(t) {
  const T = panTarget(), P = PANS.P; const th = Math.atan2(T[1] - P[1], T[0] - P[0]);
  if (t < PAN_HIT) return lerp(-2.75, th, Ease.inCubic(prog(t, PANS.t0, PAN_HIT)));
  const a = t - PAN_HIT; return th + 0.22 * (1 - Math.exp(-a * 14)) + 0.06 * Math.exp(-a * 9) * Math.sin(a * 40) - ep(t, PAN_HIT + 0.18, PAN_HIT + 0.42, Ease.inCubic) * 1.6;
}
function drawArmPan(ctx, th, alpha, smear = false) {
  const T = panTarget(), P = PANS.P; const dist = Math.hypot(T[0] - P[0], T[1] - P[1]);
  const armL = dist - 0.68 * PANS.panL; const hand = [P[0] + Math.cos(th) * armL, P[1] + Math.sin(th) * armL];
  ctx.save(); ctx.globalAlpha *= alpha;
  if (!smear) {
    ctx.fillStyle = '#2d3324'; limb(ctx, P, hand, 170, 96);
    ctx.fillStyle = 'rgba(255,190,120,0.25)'; // rim on sleeve
    ctx.fillStyle = '#16181a'; circle(ctx, hand[0], hand[1], 52); ctx.fill();
  }
  gun(ctx, 'pan', hand[0] - Math.cos(th) * 20, hand[1] - Math.sin(th) * 20, PANS.panL, th, smear ? 'rgba(220,225,232,1)' : '#1c1d21', smear ? {} : { hi: 'rgba(255,214,170,0.6)' });
  if (!smear) { const hc = [hand[0] + Math.cos(th) * (0.68 * PANS.panL - 20), hand[1] + Math.sin(th) * (0.68 * PANS.panL - 20)]; ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 8; circle(ctx, hc[0], hc[1], 0.2 * PANS.panL); ctx.stroke(); }
  ctx.restore();
}
function panSwing(ctx, t) {
  if (t < PANS.t0 || t > PAN_HIT + 0.5) return;
  const fade = 1 - ep(t, PAN_HIT + 0.32, PAN_HIT + 0.5);
  // speed arc behind the pan head
  if (t < PAN_HIT + 0.08) {
    const T = panTarget(), P = PANS.P, R0 = Math.hypot(T[0] - P[0], T[1] - P[1]);
    const a1 = panAngle(Math.min(t, PAN_HIT)), a0 = panAngle(Math.max(PANS.t0, t - 0.07));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) { ctx.strokeStyle = `rgba(255,240,220,${0.18 - k * 0.03})`; ctx.lineWidth = 26 - k * 4; ctx.beginPath(); ctx.arc(P[0], P[1], R0 - 60 + k * 30, a0, a1); ctx.stroke(); }
    ctx.restore();
  }
  for (let k = 5; k >= 1; k--) { const tt = t - k * 0.01; if (tt < PANS.t0 || tt > PAN_HIT) continue; drawArmPan(ctx, panAngle(tt), 0.1 * fade, true); }
  drawArmPan(ctx, panAngle(t), fade);
}
function sRevive(ctx, t) {
  const v = reviveView(t);
  drawVista(ctx, v, {
    t, fg: false,
    near: (c, vv) => {
      // revived teammates standing up after the smoke clears
      const st = ep(t, 19.9, 20.35);
      if (st > 0) [[-28.8, 3.9, 0], [-26.4, 4.15, 1], [-24.0, 3.85, 2]].forEach(([ax, ay, i]) => { const [x, y] = P2S(vv, ax, ay); c.save(); c.globalAlpha = st; soldier(c, x, y + (1 - st) * 40, 1.9 * vv.s, { type: i === 1 ? 'aim' : 'stand' }, { rim: RIM, col: THEME.ink, dir: 1 }); c.restore(); const m = SQUAD[i + 1]; text(c, m.name, x, y - 2.15 * vv.s, { size: 22, fam: 'bar', w: 800, align: 'center', color: m.col, alpha: st, shadow: 'rgba(0,0,0,0.9)', sb: 6 }); });

    },
  });
  tracers(ctx, t);
  // grenade arc
  if (!CLIPCTX.noSmoke && t > 16.28 && t < SMOKE_POP + 0.05) { const u = prog(t, 16.28, SMOKE_POP); const x = lerp(900, 560, u), y = lerp(1120, 600, u) - Math.sin(u * Math.PI) * 260; smokeGrenade(ctx, x, y, 46, t * 14); }
  const veil = CLIPCTX.noSmoke ? 0 : smokeCloud(ctx, t);
  if (THEME.rain && veil > 0) rainFX(ctx, t, 0.55 * veil);
  if (!CLIPCTX.noReviveUI) reviveUI(ctx, t);
  if (t > 19.5 && t < 20.8 && !CLIPCTX.noAttacker) {
    const A = attackerAt(t);
    ctx.save(); ctx.globalAlpha = ep(t, 19.52, 19.66);
    soldier(ctx, A.x, A.y, A.h, { type: 'run', ph: A.ph }, { rim: { c: THEME.rim, dx: 0.006, dy: -0.006 }, col: THEME.ink, dir: -1, fall: A.hit * 0.9 });
    ctx.restore();
    // helmet knocked off
    if (A.hit > 0) { const a = t - PAN_HIT; const T = panTarget(); ctx.save(); ctx.translate(T[0] + 60 + a * 900, T[1] - 40 - a * 700 + a * a * 1600); ctx.rotate(a * 11); ctx.scale(0.62, 0.62); ctx.fillStyle = '#231a1d'; ctx.beginPath(); ctx.moveTo(-122, -10); ctx.bezierCurveTo(-126, -110, -10, -165, 72, -132); ctx.bezierCurveTo(126, -108, 138, -30, 128, 26); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  panSwing(ctx, t);
  // CLANG!
  const ca = t - PAN_HIT;
  if (ca > 0 && ca < 0.65) {
    const TT = panTarget(); ctx.save(); ctx.translate(Math.min(TT[0] + 40, 760), Math.max(TT[1] - 150, 300)); ctx.rotate(-0.12);
    const k = ep(ca, 0, 0.12, Ease.outBack), out = ep(ca, 0.45, 0.65);
    ctx.scale(lerp(0.4, 1, k) * (1 + out * 0.2), lerp(0.4, 1, k) * (1 + out * 0.2)); ctx.globalAlpha = 1 - out;
    // burst star
    ctx.fillStyle = '#fff3b0'; ctx.beginPath(); for (let i = 0; i < 24; i++) { const r = i % 2 ? 120 : 230 + 30 * R(i, 5); const an = i / 24 * TAU; ctx.lineTo(Math.cos(an) * r * 1.3, Math.sin(an) * r * 0.8); } ctx.closePath(); ctx.fill();
    text(ctx, 'CLANG!', 0, 44, { size: 150, fam: 'osw', w: 700, align: 'center', color: '#ffcf1a', stroke: '#111', lw: 16 });
    text(ctx, 'CLANG!', 0, 44, { size: 150, fam: 'osw', w: 700, align: 'center', color: '#ffcf1a' });
    ctx.restore();
  }
  damageIndicator(ctx, t);
}
