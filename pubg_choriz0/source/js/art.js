'use strict';
// ═════════════════════════ WEAPON SILHOUETTES (side view, 100u long, facing +x) ═════════════════════════
const GUNS = {
  m416: [
    { t: 'p', d: [[0, -4.2], [2.5, -5.4], [15.5, -5.4], [17.5, -3], [17.5, 0.6], [9, 1.2], [3.5, 6.4], [0, 6.6]] },
    { t: 'r', d: [16, -4.4, 11, 3.4] },
    { t: 'r', d: [27, -6.2, 28, 5.2] },
    { t: 'p', d: [[27, -1.2], [54, -1.2], [54, 2.2], [44, 2.6], [27, 2.4]] },
    { t: 'r', d: [27, -7.4, 54, 1.4] },
    { t: 'r', d: [55, -6.2, 26, 6] },
    { t: 'r', d: [81, -3.9, 10, 1.9] },
    { t: 'r', d: [90, -4.9, 9.5, 3.6] },
    { t: 'p', d: [[76.5, -7.4], [77.5, -9.8], [79.4, -9.8], [80.2, -7.4]] },
    { t: 'r', d: [29, -9.6, 3.4, 2.4] },
    { t: 'p', d: [[33.5, 1.8], [38.8, 1.8], [37, 10], [32.2, 9.4]] },
    { t: 'p', d: [[44.6, 2], [51, 2], [52.6, 7.4], [54.4, 12.6], [49, 13.6], [46.6, 8]] },
    { t: 'l', d: [[38.6, 2.4], [38.8, 4.6], [44.6, 4.6]], w: 0.9 },
  ],
  kar98k: [
    { t: 'p', d: [[0, -1.5], [27, -2.2], [31, -2.8], [74, -2.6], [76, -1.4], [74, 0.6], [40, 1.4], [34, 2.2], [30, 4.2], [25, 5.3], [14, 6.6], [0, 9.6]] },
    { t: 'p', d: [[38, -4.4], [100, -3.9], [100, -2.7], [38, -2.5]] },
    { t: 'r', d: [30, -5.5, 18, 3.2] },
    { t: 'l', d: [[43, -4], [40, 0.6]], w: 1.1 },
    { t: 'c', d: [39.8, 1, 1.5] },
    { t: 'l', d: [[33, 1.6], [33.5, 4.4], [37.5, 4.4], [38, 1.6]], w: 0.8 },
    { t: 'r', d: [97.5, -5.4, 1.2, 1.6] },
    { t: 'scope', d: [[31, -10.6, 29, 3.2], [28, -11.4, 5, 4.6], [56, -12.2, 7, 6], [36, -7.6, 2, 2.4], [52, -7.6, 2, 2.4]] },
  ],
  awm: [
    { t: 'p', d: [[0, -6], [5, -7.2], [18, -7.8], [21, -5.4], [30, -4], [30, 3.6], [27, 3.6], [25.4, 9.6], [19.6, 10], [21.2, 3.6], [13, 3.2], [4.6, 10.2], [0, 10.2]] },
    { t: 'r', d: [28, -5.6, 31, 7.2] },
    { t: 'r', d: [43, 1.4, 7, 6] },
    { t: 'l', d: [[31, 1.6], [31.4, 4.2], [37, 4.2], [37, 1.6]], w: 0.8 },
    { t: 'p', d: [[58, -3.8], [91, -3.3], [91, -1.3], [58, -1]] },
    { t: 'r', d: [89.5, -4.8, 10.5, 4.6] },
    { t: 'r', d: [30, -12.6, 36, 3.4] },
    { t: 'r', d: [26.5, -13.8, 5.5, 5.8] },
    { t: 'p', d: [[60, -12.6], [64, -14.6], [69, -14.6], [69, -7.4], [64, -7.4], [60, -9.2]] },
    { t: 'r', d: [36, -9.4, 3, 4] },
    { t: 'r', d: [54, -9.4, 3, 4] },
    { t: 'r', d: [45.5, -15, 4, 2.6] },
    { t: 'l', d: [[60, 1.2], [76, 2.8]], w: 1.4 },
  ],
  pan: [
    { t: 'p', d: [[0, -1.8], [42, -2.2], [44, -1.2], [44, 1.2], [42, 2.2], [0, 1.8]] },
    { t: 'c', d: [3, 0, 1.2], hole: true },
    { t: 'e', d: [68, 0, 24, 24] },
  ],
};
function gunPath(type) {
  const k = 'gp_' + type; if (SPR[k]) return SPR[k];
  const p = new Path2D(), holes = new Path2D();
  for (const s of GUNS[type]) {
    if (s.t === 'p') { const q = new Path2D(); q.moveTo(s.d[0][0], s.d[0][1]); for (const pt of s.d.slice(1)) q.lineTo(pt[0], pt[1]); q.closePath(); p.addPath(q); }
    else if (s.t === 'r') p.rect(s.d[0], s.d[1], s.d[2], s.d[3]);
    else if (s.t === 'c') { const q = new Path2D(); q.arc(s.d[0], s.d[1], s.d[2], 0, TAU); (s.hole ? holes : p).addPath(q); }
    else if (s.t === 'e') { const q = new Path2D(); q.ellipse(s.d[0], s.d[1], s.d[2], s.d[3], 0, 0, TAU); p.addPath(q); }
    else if (s.t === 'scope') for (const r of s.d) p.rect(r[0], r[1], r[2], r[3]);
  }
  return (SPR[k] = { p, holes, lines: GUNS[type].filter(s => s.t === 'l') });
}
// draw weapon: (x,y) = position of bore line at butt end, len = px length, ang = radians
function gun(ctx, type, x, y, len, ang = 0, col = '#111', o = {}) {
  const g = gunPath(type), s = len / 100;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(o.flip ? -s : s, s);
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = (o.sb || 8) / s; }
  ctx.fillStyle = col; ctx.fill(g.p, 'nonzero');
  ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const l of g.lines) { ctx.lineWidth = l.w; ctx.beginPath(); ctx.moveTo(l.d[0][0], l.d[0][1]); for (const pt of l.d.slice(1)) ctx.lineTo(pt[0], pt[1]); ctx.stroke(); }
  if (o.hi) { // top-edge highlight
    ctx.globalCompositeOperation = 'source-atop';
    const gr = ctx.createLinearGradient(0, -15, 0, 12); gr.addColorStop(0, o.hi); gr.addColorStop(0.45, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(-5, -20, 110, 40);
  }
  if (type === 'pan') { ctx.globalCompositeOperation = 'destination-out'; ctx.fill(g.holes); }
  ctx.restore();
}

// ═════════════════════════ SOLDIER (articulated silhouette) ═════════════════════════
const J_GL = 0.56;
const up = (a, l) => [Math.sin(a) * l, -Math.cos(a) * l];
const dn = (a, l) => [Math.sin(a) * l, Math.cos(a) * l];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
function ik(S, T, l1, l2, bendSign = 1) {
  let dx = T[0] - S[0], dy = T[1] - S[1]; let d = Math.hypot(dx, dy);
  const dmax = (l1 + l2) * 0.999; if (d > dmax) { dx *= dmax / d; dy *= dmax / d; d = dmax; }
  const base = Math.atan2(dy, dx);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ang = base + bendSign * a;
  return [S[0] + Math.cos(ang) * l1, S[1] + Math.sin(ang) * l1];
}
// pose → joints (units: h = 1, feet on y = 0, facing +x)
function poseJoints(pose) {
  const P = { type: 'run', ph: 0, k: 0, ...pose };
  let hip, tA, th1, b1, th2, b2, headT = 0, gripOff, gunAng, weapon = P.weapon ?? 'm416';
  if (P.type === 'run') {
    const ph = P.ph;
    tA = 0.26 + 0.03 * Math.sin(ph * 2);
    th1 = 0.62 * Math.sin(ph); th2 = 0.62 * Math.sin(ph + Math.PI);
    b1 = 0.18 + 1.25 * Math.pow(0.5 + 0.5 * Math.cos(ph), 1.6); b2 = 0.18 + 1.25 * Math.pow(0.5 + 0.5 * Math.cos(ph + Math.PI), 1.6);
    hip = [0, -0.5 + 0.022 * Math.cos(ph * 2)];
    gripOff = [0.1, 0.16]; gunAng = 0.32;
  } else if (P.type === 'aim' || P.type === 'stand') {
    tA = P.type === 'aim' ? 0.08 : 0.02; th1 = 0.16; th2 = -0.14; b1 = 0.05; b2 = 0.08; hip = [0, -0.5];
    gripOff = P.type === 'aim' ? [0.1, 0.02] : [0.06, 0.16]; gunAng = P.type === 'aim' ? -0.02 : 1.05;
    headT = P.type === 'aim' ? 0.12 : 0;
  } else if (P.type === 'hero') { // low-ready, muzzle down-forward
    tA = 0.0; th1 = 0.13; th2 = -0.11; b1 = 0.03; b2 = 0.05; hip = [0, -0.5];
    gripOff = [0.035, 0.2]; gunAng = 0.78; headT = -0.06;
  } else if (P.type === 'shoulder') { // rifle resting on shoulder, muzzle up-back
    tA = -0.03; th1 = 0.08; th2 = -0.12; b1 = 0.02; b2 = 0.06; hip = [0, -0.5];
    gripOff = [0.06, -0.02]; gunAng = -2.25; headT = 0.0;
  } else if (P.type === 'crouch') {
    tA = 0.3; th1 = 1.45; b1 = 1.95; th2 = -0.25; b2 = 2.35; hip = [0, -0.27]; gripOff = [0.12, 0.02]; gunAng = -0.03; headT = 0.15;
  } else if (P.type === 'down') { // DBNO crawl
    tA = 1.25; th1 = 0.9; b1 = 1.7; th2 = 0.4; b2 = 1.5; hip = [0, -0.16]; gripOff = null; headT = -0.5;
  }
  const L = { th: 0.245, sh: 0.245, tor: 0.29, ua: 0.17, fa: 0.16 };
  const neck = add(hip, up(tA, L.tor)), sho = add(hip, up(tA, L.tor - 0.035));
  const head = add(neck, up(tA + headT, 0.085));
  const k1 = add(hip, dn(th1, L.th)), a1 = add(k1, dn(th1 - b1, L.sh));
  const k2 = add(hip, dn(th2, L.th)), a2 = add(k2, dn(th2 - b2, L.sh));
  let grip = null, sup = null, e1, e2, gunBase = null;
  if (gripOff) {
    grip = add(sho, [gripOff[0], gripOff[1]]);
    const gl = J_GL; // gun length in h
    const dir = [Math.cos(gunAng), Math.sin(gunAng)];
    gunBase = [grip[0] - dir[0] * gl * 0.36, grip[1] - dir[1] * gl * 0.36 - 0.0];
    sup = [grip[0] + dir[0] * gl * 0.25, grip[1] + dir[1] * gl * 0.25 + 0.012];
    e1 = ik(sho, grip, L.ua, L.fa, 1);
    e2 = ik(sho, sup, L.ua, L.fa, 1);
  } else {
    const hand1 = add(sho, [0.2, 0.2]), hand2 = add(sho, [0.05, 0.28]);
    e1 = ik(sho, hand1, L.ua, L.fa, 1); e2 = ik(sho, hand2, L.ua, L.fa, 1); grip = hand1; sup = hand2;
  }
  return { hip, neck, sho, head, k1, a1, k2, a2, grip, sup, e1, e2, tA, th1, th2, b1, b2, gunBase, gunAng, gunLen: J_GL, weapon, headT };
}
function limb(ctx, a, b, wa, wb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  ctx.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2); ctx.lineTo(b[0] + nx * wb / 2, b[1] + ny * wb / 2);
  ctx.lineTo(b[0] - nx * wb / 2, b[1] - ny * wb / 2); ctx.lineTo(a[0] - nx * wa / 2, a[1] - ny * wa / 2); ctx.closePath(); ctx.fill();
  circle(ctx, a[0], a[1], wa / 2); ctx.fill(); circle(ctx, b[0], b[1], wb / 2); ctx.fill();
}
function drawBody(ctx, J, col, o = {}) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // far leg
  limb(ctx, J.hip, J.k2, 0.118, 0.08); limb(ctx, J.k2, J.a2, 0.078, 0.056);
  boot(ctx, J.a2, J.th2 - J.b2);
  // far arm (support)
  limb(ctx, J.sho, J.e2, 0.07, 0.056); limb(ctx, J.e2, J.sup, 0.056, 0.046); circle(ctx, J.sup[0], J.sup[1], 0.03); ctx.fill();
  // backpack + bedroll
  ctx.save(); ctx.translate(...add(J.hip, up(J.tA, 0.17))); ctx.rotate(J.tA);
  rr(ctx, -0.17, -0.12, 0.12, 0.25, 0.04); ctx.fill();
  rr(ctx, -0.185, -0.165, 0.09, 0.07, 0.035); ctx.fill();
  ctx.restore();
  // torso: back, shoulders, vest bulge, belly
  ctx.save(); ctx.translate(...J.hip); ctx.rotate(J.tA);
  ctx.beginPath();
  smoothPath(ctx, [[-0.072, 0.035], [-0.078, -0.09], [-0.086, -0.2], [-0.07, -0.282], [-0.02, -0.318], [0.035, -0.31], [0.082, -0.262], [0.1, -0.17], [0.092, -0.07], [0.075, 0.035]], true, 0.55);
  ctx.fill();
  // mag pouches on vest
  rr(ctx, 0.07, -0.16, 0.05, 0.075, 0.012); ctx.fill();
  ctx.restore();
  // neck
  limb(ctx, J.neck, add(J.neck, up(J.tA + J.headT, 0.05)), 0.06, 0.055);
  // near leg (thigh with knee pad bump)
  limb(ctx, J.hip, J.k1, 0.122, 0.082); limb(ctx, J.k1, J.a1, 0.08, 0.057);
  boot(ctx, J.a1, J.th1 - J.b1);
  // head + helmet
  const hd = J.head;
  circle(ctx, hd[0], hd[1], 0.056); ctx.fill();
  ctx.save(); ctx.translate(hd[0], hd[1]); ctx.rotate(J.tA + J.headT);
  ctx.beginPath(); ctx.moveTo(-0.082, 0.02); ctx.bezierCurveTo(-0.09, -0.07, -0.02, -0.098, 0.022, -0.09); ctx.bezierCurveTo(0.07, -0.08, 0.088, -0.03, 0.084, 0.0); ctx.lineTo(0.06, 0.006); ctx.lineTo(0.03, -0.004); ctx.lineTo(-0.03, 0.008); ctx.lineTo(-0.05, 0.04); ctx.closePath(); ctx.fill();
  if (o.lvl3) { rr(ctx, 0.03, -0.035, 0.07, 0.06, 0.012); ctx.fill(); }
  ctx.restore();
  // gun
  if (J.gunBase && J.weapon) gun(ctx, J.weapon, J.gunBase[0], J.gunBase[1], J.gunLen, J.gunAng, col);
  // near arm (trigger)
  limb(ctx, J.sho, J.e1, 0.074, 0.058); limb(ctx, J.e1, J.grip, 0.058, 0.047); circle(ctx, J.grip[0], J.grip[1], 0.031); ctx.fill();
}
function boot(ctx, a, shinAng) {
  ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(shinAng * 0.55);
  ctx.beginPath(); ctx.moveTo(-0.035, -0.03); ctx.lineTo(0.03, -0.03); ctx.lineTo(0.075, 0.0); ctx.lineTo(0.078, 0.024); ctx.lineTo(-0.04, 0.024); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// x,y = feet; h = px height; pose; o: {col, rim:{c,dx,dy}, dir, fall (0..1), lvl3}
function soldier(ctx, x, y, h, pose, o = {}) {
  const J = poseJoints(pose);
  ctx.save(); ctx.translate(x, y);
  if (o.fall) { // topple backwards around the feet, then settle
    const f = o.fall; const ang = -Ease.inCubic(clamp(f * 1.25)) * 1.45 + Math.sin(clamp((f - 0.8) / 0.2) * Math.PI) * 0.08;
    ctx.translate(-0.12 * h * f, 0); ctx.rotate(ang * (o.dir || 1));
  }
  ctx.scale((o.dir || 1) * h, h);
  if (o.rim) { ctx.save(); ctx.translate(o.rim.dx, o.rim.dy); drawBody(ctx, J, o.rim.c, o); ctx.restore(); }
  drawBody(ctx, J, o.col || '#1d1619', o);
  ctx.restore();
  return J;
}

// ═════════════════════════ CARE PACKAGE + PARACHUTE ═════════════════════════
function crate(ctx, x, y, w, o = {}) {
  const h = w * 0.74, d = w * 0.28; // front w×h, top depth
  ctx.save(); ctx.translate(x, y);
  // top face
  ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(-w / 2 + d * 0.9, -h - d * 0.55); ctx.lineTo(w / 2 + d * 0.9, -h - d * 0.55); ctx.lineTo(w / 2, -h); ctx.closePath();
  ctx.fillStyle = '#5c84ab'; ctx.fill();
  // side face
  ctx.beginPath(); ctx.moveTo(w / 2, -h); ctx.lineTo(w / 2 + d * 0.9, -h - d * 0.55); ctx.lineTo(w / 2 + d * 0.9, -d * 0.55); ctx.lineTo(w / 2, 0); ctx.closePath();
  ctx.fillStyle = '#1f3954'; ctx.fill();
  // front face
  const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#3e6a96'); g.addColorStop(1, '#2a4d72');
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h, w, h);
  // frame + straps
  ctx.strokeStyle = '#1a2f45'; ctx.lineWidth = w * 0.045; ctx.strokeRect(-w / 2 + w * 0.02, -h + w * 0.02, w - w * 0.04, h - w * 0.04);
  ctx.fillStyle = '#e8eef4';
  ctx.fillRect(-w / 2, -h * 0.62, w, h * 0.08); // white band
  ctx.fillStyle = '#d23a2a'; ctx.fillRect(-w * 0.07, -h, w * 0.14, h); // red strap
  ctx.fillRect(w / 2 + d * 0.3, -h - d * 0.18, d * 0.18, h); // strap on side (approx)
  // rivets
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (const sx of [-0.42, 0.42]) for (const sy of [-0.9, -0.1]) { circle(ctx, sx * w, sy * h, w * 0.018); ctx.fill(); }
  // rim light top-left
  ctx.strokeStyle = 'rgba(255,214,160,0.55)'; ctx.lineWidth = w * 0.02;
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h); ctx.lineTo(-w / 2 + d * 0.9, -h - d * 0.55); ctx.stroke();
  // beacon
  if (o.beacon !== undefined) {
    const on = o.beacon;
    ctx.fillStyle = '#5b0e0a'; circle(ctx, w * 0.1 + d * 0.45, -h - d * 0.3, w * 0.035); ctx.fill();
    if (on > 0) { drawSprite(ctx, softDot('#ff4030', 64), w * 0.1 + d * 0.45, -h - d * 0.3, w * 0.35, on); ctx.fillStyle = '#ffd0c0'; circle(ctx, w * 0.1 + d * 0.45, -h - d * 0.3, w * 0.03); ctx.fill(); }
  }
  ctx.restore();
}
// parachute canopy with suspension lines; (x,y) = attach point above crate; open 0..1
function parachute(ctx, x, y, size, open, sway = 0, o = {}) {
  const op = clamp(open);
  const cw = size * lerp(0.18, 1, Ease.outBack(op, 1.3)), ch = size * lerp(0.9, 0.42, Ease.outCubic(op));
  const lineLen = size * 0.95;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sway);
  const top = -lineLen - ch * 0.15;
  const gores = 8;
  // suspension lines
  ctx.strokeStyle = 'rgba(40,30,30,0.75)'; ctx.lineWidth = Math.max(1, size * 0.006);
  ctx.beginPath();
  for (let i = 0; i <= gores; i++) { const gx = -cw / 2 + cw * i / gores; ctx.moveTo(0, 0); ctx.lineTo(gx, top + ch * 0.06); }
  ctx.stroke();
  // canopy gores
  for (let i = 0; i < gores; i++) {
    const xa = -cw / 2 + cw * i / gores, xb = -cw / 2 + cw * (i + 1) / gores;
    const ya = top - ch * Math.sqrt(Math.max(0, 1 - Math.pow((xa) / (cw / 2), 2))) * 0.95;
    const yb = top - ch * Math.sqrt(Math.max(0, 1 - Math.pow((xb) / (cw / 2), 2))) * 0.95;
    ctx.beginPath(); ctx.moveTo(xa, top + ch * 0.06);
    ctx.lineTo(xa, ya);
    ctx.quadraticCurveTo((xa + xb) / 2, Math.min(ya, yb) - ch * 0.1, xb, yb);
    ctx.lineTo(xb, top + ch * 0.06);
    ctx.quadraticCurveTo((xa + xb) / 2, top - ch * 0.04, xa, top + ch * 0.06);
    const lit = 0.75 + 0.25 * Math.cos((i + 0.5) / gores * Math.PI - 0.6);
    const base = i % 2 ? [236, 236, 230] : [214, 60, 44];
    ctx.fillStyle = `rgb(${base[0] * lit | 0},${base[1] * lit | 0},${base[2] * lit | 0})`; ctx.fill();
  }
  // vent hole highlight
  ctx.fillStyle = 'rgba(255,220,180,0.25)'; ctx.beginPath(); ctx.ellipse(-cw * 0.15, top - ch * 0.75, cw * 0.18, ch * 0.08, -0.2, 0, TAU); ctx.fill();
  ctx.restore();
}

// ═════════════════════════ C-130 (side view, facing left) ═════════════════════════
function c130(ctx, x, y, len, t, o = {}) {
  const s = len / 100;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = '#4a4f58', belly = '#7d838d', dark = '#2c3037';
  // far engines (behind fuselage)
  ctx.fillStyle = dark;
  rr(ctx, 30, -10.5, 13, 3.6, 1.5); ctx.fill();
  // tail fin
  ctx.fillStyle = body; poly(ctx, [[81, -7], [91.5, -22.5], [98.5, -23], [100, -3.6], [86, -4]]); ctx.fill();
  ctx.fillStyle = dark; poly(ctx, [[91.5, -22.5], [98.5, -23], [98.8, -19], [92.6, -19]]); ctx.fill();
  // fuselage
  ctx.beginPath();
  ctx.moveTo(0.5, -0.5); ctx.bezierCurveTo(0.5, -5, 4, -7.4, 12, -7.6); ctx.lineTo(62, -7.6); ctx.bezierCurveTo(74, -7.4, 88, -5.6, 100, -3.6);
  ctx.lineTo(100, -2.2); ctx.bezierCurveTo(90, -1.6, 80, 0.6, 66, 4.4); ctx.lineTo(13, 4.6); ctx.bezierCurveTo(5, 4.4, 0.5, 2.6, 0.5, -0.5); ctx.closePath();
  const g = ctx.createLinearGradient(0, -8, 0, 5); g.addColorStop(0, body); g.addColorStop(0.55, '#5d636d'); g.addColorStop(1, belly);
  ctx.fillStyle = g; ctx.fill();
  // ramp line + door
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.35;
  ctx.beginPath(); ctx.moveTo(66, 4.2); ctx.lineTo(86, -1.2); ctx.stroke();
  ctx.beginPath(); ctx.rect(20, -4.8, 3.2, 6.4); ctx.stroke();
  // cockpit
  ctx.fillStyle = '#16191e'; poly(ctx, [[3.6, -4.4], [6.2, -6.6], [11, -6.9], [10.4, -4.6]]); ctx.fill();
  ctx.fillStyle = 'rgba(255,210,160,0.5)'; poly(ctx, [[6.6, -6.4], [8.4, -6.6], [7.2, -4.8], [5.6, -4.8]]); ctx.fill();
  // windows
  ctx.fillStyle = '#1a1d22'; for (let i = 0; i < 6; i++) { circle(ctx, 27 + i * 5.5, -3.6, 0.6); ctx.fill(); }
  // gear pod
  ctx.fillStyle = '#555b64'; rr(ctx, 38, 2.4, 22, 3.8, 1.8); ctx.fill();
  // wing (high)
  ctx.fillStyle = dark; rr(ctx, 30, -9.6, 22, 2.2, 1); ctx.fill();
  // near engines + props
  for (const ex of [26, 33.5]) {
    ctx.fillStyle = '#3a3f47'; rr(ctx, ex, -9.2 + (ex === 26 ? 1.6 : 0), 12, 3.4, 1.6); ctx.fill();
    const px = ex - 0.6, py = -7.5 + (ex === 26 ? 1.6 : 0);
    ctx.fillStyle = 'rgba(30,30,34,0.35)'; ctx.beginPath(); ctx.ellipse(px, py, 0.9, 7.5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,20,24,0.55)'; ctx.lineWidth = 0.5;
    const pa = (t || 0) * 60;
    ctx.beginPath(); for (let k = 0; k < 4; k++) { const a = pa + k * Math.PI / 2; ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * 0.6, py + Math.sin(a) * 7.2); } ctx.stroke();
  }
  // horizontal stabiliser
  ctx.fillStyle = dark; rr(ctx, 86, -5.4, 15, 1.6, 0.8); ctx.fill();
  // warm rim on the underside (sunset)
  ctx.strokeStyle = 'rgba(255,190,130,0.55)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(13, 4.6); ctx.lineTo(66, 4.4); ctx.stroke();
  // nav lights
  if (o.blink) { drawSprite(ctx, softDot('#ff3a2a', 64), 99, -22.8, 2.2, o.blink); drawSprite(ctx, softDot('#ffffff', 64), 50, 5, 1.8, o.blink); }
  ctx.restore();
}

// ═════════════════════════ ICONS ═════════════════════════
function icoHelmet(ctx, x, y, s, col = '#fff', lvl = 3) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-0.5, 0.18); ctx.bezierCurveTo(-0.52, -0.5, 0.5, -0.56, 0.5, 0.16); ctx.lineTo(0.42, 0.3); ctx.lineTo(0.18, 0.3); ctx.lineTo(0.18, 0.06); ctx.lineTo(-0.3, 0.06); ctx.lineTo(-0.34, 0.3); ctx.lineTo(-0.5, 0.3); ctx.closePath(); ctx.fill();
  if (lvl >= 3) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-0.26, -0.06, 0.4, 0.07); }
  ctx.restore();
}
function icoVest(ctx, x, y, s, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-0.22, -0.5); ctx.lineTo(-0.1, -0.5); ctx.quadraticCurveTo(0, -0.3, 0.1, -0.5); ctx.lineTo(0.22, -0.5); ctx.lineTo(0.42, -0.3); ctx.lineTo(0.38, 0.45); ctx.lineTo(-0.38, 0.45); ctx.lineTo(-0.42, -0.3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-0.3, 0.05, 0.6, 0.06); ctx.fillRect(-0.3, 0.22, 0.6, 0.06);
  ctx.restore();
}
function icoBackpack(ctx, x, y, s, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  rr(ctx, -0.34, -0.38, 0.68, 0.85, 0.16); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; rr(ctx, -0.24, 0.05, 0.48, 0.3, 0.06); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(0, -0.38, 0.16, Math.PI, TAU); ctx.stroke();
  ctx.restore();
}
function icoSyringe(ctx, x, y, s, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.8); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.fillRect(-0.5, -0.1, 0.62, 0.2); ctx.fillRect(0.12, -0.03, 0.34, 0.06); ctx.fillRect(-0.62, -0.18, 0.1, 0.36); ctx.fillRect(-0.72, -0.05, 0.1, 0.1);
  ctx.fillStyle = 'rgba(255,90,90,0.9)'; ctx.fillRect(-0.36, -0.06, 0.34, 0.12);
  ctx.restore();
}
function icoMedkit(ctx, x, y, s, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  rr(ctx, -0.48, -0.34, 0.96, 0.72, 0.1); ctx.fill(); ctx.fillRect(-0.16, -0.46, 0.32, 0.14);
  ctx.fillStyle = '#d83a2c'; ctx.fillRect(-0.07, -0.22, 0.14, 0.44); ctx.fillRect(-0.22, -0.07, 0.44, 0.14);
  ctx.restore();
}
function icoAmmo(ctx, x, y, s, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  for (let i = 0; i < 3; i++) { const bx = -0.32 + i * 0.26; rr(ctx, bx - 0.08, -0.15, 0.16, 0.6, 0.03); ctx.fill(); ctx.beginPath(); ctx.moveTo(bx - 0.06, -0.15); ctx.quadraticCurveTo(bx, -0.55, bx + 0.06, -0.15); ctx.fill(); }
  ctx.restore();
}
function icoGhillie(ctx, x, y, s, col = '#fff') {
  // hooded bust with a leafy, ragged outline
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); const n = 34;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + i / n * Math.PI; const base = [Math.cos(a) * 0.42, -0.08 + Math.sin(a) * 0.44];
    const sh = i > 4 && i < n - 4 ? 1 : 0.6; const j = (i % 2 ? 0.07 : -0.02) * sh;
    ctx.lineTo(base[0] * (1 + j), base[1] * (1 + j));
  }
  ctx.lineTo(0.5, 0.2); for (let i = 0; i <= 10; i++) ctx.lineTo(0.5 - i * 0.1, 0.46 + (i % 2 ? 0.05 : 0)); ctx.lineTo(-0.5, 0.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(0, -0.08, 0.17, 0.2, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function icoMic(ctx, x, y, s, col = '#fff', lvl = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col;
  // speaker
  ctx.beginPath(); ctx.moveTo(-0.45, -0.16); ctx.lineTo(-0.25, -0.16); ctx.lineTo(0, -0.4); ctx.lineTo(0, 0.4); ctx.lineTo(-0.25, 0.16); ctx.lineTo(-0.45, 0.16); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 0.09; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const a = clamp(lvl * 3 - i); if (a <= 0) continue; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(0.02, 0, 0.18 + i * 0.16, -0.75, 0.75); ctx.stroke(); }
  ctx.restore();
}
function icoSkullHS(ctx, x, y, s, col = '#fff') {
  // headshot marker: head silhouette with crosshair
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col;
  circle(ctx, 0, -0.08, 0.26); ctx.fill(); ctx.fillRect(-0.16, 0.1, 0.32, 0.22);
  ctx.lineWidth = 0.07; ctx.beginPath(); ctx.arc(0, -0.02, 0.42, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.56, -0.02); ctx.lineTo(-0.3, -0.02); ctx.moveTo(0.3, -0.02); ctx.lineTo(0.56, -0.02); ctx.moveTo(0, -0.58); ctx.lineTo(0, -0.34); ctx.stroke();
  ctx.restore();
}
function icoPin(ctx, x, y, s, col) {
  // PUBG-like map marker (teardrop) with tip at (x,y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-0.18, -0.35, -0.42, -0.55, -0.42, -0.85); ctx.arc(0, -0.85, 0.42, Math.PI, 0); ctx.bezierCurveTo(0.42, -0.55, 0.18, -0.35, 0, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 0.25; ctx.shadowOffsetY = 0.06; ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.lineWidth = 0.07; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; circle(ctx, 0, -0.85, 0.15); ctx.fill();
  ctx.restore();
}
function badge(ctx, x, y, s, n, col) {
  // squad number badge (coloured square with number)
  ctx.save(); rr(ctx, x - s / 2, y - s / 2, s, s, s * 0.14); ctx.fillStyle = col; ctx.fill();
  text(ctx, String(n), x, y + s * 0.34, { size: s * 0.88, fam: 'raj', w: 700, align: 'center', color: '#101010' });
  ctx.restore();
}
function smokeGrenade(ctx, x, y, s, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  rr(ctx, -0.22, -0.5, 0.44, 1, 0.08); ctx.fillStyle = '#5b6b4a'; ctx.fill();
  ctx.fillStyle = '#e9e9e2'; ctx.fillRect(-0.22, -0.2, 0.44, 0.14);
  ctx.fillStyle = '#2f3528'; ctx.fillRect(-0.16, -0.62, 0.32, 0.14);
  ctx.strokeStyle = '#c9c9c0'; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.arc(0.2, -0.6, 0.1, 0, TAU); ctx.stroke();
  ctx.restore();
}
