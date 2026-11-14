'use strict';
// ═════════════════════════ S2 — KILLS (Kar98k ×8 → bullet cam → M416 red dot) ═════════════════════════
const EH = 1.55; // enemy height (deg)
const RIM = { c: '#ffc27a', dx: -0.012, dy: -0.008 };
const S2E = [
  { ax0: 5.0, ay: 6.0, sp: 1.25, ph: 0.0, die: 8.86 },
  { ax0: 6.5, ay: 6.4, sp: 1.2, ph: 1.7, die: 9.86 },
  { ax0: 7.5, ay: 5.7, sp: 1.32, ph: 3.1, die: 10.32, turn: 9.0 },
  { ax0: 8.7, ay: 6.25, sp: 1.15, ph: 4.4, die: 10.8, crouch: 9.3 },
];
function s2pos(e, t) {
  const tt = Math.min(t, e.die);
  let ax = e.ax0 - e.sp * (tt - 6.3), dir = -1, mode = 'run';
  if (e.turn && tt > e.turn) { ax = e.ax0 - e.sp * (e.turn - 6.3) + 1.45 * (tt - e.turn); dir = 1; }
  if (e.crouch && tt > e.crouch) { ax = e.ax0 - e.sp * (e.crouch - 6.3); mode = 'crouch'; }
  return { ax, ay: e.ay, dir, mode };
}
const headOf = (p) => [p.ax + 0.06 * p.dir, p.ay - EH * (p.mode === 'crouch' ? 0.62 : 0.86)];
function drawS2Enemies(ctx, v, t) {
  S2E.forEach((e, i) => {
    const p = s2pos(e, t);
    const [x, y] = P2S(v, p.ax, p.ay);
    const h = EH * v.s; if (x < -h || x > W + h) return;
    const dead = t >= e.die, f = dead ? prog(t, e.die, e.die + 0.6) : 0;
    // contact shadow
    ctx.fillStyle = 'rgba(40,25,10,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, h * (dead ? 0.5 * f + 0.18 : 0.18), h * 0.035, 0, 0, TAU); ctx.fill();
    const pose = p.mode === 'crouch' ? { type: 'crouch' } : { type: 'run', ph: e.ph + Math.min(t, e.die) * 11 };
    soldier(ctx, x, y, h, pose, { dir: p.dir, rim: RIM, col: THEME.ink, fall: dead ? f : 0 });
    // hit puffs
    for (const ht of hitTimes(i)) { const a = t - ht; if (a > 0 && a < 0.35) { const [hx, hy] = P2S(v, ...headOf(p)); for (let k = 0; k < 7; k++) { const an = R(k, ht * 100) * TAU, d = a * (40 + 80 * R(k, 3)) * v.s / 60; drawSprite(ctx, softDot(k % 2 ? '#b0201a' : '#e8d0b0', 32), hx + Math.cos(an) * d, hy + Math.sin(an) * d + (i === 0 ? 0 : h * 0.22), (3 + 6 * a) * v.s / 50, (1 - a / 0.35) * 0.8); } } }
    // dust when hitting the ground
    if (dead) { const a = t - (e.die + 0.42); if (a > 0 && a < 0.7) for (let k = 0; k < 9; k++) { const an = Math.PI + R(k, 9 + i) * Math.PI, d = (20 + 50 * R(k, 4)) * a * v.s / 40; drawSprite(ctx, softDot('#cfa66a', 32), x + p.dir * -h * 0.5 + Math.cos(an) * d * 1.6, y + Math.sin(an) * d * 0.4, h * (0.06 + 0.12 * a), (1 - a / 0.7) * 0.5); } }
  });
}
// M416 sprays: 4 shots before each kill
const SPRAY = [];
S2E.slice(1).forEach(e => [0.2, 0.14, 0.08, 0.02].forEach(d => SPRAY.push(e.die - d)));
function hitTimes(i) { if (i === 0) return [8.86]; const d = S2E[i].die; return [d - 0.14, d - 0.08, d - 0.02]; }
const lastShot = (t, list) => { let s = -1; for (const x of list) if (x <= t) s = x; return s; };

function scopeOverlay(ctx, R, o = {}) {
  const cx = W / 2, cy = H / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(-40, -40, W + 80, H + 80); ctx.arc(cx, cy, R, 0, TAU, true); ctx.fillStyle = '#030303'; ctx.fill('evenodd');
  const g = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0.96)');
  ctx.fillStyle = g; circle(ctx, cx, cy, R + 1); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,80,40,0.22)'; circle(ctx, cx, cy, R - 4); ctx.stroke();
  ctx.strokeStyle = 'rgba(80,150,255,0.18)'; circle(ctx, cx, cy, R - 9); ctx.stroke();
  // lens glare
  ctx.save(); circle(ctx, cx, cy, R); ctx.clip();
  const gl = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.2, cy + R * 0.2); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.35, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = gl; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  if (o.reticle !== false) {
    ctx.strokeStyle = 'rgba(8,8,8,0.92)'; ctx.fillStyle = 'rgba(8,8,8,0.92)'; ctx.lineCap = 'butt';
    ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx - 9, cy); ctx.moveTo(cx + 9, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy - 9); ctx.moveTo(cx, cy + 9); ctx.lineTo(cx, cy + R); ctx.stroke();
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx - R * 0.45, cy); ctx.moveTo(cx + R * 0.45, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy + R); ctx.lineTo(cx, cy + R * 0.45); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy - R * 0.45); ctx.stroke();
    ctx.lineWidth = 2;
    for (let k = 1; k <= 8; k++) { const d = k * 24; ctx.beginPath(); ctx.moveTo(cx - d, cy - (k % 2 ? 5 : 9)); ctx.lineTo(cx - d, cy + (k % 2 ? 5 : 9)); ctx.moveTo(cx + d, cy - (k % 2 ? 5 : 9)); ctx.lineTo(cx + d, cy + (k % 2 ? 5 : 9)); ctx.stroke(); }
    for (let k = 1; k <= 6; k++) { const d = k * 30, w = 30 - k * 3; ctx.beginPath(); ctx.moveTo(cx - w, cy + d); ctx.lineTo(cx + w, cy + d); ctx.stroke(); if (k > 1) text(ctx, String(k), cx + w + 6, cy + d + 5, { size: 14, fam: 'raj', w: 700, color: 'rgba(8,8,8,0.9)' }); }
    circle(ctx, cx, cy, 2.2); ctx.fill();
  }
  ctx.restore();
}
function muzzleBloom(ctx, x, y, a, scale = 1) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, softDot('#ffb050', 128), x, y, 420 * scale, a * 0.85);
  drawSprite(ctx, softDot('#fff2c8', 128), x, y, 160 * scale, a);
  ctx.restore();
}
function muzzleStar(ctx, x, y, s, a, seed) {
  if (a <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(R(seed, 77) * TAU); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  const n = 5; ctx.fillStyle = '#ffd68a';
  ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? s * 0.18 : s * (0.7 + 0.5 * R(i, seed)); const an = i / (n * 2) * TAU; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r * 0.7); } ctx.closePath(); ctx.fill();
  drawSprite(ctx, softDot('#ffffff', 64), 0, 0, s * 0.5, 1);
  ctx.restore();
}
function redDotSight(ctx, t, kick, lower = 0) {
  ctx.save(); ctx.translate(0, kick + lower);
  // handguard + rail in perspective
  const g = ctx.createLinearGradient(0, 780, 0, 1080); g.addColorStop(0, '#2a2b30'); g.addColorStop(1, '#0e0f12');
  ctx.fillStyle = g; poly(ctx, [[330, 1090], [750, 1090], [612, 792], [468, 792]]); ctx.fill();
  ctx.fillStyle = '#3a3c43'; poly(ctx, [[492, 1090], [588, 1090], [557, 800], [523, 800]]); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3;
  for (let k = 0; k < 12; k++) { const u = Math.pow(k / 12, 1.6); const y = lerp(1090, 805, u); const hw = lerp(48, 17, u); ctx.beginPath(); ctx.moveTo(540 - hw, y); ctx.lineTo(540 + hw, y); ctx.stroke(); }
  // side vents
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let k = 0; k < 5; k++) { const u = k / 5; const y = lerp(1040, 840, u), xw = lerp(150, 60, u); rr(ctx, 540 - xw - 30, y, 22 - u * 10, 10 - u * 4, 3); ctx.fill(); rr(ctx, 540 + xw + 8 + u * 10, y, 22 - u * 10, 10 - u * 4, 3); ctx.fill(); }
  // muzzle device
  ctx.fillStyle = '#18191c'; rr(ctx, 518, 768, 44, 30, 4); ctx.fill();
  // rim light on handguard edges
  ctx.strokeStyle = 'rgba(255,190,120,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(468, 792); ctx.lineTo(330, 1090); ctx.stroke();
  // sight mount
  ctx.fillStyle = '#1b1c20'; poly(ctx, [[484, 660], [596, 660], [578, 806], [502, 806]]); ctx.fill();
  // sight tube (seen from behind)
  const cx = 540, cy = 540, Ro = 150, Ri = 121;
  ctx.beginPath(); ctx.arc(cx, cy, Ro, 0, TAU); ctx.arc(cx, cy, Ri, 0, TAU, true);
  const rg = ctx.createLinearGradient(0, cy - Ro, 0, cy + Ro); rg.addColorStop(0, '#4a4c54'); rg.addColorStop(0.25, '#26272c'); rg.addColorStop(1, '#0f1013');
  ctx.fillStyle = rg; ctx.fill('evenodd');
  ctx.strokeStyle = 'rgba(255,200,140,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Ro - 1, Math.PI * 1.1, Math.PI * 1.75); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 3; circle(ctx, cx, cy, Ri); ctx.stroke();
  // turret knob
  ctx.fillStyle = '#1d1e22'; rr(ctx, cx + Ro - 14, cy - 34, 34, 68, 6); ctx.fill();
  // glass
  ctx.save(); circle(ctx, cx, cy, Ri); ctx.clip();
  const gg = ctx.createLinearGradient(cx - Ri, cy - Ri, cx + Ri, cy + Ri); gg.addColorStop(0, 'rgba(120,160,255,0.10)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.03)'); gg.addColorStop(1, 'rgba(255,120,200,0.08)');
  ctx.fillStyle = gg; ctx.fillRect(cx - Ri, cy - Ri, Ri * 2, Ri * 2);
  ctx.restore();
  ctx.restore();
  // the dot (not translated by lower: it rides with the sight)
  ctx.save(); ctx.translate(0, kick + lower);
  ctx.globalCompositeOperation = 'lighter'; drawSprite(ctx, softDot('#ff2a1a', 64), 540, 540, 16, 0.9); ctx.globalCompositeOperation = 'source-over';
  circle(ctx, 540, 540, 3.6); ctx.fillStyle = '#ff6b5c'; ctx.fill();
  ctx.restore();
}

function sKillsView(t) {
  // camera for S2 at time t → {v, mode}
  const e0 = S2E[0];
  const lead = (tt) => { const p = s2pos(e0, tt); const h = headOf(p); return [h[0] - 0.12, h[1] + 0.05]; };
  if (t < 7.2) {
    const p = prog(t, 6.3, 7.2), dive = ep(t, 6.3, 6.62, Ease.outCubic);
    return { v: { ax: lerp(0.8, 1.7, p), ay: 4.4 + (1 - dive) * 1.6, s: lerp(46, 17, dive) + 2 * p }, mode: 'wide' };
  }
  if (t < 7.45) {
    const u = ep(t, 7.2, 7.45, Ease.inOutCubic);
    const v0 = { ax: 1.7, ay: 4.4, s: 19 }, tg = lead(t);
    const s = Math.exp(lerp(Math.log(v0.s), Math.log(68), u));
    const d0 = [(tg[0] - v0.ax) * v0.s, (tg[1] - v0.ay) * v0.s];
    return { v: { ax: tg[0] - d0[0] * (1 - u) / s, ay: tg[1] - d0[1] * (1 - u) / s, s }, mode: 'ads', R: lerp(1250, 440, u) };
  }
  if (t < 8.08) {
    const tg = lead(Math.min(t, 8.05)), hold = ep(t, 7.55, 7.8);
    const amp = lerp(0.32, 0.045, hold);
    const sw = [fbm1(t * 1.3, 11) * amp, fbm1(t * 1.1, 12) * amp * 0.8];
    const rec = -1.3 * impulse(t, 8.05, 9);
    return { v: { ax: tg[0] + sw[0], ay: tg[1] + sw[1] + rec, s: 68 + 4 * hold }, mode: 'scope', R: 440 };
  }
  if (t < 8.98) return { mode: 'bullet' };
  if (t < 9.3) {
    const p = s2pos(e0, 8.86), h = headOf(p);
    const amp = 0.09; const sw = [fbm1(t * 1.3, 11) * amp, fbm1(t * 1.1, 12) * amp];
    return { v: { ax: h[0] + 0.1 + sw[0], ay: h[1] + 0.55 + sw[1] - 0.6 * impulse(t, 8.98, 6), s: 70 }, mode: 'scope', R: 440 };
  }
  // M416: aim sequencing
  const tgts = S2E.slice(1);
  const headAim = (e, tt) => { const p = s2pos(e, Math.min(tt, e.die)); const h = headOf(p); return [h[0], h[1] + EH * 0.18]; };
  let aim = headAim(tgts[0], t);
  const p0 = s2pos(e0, 8.86), from0 = [headOf(p0)[0], headOf(p0)[1] + 0.55];
  if (t < 9.62) aim = [lerp(from0[0], aim[0], ep(t, 9.3, 9.62, Ease.inOutCubic)), lerp(from0[1], aim[1], ep(t, 9.3, 9.62, Ease.inOutCubic))];
  for (let k = 1; k < tgts.length; k++) {
    const d = tgts[k].die, prevD = tgts[k - 1].die;
    if (t >= prevD) { const a = headAim(tgts[k - 1], prevD), b = headAim(tgts[k], t); const u = ep(t, d - 0.36, d - 0.21, Ease.inOutCubic); aim = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
  }
  // recoil from spray
  let rec = 0; for (const s of SPRAY) if (t >= s) rec += 0.32 * impulse(t, s, 14);
  const s0 = lerp(70, 42, ep(t, 9.3, 9.48, Ease.inOutCubic));
  const amp = 0.05; const sw = [fbm1(t * 1.7, 21) * amp, fbm1(t * 1.4, 22) * amp];
  const lift = ep(t, 11.05, 11.75, Ease.inCubic) * 9;
  return { v: { ax: aim[0] + sw[0], ay: aim[1] + sw[1] - rec - lift, s: s0 }, mode: t < 9.48 ? 'scope-out' : 'reddot', R: lerp(440, 1300, ep(t, 9.3, 9.48)) };
}
function sKills(ctx, t) {
  const cv = sKillsView(t);
  if (cv.mode === 'bullet') { bulletCam(ctx, t); return; }
  const v = cv.v;
  drawVista(ctx, v, { t, near: (c, vv) => drawS2Enemies(c, vv, t), fg: cv.mode === 'wide' || cv.mode === 'ads' });
  if (cv.mode === 'wide' || (cv.mode === 'ads' && t < 7.3)) {
    // spotting brackets around the group
    const a = ep(t, 6.75, 6.95) * (1 - ep(t, 7.2, 7.3));
    if (a > 0) {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      S2E.forEach(e => { const p = s2pos(e, t); const [x, y] = P2S(v, p.ax, p.ay); x0 = Math.min(x0, x - 14); x1 = Math.max(x1, x + 14); y0 = Math.min(y0, y - EH * v.s - 8); y1 = Math.max(y1, y + 6); });
      const pad = (1 - ep(t, 6.75, 7.0, Ease.outBack)) * 40;
      x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.p1; ctx.lineWidth = 3; const L = 16;
      ctx.beginPath(); ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0); ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L); ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1); ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L); ctx.stroke();
      text(ctx, '×4  ·  255  ·  310 M', x1 + 10, y0 + 18, { size: 20, fam: 'bar', w: 800, ls: 1, color: C.p1, shadow: 'rgba(0,0,0,0.9)', sb: 6 });
      ctx.restore();
    }
  }
  if (cv.mode === 'ads' || cv.mode === 'scope' || cv.mode === 'scope-out') {
    // muzzle flash of the Kar98k
    const fa = impulse(t, 8.05, 22) * (t >= 8.05 ? 1 : 0);
    if (fa > 0.01) { muzzleBloom(ctx, W / 2, H * 0.98, fa, 1.4); ctx.fillStyle = `rgba(255,240,210,${0.35 * fa})`; ctx.fillRect(0, 0, W, H); }
    scopeOverlay(ctx, cv.R);
    if (t > 8.98) hudHitmarker(ctx, W / 2, H / 2, t - 8.98, true);
  }
  if (cv.mode === 'reddot' || cv.mode === 'scope-out') {
    const ls = lastShot(t, SPRAY); const fa = ls > 0 ? impulse(t, ls, 40) : 0;
    let kick = 0; for (const s of SPRAY) if (t >= s) kick += 16 * impulse(t, s, 16);
    const lower = ep(t, 11.0, 11.45, Ease.inCubic) * 700;
    const ina = ep(t, 9.38, 9.52);
    ctx.save(); ctx.globalAlpha = ina; ctx.translate(0, (1 - ina) * 300);
    if (fa > 0.02) { muzzleBloom(ctx, 540, 760 + kick, fa, 0.9); }
    redDotSight(ctx, t, kick, lower);
    if (fa > 0.02) muzzleStar(ctx, 540, 752 + kick + lower, 120, fa, Math.round(ls * 100));
    ctx.restore();
    // hitmarkers
    S2E.slice(1).forEach((e, i) => { for (const h of hitTimes(i + 1)) hudHitmarker(ctx, W / 2, H / 2, t - h, h === e.die - 0.02 && false); hudHitmarker(ctx, W / 2, H / 2, t - e.die, true); });
  }
}

// ── bullet cam ──
function bulletCam(ctx, t) {
  const u = prog(t, 8.08, 8.86);
  // background: smeared vista
  const b = buf('bc');
  drawVista(b.x, { ax: lerp(-4, 6, u), ay: 5.2, s: 30 }, { t: 8.0, fg: false, near: (c, vv) => drawS2Enemies(c, vv, 8.84) });
  ctx.save();
  for (let k = 0; k < 9; k++) { ctx.globalAlpha = 1 / (k + 1); ctx.drawImage(b.c, -k * 22, 0, W, H); }
  ctx.restore();
  ctx.fillStyle = 'rgba(20,10,5,0.25)'; ctx.fillRect(0, 0, W, H);
  // speed streaks
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) { const y = R(i, 81) * H, sp = 1600 + R(i, 82) * 2600; const x = W - fract(R(i, 83) + t * sp / 2400) * (W + 600); ctx.strokeStyle = `rgba(255,230,200,${0.08 + 0.12 * R(i, 84)})`; ctx.lineWidth = 1 + 2 * R(i, 85); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 180 + 300 * R(i, 86), y); ctx.stroke(); }
  ctx.restore();
  const bx = 470, by = 540, bob = Math.sin(t * 40) * 1.5;
  // trail / heat haze
  ctx.save();
  const tg = ctx.createLinearGradient(bx - 520, 0, bx, 0); tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(255,240,220,0.35)');
  ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(bx - 560, by - 6); ctx.quadraticCurveTo(bx - 200, by - 30, bx - 140, by - 34); ctx.lineTo(bx - 140, by + 34); ctx.quadraticCurveTo(bx - 200, by + 30, bx - 560, by + 6); ctx.fill();
  for (let k = 0; k < 6; k++) { const ph = fract(k / 6 + t * 3.2); const x = bx + 120 - ph * 700, r = 40 + ph * 70; ctx.strokeStyle = `rgba(255,255,255,${0.22 * (1 - ph)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, by, r * 0.22, r, 0, 0, TAU); ctx.stroke(); }
  // shock cone from the tip
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx + 175, by); ctx.quadraticCurveTo(bx + 60, by - 60, bx - 120, by - 150); ctx.moveTo(bx + 175, by); ctx.quadraticCurveTo(bx + 60, by + 60, bx - 120, by + 150); ctx.stroke();
  ctx.restore();
  // the bullet (.30-cal spitzer boat-tail, copper jacket)
  drawSprite(ctx, softDot('#1a0c06', 128), bx, by, 300, 0.5);
  ctx.save(); ctx.translate(bx, by + bob);
  const body = new Path2D();
  body.moveTo(-158, -27); body.lineTo(-122, -34); body.lineTo(52, -34);
  body.bezierCurveTo(112, -33, 150, -15, 176, -1.6); body.lineTo(179, 0); body.lineTo(176, 1.6);
  body.bezierCurveTo(150, 15, 112, 33, 52, 34); body.lineTo(-122, 34); body.lineTo(-158, 27); body.closePath();
  ctx.shadowColor = 'rgba(255,170,90,0.6)'; ctx.shadowBlur = 26; ctx.fillStyle = '#7a3a18'; ctx.fill(body); ctx.shadowBlur = 0;
  const bg = ctx.createLinearGradient(0, -34, 0, 34);
  bg.addColorStop(0, '#f6c79a'); bg.addColorStop(0.12, '#fff0dc'); bg.addColorStop(0.26, '#e8a066'); bg.addColorStop(0.55, '#a8522a'); bg.addColorStop(0.82, '#5c2a12'); bg.addColorStop(1, '#2e1408');
  ctx.fillStyle = bg; ctx.fill(body);
  ctx.save(); ctx.clip(body);
  ctx.strokeStyle = 'rgba(70,30,10,0.22)'; ctx.lineWidth = 2;
  for (let k = 0; k < 10; k++) { const x = -120 + fract(k / 10 + t * 9) * 170; ctx.beginPath(); ctx.moveTo(x, -36); ctx.lineTo(x + 14, 36); ctx.stroke(); }
  const sg = ctx.createLinearGradient(-160, 0, 180, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.35, 'rgba(255,255,255,0.8)'); sg.addColorStop(0.8, 'rgba(255,255,255,0.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg; ctx.fillRect(-160, -27, 340, 5);
  ctx.fillStyle = 'rgba(40,15,5,0.45)'; ctx.fillRect(-58, -36, 6, 72);
  ctx.fillStyle = 'rgba(20,8,2,0.35)'; ctx.fillRect(-160, -40, 38, 80);
  const og = ctx.createLinearGradient(52, 0, 179, 0); og.addColorStop(0, 'rgba(0,0,0,0)'); og.addColorStop(1, 'rgba(255,230,200,0.25)');
  ctx.fillStyle = og; ctx.fillRect(52, -36, 130, 72);
  ctx.restore();
  ctx.fillStyle = '#3a1a0a'; ctx.beginPath(); ctx.ellipse(-158, 0, 6, 27, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // distance + label
  const dist = Math.round(312 * (1 - u));
  text(ctx, 'BULLET CAM', 80, 196, { size: 22, fam: 'bar', w: 800, ls: 5, color: C.p1 });
  text(ctx, String(dist), 76, 290, { size: 104, fam: 'teko', w: 600, color: '#fff', shadow: 'rgba(0,0,0,0.5)', sb: 12 });
  text(ctx, 'M', 80 + tw(ctx, String(dist), 104, 'teko', 600), 290, { size: 50, fam: 'teko', w: 500, color: 'rgba(255,255,255,0.75)' });
  text(ctx, 'Kar98k  ·  7.62 MM  ·  ×0.05', 80, 326, { size: 20, fam: 'bar', w: 700, ls: 2, color: 'rgba(255,255,255,0.8)' });
  // target head arriving
  const hu = ep(t, 8.6, 8.86, Ease.inQuad);
  if (hu > 0) {
    const hx = lerp(W + 260, bx + 330, hu), hy = by + 20;
    ctx.save(); ctx.translate(hx, hy); ctx.scale(1.15, 1.15);
    enemyHeadProfile(ctx, true);
    ctx.restore();
  }
  headshotImpact(ctx, t);
}

function enemyHeadProfile(ctx, helmet = true) {
  // side profile facing left (−x), centred on the skull
  ctx.fillStyle = '#1b1215';
  ctx.beginPath(); ctx.moveTo(-30, 150); ctx.lineTo(-60, 300); ctx.lineTo(260, 330); ctx.lineTo(170, 150); ctx.closePath(); ctx.fill(); // shoulders/vest
  ctx.beginPath();
  ctx.moveTo(70, 160); ctx.bezierCurveTo(105, 70, 112, -10, 92, -60); ctx.bezierCurveTo(70, -110, 0, -125, -50, -105);
  ctx.bezierCurveTo(-92, -88, -104, -50, -104, -18); ctx.lineTo(-110, -6); ctx.lineTo(-132, 30); ctx.lineTo(-112, 40);
  ctx.lineTo(-116, 56); ctx.lineTo(-108, 64); ctx.bezierCurveTo(-112, 84, -104, 96, -84, 104); ctx.bezierCurveTo(-60, 118, -36, 120, -26, 150); ctx.closePath(); ctx.fill();
  // ear
  ctx.fillStyle = '#2a1d21'; ctx.beginPath(); ctx.ellipse(28, 18, 16, 24, 0.2, 0, TAU); ctx.fill();
  if (helmet) {
    ctx.fillStyle = '#24191c';
    ctx.beginPath(); ctx.moveTo(-122, -10); ctx.bezierCurveTo(-126, -110, -10, -165, 72, -132); ctx.bezierCurveTo(126, -108, 138, -30, 128, 26); ctx.lineTo(102, 30); ctx.bezierCurveTo(100, -40, 60, -96, -20, -92); ctx.bezierCurveTo(-70, -88, -96, -50, -100, -14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-122, -10); ctx.bezierCurveTo(-126, -110, -10, -165, 72, -132); ctx.bezierCurveTo(100, -120, 120, -86, 128, -40); ctx.lineTo(128, 26); ctx.lineTo(96, 30); ctx.bezierCurveTo(96, -40, 40, -96, -40, -96); ctx.closePath(); ctx.fill();
  }
  // warm rim along the top/back edge
  ctx.strokeStyle = 'rgba(255,190,120,0.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-124, -14); ctx.bezierCurveTo(-128, -112, -10, -167, 72, -134); ctx.stroke();
}
