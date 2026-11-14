'use strict';
// ═════════════════════════ BEST-OF MONTAGE: intro + 6 clips from different games ═════════════════════════
const CLIPSPEC = [
  { k: 'intro', dur: 2.4 },
  { k: 'call', scene: 'map', theme: 'sunset', title: 'CALL DE ZONE', sub: 'Prédiction parfaite', alive0: 47, kills0: 2, src: [[0, 2.8], [3.6, 6.12]] },
  { k: 'wipe', scene: 'kills', theme: 'sunset', title: 'SQUAD WIPE', sub: '4 kills · Kar98k + M416', alive0: 39, kills0: 3, src: [[0, 6.42], [0.6, 7.2], [1.2, 8.05], [2.4, 8.86], [2.55, 8.98], [4.8, 11.45]] },
  { k: 'crate', scene: 'crate', theme: 'day', title: 'AIRDROP', sub: 'AWM + full stuff Lv.3', alive0: 27, kills0: 5, src: [[0, 11.85], [1.5, 13.36], [3.0, 14.95]] },
  { k: 'revive', scene: 'revive', theme: 'rain', title: 'TRIPLE REZ', sub: 'jiomi · mochard · dotvav', alive0: 18, kills0: 6, src: [[0, 15.6], [3.6, 19.78]], ctx: { noAttacker: true } },
  { k: 'pan', scene: 'pan', theme: 'morning', title: 'LA POÊLE', sub: 'Kill à la poêle', alive0: 11, kills0: 8, src: [[0, 19.5], [1.05, 19.935], [1.45, 20.0], [1.8, 20.7]], ctx: { noSmoke: true, noReviveUI: true } },
  { k: 'final', scene: 'final', theme: 'sunset', title: 'TOP 1', sub: "Le dernier, à l'AWM", alive0: 5, kills0: 13, src: [[0, 20.6], [1.8, 21.92], [2.4, 22.9], [7.2, 27.7]] },
];
let _acc = 0, _no = 0;
const CLIPS = CLIPSPEC.map(c => { const o = { ...c, a: _acc }; o.b = _acc + (c.dur ?? c.src[c.src.length - 1][0]); _acc = o.b; if (c.k !== 'intro') { o.n = ++_no; o.s0 = c.src[0][1]; } return o; });
const MDUR = _acc, NCLIPS = _no, FINALCLIP = CLIPS[CLIPS.length - 1];
function montageOf(c, ts) { const S = c.src; for (let i = 0; i < S.length - 1; i++) if (ts <= S[i + 1][1]) return c.a + lerp(S[i][0], S[i + 1][0], (ts - S[i][1]) / (S[i + 1][1] - S[i][1])); const n = S.length; return c.a + S[n - 1][0] + (ts - S[n - 1][1]); }
const M_LOOP_A = montageOf(FINALCLIP, LOOP_A);
window.MONTAGE_INFO = { MDUR, M_LOOP_A, LOOP_P, clips: CLIPS.map(c => [c.k, +c.a.toFixed(3), +c.b.toFixed(3)]) };
const CUTS = CLIPS.filter(c => c.k !== 'intro').map(c => c.a);

function clipAt(T) { for (const c of CLIPS) if (T < c.b) return c; return FINALCLIP; }
function srcTime(c, T) {
  const L = T - c.a, S = c.src;
  if (L <= S[0][0]) return S[0][1];
  for (let i = 0; i < S.length - 1; i++) if (L <= S[i + 1][0]) return lerp(S[i][1], S[i + 1][1], (L - S[i][0]) / (S[i + 1][0] - S[i][0]));
  const n = S.length; return S[n - 1][1] + (L - S[n - 1][0]) * ((S[n - 1][1] - S[n - 2][1]) / (S[n - 1][0] - S[n - 2][0]));
}
function srcSpeed(c, T) { const e = 0.004; return (srcTime(c, T + e) - srcTime(c, T - e)) / (2 * e); }
function freezeFrame(ctx, t) {
  const b = buf('frz'); sFinal(b.x, t);
  const k = ep(t, FIN.freeze, FIN.freeze + 0.18);
  const z = 1 + 0.05 * ep(t, FIN.freeze, 22.9, Ease.inQuad);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(b.c, 0, 0, W, H);
  ctx.filter = 'grayscale(1) contrast(1.6) brightness(1.08)'; ctx.globalAlpha = k; ctx.drawImage(b.c, 0, 0, W, H); ctx.filter = 'none';
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,196,90,${0.85 * k})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const a = R(i, 1201) * TAU, r0 = 300 + R(i, 1202) * 300; ctx.strokeStyle = `rgba(255,236,190,${0.25 * k})`; ctx.lineWidth = 1 + 2 * R(i, 1203); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * 1100, H / 2 + Math.sin(a) * 1100); ctx.stroke(); }
  ctx.restore();
}
function renderClipScene(ctx, c, t) {
  setTheme(c.theme); CLIPCTX = c.ctx || {};
  switch (c.scene) {
    case 'map': sMap(ctx, t); break;
    case 'kills': sKills(ctx, t); break;
    case 'crate': sCrate(ctx, t); break;
    case 'revive': case 'pan': sRevive(ctx, t); break;
    case 'final': if (t < FIN.freeze) sFinal(ctx, t); else if (t < 22.9) freezeFrame(ctx, t); else sEnd(ctx, t); break;
  }
  CLIPCTX = {};
}
function renderClipMB(ctx, c, T) {
  const t = srcTime(c, T);
  if (!MB.some(([a, b]) => t >= a && t <= b)) { renderClipScene(ctx, c, t); return; }
  const N = 6, shutter = (1 / 55) * srcSpeed(c, T);
  const acc = buf('mbAcc');
  for (let k = 0; k < N; k++) { const tt = t - shutter / 2 + shutter * k / (N - 1); const sb = buf('mbSub'); renderClipScene(sb.x, c, tt); acc.x.globalAlpha = 1 / (k + 1); acc.x.drawImage(sb.c, 0, 0, W, H); }
  ctx.drawImage(acc.c, 0, 0, W, H);
}
// ── intro: rapid teaser frames from the clips behind the title ──
const INTRO_BG = [['wipe', 7.95], ['crate', 12.6], ['revive', 16.02], ['pan', 19.8], ['final', 21.75], ['call', 3.45]];
function drawIntro(ctx, T) {
  const seg = 0.15, i = Math.floor(T / seg), local = T - i * seg;
  const [k, st] = INTRO_BG[i % INTRO_BG.length];
  const c = CLIPS.find(x => x.k === k);
  const b = buf('ibg'); renderClipScene(b.x, c, st + local * 0.6);
  const z = 1.12 - 0.06 * (local / seg);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.filter = 'saturate(0.6) brightness(0.85)'; ctx.drawImage(b.c, 0, 0, W, H); ctx.filter = 'none'; ctx.restore();
  ctx.fillStyle = 'rgba(8,8,12,0.58)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = `rgba(255,255,255,${0.16 * Math.exp(-local * 30)})`; ctx.fillRect(0, 0, W, H);
  setTheme('sunset');
  drawTitle(ctx, T / 1.1, { label: 'PUBG  ·  SQUAD  ·  FPP', pill: 'BEST OF', pillSize: 30, pillLs: 8 });
}
// ── clip packaging ──
function clipFade(c, t) { return c.k === 'final' ? 1 - ep(t, 22.12, 22.32) : 1; }
function clipTag(ctx, c, T, t) {
  const A = clipFade(c, t); if (A <= 0) return;
  const k = ep(T - c.a, 0.03, 0.42, Ease.outExpo);
  const x = lerp(-380, 34, k), y = 24;
  const tw1 = tw(ctx, c.title, 31, 'osw', 700), tw2 = tw(ctx, c.sub, 18, 'bar', 600, 0.5);
  const wTot = 70 + 14 + Math.max(tw1, tw2) + 16;
  ctx.save(); ctx.globalAlpha = A;
  rr(ctx, x, y, wTot, 70, 6); ctx.fillStyle = 'rgba(8,8,10,0.62)'; ctx.fill();
  rr(ctx, x, y, 70, 70, 6); ctx.fillStyle = C.p1; ctx.fill();
  text(ctx, 'CLIP', x + 35, y + 22, { size: 14, fam: 'bar', w: 800, ls: 2.5, align: 'center', color: '#111' });
  text(ctx, String(c.n).padStart(2, '0'), x + 35, y + 63, { size: 46, fam: 'teko', w: 600, align: 'center', color: '#111' });
  text(ctx, c.title, x + 84, y + 36, { size: 31, fam: 'osw', w: 700, color: '#fff' });
  text(ctx, c.sub, x + 85, y + 59, { size: 18, fam: 'bar', w: 600, ls: 0.5, color: 'rgba(255,255,255,0.82)' });
  ctx.restore();
}
function progressBar(ctx, c, T, t) {
  const A = clipFade(c, t); if (A <= 0) return;
  const x0 = 34, x1 = W - 34, gap = 6, n = NCLIPS, w = (x1 - x0 - gap * (n - 1)) / n, y = 8, h = 5;
  ctx.save(); ctx.globalAlpha = A;
  for (let i = 0; i < n; i++) {
    const sx = x0 + i * (w + gap);
    let f = 0; if (c.n > i + 1) f = 1; else if (c.n === i + 1) f = c.k === 'final' ? clamp((t - c.s0) / (22.2 - c.s0)) : clamp((T - c.a) / (c.b - c.a));
    rr(ctx, sx, y, w, h, 2.5); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
    if (f > 0) { rr(ctx, sx, y, Math.max(h, w * f), h, 2.5); ctx.fillStyle = c.n === i + 1 ? C.p1 : 'rgba(255,255,255,0.9)'; ctx.fill(); }
  }
  ctx.restore();
}
function numberSlam(ctx, c, T) {
  const age = T - c.a; if (age < 0 || age > 0.45) return;
  const k = age / 0.45, s = lerp(1.0, 2.3, Ease.outCubic(k));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.globalAlpha = (1 - k) * 0.6;
  text(ctx, String(c.n).padStart(2, '0'), 0, 80, { size: 230, fam: 'teko', w: 600, align: 'center', fill: false, stroke: '#ffffff', lw: 5 });
  ctx.restore();
}
function cutAge(T) { let a = 1e9; for (const ct of CUTS) if (T >= ct) a = Math.min(a, T - ct); return a; }
function glitch(ctx, age) {
  const k = 1 - age / 0.12; if (k <= 0) return;
  const src = buf('gl'); src.x.drawImage(CV, 0, 0, W, H);
  const f = Math.floor(age * 30);
  for (let i = 0; i < 12; i++) { const y = R(i, f + 1300) * H, h = 10 + 70 * R(i, f + 1301); const dx = (R(i, f + 1302) - 0.5) * 160 * k; ctx.drawImage(src.c, 0, y * PXS, W * PXS, h * PXS, dx, y, W, h); }
}
// ── HUD for a clip (each clip is its own game: counters, kill feed and kill count start fresh) ──
function killMsgClip(t, c) {
  let m = null, idx = 0;
  MYK.forEach(k => { if (k.t < c.s0) return; idx++; const mt = k.msgT ?? k.t; if (k.show && t >= mt && t < mt + 1.6) m = { t: mt, end: mt + 1.6, n: c.kills0 + idx, victim: k.victim, weapon: k.wname, hs: k.hs }; });
  return m;
}
function drawHUDClip(ctx, t, c) {
  const A = ep(t, 2.45, 2.85) * (1 - ep(t, 22.45, 22.75));
  if (A <= 0) return;
  const a = A * ((t > 8.07 && t < 8.98) ? 0 : 1);
  const heading = headingAt(t) + (t > 6.3 ? fbm1(t * 0.8, 51) * 1.5 : 0);
  const pinB = c.k === 'call' ? 62 : c.k === 'wipe' ? 255 : c.k === 'crate' ? 28 : c.k === 'final' ? 310 : null;
  const marks = [{ a: heading - 128, col: C.p2 }, { a: heading + 141, col: C.p3 }, { a: heading - 160, col: C.p4 }];
  if (pinB !== null && (c.k !== 'call' || t > 3.55)) marks.push({ a: pinB, col: C.p1, pin: true });
  hudCompass(ctx, heading, a, marks);
  const alive = c.alive0 - (aliveAt(c.s0) - aliveAt(t)), kills = c.kills0 + (killsAt(t) - killsAt(c.s0));
  hudCounters(ctx, alive, kills, a, killPopAt(t));
  hudKillfeed(ctx, KF.filter(e => e.t >= c.s0 - 0.001), t, a);
  hudSquad(ctx, squadAt(t), t, a);
  hudVitals(ctx, vitalsAt(t), t, a);
  const z = zoneAt(t), pp = playerPosAt(t);
  const mates = [[0.12, 0.07], [-0.1, 0.1], [0.06, -0.13]].map((o, i) => ({ x: pp[0] + o[0], y: pp[1] + o[1], col: SQUAD[i + 1].col }));
  if (c.k !== 'call') hudMinimap(ctx, { px: pp[0], py: pp[1], s: t < 15.6 ? 180 : t < 20.6 ? 360 : 900, blue: z.blue, white: z.white, mates, heading: headingAt(t), timer: z.timer, zoneProg: 0.3 + 0.6 * fract(t / 9) }, t, a);
  hudKillMsg(ctx, killMsgClip(t, c), t, a);
  hudCaption(ctx, capAt(t), t, A, c.k === 'call' ? W / 2 : 446);
}
// ── frame compositor (montage time T) ──
function drawFrame(ctx, T) {
  const c = clipAt(T);
  const scn = buf('scn');
  let t = 0;
  if (c.k === 'intro') drawIntro(scn.x, T);
  else { t = srcTime(c, T); CAP_FROM = c.s0 - 0.12; renderClipMB(scn.x, c, T); setTheme(c.theme); }
  let [sx, sy, sr] = c.k === 'intro' ? [0, 0, 0] : shakeAt(t);
  const ca0 = cutAge(T);
  if (ca0 < 0.5) { const e = 8 * Math.exp(-ca0 * 12); sx += vnoise(ca0 * 40, 7) * e; sy += vnoise(ca0 * 40, 9) * e; }
  let zp = 1; const next = CUTS.find(ct => ct > T); if (next !== undefined && next - T < 0.1) zp = 1 + (1 - (next - T) / 0.1) * 0.09;
  const m = Math.max(Math.abs(sx), Math.abs(sy));
  ctx.save(); ctx.translate(W / 2 + sx, H / 2 + sy); ctx.rotate(sr); const z = zp * (1 + (m * 2.2 + Math.abs(sr) * 900) / W); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(scn.c, 0, 0, W, H); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.42, W / 2, H / 2, W * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  let ca = c.k === 'intro' ? 0 : caAt(t); if (ca0 < 0.4) ca = Math.max(ca, 9 * Math.exp(-ca0 * 10));
  if (ca > 0.6) chromatic(ctx, ca);
  if (c.k !== 'intro') { drawHUDClip(ctx, t, c); flashAt(ctx, t); }
  if (ca0 < 0.4) { ctx.fillStyle = `rgba(255,255,255,${0.72 * Math.exp(-ca0 * 11)})`; ctx.fillRect(0, 0, W, H); }
  if (ca0 < 0.12) glitch(ctx, ca0);
  if (c.k !== 'intro') { progressBar(ctx, c, T, t); clipTag(ctx, c, T, t); numberSlam(ctx, c, T); }
  if (T < 0.3) { ctx.fillStyle = `rgba(0,0,0,${0.6 * (1 - T / 0.3)})`; ctx.fillRect(0, 0, W, H); }
}
