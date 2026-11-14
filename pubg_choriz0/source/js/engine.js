'use strict';
// ───────────────────────── core constants & math ─────────────────────────
const W = 1080, H = 1080, TAU = Math.PI * 2, DEG = Math.PI / 180;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const fract = x => x - Math.floor(x);
const Ease = {
  lin: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inQuart: t => t * t * t * t,
  outQuart: t => 1 - Math.pow(1 - t, 4),
  inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  inOutQuint: t => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
};
// eased progress between two times
const ep = (t, a, b, e = Ease.outCubic) => e(prog(t, a, b));
// in/out envelope: rises over [a, a+fi], holds, falls over [b-fo, b]
const env = (t, a, b, fi = 0.2, fo = 0.2, ei = Ease.outCubic, eo = Ease.inCubic) =>
  t < a || t > b ? 0 : Math.min(ei(prog(t, a, a + fi)), 1 - eo(prog(t, b - fo, b)));
// damped spring 0→1 (overshoot)
const spring = (t, f = 9, d = 7) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(f * t));
// decaying impulse (for shakes / flashes)
const impulse = (t, t0, decay = 10) => (t < t0 ? 0 : Math.exp(-(t - t0) * decay));

// ───────────────────────── deterministic randomness ─────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash1(n) {
  // integer-ish hash → [0,1)
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
const R = (i, s = 0) => hash1(Math.floor(i) * 7919 + Math.floor(s) * 104729 + 17);
function vnoise(x, s = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(R(i, s), R(i + 1, s), u) * 2 - 1;
}
function fbm1(x, s = 0, oct = 4, lac = 2, gain = 0.5) {
  let a = 0, amp = 0.5, f = 1, n = 0;
  for (let k = 0; k < oct; k++) { a += amp * vnoise(x * f, s + k * 31); n += amp; f *= lac; amp *= gain; }
  return a / n;
}
function makeNoise2D(seed) {
  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const tmp = p[i]; p[i] = p[j]; p[j] = tmp; }
  const perm = new Uint8Array(512), pm12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; pm12[i] = perm[i] % 12; }
  const g = [1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1];
  const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  return function (xin, yin) {
    let n0 = 0, n1 = 0, n2 = 0;
    const s = (xin + yin) * F2, i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2, x0 = xin - (i - t), y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { const gi = pm12[ii + perm[jj]] * 3; t0 *= t0; n0 = t0 * t0 * (g[gi] * x0 + g[gi + 1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { const gi = pm12[ii + i1 + perm[jj + j1]] * 3; t1 *= t1; n1 = t1 * t1 * (g[gi] * x1 + g[gi + 1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { const gi = pm12[ii + 1 + perm[jj + 1]] * 3; t2 *= t2; n2 = t2 * t2 * (g[gi] * x2 + g[gi + 1] * y2); }
    return 70 * (n0 + n1 + n2);
  };
}
const N2 = makeNoise2D(1337);
function fbm2(x, y, oct = 5, lac = 2.03, gain = 0.5, nz = N2) {
  let a = 0, amp = 0.5, f = 1, n = 0;
  for (let k = 0; k < oct; k++) { a += amp * nz(x * f + k * 17.3, y * f - k * 9.1); n += amp; f *= lac; amp *= gain; }
  return a / n;
}

// ───────────────────────── colour helpers ─────────────────────────
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(h, a = 1) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
function mixHex(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
function mixRGB(A, B, t) { return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; }

// palette
const C = {
  p1: '#F7C531', p2: '#FF8A1F', p3: '#3FA2FF', p4: '#5BCB4A', // PUBG squad slots: yellow, orange, blue, green
  gold: '#FFC629', gold2: '#FFE07A', amber: '#F2A900',
  red: '#E8412E', hit: '#FF3B2F', white: '#FFFFFF', ink: '#0B0C0D',
  zone: '#2E6BFF', zoneEdge: '#8FB2FF',
};
const SQUAD = [
  { n: 1, name: 'choriz0', col: C.p1 },
  { n: 2, name: 'jiomi', col: C.p2 },
  { n: 3, name: 'mochard', col: C.p3 },
  { n: 4, name: 'dotvav', col: C.p4 },
];

// ───────────────────────── canvas helpers ─────────────────────────
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return { c, x: c.getContext('2d') }; }
const FONTS = { osw: 'Oswald', teko: 'Teko', bar: 'BarlowC', raj: 'Rajdhani', barlow: 'Barlow' };
function font(ctx, size, fam = 'bar', weight = 600) { ctx.font = `${weight} ${size}px ${FONTS[fam] || fam}`; }
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  font(ctx, o.size || 24, o.fam || 'bar', o.w || 600);
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  const ls = o.ls || 0;
  ctx.letterSpacing = ls + 'px';
  let xx = x;
  if (ls && (o.align === 'center')) xx += ls / 2; // compensate trailing spacing
  if (ls && (o.align === 'right')) xx += ls;
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.gb || 18; }
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.sb ?? 6; ctx.shadowOffsetX = o.sx || 0; ctx.shadowOffsetY = o.sy ?? 2; }
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || 3; ctx.strokeStyle = o.stroke; ctx.strokeText(s, xx, y); }
  if (o.fill !== false) { ctx.fillStyle = o.color || '#fff'; ctx.fillText(s, xx, y); }
  ctx.restore();
}
function tw(ctx, s, size, fam = 'bar', w = 600, ls = 0) {
  ctx.save(); font(ctx, size, fam, w); ctx.letterSpacing = ls + 'px';
  const m = ctx.measureText(s).width; ctx.restore(); return m - (ls ? ls : 0);
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); }
function poly(ctx, pts, close = true) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}
// smooth closed/open curve through points (Catmull-Rom → Bézier)
function smoothPath(ctx, pts, closed = false, tension = 0.5) {
  const n = pts.length; if (n < 2) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  const get = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * tension / 3, c1y = p1[1] + (p2[1] - p0[1]) * tension / 3;
    const c2x = p2[0] - (p3[0] - p1[0]) * tension / 3, c2y = p2[1] - (p3[1] - p1[1]) * tension / 3;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
  }
}
// sprite cache: soft radial dot
const SPR = {};
function softDot(col = '#fff', size = 128, hard = 0) {
  const k = col + size + hard; if (SPR[k]) return SPR[k];
  const { c, x } = mkCanvas(size, size);
  const g = x.createRadialGradient(size / 2, size / 2, size * 0.5 * hard, size / 2, size / 2, size / 2);
  g.addColorStop(0, rgba(col, 1)); g.addColorStop(0.35 + hard * 0.4, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0));
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return (SPR[k] = c);
}
function drawSprite(ctx, spr, x, y, r, alpha = 1) {
  if (alpha <= 0.002 || r <= 0) return;
  const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * alpha;
  ctx.drawImage(spr, x - r, y - r, r * 2, r * 2); ctx.globalAlpha = a0;
}
// lightweight noise-textured smoke puff sprites
function smokeSprite(seed, size = 256, tint = '#ffffff') {
  const k = 'smk' + seed + size + tint; if (SPR[k]) return SPR[k];
  const { c, x } = mkCanvas(size, size);
  const img = x.createImageData(size, size); const d = img.data; const [r, g, b] = hex2rgb(tint);
  const nz = makeNoise2D(seed * 77 + 5);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = (i / size) * 2 - 1, v = (j / size) * 2 - 1; const rr0 = Math.sqrt(u * u + v * v);
    const n = fbm2(u * 2.2 + seed, v * 2.2 - seed, 4, 2, 0.55, nz);
    let a = clamp(1 - rr0 * (1.05 - n * 0.55)); a = Math.pow(a, 1.6);
    const shade = 0.82 + 0.18 * clamp(0.5 - v * 0.5 + n * 0.6);
    const o = (j * size + i) * 4; d[o] = r * shade; d[o + 1] = g * shade; d[o + 2] = b * shade; d[o + 3] = a * 255;
  }
  x.putImageData(img, 0, 0);
  return (SPR[k] = c);
}
