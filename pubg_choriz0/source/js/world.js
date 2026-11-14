'use strict';
// ═════════════════════════ TACTICAL MAP (Erangel-like, 8×8 km) ═════════════════════════
const MAP_KM = 8, MAP_PX = 4096, PPK = MAP_PX / MAP_KM; // texture px per km
const TOWNS = [
  { n: 'ZHARKI', x: 0.75, y: 0.85, s: 0.7 },
  { n: 'SEVERNY', x: 4.15, y: 0.95, s: 0.8 },
  { n: 'STALBER', x: 5.6, y: 0.85, s: 0.4 },
  { n: 'KAMESHKI', x: 7.05, y: 0.75, s: 0.6 },
  { n: 'GEORGOPOL', x: 1.75, y: 2.05, s: 1.4 },
  { n: 'ROZHOK', x: 3.55, y: 2.55, s: 0.9 },
  { n: 'SCHOOL', x: 4.25, y: 2.95, s: 0.5 },
  { n: 'YASNAYA POLYANA', x: 5.5, y: 1.85, s: 1.3 },
  { n: 'MANSION', x: 5.65, y: 3.35, s: 0.3 },
  { n: 'PRISON', x: 6.55, y: 2.65, s: 0.35 },
  { n: 'MYLTA POWER', x: 7.1, y: 3.4, s: 0.6 },
  { n: 'GATKA', x: 2.15, y: 3.95, s: 0.7 },
  { n: 'POCHINKI', x: 3.35, y: 4.25, s: 1.3 },
  { n: 'MYLTA', x: 6.1, y: 4.7, s: 1.0 },
  { n: 'LIPOVKA', x: 7.05, y: 4.95, s: 0.6 },
  { n: 'PRIMORSK', x: 1.5, y: 5.4, s: 0.9 },
  { n: 'FERRY PIER', x: 2.5, y: 5.9, s: 0.4 },
  { n: 'NOVOREPNOYE', x: 6.25, y: 5.85, s: 1.0 },
  { n: 'MILITARY BASE', x: 4.15, y: 7.05, s: 1.4 },
];
const ROADS = [
  ['GEORGOPOL', 'ROZHOK', 'SCHOOL', 'YASNAYA POLYANA', 'STALBER'],
  ['ZHARKI', 'GEORGOPOL', 'GATKA', 'POCHINKI', 'MYLTA', 'LIPOVKA'],
  ['SEVERNY', 'ROZHOK', 'POCHINKI', 'PRIMORSK'],
  ['SCHOOL', 'MANSION', 'MYLTA'],
  ['YASNAYA POLYANA', 'PRISON', 'MYLTA POWER', 'LIPOVKA'],
  ['POCHINKI', 'FERRY PIER', [2.95, 5.84], [2.95, 6.3], 'MILITARY BASE', [5.45, 6.43], [5.45, 5.95], 'NOVOREPNOYE', 'MYLTA'],
  ['SEVERNY', 'YASNAYA POLYANA', 'KAMESHKI'],
];
const townBy = n => TOWNS.find(t => t.n === n);

function islandField(x, y) {
  // signed land value (>0 land) at km coords; x,y in [0,8]
  const sdBox = (px, py, cx, cy, hx, hy, r) => {
    const qx = Math.abs(px - cx) - hx + r, qy = Math.abs(py - cy) - hy + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  const warp = fbm2(x * 0.45, y * 0.45, 4) * 0.55 + fbm2(x * 1.6 + 7, y * 1.6, 3) * 0.12;
  let main = -sdBox(x, y, 3.95, 3.15, 3.55, 2.85, 1.0) + warp;
  // south-west coast bite (Primorsk bay) and north-west bay (Georgopol)
  main -= Math.max(0, 0.7 - Math.hypot(x - 0.35, y - 4.6)) * 1.3;
  main -= Math.max(0, 0.55 - Math.hypot(x - 0.9, y - 2.75)) * 1.6;
  const sos = -sdBox(x, y, 4.35, 6.95, 2.7, 0.62, 0.55) + fbm2(x * 0.9 + 3, y * 0.9, 3) * 0.3;
  let land = Math.max(main, sos);
  // channel between main island and Sosnovka
  const chY = 6.12 + Math.sin(x * 1.3) * 0.08;
  const ch = Math.abs(y - chY) - 0.11;
  if (x > 1.2 && x < 7.4) land = Math.min(land, ch * 3);
  // river from the north, meandering down toward the channel (west side)
  const rx = 2.75 + Math.sin(y * 1.7) * 0.22 + fbm2(1.3, y * 0.6, 2) * 0.25;
  if (y > 0.2 && y < 6.2) {
    const w = 0.035 + 0.02 * y / 6;
    land = Math.min(land, (Math.abs(x - rx) - w) * 4);
  }
  return land;
}

function bakeMap() {
  const N = 2048, k = MAP_KM / N;
  const land = new Float32Array(N * N), elev = new Float32Array(N * N), veg = new Float32Array(N * N);
  const nzV = makeNoise2D(99);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * k, y = (j + 0.5) * k, o = j * N + i;
    const L = islandField(x, y); land[o] = L;
    const hills = fbm2(x * 0.55 + 11, y * 0.55 - 4, 5) * 0.5 + 0.5;
    const ridges = 1 - Math.abs(fbm2(x * 0.9 - 3, y * 0.9 + 5, 4));
    elev[o] = clamp(L * 1.4) * (0.35 * hills + 0.65 * hills * ridges);
    veg[o] = fbm2(x * 1.1 + 20, y * 1.1, 4, 2.1, 0.55, nzV);
  }
  const { c: base, x: bx } = mkCanvas(N, N);
  const img = bx.createImageData(N, N), d = img.data;
  const deep = [14, 38, 46], shal = [36, 78, 78], sand = [150, 138, 104];
  const fieldA = [118, 122, 70], fieldB = [138, 132, 82], meadow = [84, 104, 52], forest = [40, 62, 34], rock = [112, 110, 92];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const o = j * N + i, L = land[o];
    let col;
    if (L < 0) {
      col = mixRGB(shal, deep, clamp(-L * 2.2));
    } else {
      const e = elev[o], v = veg[o];
      col = mixRGB(meadow, v > 0 ? fieldB : fieldA, clamp(Math.abs(v) * 2));
      if (v < -0.12) col = mixRGB(col, forest, clamp((-v - 0.12) * 6));
      col = mixRGB(col, rock, clamp((e - 0.62) * 3));
      col = mixRGB(sand, col, clamp(L * 14));
      // hillshade
      const iL = Math.max(i - 1, 0), iR = Math.min(i + 1, N - 1), jU = Math.max(j - 1, 0), jD = Math.min(j + 1, N - 1);
      const dx = elev[j * N + iR] - elev[j * N + iL], dy = elev[jD * N + i] - elev[jU * N + i];
      const sh = clamp(0.82 + (-dx - dy) * 38, 0.45, 1.35);
      col = [col[0] * sh, col[1] * sh, col[2] * sh];
    }
    d[o * 4] = col[0]; d[o * 4 + 1] = col[1]; d[o * 4 + 2] = col[2]; d[o * 4 + 3] = 255;
  }
  bx.putImageData(img, 0, 0);
  const { c, x } = mkCanvas(MAP_PX, MAP_PX);
  x.imageSmoothingQuality = 'high';
  x.drawImage(base, 0, 0, MAP_PX, MAP_PX);
  const rnd = mulberry32(4242);
  const isLand = (kx, ky) => islandField(kx, ky) > 0.02;
  // farmland patches (rectangular fields with hedgerows)
  for (let n = 0; n < 2600; n++) {
    const kx = 0.4 + rnd() * 7.2, ky = 0.4 + rnd() * 7.2;
    if (!isLand(kx, ky) || fbm2(kx * 1.1 + 20, ky * 1.1, 4, 2.1, 0.55, nzV) < -0.08) continue;
    const w = (0.08 + rnd() * 0.22) * PPK, h = (0.06 + rnd() * 0.16) * PPK, a = (rnd() - 0.5) * 0.5 + (fbm2(kx * 0.3, ky * 0.3, 2) * 0.8);
    x.save(); x.translate(kx * PPK, ky * PPK); x.rotate(a);
    const tone = rnd();
    x.fillStyle = tone < 0.33 ? 'rgba(170,150,90,0.20)' : tone < 0.66 ? 'rgba(90,120,50,0.20)' : 'rgba(140,120,70,0.16)';
    x.fillRect(-w / 2, -h / 2, w, h);
    x.strokeStyle = 'rgba(30,45,20,0.35)'; x.lineWidth = 2; x.strokeRect(-w / 2, -h / 2, w, h);
    x.restore();
  }
  // forests: dense tree crowns
  for (let n = 0; n < 160000; n++) {
    const kx = rnd() * 8, ky = rnd() * 8;
    const v = fbm2(kx * 1.1 + 20, ky * 1.1, 4, 2.1, 0.55, nzV);
    if (v > -0.1 + rnd() * 0.08 || !isLand(kx, ky)) continue;
    const r = 2.2 + rnd() * 3.2, px = kx * PPK, py = ky * PPK;
    x.fillStyle = 'rgba(8,16,8,0.45)'; circle(x, px + 1.6, py + 1.8, r); x.fill();
    x.fillStyle = rnd() < 0.5 ? '#2c4a26' : '#35552c'; circle(x, px, py, r); x.fill();
  }
  // roads
  const roadPts = names => {
    const pts = names.map(nm => { if (Array.isArray(nm)) return [nm[0] * PPK, nm[1] * PPK]; const t = townBy(nm); return [t.x * PPK, t.y * PPK]; });
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx2, by] = pts[i + 1];
      for (let s = 0; s < 14; s++) {
        const u = s / 14, segL = Math.hypot(bx2 - ax, by - ay) / PPK, wob = segL < 0.7 ? 0 : Math.sin(u * Math.PI) * fbm1(i * 3.3 + u * 2, 7 + i) * 0.18 * PPK;
        const nx = -(by - ay), ny = bx2 - ax, nl = Math.hypot(nx, ny) || 1;
        out.push([lerp(ax, bx2, u) + nx / nl * wob, lerp(ay, by, u) + ny / nl * wob]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  x.lineCap = 'round'; x.lineJoin = 'round';
  for (const r of ROADS) { const p = roadPts(r); x.beginPath(); smoothPath(x, p); x.strokeStyle = 'rgba(40,34,22,0.65)'; x.lineWidth = 10; x.stroke(); }
  for (const r of ROADS) { const p = roadPts(r); x.beginPath(); smoothPath(x, p); x.strokeStyle = '#b8a77c'; x.lineWidth = 5.5; x.stroke(); }
  // bridges over the channel
  for (const bxk of [2.95, 5.45]) {
    const yy = 6.12 + Math.sin(bxk * 1.3) * 0.08;
    x.strokeStyle = '#2a2a26'; x.lineWidth = 16; x.beginPath(); x.moveTo(bxk * PPK, (yy - 0.2) * PPK); x.lineTo(bxk * PPK, (yy + 0.2) * PPK); x.stroke();
    x.strokeStyle = '#c9c1a6'; x.lineWidth = 9; x.stroke();
  }
  // towns: building clusters
  for (const t of TOWNS) {
    const cnt = Math.round(40 * t.s + 10);
    for (let n = 0; n < cnt; n++) {
      const ang = rnd() * TAU, rad = Math.pow(rnd(), 0.7) * (0.12 + 0.2 * t.s);
      const kx = t.x + Math.cos(ang) * rad, ky = t.y + Math.sin(ang) * rad * 0.8;
      if (!isLand(kx, ky)) continue;
      const w = (10 + rnd() * 18) * (t.n === 'MILITARY BASE' ? 1.8 : 1), h = 8 + rnd() * 12;
      x.save(); x.translate(kx * PPK, ky * PPK); x.rotate(Math.round(rnd() * 3) * 0.5 + (rnd() - 0.5) * 0.2);
      x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(-w / 2 + 2.5, -h / 2 + 3, w, h);
      const roof = rnd(); x.fillStyle = roof < 0.45 ? '#a59f92' : roof < 0.75 ? '#8d5843' : '#6f7272';
      x.fillRect(-w / 2, -h / 2, w, h);
      x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(-w / 2, -h / 2, w, h / 2);
      x.restore();
    }
  }
  return c;
}

// map camera: centre (km) + scale (screen px per km)
function mapToScreen(cam, kx, ky) { return [W / 2 + (kx - cam.x) * cam.s, H / 2 + (ky - cam.y) * cam.s]; }
function drawMapBase(ctx, MAP, cam, opt = {}) {
  ctx.save();
  ctx.fillStyle = '#0c1f25'; ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const [x0, y0] = mapToScreen(cam, 0, 0);
  ctx.drawImage(MAP, x0, y0, MAP_KM * cam.s, MAP_KM * cam.s);
  // tactical grade: darken + cool tint
  ctx.fillStyle = `rgba(8,14,16,${opt.dim ?? 0.38})`; ctx.fillRect(0, 0, W, H);
  // grid
  const gA = opt.grid ?? 1;
  if (gA > 0) {
    ctx.lineWidth = 1;
    if (cam.s > 260) {
      ctx.strokeStyle = `rgba(255,255,255,${0.05 * gA * clamp((cam.s - 260) / 200)})`;
      ctx.beginPath();
      for (let k = 0; k <= 80; k++) { const v = k / 10; if (k % 10 === 0) continue; let [sx] = mapToScreen(cam, v, 0); ctx.moveTo(sx, y0); ctx.lineTo(sx, y0 + MAP_KM * cam.s); let [, sy] = mapToScreen(cam, 0, v); ctx.moveTo(x0, sy); ctx.lineTo(x0 + MAP_KM * cam.s, sy); }
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.2 * gA})`; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let k = 0; k <= 8; k++) { const [sx] = mapToScreen(cam, k, 0); ctx.moveTo(sx, y0); ctx.lineTo(sx, y0 + MAP_KM * cam.s); const [, sy] = mapToScreen(cam, 0, k); ctx.moveTo(x0, sy); ctx.lineTo(x0 + MAP_KM * cam.s, sy); }
    ctx.stroke();
    // grid letters (A–H columns, I–P rows) pinned to visible edge
    const cols = 'ABCDEFGH', rows = 'IJKLMNOP';
    for (let k = 0; k < 8; k++) {
      const [sx] = mapToScreen(cam, k + 0.5, 0); const [, sy] = mapToScreen(cam, 0, k + 0.5);
      const ty = clamp(y0 + 26, 26, H), tx = clamp(x0 + 14, 14, W);
      text(ctx, cols[k], sx, ty, { size: 22, fam: 'raj', w: 700, align: 'center', color: 'rgba(255,255,255,0.75)', alpha: gA });
      text(ctx, rows[k], tx, sy + 8, { size: 22, fam: 'raj', w: 700, color: 'rgba(255,255,255,0.75)', alpha: gA });
    }
  }
  // town labels
  const lA = opt.labels ?? 1;
  if (lA > 0) {
    const fs = clamp(cam.s * 0.045, 13, 24);
    for (const t of TOWNS) {
      const [sx, sy] = mapToScreen(cam, t.x, t.y);
      if (sx < -200 || sx > W + 200 || sy < -50 || sy > H + 50) continue;
      text(ctx, t.n, sx, sy - fs * 0.2, { size: fs, fam: 'bar', w: 700, ls: fs * 0.12, align: 'center', color: '#f1ead8', alpha: lA * 0.92, shadow: 'rgba(0,0,0,0.9)', sb: 6, sy: 1 });
    }
  }
  ctx.restore();
}
// zone overlay: blue zone outside circle B, white circle W
function drawZones(ctx, cam, blue, white, opt = {}) {
  ctx.save();
  if (blue) {
    const [bx, by] = mapToScreen(cam, blue.x, blue.y), br = blue.r * cam.s;
    ctx.beginPath(); ctx.rect(-50, -50, W + 100, H + 100); ctx.arc(bx, by, br, 0, TAU, true);
    ctx.fillStyle = `rgba(30,90,255,${0.32 * (opt.blueA ?? 1)})`; ctx.fill('evenodd');
    circle(ctx, bx, by, br); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(120,170,255,${0.95 * (opt.blueA ?? 1)})`; ctx.stroke();
  }
  if (white) {
    const [wx, wy] = mapToScreen(cam, white.x, white.y), wr = white.r * cam.s;
    const p = white.p ?? 1;
    ctx.beginPath(); ctx.arc(wx, wy, wr, -Math.PI / 2, -Math.PI / 2 + TAU * p);
    ctx.lineWidth = white.lw || 3.5; ctx.strokeStyle = `rgba(255,255,255,${white.a ?? 1})`;
    ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 10; ctx.stroke();
  }
  ctx.restore();
}

// ═════════════════════════ FIRST-PERSON PANORAMA (themed: sunset / day / rain / morning) ═════════════════════════
// view: { ax, ay } = centre angles (deg), s = px per degree. +y = down; horizon at ay = 0.
const P2S = (v, ax, ay) => [W / 2 + (ax - v.ax) * v.s, H / 2 + (ay - v.ay) * v.s];
const PAN = { sun: { ax: -17, ay: -4.2 } };
const THEMES = {
  sunset: {
    sky: [[-40, [26, 32, 58]], [-22, [58, 52, 86]], [-12, [150, 84, 92]], [-6, [222, 124, 92]], [-2, [246, 172, 102]], [0.5, [255, 204, 132]]],
    sun: { ax: -17, ay: -4.2, core: '#fff6df', g: ['rgba(255,240,200,0.95)', 'rgba(255,214,150,0.65)', 'rgba(255,170,100,0.22)', 'rgba(255,140,90,0)'], r: 26 },
    cloud: '#ffd2a8', cloudShade: '#6d4560', cloudA: 0.18,
    far: ['#a07f93', '#d6a28c'], mid: ['#7a6074', '#b98a7e', '#6f5669'], near: ['#4f4050', '#6d5258', '#3e3241'],
    field: ['#d9ab66', '#c39452', '#9a7642', '#735733', '#4a3820'], patch: ['#3d2c14', '#f0c27a'], furrow: 'rgba(70,48,22,0.16)',
    tuft: ['rgba(66,46,20,0.38)', 'rgba(150,112,58,0.35)', 'rgba(240,200,130,0.4)'],
    haze: '255,196,140', tree: ['#2b2026', '#3a2d33', '#45363c'], rock: ['#b0906a', '#6a574a', '#3a3030'], hay: ['#f1cf86', '#b98e4c', '#7a5a2e'],
    fg: ['#2a1d17', '#0d0907'], fgRim: 'rgba(255,180,110,0.55)', blade: '#120c09', rim: '#ffc27a', ink: '#22181b',
  },
  day: {
    sky: [[-40, [30, 82, 166]], [-22, [52, 116, 198]], [-12, [92, 152, 222]], [-6, [136, 184, 232]], [-2, [184, 212, 236]], [0.5, [214, 230, 238]]],
    sun: { ax: -32, ay: -22, core: '#ffffff', g: ['rgba(255,255,245,0.9)', 'rgba(255,252,232,0.42)', 'rgba(255,250,222,0.12)', 'rgba(255,250,222,0)'], r: 30 },
    cloud: '#ffffff', cloudShade: '#a9bccd', cloudA: 0.42, cumulus: true,
    far: ['#8ea3b6', '#c3d0d8'], mid: ['#5f7f68', '#93ab96', '#53735a'], near: ['#45653f', '#5f7f51', '#36532f'],
    field: ['#cfc878', '#b8b25f', '#949744', '#6e7834', '#48521f'], patch: ['#4e5a22', '#f2e7a0'], furrow: 'rgba(60,70,20,0.14)',
    tuft: ['rgba(60,72,24,0.38)', 'rgba(120,130,50,0.35)', 'rgba(232,232,150,0.4)'],
    haze: '225,236,244', tree: ['#3a3326', '#3d5a35', '#4a6b40'], rock: ['#c9c2b2', '#8a8476', '#55524a'], hay: ['#f3dc96', '#c9a85e', '#8a6f3a'],
    fg: ['#3a4a2a', '#1a2412'], fgRim: 'rgba(255,255,220,0.35)', blade: '#1f2a14', rim: '#fff6dc', ink: '#262b20',
  },
  rain: {
    sky: [[-40, [38, 44, 54]], [-22, [58, 66, 78]], [-12, [84, 92, 104]], [-6, [108, 116, 126]], [-2, [132, 138, 146]], [0.5, [150, 154, 160]]],
    sun: null, cloud: '#9aa3ad', cloudShade: '#2e353f', cloudA: 0.3,
    far: ['#68727c', '#8a939b'], mid: ['#4c5753', '#6c7672', '#414b47'], near: ['#38443a', '#4b5747', '#2c362d'],
    field: ['#8f8c62', '#7c7b52', '#626440', '#4b4e30', '#343820'], patch: ['#2e3020', '#b8b48a'], furrow: 'rgba(30,34,20,0.18)',
    tuft: ['rgba(40,44,28,0.4)', 'rgba(100,104,70,0.35)', 'rgba(180,184,150,0.3)'],
    haze: '160,168,176', tree: ['#1f2422', '#2a332e', '#323c36'], rock: ['#8d9089', '#5d605a', '#3a3c38'], hay: ['#c7b77e', '#97875a', '#615638'],
    fg: ['#232a22', '#0e120d'], fgRim: 'rgba(200,210,220,0.3)', blade: '#121611', rim: '#b9c4cf', ink: '#1c2022', rain: true,
  },
  morning: {
    sky: [[-40, [52, 76, 132]], [-22, [96, 118, 176]], [-12, [170, 160, 196]], [-6, [230, 184, 184]], [-2, [248, 208, 184]], [0.5, [252, 226, 200]]],
    sun: { ax: -13, ay: -3.0, core: '#fffaf0', g: ['rgba(255,250,235,0.95)', 'rgba(255,232,200,0.55)', 'rgba(255,210,180,0.2)', 'rgba(255,200,170,0)'], r: 22 },
    cloud: '#ffe9e2', cloudShade: '#8d84a8', cloudA: 0.26,
    far: ['#aaa5c2', '#dcc8cc'], mid: ['#8b89a6', '#c2b4bd', '#7c7a98'], near: ['#5f6d63', '#7d8a78', '#4e5c52'],
    field: ['#cdb98a', '#b39f6e', '#8f7f55', '#6b6040', '#433f2c'], patch: ['#3e3a28', '#f4dcb0'], furrow: 'rgba(60,50,30,0.14)',
    tuft: ['rgba(60,52,32,0.38)', 'rgba(140,120,80,0.35)', 'rgba(250,225,180,0.4)'],
    haze: '250,228,214', tree: ['#2b2a33', '#3a3a48', '#454556'], rock: ['#c4b4a8', '#7e7268', '#4a4440'], hay: ['#f5d9a0', '#c9a46a', '#8a6c42'],
    fg: ['#2d2a30', '#121014'], fgRim: 'rgba(255,220,200,0.45)', blade: '#141216', rim: '#ffe0c8', ink: '#24212a',
  },
};
let THEME = THEMES.sunset;
function setTheme(name) { THEME = THEMES[name] || THEMES.sunset; if (typeof RIM !== 'undefined') RIM.c = THEME.rim; }
function ridge(ax, seed, base, amp, freq, oct = 5) { return base + amp * fbm1(ax * freq + 100, seed, oct); }
function skyCol(ay) {
  const stops = THEME.sky;
  if (ay <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) { const [a, ca] = stops[i], [b, cb] = stops[i + 1]; if (ay <= b) return mixRGB(ca, cb, (ay - a) / (b - a)); }
  return stops[stops.length - 1][1];
}
const rgbS = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
function drawSky(ctx, v, opt = {}) {
  const aTop = v.ay - H / 2 / v.s, aBot = v.ay + H / 2 / v.s;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (let k = 0; k <= 10; k++) { const a = lerp(aTop, aBot, k / 10); g.addColorStop(k / 10, rgbS(skyCol(a))); }
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  const S = THEME.sun;
  if (S) {
    const [sx, sy] = P2S(v, S.ax, S.ay);
    const glowR = Math.max(60, S.r * v.s);
    const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
    gg.addColorStop(0, S.g[0]); gg.addColorStop(0.08, S.g[1]); gg.addColorStop(0.35, S.g[2]); gg.addColorStop(1, S.g[3]);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.globalCompositeOperation = 'source-over';
    circle(ctx, sx, sy, Math.max(7, 1.05 * v.s)); ctx.fillStyle = S.core; ctx.fill();
  }
  // stretched cloud bands
  const spr = softDot(THEME.cloud, 128), sh = softDot(THEME.cloudShade, 128);
  for (let i = 0; i < 26; i++) {
    const ca = -60 + R(i, 3) * 120, cy = -7 - R(i, 4) * 16, cw = 4 + R(i, 5) * 10;
    const [cx, cyy] = P2S(v, ca + (opt.t || 0) * 0.15, cy);
    const wpx = cw * v.s, hpx = Math.max(4, cw * (THEME.rain ? 0.3 : 0.12) * v.s);
    if (cx + wpx < -50 || cx - wpx > W + 50) continue;
    ctx.globalAlpha = THEME.cloudA + 0.2 * R(i, 6);
    ctx.drawImage(spr, cx - wpx, cyy - hpx, wpx * 2, hpx * 2);
    ctx.globalAlpha = 0.25; ctx.drawImage(sh, cx - wpx * 0.8, cyy - hpx * (THEME.rain ? 0.6 : 1.4), wpx * 1.6, hpx * 1.3);
  }
  // fair-weather cumulus
  if (THEME.cumulus) {
    const wd = softDot('#ffffff', 64), shd = softDot('#9fb2c6', 64);
    for (let i = 0; i < 12; i++) {
      const ca = -80 + i * 15 + R(i, 21) * 8, cy = -8 - R(i, 22) * 12, sz = 2.2 + R(i, 23) * 2.8;
      const [bx, by] = P2S(v, ca, cy + sz * 0.25);
      if (bx < -sz * v.s * 3 || bx > W + sz * v.s * 3) continue;
      ctx.globalAlpha = 0.5; ctx.drawImage(shd, bx - sz * 1.6 * v.s, by - sz * 0.35 * v.s, sz * 3.2 * v.s, sz * 0.8 * v.s);
      for (let k = 0; k < 10; k++) { const ox = (R(k, i * 7 + 1) - 0.5) * sz * 2.4, oy = -R(k, i * 7 + 2) * sz * 0.8; const r = sz * (0.45 + 0.4 * R(k, i * 7 + 3)); const [x, y] = P2S(v, ca + ox, cy + oy); drawSprite(ctx, wd, x, y, r * v.s, 0.6); }
    }
  }
  ctx.globalAlpha = 1;
}
function pine(ctx, x, y, h, col) {
  const w = h * 0.36; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x, y - h);
  const tiers = 4;
  for (let i = 1; i <= tiers; i++) { const yy = y - h + (h * 0.88) * (i / tiers); const ww = w * (0.35 + 0.65 * i / tiers); ctx.lineTo(x + ww, yy); ctx.lineTo(x + ww * 0.42, yy - h * 0.05); }
  ctx.lineTo(x + w * 0.08, y); ctx.lineTo(x - w * 0.08, y);
  for (let i = tiers; i >= 1; i--) { const yy = y - h + (h * 0.88) * (i / tiers); const ww = w * (0.35 + 0.65 * i / tiers); ctx.lineTo(x - ww * 0.42, yy - h * 0.05); ctx.lineTo(x - ww, yy); }
  ctx.closePath(); ctx.fill();
}
function drawRidgeLayer(ctx, v, L) {
  const a0 = v.ax - W / 2 / v.s - 2, a1 = v.ax + W / 2 / v.s + 2;
  const step = Math.max(0.02, 3 / v.s);
  const pts = [];
  for (let a = a0; a <= a1 + step; a += step) { const y = ridge(a, L.seed, L.base, L.amp, L.freq, L.oct || 5); pts.push(P2S(v, a, y)); }
  ctx.beginPath(); ctx.moveTo(pts[0][0], H + 40);
  for (const p of pts) ctx.lineTo(p[0], p[1]);
  ctx.lineTo(pts[pts.length - 1][0], H + 40); ctx.closePath();
  const [, yb] = P2S(v, 0, L.base - L.amp), [, ye] = P2S(v, 0, L.base + (L.depth || 6));
  const g = ctx.createLinearGradient(0, yb, 0, ye);
  g.addColorStop(0, L.col); g.addColorStop(1, L.colB || L.col);
  ctx.fillStyle = g; ctx.fill();
  if (L.trees) {
    const T = L.trees, sp = T.sp;
    const i0 = Math.floor(a0 / sp), i1 = Math.ceil(a1 / sp);
    for (let i = i0; i <= i1; i++) {
      if (R(i, L.seed + 9) > T.dens) continue;
      const a = (i + R(i, L.seed + 1)) * sp;
      const yy = ridge(a, L.seed, L.base, L.amp, L.freq, L.oct || 5) + T.sink;
      const hh = T.h * (0.6 + 0.7 * R(i, L.seed + 2));
      const [x, y] = P2S(v, a, yy);
      pine(ctx, x, y, hh * v.s, T.col);
    }
  }
}
function fieldTop(a) { return ridge(a, 41, 1.05, 0.35, 0.035, 3); }
function drawField(ctx, v, opt = {}) {
  const a0 = v.ax - W / 2 / v.s - 2, a1 = v.ax + W / 2 / v.s + 2;
  const step = Math.max(0.02, 3 / v.s);
  ctx.beginPath(); let first = true;
  for (let a = a0; a <= a1 + step; a += step) { const [x, y] = P2S(v, a, fieldTop(a)); if (first) { ctx.moveTo(x, H + 60); first = false; } ctx.lineTo(x, y); }
  ctx.lineTo(W + 60, H + 60); ctx.closePath();
  const [, y0] = P2S(v, 0, 0.9), [, y1] = P2S(v, 0, 15);
  const g = ctx.createLinearGradient(0, y0, 0, y1), F = THEME.field;
  g.addColorStop(0, F[0]); g.addColorStop(0.08, F[1]); g.addColorStop(0.3, F[2]); g.addColorStop(0.65, F[3]); g.addColorStop(1, F[4]);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  const vp = P2S(v, 30, -0.4);
  ctx.strokeStyle = THEME.furrow; ctx.lineWidth = Math.max(1, v.s * 0.05);
  ctx.beginPath();
  for (let k = -60; k <= 60; k++) { const [bx] = P2S(v, 30 + k * 2.2, 9); const by = P2S(v, 0, 9)[1]; const u0 = 0.22; ctx.moveTo(lerp(vp[0], bx, u0), lerp(vp[1], by, u0)); ctx.lineTo(bx, by); }
  ctx.stroke();
  for (let i = 0; i < 40; i++) {
    const pa = -50 + R(i, 71) * 100, py = 1.4 + R(i, 72) * 5, pr = (2 + R(i, 73) * 5);
    const [px, pyy] = P2S(v, pa, py);
    ctx.globalAlpha = 0.16; ctx.drawImage(softDot(R(i, 74) < 0.5 ? THEME.patch[0] : THEME.patch[1], 64), px - pr * v.s, pyy - pr * v.s * 0.18, pr * v.s * 2, pr * v.s * 0.36);
  }
  ctx.globalAlpha = 1;
  if (v.s > 30) {
    const cell = 0.32, ac0 = Math.floor(a0 / cell), ac1 = Math.ceil(a1 / cell);
    const yTopA = v.ay - H / 2 / v.s, yBotA = v.ay + H / 2 / v.s;
    const rc0 = Math.floor(Math.max(0.9, yTopA) / cell * 3), rc1 = Math.ceil(yBotA / cell * 3);
    ctx.lineCap = 'round';
    for (let r = rc0; r <= rc1; r++) {
      const ay = r * cell / 3; const depth = clamp((ay - 0.9) / 5);
      for (let c = ac0; c <= ac1; c++) {
        if (R(c * 131 + r, 5) > 0.55) continue;
        const ax = (c + R(c, r)) * cell;
        if (ay < fieldTop(ax) + 0.05) continue;
        const [x, y] = P2S(v, ax, ay + R(r, c) * cell / 3);
        const hh = (0.04 + 0.12 * R(c, r + 3)) * v.s * (0.6 + depth);
        const tone = R(c, r + 7);
        ctx.strokeStyle = tone < 0.45 ? THEME.tuft[0] : tone < 0.8 ? THEME.tuft[1] : THEME.tuft[2];
        ctx.lineWidth = Math.max(1, v.s * (0.008 + 0.01 * R(c, r + 9)));
        const nb = 2 + Math.floor(R(c, r + 11) * 3), jx = (R(c, r + 13) - 0.5) * cell * v.s;
        ctx.beginPath();
        for (let b = 0; b < nb; b++) { const an = (R(c * 7 + b, r + 17) - 0.5) * 1.1, L = hh * (0.55 + 0.6 * R(c + b, r + 19)); ctx.moveTo(x + jx, y); ctx.quadraticCurveTo(x + jx + Math.sin(an) * L * 0.3, y - L * 0.6, x + jx + Math.sin(an) * L, y - L * Math.cos(an)); }
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
function rock(ctx, v, ax, ay, size, seed) {
  const [cx, cy] = P2S(v, ax, ay); const s = size * v.s;
  const pts = []; const n = 9;
  for (let i = 0; i < n; i++) { const a = Math.PI + (i / (n - 1)) * Math.PI; const r = s * (0.75 + 0.35 * R(i, seed)); pts.push([cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 0.75]); }
  ctx.beginPath(); ctx.moveTo(cx - s * 1.3, cy); smoothPath(ctx, pts, false, 0.6); ctx.lineTo(cx + s * 1.3, cy); ctx.closePath();
  const g = ctx.createLinearGradient(cx - s, cy - s, cx + s, cy);
  g.addColorStop(0, THEME.rock[0]); g.addColorStop(0.45, THEME.rock[1]); g.addColorStop(1, THEME.rock[2]);
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(30,20,15,0.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.04, s * 1.35, s * 0.1, 0, 0, TAU); ctx.fill();
}
function hayBale(ctx, v, ax, ay, size) {
  const [cx, cy] = P2S(v, ax, ay); const r = size * v.s;
  ctx.fillStyle = 'rgba(40,25,10,0.35)'; ctx.beginPath(); ctx.ellipse(cx + r * 0.3, cy, r * 1.2, r * 0.18, 0, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy);
  g.addColorStop(0, THEME.hay[0]); g.addColorStop(0.6, THEME.hay[1]); g.addColorStop(1, THEME.hay[2]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.8, r * 0.85, r * 0.8, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,25,0.5)'; ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath(); ctx.ellipse(cx - r * 0.15, cy - r * 0.8, r * 0.45, r * 0.55, 0, 0, TAU); ctx.stroke();
}
function lonelyTree(ctx, v, ax, ay, h) {
  const [x, y] = P2S(v, ax, ay); const s = h * v.s;
  ctx.strokeStyle = THEME.tree[0]; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.02, y - s * 0.55); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (R(i, 31) - 0.5) * 2.2, rr = s * (0.18 + 0.12 * R(i, 32));
    const bx = x + Math.cos(a) * s * 0.28, by = y - s * 0.62 + Math.sin(a) * s * 0.22;
    ctx.fillStyle = i % 2 ? THEME.tree[1] : THEME.tree[2]; circle(ctx, bx, by, rr); ctx.fill();
  }
}
function house(ctx, v, ax, ay, w) {
  const [x, y] = P2S(v, ax, ay), s = w * v.s;
  ctx.fillStyle = '#4b3a3c'; ctx.fillRect(x - s / 2, y - s * 0.42, s, s * 0.42);
  ctx.fillStyle = '#6d2f2a'; poly(ctx, [[x - s * 0.58, y - s * 0.4], [x - s * 0.1, y - s * 0.78], [x + s * 0.4, y - s * 0.78], [x + s * 0.58, y - s * 0.4]]); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,120,0.75)'; ctx.fillRect(x - s * 0.3, y - s * 0.3, s * 0.08, s * 0.1); ctx.fillRect(x + s * 0.12, y - s * 0.3, s * 0.08, s * 0.1);
  ctx.fillStyle = '#3a2c2e'; ctx.fillRect(x + s * 0.22, y - s * 0.95, s * 0.07, s * 0.2);
}
function fence(ctx, v, a0, y0, a1, y1, n) {
  ctx.strokeStyle = '#3b2d26'; ctx.lineCap = 'round';
  const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push(P2S(v, lerp(a0, a1, u), lerp(y0, y1, u))); }
  const ph = 0.38 * v.s;
  ctx.lineWidth = Math.max(1, v.s * 0.05);
  ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1] - ph * 0.55) : ctx.moveTo(p[0], p[1] - ph * 0.55); }); ctx.stroke();
  ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1] - ph * 0.9) : ctx.moveTo(p[0], p[1] - ph * 0.9); }); ctx.stroke();
  ctx.lineWidth = Math.max(1.2, v.s * 0.07);
  ctx.beginPath(); pts.forEach(p => { ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - ph); }); ctx.stroke();
}
function fgTop(a) { return 12.6 + 1.3 * fbm1(a * 0.07 + 30, 77, 4); }
function drawForeground(ctx, v, t) {
  const yTopA = v.ay + H / 2 / v.s; if (yTopA < 11) return;
  const a0 = v.ax - W / 2 / v.s - 2, a1 = v.ax + W / 2 / v.s + 2, step = Math.max(0.05, 3 / v.s);
  ctx.beginPath(); ctx.moveTo(-20, H + 40);
  for (let a = a0; a <= a1 + step; a += step) { const [x, y] = P2S(v, a, fgTop(a)); ctx.lineTo(x, y); }
  ctx.lineTo(W + 20, H + 40); ctx.closePath();
  const [, gy] = P2S(v, 0, 11.5);
  const g = ctx.createLinearGradient(0, gy, 0, gy + 8 * v.s); g.addColorStop(0, THEME.fg[0]); g.addColorStop(1, THEME.fg[1]);
  ctx.fillStyle = g; ctx.fill();
  const cell = 0.11, i0 = Math.floor(a0 / cell), i1 = Math.ceil(a1 / cell);
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? THEME.blade : THEME.fgRim; ctx.lineCap = 'round';
    for (let i = i0; i <= i1; i++) {
      const a = (i + R(i, 61)) * cell, base = fgTop(a) + 0.15 + R(i, 62) * 0.5;
      const [x, y] = P2S(v, a, base); const hh = (0.5 + 1.1 * R(i, 63)) * v.s;
      const sw = Math.sin(t * 2.2 + i * 0.7) * 0.12 + (R(i, 64) - 0.5) * 0.5;
      ctx.lineWidth = Math.max(1, v.s * (0.035 + 0.03 * R(i, 65)));
      ctx.beginPath(); ctx.moveTo(x + (pass ? 0 : -1), y); ctx.quadraticCurveTo(x + sw * hh * 0.3, y - hh * 0.6, x + sw * hh + (pass ? 0 : -1), y - hh - (pass ? 0 : 1)); ctx.stroke();
    }
  }
}
function rainFX(ctx, t, a = 1) {
  ctx.save(); ctx.lineCap = 'round';
  for (let layer = 0; layer < 2; layer++) {
    ctx.strokeStyle = layer ? 'rgba(220,230,240,0.32)' : 'rgba(190,205,220,0.18)'; ctx.lineWidth = layer ? 2 : 1.2;
    ctx.beginPath();
    const n = layer ? 120 : 220;
    for (let i = 0; i < n; i++) {
      const sp = (layer ? 2600 : 1700) + 700 * R(i, 1501 + layer), len = (layer ? 46 : 24) + 26 * R(i, 1502 + layer);
      const x0 = R(i, 1503 + layer) * (W + 300) - 60, ph = fract(R(i, 1504 + layer) + t * sp / (H + 200));
      const y = ph * (H + 200) - 100, x = x0 - ph * 140;
      ctx.moveTo(x, y); ctx.lineTo(x - len * 0.16, y + len);
    }
    ctx.globalAlpha = a; ctx.stroke();
  }
  ctx.restore();
}
// the full vista, painted with the current THEME
function drawVista(ctx, v, opt = {}) {
  const t = opt.t || 0, T = THEME;
  drawSky(ctx, v, opt);
  drawRidgeLayer(ctx, v, { seed: 11, base: -2.3, amp: 3.0, freq: 0.04, col: T.far[0], colB: T.far[1], depth: 3 });
  drawRidgeLayer(ctx, v, { seed: 23, base: -0.6, amp: 0.8, freq: 0.08, col: T.mid[0], colB: T.mid[1], depth: 2, trees: { sp: 0.36, dens: 0.85, h: 0.6, sink: 0.12, col: T.mid[2] } });
  drawRidgeLayer(ctx, v, { seed: 37, base: 0.35, amp: 0.55, freq: 0.06, col: T.near[0], colB: T.near[1], depth: 2, trees: { sp: 0.26, dens: 0.75, h: 0.85, sink: 0.15, col: T.near[2] } });
  drawField(ctx, v, opt);
  const [, hy] = P2S(v, 0, 0.9);
  const hg = ctx.createLinearGradient(0, hy - 3 * v.s, 0, hy + 2 * v.s);
  hg.addColorStop(0, `rgba(${T.haze},0)`); hg.addColorStop(0.6, `rgba(${T.haze},0.28)`); hg.addColorStop(1, `rgba(${T.haze},0)`);
  ctx.fillStyle = hg; ctx.fillRect(-20, hy - 3 * v.s, W + 40, 5 * v.s);
  house(ctx, v, 24, 1.55, 2.2); house(ctx, v, 27.5, 1.6, 1.6);
  fence(ctx, v, 6, 2.1, 30, 2.7, 34);
  lonelyTree(ctx, v, -9.5, 2.4, 3.4);
  hayBale(ctx, v, -22, 3.0, 0.4); hayBale(ctx, v, -25, 3.3, 0.45);
  hayBale(ctx, v, -4.6, 3.6, 0.42); hayBale(ctx, v, -3.4, 3.8, 0.4);
  hayBale(ctx, v, 12.5, 4.6, 0.5);
  if (opt.behind) opt.behind(ctx, v);
  rock(ctx, v, 36, 3.1, 0.6, 7); rock(ctx, v, 40, 3.4, 1.15, 5);
  if (opt.props) opt.props(ctx, v);
  rock(ctx, v, -1.6, 7.0, 0.9, 3);
  if (opt.near) opt.near(ctx, v);
  if (opt.fg !== false) drawForeground(ctx, v, t);
  if (T.rain) { ctx.fillStyle = 'rgba(40,50,60,0.12)'; ctx.fillRect(0, 0, W, H); rainFX(ctx, t, 1); }
}
