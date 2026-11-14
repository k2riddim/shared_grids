'use strict';
// ═════════════════════════ S5 — FINAL CIRCLE (AWM) ═════════════════════════
const FIN = { shot: 21.92, hit: 22.02, freeze: 22.28, peek: 21.25, ex: 40.5, ey: 3.36 };
function finalView(t) {
  const tt = Math.min(t, FIN.freeze);
  const peek = ep(tt, FIN.peek, FIN.peek + 0.35, Ease.inOutCubic);
  const headY = FIN.ey - EH * lerp(0.62, 0.86, peek);
  const hold = ep(tt, 21.35, 21.7);
  const amp = lerp(0.3, 0.04, hold);
  const sw = [fbm1(tt * 1.25, 31) * amp, fbm1(tt * 1.05, 32) * amp * 0.8];
  const rec = -2.2 * impulse(tt, FIN.shot, 7);
  const intro = ep(t, 20.6, 20.95, Ease.outCubic);
  return { ax: FIN.ex - 0.05 + sw[0] - (1 - intro) * 3, ay: headY + 0.18 + sw[1] + rec, s: 104 + 8 * hold };
}
function blueWall(ctx, v, t) {
  // play-zone wall standing across the far end of the field
  const a0 = v.ax - W / 2 / v.s - 1, a1 = v.ax + W / 2 / v.s + 1, step = Math.max(0.05, 4 / v.s);
  const wl = a => 2.15 + 0.12 * Math.sin(a * 0.35 + 1.2);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-50, -50);
  for (let a = a0; a <= a1 + step; a += step) { const [x, y] = P2S(v, a, wl(a)); ctx.lineTo(x, y); }
  ctx.lineTo(W + 50, -50); ctx.closePath();
  ctx.fillStyle = 'rgba(40,95,255,0.30)'; ctx.fill();
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const ax = a0 + R(i, 901) * (a1 - a0); const [x] = P2S(v, ax, 0); const ph = fract(R(i, 902) + t * (0.3 + 0.4 * R(i, 903))); const y = H - ph * (H + 200); ctx.strokeStyle = `rgba(120,170,255,${0.14 + 0.16 * R(i, 904)})`; ctx.lineWidth = 1 + 2 * R(i, 905); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 80 + 140 * R(i, 906)); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.beginPath();
  for (let a = a0; a <= a1 + step; a += step) { const [x, y] = P2S(v, a, wl(a)); a === a0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.strokeStyle = 'rgba(160,200,255,0.9)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(80,140,255,1)'; ctx.shadowBlur = 18; ctx.stroke();
  ctx.restore();
}
function sFinal(ctx, t) {
  const tf = Math.min(t, FIN.freeze);
  const v = finalView(t);
  drawVista(ctx, v, {
    t: tf, fg: false,
    props: (c, vv) => blueWall(c, vv, tf),
    behind: (c, vv) => {
      const peek = ep(tf, FIN.peek, FIN.peek + 0.35, Ease.inOutCubic);
      const dead = tf >= FIN.hit, f = dead ? prog(tf, FIN.hit, FIN.hit + 0.55) : 0;
      const [x, y] = P2S(vv, FIN.ex, FIN.ey);
      soldier(c, x, y + (1 - peek) * 0.0, EH * vv.s, peek > 0.5 ? { type: 'aim', weapon: 'm416' } : { type: 'crouch', weapon: 'm416' }, { dir: -1, rim: RIM, col: THEME.ink, fall: f, lvl3: true });
      if (dead) {
        const a = tf - FIN.hit; const [hx, hy] = P2S(vv, FIN.ex - 0.1, FIN.ey - EH * 0.86);
        for (let k = 0; k < 10; k++) { const an = -Math.PI * 0.2 - R(k, 951) * Math.PI * 0.9, d = (0.6 + 1.6 * R(k, 952)) * a * vv.s * 2.2; c.save(); c.translate(hx + Math.cos(an) * d, hy + Math.sin(an) * d + a * a * 160); c.rotate(a * 12 * (R(k, 953) - 0.5)); c.fillStyle = '#2b2226'; c.fillRect(-3, -2, 6 + 6 * R(k, 954), 4); c.restore(); }
        for (let k = 0; k < 12; k++) { const an = R(k, 955) * TAU, d = a * (60 + 160 * R(k, 956)); drawSprite(c, softDot(k % 2 ? '#a8140e' : '#e0402a', 32), hx + Math.cos(an) * d, hy + Math.sin(an) * d, 8 + 40 * a, Math.max(0, 0.75 - a * 2.5)); }
      }
    },
  });
  const fa = t >= FIN.shot ? impulse(t, FIN.shot, 16) : 0;
  if (fa > 0.01) { muzzleBloom(ctx, W / 2, H * 0.99, fa, 1.8); ctx.fillStyle = `rgba(255,240,210,${0.45 * fa})`; ctx.fillRect(0, 0, W, H); }
  scopeOverlay(ctx, 440);
  hudHitmarker(ctx, W / 2, H / 2, t - FIN.hit, true);
}
// ═════════════════════════ S6 — WINNER WINNER CHICKEN DINNER ═════════════════════════
const loopPh = t => fract((t - LOOP_A) / LOOP_P);
function laurel(ctx, x, y, s, flip, fill) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = fill; ctx.fillStyle = fill; ctx.lineWidth = 0.035; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0.95, 0, 0.95, Math.PI * 0.58, Math.PI * 1.36); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 0.62 + i * 0.083 * Math.PI, px = 0.95 + Math.cos(a) * 0.95, py = Math.sin(a) * 0.95;
    const sz = 0.17 - i * 0.006;
    for (const side of [-1, 1]) {
      ctx.save(); ctx.translate(px, py); ctx.rotate(a - Math.PI / 2 + side * 0.65 + Math.PI);
      ctx.beginPath(); ctx.ellipse(0, -sz * 0.9, sz * 0.36, sz, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  }
  ctx.save(); ctx.translate(0.95 + Math.cos(Math.PI * 1.36) * 0.95, Math.sin(Math.PI * 1.36) * 0.95); ctx.rotate(-0.5); ctx.beginPath(); ctx.ellipse(0, -0.12, 0.06, 0.15, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.restore();
}
function goldGrad(ctx, y0, y1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fff4c2'); g.addColorStop(0.35, '#ffd34a'); g.addColorStop(0.7, '#f2a900'); g.addColorStop(1, '#a86d08'); return g; }
function shimmer(ctx, x0, y0, w, h, ph, ang = -0.35) {
  // a bright diagonal sweep clipped by the current path (call after clip)
  const sx = lerp(x0 - 200, x0 + w + 200, ph);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(sx, y0 + h / 2); ctx.rotate(ang);
  const g = ctx.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,240,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-90, -h * 2, 180, h * 4); ctx.restore();
}
function endSky(ctx, t) {
  const v = { ax: -17, ay: -2.9, s: 30 };
  drawSky(ctx, v, { t: 0 });
  // god rays from the sun (periodic rotation → seamless loop)
  const [sx, sy] = P2S(v, PAN.sun.ax, PAN.sun.ay);
  const rot = (t - LOOP_A) / LOOP_P * (TAU / 14);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(sx, sy); ctx.rotate(rot);
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; const g = ctx.createLinearGradient(0, 0, Math.cos(a) * 900, Math.sin(a) * 900); g.addColorStop(0, 'rgba(255,214,150,0.16)'); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1000, a - 0.07, a + 0.07); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  drawRidgeLayer(ctx, v, { seed: 11, base: -2.3, amp: 3.0, freq: 0.04, col: '#9a7a90', colB: '#d6a28c', depth: 3 });
  drawRidgeLayer(ctx, v, { seed: 23, base: -0.6, amp: 0.8, freq: 0.08, col: '#76597a', colB: '#b98a7e', depth: 2, trees: { sp: 0.36, dens: 0.85, h: 0.6, sink: 0.12, col: '#6a5068' } });
  return v;
}
const LINEUP = [
  { i: 3, x: 300, y: 812, h: 214, pose: { type: 'stand', weapon: 'kar98k' }, dir: 1 },
  { i: 1, x: 425, y: 806, h: 236, pose: { type: 'shoulder', weapon: 'm416' }, dir: 1 },
  { i: 0, x: 566, y: 812, h: 276, pose: { type: 'hero', weapon: 'awm' }, dir: 1, lvl3: true },
  { i: 2, x: 718, y: 812, h: 230, pose: { type: 'shoulder', weapon: 'm416' }, dir: -1 },
];
function endRidge(ctx) {
  ctx.beginPath(); ctx.moveTo(-20, H + 20); ctx.lineTo(-20, 860);
  const pts = []; for (let x = -20; x <= W + 20; x += 20) pts.push([x, 820 + 38 * fbm1(x * 0.004 + 3, 991, 3) + Math.pow((x - 540) / 540, 2) * 40]);
  pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(W + 20, H + 20); ctx.closePath();
  const g = ctx.createLinearGradient(0, 800, 0, H); g.addColorStop(0, '#24181a'); g.addColorStop(1, '#0b0708'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,180,110,0.45)'; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
}
function embers(ctx, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) {
    const per = LOOP_P / (1 + (i % 3)); // divisors of the loop period
    const ph = fract((t - LOOP_A) / per + R(i, 1001));
    const x = R(i, 1002) * W + Math.sin(ph * TAU + i) * 18, y = 900 - ph * (520 + 260 * R(i, 1003));
    const a = Math.sin(ph * Math.PI) * (0.4 + 0.6 * R(i, 1004));
    drawSprite(ctx, softDot(i % 4 ? '#ffb040' : '#fff0b0', 32), x, y, 3 + 6 * R(i, 1005), a);
  }
  ctx.restore();
}
function endSmoke(ctx, t) {
  // the crate's red smoke drifting on the right, periodic
  ctx.save();
  for (let i = 0; i < 26; i++) {
    const ph = fract((t - LOOP_A) / LOOP_P + i / 26);
    const x = 905 + ph * 180 + Math.sin(ph * 4 + i) * 10, y = 820 - ph * 420;
    const r = 26 + ph * 120, a = Math.sin(ph * Math.PI) * 0.42;
    ctx.globalAlpha = a; ctx.drawImage(smokeSprite(1 + (i % 4), 128, '#e2412f'), x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
function sEnd(ctx, t) {
  const pz = 1 + 0.07 * (1 - ep(t, 22.9, 25.1, Ease.outCubic));
  ctx.save(); ctx.translate(540, 760); ctx.scale(pz, pz); ctx.translate(-540, -760);
  const v = endSky(ctx, t);
  endSmoke(ctx, t);
  // squad silhouettes rise from behind the ridge
  LINEUP.forEach((L, k) => {
    const rise = ep(t, 23.15 + k * 0.08, 23.75 + k * 0.08, Ease.outCubic);
    soldier(ctx, L.x, L.y + (1 - rise) * 320, L.h, L.pose, { dir: L.dir, rim: { c: '#ffcf8a', dx: -0.008, dy: -0.006 }, col: '#140d0f', lvl3: L.lvl3 });
  });
  endRidge(ctx);
  // crate on the ridge with beacon
  crate(ctx, 905, 836, 64, { beacon: Math.sin(t * TAU / LOOP_P * 3) > 0 ? 1 : 0.15 });
  // name tags
  LINEUP.forEach((L, k) => {
    const a = ep(t, 23.7 + k * 0.08, 24.0 + k * 0.08);
    if (a <= 0) return; const m = SQUAD[L.i];
    const ty = L.y - L.h * 1.04 - 22;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 10);
    const w = tw(ctx, m.name, 22, 'bar', 800) + 40;
    rr(ctx, L.x - w / 2, ty - 18, w, 30, 5); ctx.fillStyle = 'rgba(8,8,10,0.6)'; ctx.fill();
    badge(ctx, L.x - w / 2 + 15, ty - 3, 20, m.n, m.col);
    text(ctx, m.name, L.x - w / 2 + 30, ty + 5, { size: 22, fam: 'bar', w: 800, color: '#fff' });
    ctx.restore();
  });
  ctx.restore();
  embers(ctx, t);
  // top darkening for legibility
  const tg = ctx.createLinearGradient(0, 0, 0, 470); tg.addColorStop(0, 'rgba(12,8,18,0.72)'); tg.addColorStop(1, 'rgba(12,8,18,0)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 470);
  // ── typography ──
  const X = 58;
  // name + #1/25
  const na = ep(t, 23.55, 23.85, Ease.outCubic);
  if (na > 0) {
    ctx.save(); ctx.globalAlpha = na; ctx.translate((1 - na) * -30, 0);
    badge(ctx, X + 19, 96, 38, 1, C.p1);
    text(ctx, 'choriz0', X + 50, 116, { size: 56, fam: 'osw', w: 600, color: '#fff', shadow: 'rgba(0,0,0,0.5)', sb: 10 });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = na; ctx.translate((1 - na) * 30, 0);
    const rw = tw(ctx, '/100', 54, 'teko', 500);
    text(ctx, '/100', W - X, 124, { size: 54, fam: 'teko', w: 500, align: 'right', color: 'rgba(255,255,255,0.6)' });
    ctx.fillStyle = goldGrad(ctx, 40, 130);
    text(ctx, '#1', W - X - rw - 8, 124, { size: 112, fam: 'teko', w: 600, align: 'right', color: ctx.fillStyle, glow: 'rgba(255,180,40,0.55)', gb: 24 });
    ctx.restore();
  }
  // WINNER WINNER / CHICKEN DINNER!
  const fitLine = (s, maxW, size) => { const w0 = tw(ctx, s, size, 'osw', 700, 2); return Math.min(size, size * maxW / w0); };
  const s1 = 'WINNER WINNER', s2 = 'CHICKEN DINNER!';
  const fs2 = fitLine(s2, W - 2 * X, 132), fs1 = fs2;
  const slam = (str, y, fs, t0, col, isGold) => {
    font(ctx, fs, 'osw', 700); ctx.letterSpacing = '2px';
    let x = X;
    str.split('').forEach((ch, i) => {
      const ti = t0 + i * 0.022; const k = ep(t, ti, ti + 0.22, Ease.outBack); const a = clamp((t - ti) * 12);
      const cw = ctx.measureText(ch).width;
      if (a > 0) {
        ctx.save(); ctx.translate(x + cw / 2, y - fs * 0.35); ctx.scale(lerp(2.2, 1, k), lerp(2.2, 1, k)); ctx.globalAlpha = a;
        const fill = isGold ? goldGrad(ctx, -fs * 0.4, fs * 0.38) : col;
        text(ctx, ch, -cw / 2, fs * 0.35, { size: fs, fam: 'osw', w: 700, color: fill, shadow: 'rgba(0,0,0,0.55)', sb: 18, sy: 6 });
        ctx.restore();
      }
      x += cw;
    });
    return x - X;
  };
  slam(s1, 262, fs1, 23.0, '#ffffff', false);
  const w2 = slam(s2, 262 + fs2 * 0.98, fs2, 23.5, null, true);
  // shimmer across CHICKEN DINNER! (periodic)
  if (t > 24.0) {
    ctx.save(); font(ctx, fs2, 'osw', 700); ctx.letterSpacing = '2px';
    // build clip from text: draw text into an offscreen mask
    const ph = loopPh(t);
    if (ph < 0.42) {
      const mk = buf('shm');
      shimmer(mk.x, X, 262 + fs2 * 0.2, w2, fs2, ph / 0.42);
      mk.x.globalCompositeOperation = 'destination-in'; font(mk.x, fs2, 'osw', 700); mk.x.letterSpacing = '2px'; mk.x.fillStyle = '#fff'; mk.x.fillText(s2, X, 262 + fs2 * 0.98);
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(mk.c, 0, 0, W, H);
    }
    ctx.restore();
  }
  // stats line
  const sa = ep(t, 23.85, 24.2);
  if (sa > 0) {
    const stats = [['14', 'KILLS'], ['2 847', 'DMG'], ['3', 'REVIVES'], ['312 M', 'HEADSHOT']];
    let x = X; const y = 262 + fs2 * 0.98 + 58;
    ctx.save(); ctx.globalAlpha = sa;
    const bandG = ctx.createLinearGradient(X - 20, 0, W - 40, 0); bandG.addColorStop(0, 'rgba(10,6,10,0.62)'); bandG.addColorStop(0.75, 'rgba(10,6,10,0.4)'); bandG.addColorStop(1, 'rgba(10,6,10,0)');
    ctx.fillStyle = bandG; ctx.fillRect(X - 20, y - 38, W - X - 20, 52);
    stats.forEach(([n, l], i) => {
      const k = ep(t, 23.85 + i * 0.06, 24.15 + i * 0.06);
      text(ctx, n, x, y, { size: 40, fam: 'teko', w: 600, color: '#ffd24a', alpha: k }); x += tw(ctx, n, 40, 'teko', 600) + 8;
      text(ctx, l, x, y - 3, { size: 21, fam: 'bar', w: 700, ls: 2, color: 'rgba(255,255,255,0.85)', alpha: k }); x += tw(ctx, l, 21, 'bar', 700, 2) + 26;
      if (i < stats.length - 1) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 15, y - 26, 2, 26); }
    });
    ctx.restore();
  }
  // ── #1 MONDIAL crest ──
  const ct = 24.7;
  const ck = ep(t, ct, ct + 0.32, Ease.outBack), ca = clamp((t - ct) * 8);
  if (ca > 0) {
    const cx = W / 2, cy = 952;
    // shockwave
    const sw = prog(t, ct + 0.05, ct + 0.55);
    if (sw > 0 && sw < 1) { ctx.save(); ctx.strokeStyle = `rgba(255,214,90,${0.8 * (1 - sw)})`; ctx.lineWidth = 6 * (1 - sw) + 1; ctx.beginPath(); ctx.ellipse(cx, cy, 120 + sw * 520, 40 + sw * 170, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    const pulse = 0.5 + 0.5 * Math.sin(loopPh(t) * TAU);
    if (t > ct + 0.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ep(t, ct + 0.2, ct + 0.6) * (0.35 + 0.25 * pulse); ctx.drawImage(softDot('#ffb020', 128), cx - 420, cy - 120, 840, 240); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = ca; ctx.translate(cx, cy); const sc = lerp(2.4, 1.12, ck); ctx.scale(sc, sc);
    // plate
    const pw = 600, ph = 132;
    rr(ctx, -pw / 2, -ph / 2, pw, ph, 14); ctx.fillStyle = 'rgba(14,10,8,0.78)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = goldGrad(ctx, -ph / 2, ph / 2); ctx.stroke();
    rr(ctx, -pw / 2 + 7, -ph / 2 + 7, pw - 14, ph - 14, 10); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,214,90,0.45)'; ctx.stroke();
    laurel(ctx, -pw / 2 + 18, 6, 80, false, goldGrad(ctx, -70, 70));
    laurel(ctx, pw / 2 - 18, 6, 80, true, goldGrad(ctx, -70, 70));
    const w1 = tw(ctx, '#1', 112, 'teko', 600), w2m = tw(ctx, 'MONDIAL', 62, 'osw', 700, 3), gW = 56;
    const tot = gW + 18 + w1 + 22 + w2m; let gx = -tot / 2;
    ctx.save(); ctx.translate(gx + gW / 2, -2); ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 3.2; circle(ctx, 0, 0, 27); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 11, 27, 0, 0, TAU); ctx.moveTo(-27, 0); ctx.lineTo(27, 0); ctx.moveTo(-23, -13); ctx.quadraticCurveTo(0, -7, 23, -13); ctx.moveTo(-23, 13); ctx.quadraticCurveTo(0, 7, 23, 13); ctx.stroke(); ctx.restore();
    gx += gW + 18;
    text(ctx, '#1', gx, 38, { size: 112, fam: 'teko', w: 600, color: goldGrad(ctx, -50, 38), glow: 'rgba(255,170,30,0.6)', gb: 26 });
    gx += w1 + 22;
    text(ctx, 'MONDIAL', gx, 14, { size: 62, fam: 'osw', w: 700, ls: 3, color: goldGrad(ctx, -40, 14) });
    text(ctx, 'CLASSEMENT SQUAD · FPP', gx + 2, 44, { size: 19, fam: 'bar', w: 700, ls: 3.2, color: 'rgba(255,255,255,0.85)' });
    // periodic shine across the plate
    const ph2 = fract(loopPh(t) + 0.5);
    if (t > 25.0 && ph2 < 0.45) { ctx.save(); rr(ctx, -pw / 2, -ph / 2, pw, ph, 14); ctx.clip(); shimmer(ctx, -pw / 2, -ph / 2, pw, ph, ph2 / 0.45); ctx.restore(); }
    ctx.restore();
    // gold burst particles at stamp
    const ba = t - ct;
    if (ba > 0 && ba < 0.55) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const an = R(i, 1101) * TAU, d = (1 - Math.exp(-ba * 5)) * (160 + 380 * R(i, 1102)); drawSprite(ctx, softDot('#ffd060', 32), cx + Math.cos(an) * d * 1.3, cy + Math.sin(an) * d * 0.55, 4 + 8 * R(i, 1103), (1 - ba / 0.55) * 0.9); } ctx.restore(); }
  }
}

// ═════════════════════════ COMPOSITING ═════════════════════════
const BUF = {};
function buf(name) {
  const pw = Math.round(W * PXS);
  if (!BUF[name] || BUF[name].c.width !== pw) BUF[name] = mkCanvas(pw, pw);
  const b = BUF[name]; b.x.setTransform(PXS, 0, 0, PXS, 0, 0); b.x.globalAlpha = 1; b.x.globalCompositeOperation = 'source-over'; b.x.filter = 'none'; b.x.clearRect(0, 0, W, H);
  return b;
}
function sceneAt(t) { if (t < 6.3) return sMap; if (t < 11.6) return sKills; if (t < 15.6) return sCrate; if (t < 20.6) return sRevive; if (t < 22.9) return sFinal; return sEnd; }
const WHIPS = [
  { t: 11.6, a: 0.2, b: 0.24, dir: [0, 1], A: sKills, B: sCrate },
  { t: 20.6, a: 0.15, b: 0.2, dir: [-1, 0], A: sRevive, B: sFinal },
];
function smearDraw(ctx, img, x, y, dir, len, n = 9) {
  for (let k = 0; k < n; k++) { const o = (n === 1 ? 0 : (k / (n - 1) - 0.5)) * len; ctx.globalAlpha = 1 / (k + 1); ctx.drawImage(img, x + dir[0] * o, y + dir[1] * o, W, H); }
  ctx.globalAlpha = 1;
}
function renderScene(ctx, t) {
  for (const w of WHIPS) {
    if (t > w.t - w.a && t < w.t + w.b) {
      const p = prog(t, w.t - w.a, w.t + w.b), u = Ease.inOutCubic(p);
      const A = buf('wA'), B = buf('wB');
      w.A(A.x, t); w.B(B.x, t);
      const D = w.dir[0] ? W : H, blur = Math.sin(p * Math.PI) * 140;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      smearDraw(ctx, A.c, w.dir[0] * u * D, w.dir[1] * u * D, w.dir, blur);
      smearDraw(ctx, B.c, w.dir[0] * (u - 1) * D, w.dir[1] * (u - 1) * D, w.dir, blur);
      return;
    }
  }
  if (t >= FIN.freeze && t < 22.9) { // freeze-frame grade
    const b = buf('frz'); sFinal(b.x, t);
    const k = ep(t, FIN.freeze, FIN.freeze + 0.18);
    const z = 1 + 0.05 * ep(t, FIN.freeze, 22.9, Ease.inQuad);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(b.c, 0, 0, W, H);
    ctx.filter = 'grayscale(1) contrast(1.6) brightness(1.08)'; ctx.globalAlpha = k; ctx.drawImage(b.c, 0, 0, W, H); ctx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,196,90,${0.85 * k})`; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // speed lines
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) { const a = R(i, 1201) * TAU, r0 = 300 + R(i, 1202) * 300; ctx.strokeStyle = `rgba(255,236,190,${0.25 * k})`; ctx.lineWidth = 1 + 2 * R(i, 1203); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * 1100, H / 2 + Math.sin(a) * 1100); ctx.stroke(); }
    ctx.restore();
    return;
  }
  sceneAt(t)(ctx, t);
}
const SHAKES = [
  [8.05, 9, 12], [8.86, 16, 9], [13.36, 7, 10], [15.66, 9, 10], [15.8, 8, 10], [15.95, 9, 10], [16.1, 8, 10], [16.62, 4, 8],
  [19.96, 20, 8], [21.92, 16, 9], [22.02, 7, 10], [23.05, 7, 12], [23.52, 9, 11], [24.72, 12, 11],
];
SPRAY.forEach(s => SHAKES.push([s, 3.2, 22]));
[15.0, 15.13, 15.26, 15.39, 20.28, 20.4, 20.52, 20.64].forEach(s => SHAKES.push([s, 3, 20]));
function shakeAt(t) {
  let dx = 0, dy = 0, r = 0;
  for (const [t0, amp, dec] of SHAKES) { if (t < t0) continue; const e = Math.exp(-(t - t0) * dec) * amp; if (e < 0.05) continue; dx += vnoise((t - t0) * 38, t0 * 10) * e; dy += vnoise((t - t0) * 38, t0 * 10 + 5) * e; r += vnoise((t - t0) * 30, t0 * 10 + 9) * e * 0.0016; }
  return [dx, dy, r];
}
const FLASHES = [
  // [t, peak alpha, decay, colour, attack]
  [6.3, 0.95, 9, '255,255,255', 0.06], [8.86, 0.7, 16, '255,255,255', 0], [15.62, 0.55, 7, '255,30,20', 0], [16.62, 0.5, 6, '255,255,255', 0],
  [19.96, 0.7, 13, '255,255,255', 0], [22.9, 1.0, 5.5, '255,255,255', 0.2], [23.5, 0.35, 8, '255,214,120', 0], [24.7, 0.45, 10, '255,214,120', 0],
  [0.0, 0.55, 7, '0,0,0', 0],
];
function flashAt(ctx, t) {
  for (const [t0, pk, dec, col, att] of FLASHES) {
    let a = 0;
    if (t >= t0 - att && t < t0) a = pk * Ease.inQuad(prog(t, t0 - att, t0));
    else if (t >= t0) a = pk * Math.exp(-(t - t0) * dec);
    if (a > 0.004) { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  }
}
const CAS = [[8.86, 7, 8], [15.62, 5, 9], [19.96, 8, 8], [21.92, 7, 9], [23.5, 4, 9], [24.7, 5, 10], [6.3, 6, 9], [0.05, 10, 10]];
function caAt(t) { let a = 0; for (const [t0, amp, dec] of CAS) if (t >= t0) a = Math.max(a, amp * Math.exp(-(t - t0) * dec)); return a; }
function chromatic(ctx, amt) {
  const src = buf('caS'); src.x.drawImage(CV, 0, 0, W, H);
  const ch = (name, col) => { const b = buf(name); b.x.drawImage(src.c, 0, 0, W, H); b.x.globalCompositeOperation = 'multiply'; b.x.fillStyle = col; b.x.fillRect(0, 0, W, H); return b.c; };
  const r = ch('caR', '#ff0000'), g = ch('caG', '#00ff00'), b = ch('caB', '#0000ff');
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
  const s = amt / W * 2;
  ctx.drawImage(r, -W * s, -H * s, W * (1 + 2 * s), H * (1 + 2 * s));
  ctx.drawImage(g, -W * s / 2, -H * s / 2, W * (1 + s), H * (1 + s));
  ctx.drawImage(b, 0, 0, W, H);
  ctx.restore();
}
function glitchIn(ctx, t) {
  if (t > 0.32) return;
  const k = 1 - prog(t, 0, 0.32);
  const src = buf('gl'); src.x.drawImage(CV, 0, 0, W, H);
  for (let i = 0; i < 14; i++) { const y = R(i, Math.floor(t * 30) + 1300) * H, h = 8 + 60 * R(i, Math.floor(t * 30) + 1301); const dx = (R(i, Math.floor(t * 30) + 1302) - 0.5) * 180 * k; ctx.drawImage(src.c, 0, y * PXS, W * PXS, h * PXS, dx, y, W, h); }
}
function drawHUD(ctx, t) {
  const A = ep(t, 2.45, 2.85) * (1 - ep(t, 22.45, 22.75));
  if (A <= 0) return;
  const cine = (t > 8.07 && t < 8.98) ? 0 : 1;
  const a = A * cine;
  const heading = headingAt(t) + (t > 6.3 ? fbm1(t * 0.8, 51) * 1.5 : 0);
  const pinB = t < 6.3 ? 62 : t < 11.6 ? 255 : t < 15.6 ? 28 : t < 20.6 ? null : 310;
  const marks = [{ a: heading - 128, col: C.p2 }, { a: heading + 141, col: C.p3 }, { a: heading - 160, col: C.p4 }];
  if (pinB !== null && t > 3.55) marks.push({ a: pinB, col: C.p1, pin: true });
  hudCompass(ctx, heading, a, marks);
  hudCounters(ctx, aliveAt(t), killsAt(t), a, killPopAt(t));
  hudKillfeed(ctx, KF, t, a);
  hudSquad(ctx, squadAt(t), t, a);
  hudVitals(ctx, vitalsAt(t), t, a);
  const z = zoneAt(t), pp = playerPosAt(t);
  const mates = [[0.12, 0.07], [-0.1, 0.1], [0.06, -0.13]].map((o, i) => ({ x: pp[0] + o[0], y: pp[1] + o[1], col: SQUAD[i + 1].col }));
  hudMinimap(ctx, { px: pp[0], py: pp[1], s: t < 15.6 ? 180 : t < 20.6 ? 360 : 900, blue: z.blue, white: z.white, mates, heading: headingAt(t), timer: z.timer, zoneProg: 0.3 + 0.6 * fract(t / 9), pin: t < 11.6 && t > 6.3 ? null : null }, t, a * ep(t, 6.3, 6.7));
  hudKillMsg(ctx, killMsgAt(t), t, A * (t > 8.07 && t < 8.98 ? 0 : 1));
  hudCaption(ctx, capAt(t), t, A, t < 6.3 ? W / 2 : 446);
}
const MB = [[6.0, 6.34], [7.2, 7.46], [9.3, 9.63], [9.95, 10.13], [10.43, 10.61], [11.4, 13.45], [19.8, 20.14], [20.42, 20.82]];
function renderSceneMB(ctx, t) {
  if (!MB.some(([a, b]) => t >= a && t <= b)) { renderScene(ctx, t); return; }
  const N = 6, shutter = 1 / 55;
  const acc = buf('mbAcc');
  for (let k = 0; k < N; k++) {
    const tt = t - shutter / 2 + shutter * k / (N - 1);
    const sb = buf('mbSub'); renderScene(sb.x, tt);
    acc.x.globalAlpha = 1 / (k + 1); acc.x.drawImage(sb.c, 0, 0, W, H);
  }
  ctx.drawImage(acc.c, 0, 0, W, H);
}
function drawFrame(ctx, t) {
  const scn = buf('scn');
  renderSceneMB(scn.x, t);
  const [sx, sy, sr] = shakeAt(t);
  const m = Math.max(Math.abs(sx), Math.abs(sy));
  ctx.save(); ctx.translate(W / 2 + sx, H / 2 + sy); ctx.rotate(sr); const z = 1 + (m * 2.2 + Math.abs(sr) * 900) / W; ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(scn.c, 0, 0, W, H); ctx.restore();
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.42, W / 2, H / 2, W * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const ca = caAt(t); if (ca > 0.6) chromatic(ctx, ca);
  drawHUD(ctx, t);
  flashAt(ctx, t);
  glitchIn(ctx, t);
}
