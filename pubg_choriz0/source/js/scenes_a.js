'use strict';
// ═════════════════════════ S0 INTRO + S1 STRATEGIC CALL (shared map camera) ═════════════════════════
const PLANE_P0 = [0.3, 0.55], PLANE_P1 = [7.7, 6.25];
const SCHOOL = [4.25, 2.95], RIDGE = [5.35, 2.42];
const ROUTE = [[4.25, 2.95], [4.5, 2.86], [4.78, 2.67], [5.05, 2.55], [5.35, 2.42]];
const SQUAD_POS = [[4.215, 2.925], [4.29, 2.975], [4.225, 3.005], [4.3, 2.895]];
const ENEMY_POS = [[5.02, 3.22], [5.07, 3.26], [4.98, 3.28], [5.09, 3.2]];
const ENEMY_PATH = [[5.03, 3.22], [5.13, 3.02], [5.27, 2.82], [5.38, 2.62]];

function mapCamAt(t) {
  const K = [
    [0, 4.05, 4.08, 112], [1.7, 4.12, 3.9, 126], [2.75, 4.85, 2.8, 420], [6.0, 4.97, 2.72, 470], [6.32, RIDGE[0], RIDGE[1] + 0.02, 5200],
  ];
  const E = [Ease.inOutQuad, Ease.inOutCubic, Ease.inOutQuad, Ease.inExpo];
  for (let i = 0; i < K.length - 1; i++) {
    const [ta, xa, ya, sa] = K[i], [tb, xb, yb, sb] = K[i + 1];
    if (t <= tb || i === K.length - 2) {
      const u = E[i](prog(t, ta, tb));
      const ls = lerp(Math.log(sa), Math.log(sb), u);
      // keep the zoom target steady: blend centre in screen-space-consistent way
      const s = Math.exp(ls);
      if (i === 3) { // dive: the target glides to screen centre while we zoom into it
        const d0x = (xb - xa) * sa, d0y = (yb - ya) * sa, k = 1 - Ease.inOutCubic(prog(t, ta, tb));
        return { x: xb - d0x * k / s, y: yb - d0y * k / s, s };
      }
      return { x: lerp(xa, xb, u), y: lerp(ya, yb, u), s };
    }
  }
}
function planeIcon(ctx, x, y, s, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.save(); ctx.translate(0.18, 0.28);
  planeShape(ctx); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#f4f4f0'; planeShape(ctx); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-0.5, -0.02, 1.2, 0.04);
  ctx.restore();
}
function planeShape(ctx) {
  // top-down C-130: fuselage, straight high wing with 4 nacelles, tailplane
  ctx.beginPath();
  ctx.ellipse(0.05, 0, 0.95, 0.1, 0, 0, TAU);
  ctx.moveTo(0.22, -0.09); ctx.lineTo(0.16, -0.98); ctx.lineTo(0.02, -0.98); ctx.lineTo(-0.04, -0.09); ctx.closePath();
  ctx.moveTo(0.22, 0.09); ctx.lineTo(0.16, 0.98); ctx.lineTo(0.02, 0.98); ctx.lineTo(-0.04, 0.09); ctx.closePath();
  ctx.moveTo(-0.66, -0.06); ctx.lineTo(-0.74, -0.36); ctx.lineTo(-0.86, -0.36); ctx.lineTo(-0.84, -0.05); ctx.closePath();
  ctx.moveTo(-0.66, 0.06); ctx.lineTo(-0.74, 0.36); ctx.lineTo(-0.86, 0.36); ctx.lineTo(-0.84, 0.05); ctx.closePath();
  for (const yy of [-0.3, -0.62, 0.3, 0.62]) { ctx.rect(0.12, yy - 0.04, 0.28, 0.08); }
}
function chuteIcon(ctx, x, y, s, col, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.06;
  ctx.beginPath(); ctx.moveTo(-0.5, -0.55); ctx.lineTo(0, 0); ctx.lineTo(0.5, -0.55); ctx.moveTo(-0.18, -0.6); ctx.lineTo(0, 0); ctx.lineTo(0.18, -0.6); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -0.62, 0.55, 0.32, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
  circle(ctx, 0, 0.05, 0.12); ctx.fill();
  ctx.restore();
}
function squadMarker(ctx, x, y, r, m, a = 1, ring = 0) {
  ctx.save(); ctx.globalAlpha *= a;
  if (ring > 0) { circle(ctx, x, y, r + 6 + ring * 18); ctx.strokeStyle = rgba(m.col, 0.8 * (1 - ring)); ctx.lineWidth = 3; ctx.stroke(); }
  circle(ctx, x, y + 2, r + 2); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
  circle(ctx, x, y, r); ctx.fillStyle = m.col; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#111'; ctx.stroke();
  text(ctx, String(m.n), x, y + r * 0.42, { size: r * 1.25, fam: 'raj', w: 700, align: 'center', color: '#111' });
  ctx.restore();
}
function enemyMarker(ctx, x, y, s, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-s / 2 + 1.5, -s / 2 + 2, s, s);
  ctx.fillStyle = '#ff3b2f'; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.lineWidth = 2; ctx.strokeStyle = '#2a0805'; ctx.strokeRect(-s / 2, -s / 2, s, s);
  ctx.restore();
}
function pathPts(cam, pts) { return pts.map(p => mapToScreen(cam, p[0], p[1])); }
function partialPolyline(ctx, P, f) {
  // draw first fraction f of polyline P; returns head point
  const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d; }
  let rem = tot * clamp(f); ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); let head = P[0];
  for (let i = 1; i < P.length; i++) {
    if (rem >= L[i - 1]) { ctx.lineTo(P[i][0], P[i][1]); rem -= L[i - 1]; head = P[i]; }
    else { const u = rem / L[i - 1]; head = [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; ctx.lineTo(head[0], head[1]); break; }
  }
  return { head, tot };
}
function pill(ctx, x, y, label, bg, fg, o = {}) {
  const fs = o.size || 24; const w = tw(ctx, label, fs, 'bar', 800, o.ls ?? 2) + 28, h = fs + 16;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.scale) ctx.scale(o.scale, o.scale);
  const ox = o.align === 'center' ? -w / 2 : 0;
  rr(ctx, ox, -h / 2, w, h, 6); ctx.fillStyle = bg; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  text(ctx, label, ox + 14, fs * 0.36, { size: fs, fam: 'bar', w: 800, ls: o.ls ?? 2, color: fg });
  ctx.restore();
  return w;
}

function sMap(ctx, t) {
  const cam = mapCamAt(t);
  const dimIntro = 0.62 * (1 - ep(t, 1.7, 2.6));
  drawMapBase(ctx, MAP, cam, { dim: 0.32 + dimIntro * 0.45, grid: 1, labels: 1 - ep(t, 6.05, 6.25) });
  // zones (appear when the map scene starts)
  const zA = ep(t, 2.2, 2.8);
  if (zA > 0) drawZones(ctx, cam, { x: 4.7, y: 3.3, r: 2.4 }, { x: 4.9, y: 3.0, r: 1.15, a: 0.9 * zA }, { blueA: zA });
  // plane path + plane
  const pA = 1 - ep(t, 2.5, 3.0);
  if (pA > 0) {
    const a = mapToScreen(cam, ...PLANE_P0), b = mapToScreen(cam, ...PLANE_P1);
    ctx.save(); ctx.globalAlpha = pA * ep(t, 0.15, 0.6);
    ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
    const u = 0.2 + 0.15 * t; const px = lerp(PLANE_P0[0], PLANE_P1[0], u), py = lerp(PLANE_P0[1], PLANE_P1[1], u);
    const [sx, sy] = mapToScreen(cam, px, py); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    planeIcon(ctx, sx, sy, 40 + cam.s * 0.08, ang);
    ctx.restore();
    // squad jumps
    for (let i = 0; i < 4; i++) {
      const tj = 1.45 + i * 0.07; if (t < tj) continue;
      const k = ep(t, tj, 2.35, Ease.inOutCubic);
      const uj = 0.2 + 0.15 * tj; const jx = lerp(PLANE_P0[0], PLANE_P1[0], uj), jy = lerp(PLANE_P0[1], PLANE_P1[1], uj);
      const tx = SQUAD_POS[i][0], ty = SQUAD_POS[i][1];
      const [cx, cy] = mapToScreen(cam, lerp(jx, tx, k), lerp(jy, ty, k));
      chuteIcon(ctx, cx, cy, 26, SQUAD[i].col, 1 - ep(t, 2.25, 2.45));
    }
  }
  // squad markers at School
  const mA = ep(t, 2.2, 2.45);
  if (mA > 0) SQUAD.forEach((m, i) => { const [x, y] = mapToScreen(cam, ...SQUAD_POS[i]); squadMarker(ctx, x, y, 13, m, mA, i === 0 ? fract((t - 2.4) / 1.1) : 0); });
  // route (the call)
  const rP = ep(t, 3.0, 3.65, Ease.inOutCubic);
  if (rP > 0) {
    const P = pathPts(cam, ROUTE);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    partialPolyline(ctx, P, rP); ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 11; ctx.stroke();
    const { head } = partialPolyline(ctx, P, rP); ctx.strokeStyle = C.p1; ctx.lineWidth = 6; ctx.shadowColor = rgba(C.p1, 0.8); ctx.shadowBlur = 14; ctx.stroke();
    ctx.shadowBlur = 0;
    // marching chevrons
    partialPolyline(ctx, P, rP); ctx.setLineDash([2, 22]); ctx.lineDashOffset = -t * 90; ctx.strokeStyle = '#2a2000'; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
    if (rP < 1) { drawSprite(ctx, softDot(C.p1, 64), head[0], head[1], 26, 1); circle(ctx, head[0], head[1], 6); ctx.fillStyle = '#fff'; ctx.fill(); }
    ctx.restore();
  }
  // pin drop on the ridge
  const pinT = 3.55;
  if (t > pinT) {
    const [x, y] = mapToScreen(cam, ...RIDGE);
    const k = ep(t, pinT, pinT + 0.45, Ease.outBack);
    for (let r = 0; r < 2; r++) { const rt = prog(t, pinT + 0.15 + r * 0.25, pinT + 1.0 + r * 0.25); if (rt > 0 && rt < 1) { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, 10 + rt * 70, (10 + rt * 70) * 0.55, 0, 0, TAU); ctx.strokeStyle = rgba(C.p1, 1 - rt); ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); } }
    ctx.save(); ctx.globalAlpha = clamp((t - pinT) * 8);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(x, y, 10 * k, 4 * k, 0, 0, TAU); ctx.fill();
    icoPin(ctx, x, y - (1 - k) * 80, 46, C.p1);
    ctx.restore();
  }
  // next zone lands exactly on the call
  const zt = 3.95;
  if (t > zt) {
    const [x, y] = mapToScreen(cam, ...RIDGE); const r = 0.6 * cam.s;
    const p = ep(t, zt, zt + 0.5, Ease.inOutCubic);
    // scanning fill flash
    const fl = Math.exp(-Math.max(0, t - (zt + 0.5)) * 4) * ep(t, zt + 0.35, zt + 0.5);
    if (fl > 0.01) { circle(ctx, x, y, r); ctx.fillStyle = `rgba(255,255,255,${0.16 * fl})`; ctx.fill(); }
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * p);
    ctx.lineWidth = 4.5; ctx.strokeStyle = '#fff'; ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 16; ctx.stroke(); ctx.restore();
    if (p < 1) { const a = -Math.PI / 2 + TAU * p; drawSprite(ctx, softDot('#ffffff', 64), x + Math.cos(a) * r, y + Math.sin(a) * r, 22, 1); }
    // tag
    const tg = ep(t, zt + 0.5, zt + 0.75, Ease.outBack);
    if (tg > 0 && t < 6.15) pill(ctx, x, y - 92, 'ZONE CALLÉE ✓', C.p1, '#111', { size: 26, rot: -0.04, scale: tg, align: 'center' });
  }
  // enemy squad + predicted path + kill zone
  const eT = 4.9;
  if (t > eT) {
    ENEMY_POS.forEach((p, i) => { const k = ep(t, eT + i * 0.06, eT + 0.3 + i * 0.06, Ease.outBack); const [x, y] = mapToScreen(cam, ...p); enemyMarker(ctx, x, y, 15 * k, clamp(k * 2)); });
    const [ex, ey] = mapToScreen(cam, ...ENEMY_POS[3]);
    const lt = ep(t, eT + 0.25, eT + 0.5, Ease.outBack);
    if (lt > 0 && t < 6.15) pill(ctx, ex + 22, ey + 4, '4 ENNEMIS', '#ff3b2f', '#fff', { size: 21, scale: lt });
    const pp = ep(t, eT + 0.35, eT + 0.95, Ease.inOutCubic);
    if (pp > 0) {
      const P = pathPts(cam, ENEMY_PATH);
      ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([12, 10]); ctx.lineDashOffset = t * 40;
      const { head } = partialPolyline(ctx, P, pp); ctx.strokeStyle = 'rgba(255,70,50,0.95)'; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      if (pp > 0.95) { const a = P[P.length - 2], b = P[P.length - 1]; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.translate(head[0], head[1]); ctx.rotate(ang); ctx.fillStyle = '#ff4a35'; poly(ctx, [[8, 0], [-10, -9], [-10, 9]]); ctx.fill(); }
      ctx.restore();
    }
    // kill zone wedge from the ridge
    const kz = ep(t, eT + 0.6, eT + 1.0, Ease.outCubic);
    if (kz > 0) {
      const [rx, ry] = mapToScreen(cam, ...RIDGE); const R0 = 0.62 * cam.s * kz;
      const a0 = 1.72, a1 = 2.32;
      ctx.save(); ctx.globalAlpha = 1 - ep(t, 6.05, 6.2);
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.arc(rx, ry, R0, a0, a1); ctx.closePath();
      const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, R0); g.addColorStop(0, rgba(C.p1, 0.05)); g.addColorStop(1, rgba(C.p1, 0.32));
      ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(C.p1, 0.9); ctx.stroke();
      ctx.clip(); ctx.strokeStyle = rgba(C.p1, 0.25); ctx.lineWidth = 2;
      ctx.beginPath(); for (let k = -20; k < 20; k++) { ctx.moveTo(rx + k * 14 - 300, ry - 300); ctx.lineTo(rx + k * 14 + 300, ry + 300); } ctx.stroke();
      ctx.restore();
      if (kz > 0.6 && t < 6.15) { const mx = rx + Math.cos((a0 + a1) / 2) * R0 * 0.72, my = ry + Math.sin((a0 + a1) / 2) * R0 * 0.72; text(ctx, 'KILL ZONE', mx, my, { size: 22, fam: 'bar', w: 800, ls: 3, align: 'center', color: C.p1, shadow: 'rgba(0,0,0,0.9)', sb: 6, alpha: ep(t, eT + 0.8, eT + 1.0) }); }
    }
  }
  // zone banner
  if (t > 4.0 && t < 6.1) {
    const a = Math.min(ep(t, 4.0, 4.2), 1 - ep(t, 5.85, 6.1));
    ctx.save(); ctx.globalAlpha = a;
    const msg = 'RESTRICTING THE PLAY AREA IN 2:30';
    const w = tw(ctx, msg, 26, 'bar', 700, 2) + 70;
    const g = ctx.createLinearGradient(W / 2 - w / 2 - 60, 0, W / 2 + w / 2 + 60, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.2, 'rgba(0,0,0,0.6)'); g.addColorStop(0.8, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(W / 2 - w / 2 - 60, 122, w + 120, 46);
    text(ctx, msg, W / 2 + 18, 154, { size: 26, fam: 'bar', w: 700, ls: 2, align: 'center', color: '#fff' });
    ctx.fillStyle = '#ffcf3a'; poly(ctx, [[W / 2 - w / 2 + 10, 158], [W / 2 - w / 2 + 24, 132], [W / 2 - w / 2 + 38, 158]]); ctx.fill();
    text(ctx, '!', W / 2 - w / 2 + 24, 155, { size: 18, fam: 'raj', w: 700, align: 'center', color: '#111' });
    ctx.restore();
  }
  // dive: radial zoom streaks near the end
  if (t > 6.0) {
    const k = ep(t, 6.0, 6.3, Ease.inQuad);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) { const a = R(i, 501) * TAU, r0 = 120 + R(i, 502) * 400; const len = 80 + 400 * k; ctx.strokeStyle = `rgba(255,240,200,${0.18 * k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * (r0 + len), H / 2 + Math.sin(a) * (r0 + len)); ctx.stroke(); }
    ctx.restore();
  }
  if (t < 2.6) drawTitle(ctx, t);
}

function drawTitle(ctx, t, o = {}) {
  // label line
  const lab = o.label || 'ERANGEL  ·  SQUAD  ·  FPP';
  const exit = ep(t, 1.72, 2.15, Ease.inCubic);
  const la = ep(t, 0.15, 0.4) * (1 - exit);
  const nChars = Math.floor(lab.length * ep(t, 0.15, 0.55, Ease.lin));
  ctx.save();
  ctx.translate(0, -exit * 40);
  text(ctx, lab.slice(0, nChars), W / 2, 316, { size: 26, fam: 'bar', w: 700, ls: 7, align: 'center', color: 'rgba(255,255,255,0.88)', alpha: la, shadow: 'rgba(0,0,0,0.8)', sb: 8 });
  // IGL tag
  const tg = ep(t, 0.42, 0.62, Ease.outBack) * (1 - exit);
  if (tg > 0) pill(ctx, W / 2, 368, o.pill || 'IN-GAME LEADER', C.p1, '#111', { size: o.pillSize || 22, ls: o.pillLs ?? 4, align: 'center', scale: tg });
  // big name, letters rise from a mask line
  const name = 'CHORIZ0', fs = 214;
  font(ctx, fs, 'osw', 700); ctx.letterSpacing = '6px';
  const widths = name.split('').map(ch => ctx.measureText(ch).width + 6);
  const totW = widths.reduce((a, b) => a + b, 0) - 6;
  let x = W / 2 - totW / 2; const base = 586;
  ctx.save(); ctx.beginPath(); ctx.rect(0, base - fs * 0.86, W, fs * 0.98); ctx.clip();
  name.split('').forEach((ch, i) => {
    const lt = ep(t, 0.24 + i * 0.045, 0.62 + i * 0.045, Ease.outExpo);
    const yo = (1 - lt) * fs * 0.95 - exit * 30;
    const col = i === 6 ? C.p1 : '#ffffff';
    text(ctx, ch, x, base + yo, { size: fs, fam: 'osw', w: 700, color: col, shadow: 'rgba(0,0,0,0.6)', sb: 24, sy: 6, alpha: 1 - exit });
    x += widths[i];
  });
  ctx.restore();
  // light sweep across the name
  const shp = prog(t, 1.0, 1.45);
  if (shp > 0 && shp < 1) {
    const mk = buf('ttl');
    shimmer(mk.x, W / 2 - totW / 2, base - fs * 0.8, totW, fs * 0.9, shp, -0.3);
    mk.x.globalCompositeOperation = 'destination-in'; font(mk.x, fs, 'osw', 700); mk.x.letterSpacing = '6px'; mk.x.fillStyle = '#fff'; mk.x.fillText(name, W / 2 - totW / 2, base);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - exit; ctx.drawImage(mk.c, 0, 0, W, H); ctx.restore();
  }
  // underline sweep
  const ul = ep(t, 0.6, 1.0, Ease.inOutCubic);
  if (ul > 0) { ctx.fillStyle = C.p1; ctx.globalAlpha = 1 - exit; ctx.fillRect(W / 2 - totW / 2, base + 22, totW * ul, 7); ctx.globalAlpha = 1; }
  // squad chips
  let cx = 0; const chipW = SQUAD.map(m => tw(ctx, m.name, 28, 'bar', 700) + 62); const gap = 14; const tot = chipW.reduce((a, b) => a + b, 0) + gap * 3;
  cx = W / 2 - tot / 2;
  SQUAD.forEach((m, i) => {
    const k = ep(t, 0.78 + i * 0.08, 1.12 + i * 0.08, Ease.outCubic); const ex = ep(t, 1.62 + i * 0.03, 1.95 + i * 0.03, Ease.inCubic);
    const a = k * (1 - ex); if (a <= 0) { cx += chipW[i] + gap; return; }
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - k) * 26 + ex * 26);
    rr(ctx, cx, 640, chipW[i], 50, 6); ctx.fillStyle = 'rgba(10,10,10,0.72)'; ctx.fill();
    ctx.fillStyle = m.col; ctx.fillRect(cx, 640, 4, 50);
    badge(ctx, cx + 28, 665, 30, m.n, m.col);
    text(ctx, m.name, cx + 50, 675, { size: 28, fam: 'bar', w: 700, color: '#fff' });
    ctx.restore(); cx += chipW[i] + gap;
  });
  ctx.restore();
}
