'use strict';
// ═════════════════════════ HUD (PUBG-style) ═════════════════════════
const HUD_SHADOW = 'rgba(0,0,0,0.85)';
const wrap360 = a => ((a % 360) + 360) % 360;
function angDiff(a, b) { let d = wrap360(b - a); if (d > 180) d -= 360; return d; }

// ── compass (top centre) ──
function hudCompass(ctx, heading, A = 1, marks = []) {
  if (A <= 0) return;
  const cx = W / 2, y = 26, w = 420, pxd = w / 110; // ±55°
  ctx.save(); ctx.globalAlpha *= A;
  const bg = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.2, 'rgba(0,0,0,0.32)'); bg.addColorStop(0.8, 'rgba(0,0,0,0.32)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bg; ctx.fillRect(cx - w / 2, y, w, 40);
  const h0 = Math.floor((heading - 60) / 5) * 5;
  for (let a = h0; a <= heading + 60; a += 5) {
    const d = a - heading; if (Math.abs(d) > 55) continue;
    const x = cx + d * pxd, fade = 1 - Math.pow(Math.abs(d) / 55, 3);
    const aw = wrap360(a);
    ctx.globalAlpha = A * fade;
    ctx.fillStyle = '#fff';
    if (aw % 45 === 0) {
      const L = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][aw / 45];
      text(ctx, L, x, y + 27, { size: 26, fam: 'raj', w: 700, align: 'center', color: aw === 0 ? '#ffd23f' : '#fff', shadow: HUD_SHADOW, sb: 4, sy: 1 });
    } else if (aw % 15 === 0) {
      text(ctx, String(aw), x, y + 25, { size: 19, fam: 'raj', w: 600, align: 'center', color: '#fff', shadow: HUD_SHADOW, sb: 4, sy: 1 });
    } else { ctx.fillRect(x - 1, y + 30, 2, 7); }
    if (aw % 15 === 0) ctx.fillRect(x - 1, y + 32, 2, 6);
  }
  ctx.globalAlpha = A;
  // markers on the strip
  for (const m of marks) {
    const d = angDiff(heading, m.a); if (Math.abs(d) > 55) continue;
    const x = cx + d * pxd;
    if (m.pin) { icoPin(ctx, x, y + 2, 20, m.col); }
    else { ctx.fillStyle = m.col; poly(ctx, [[x - 6, y - 4], [x + 6, y - 4], [x, y + 4]]); ctx.fill(); }
  }
  // centre pointer + readout
  ctx.fillStyle = '#fff'; poly(ctx, [[cx - 7, y + 46], [cx + 7, y + 46], [cx, y + 39]]); ctx.fill();
  rr(ctx, cx - 30, y + 48, 60, 26, 3); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
  text(ctx, String(Math.round(wrap360(heading))).padStart(3, '0'), cx, y + 69, { size: 23, fam: 'raj', w: 700, align: 'center', color: '#fff' });
  ctx.restore();
}

// ── alive / killed counters (top right) ──
function hudCounters(ctx, alive, kills, A = 1, killPop = 0) {
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha *= A;
  const y = 26, h = 40;
  const group = (xr, num, label, pop) => {
    font(ctx, 20, 'bar', 700); ctx.letterSpacing = '2px';
    const lw = ctx.measureText(label).width + 20;
    const nw = Math.max(54, tw(ctx, String(num), 30, 'raj', 700) + 24);
    const xl = xr - lw, xn = xl - nw;
    ctx.fillStyle = 'rgba(70,70,70,0.55)'; ctx.fillRect(xl, y, lw, h);
    text(ctx, label, xl + lw / 2, y + 28, { size: 20, fam: 'bar', w: 700, ls: 2, align: 'center', color: '#e8e8e8' });
    ctx.fillStyle = pop > 0 ? `rgba(${lerp(15, 210, pop) | 0},${lerp(15, 45, pop) | 0},${lerp(15, 35, pop) | 0},0.75)` : 'rgba(10,10,10,0.6)';
    ctx.fillRect(xn, y, nw, h);
    ctx.save(); ctx.translate(xn + nw / 2, y + h / 2); const sc = 1 + pop * 0.35; ctx.scale(sc, sc);
    text(ctx, String(num), 0, 11, { size: 30, fam: 'raj', w: 700, align: 'center', color: '#fff' });
    ctx.restore();
    return xn;
  };
  const x2 = group(W - 34, kills, 'KILLED', killPop);
  group(x2 - 10, alive, 'ALIVE', 0);
  ctx.restore();
}

// ── kill feed (right) ──  entries: {t, killer, kcol, victim, vcol, weapon, hs, knock}
function hudKillfeed(ctx, entries, t, A = 1) {
  if (A <= 0) return;
  const live = entries.filter(e => t >= e.t && t < e.t + 5.5).slice(-5);
  ctx.save(); ctx.globalAlpha *= A;
  let row = 0;
  for (let i = live.length - 1; i >= 0; i--) {
    const e = live[i], age = t - e.t;
    const a = Math.min(ep(age, 0, 0.18, Ease.outCubic), 1 - ep(age, 4.9, 5.5, Ease.inQuad));
    const slide = (1 - ep(age, 0, 0.28, Ease.outQuart)) * 60;
    const y = 92 + row * 36; row++;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(slide, 0);
    const fs = 21;
    const kw = tw(ctx, e.killer, fs, 'bar', 700), vw = tw(ctx, e.victim, fs, 'bar', 700);
    const gw = e.weapon === 'pan' ? 34 : 58, hsw = e.hs ? 26 : 0, kn = e.knock ? 30 : 0;
    const total = kw + 12 + gw + 10 + hsw + kn + vw + 24;
    const x0 = W - 34 - total;
    ctx.fillStyle = e.mine ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.38)'; ctx.fillRect(x0, y, total, 30);
    if (e.mine) { ctx.fillStyle = rgba(C.p1, 0.9); ctx.fillRect(x0, y, 3, 30); }
    let x = x0 + 12;
    text(ctx, e.killer, x, y + 22, { size: fs, fam: 'bar', w: 700, color: e.kcol || '#fff' }); x += kw + 12;
    if (e.weapon === 'pan') gun(ctx, 'pan', x, y + 15, 34, 0, '#fff'); else gun(ctx, e.weapon, x, y + 16, gw, 0, '#fff');
    x += gw + 10;
    if (e.hs) { icoSkullHS(ctx, x + 9, y + 15, 17, '#ff5a4a'); x += hsw; }
    if (e.knock) { text(ctx, '⤓', x + 4, y + 23, { size: 22, fam: 'raj', w: 700, color: '#ff6b5a' }); x += kn; }
    text(ctx, e.victim, x, y + 22, { size: fs, fam: 'bar', w: 700, color: e.vcol || '#d9d9d9' });
    ctx.restore();
  }
  ctx.restore();
}

// ── squad list (bottom left) ──  st[i] = {hp, knocked(0..1 bleed), talking, reviveFlash}
function hudSquad(ctx, st, t, A = 1) {
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha *= A;
  const x = 34, y0 = 902, rh = 38;
  SQUAD.forEach((m, i) => {
    const s = st[i], y = y0 + i * rh;
    badge(ctx, x + 14, y + 14, 26, m.n, m.col);
    const down = s.knocked > 0;
    text(ctx, m.name, x + 36, y + 14, { size: 21, fam: 'bar', w: 700, color: down ? '#ff8a7a' : '#fff', shadow: HUD_SHADOW, sb: 4, sy: 1 });
    const nw = tw(ctx, m.name, 21, 'bar', 700);
    if (s.talking > 0) icoMic(ctx, x + 36 + nw + 16, y + 7, 18, m.col, s.talking);
    // bar
    const bx = x + 36, by = y + 20, bw = 150, bh = 7;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, bh);
    if (down) {
      const bleed = clamp(s.knocked);
      ctx.fillStyle = '#e8412e'; ctx.fillRect(bx, by, bw * bleed, bh);
      const pulse = 0.5 + 0.5 * Math.sin(t * 14);
      ctx.fillStyle = `rgba(255,120,100,${0.35 * pulse})`; ctx.fillRect(bx, by, bw * bleed, bh);
      // DBNO glyph
      ctx.save(); ctx.translate(bx + bw + 16, by + 3); ctx.fillStyle = '#ff5a48';
      ctx.fillRect(-8, -2, 16, 4); ctx.fillRect(-2, -8, 4, 16); ctx.restore();
    } else {
      ctx.fillStyle = s.hp < 0.3 ? '#ff5a48' : '#f4f4f4'; ctx.fillRect(bx, by, bw * clamp(s.hp), bh);
      if (s.boost > 0) { ctx.fillStyle = 'rgba(242,169,0,0.9)'; ctx.fillRect(bx, by + bh + 2, bw * clamp(s.boost), 2); }
    }
    if (s.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${s.flash})`; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4); }
  });
  ctx.restore();
}

// ── vitals (bottom centre): health, boost, gear, weapon/ammo ──
function hudVitals(ctx, v, t, A = 1) {
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha *= A;
  const x0 = 384, w = 336, y = 1028, h = 14;
  // boost segments
  const segW = (w - 18) / 4;
  for (let i = 0; i < 4; i++) {
    const sx = x0 + i * (segW + 6); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(sx, y - 10, segW, 4);
    const f = clamp(v.boost * 4 - i); if (f > 0) { ctx.fillStyle = '#f2a900'; ctx.fillRect(sx, y - 10, segW * f, 4); }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x0 - 2, y - 2, w + 4, h + 4);
  if (v.dmg > v.hp) { ctx.fillStyle = 'rgba(255,90,70,0.85)'; ctx.fillRect(x0, y, w * clamp(v.dmg), h); }
  ctx.fillStyle = v.hp < 0.3 ? '#ff4d3d' : '#ffffff'; ctx.fillRect(x0, y, w * clamp(v.hp), h);
  if (v.heal > 0) { ctx.fillStyle = `rgba(120,255,140,${v.heal})`; ctx.fillRect(x0, y, w * clamp(v.hp), h); }
  // gear icons (helmet, vest, backpack) with level
  const gx = x0 - 104;
  const gear = [[icoHelmet, v.helm], [icoVest, v.vest], [icoBackpack, v.pack]];
  gear.forEach(([f, lv], i) => {
    const cx = gx + i * 38;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(cx - 16, y - 18, 32, 34);
    f(ctx, cx, y - 2, 22, lv >= 3 ? '#ffd24a' : '#fff', lv);
    text(ctx, String(lv), cx + 12, y + 14, { size: 14, fam: 'raj', w: 700, align: 'center', color: lv >= 3 ? '#ffd24a' : '#fff' });
    if (v.gearFlash > 0) { ctx.fillStyle = `rgba(255,210,74,${v.gearFlash * 0.6})`; ctx.fillRect(cx - 16, y - 18, 32, 34); }
  });
  // weapon + ammo
  const wy = y - 22;
  text(ctx, v.mode || 'SINGLE', x0 + w, wy - 4, { size: 15, fam: 'bar', w: 700, ls: 1.5, align: 'right', color: 'rgba(255,255,255,0.75)', shadow: HUD_SHADOW, sb: 3, sy: 1 });
  const ammoS = String(v.mag), resS = String(v.res);
  const aw = tw(ctx, ammoS, 34, 'raj', 700);
  text(ctx, ammoS, W / 2 - 6, wy, { size: 34, fam: 'raj', w: 700, align: 'right', color: v.mag === 0 ? '#ff5a48' : '#fff', shadow: HUD_SHADOW, sb: 4, sy: 1 });
  text(ctx, resS, W / 2 + 8, wy, { size: 22, fam: 'raj', w: 600, color: 'rgba(255,255,255,0.8)', shadow: HUD_SHADOW, sb: 4, sy: 1 });
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(W / 2, wy - 22, 2, 22);
  text(ctx, v.weapon, x0, wy - 4, { size: 18, fam: 'bar', w: 700, ls: 1, color: v.wFlash > 0 ? mixHex('#ffffff', '#ffd24a', v.wFlash) : 'rgba(255,255,255,0.85)', shadow: HUD_SHADOW, sb: 3, sy: 1 });
  ctx.restore();
}

// ── minimap (bottom right) ──
function hudMinimap(ctx, mm, t, A = 1) {
  if (A <= 0) return;
  const S = 200, x0 = W - 34 - S, y0 = H - 34 - S;
  ctx.save(); ctx.globalAlpha *= A;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, S, S); ctx.clip();
  const sc = mm.s || 150; // px per km
  const cam = { x: mm.px, y: mm.py, s: sc };
  ctx.translate(x0 + S / 2 - W / 2, y0 + S / 2 - H / 2);
  ctx.drawImage(MAP, W / 2 - mm.px * sc, H / 2 - mm.py * sc, MAP_KM * sc, MAP_KM * sc);
  ctx.fillStyle = 'rgba(5,10,12,0.25)'; ctx.fillRect(W / 2 - S, H / 2 - S, S * 2, S * 2);
  drawZones(ctx, cam, mm.blue, mm.white ? { ...mm.white, lw: 2 } : null, {});
  // teammates
  (mm.mates || []).forEach(m => { const [sx, sy] = mapToScreen(cam, m.x, m.y); circle(ctx, sx, sy, 6); ctx.fillStyle = m.col; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#111'; ctx.stroke(); });
  if (mm.pin) { const [sx, sy] = mapToScreen(cam, mm.pin.x, mm.pin.y); icoPin(ctx, sx, sy, 22, C.p1); }
  // player arrow
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate((mm.heading || 0) * DEG);
  ctx.fillStyle = C.p1; poly(ctx, [[0, -11], [8, 9], [0, 4], [-8, 9]]); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, S, S);
  // zone timer bar above minimap
  const ty = y0 - 30;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x0, ty, S, 22);
  const zf = clamp(mm.zoneProg ?? 0.4);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x0 + 34, ty + 9, S - 82, 4);
  ctx.fillStyle = '#5a8dff'; ctx.fillRect(x0 + 34, ty + 9, (S - 82) * zf, 4);
  // running man glyph
  ctx.save(); ctx.translate(x0 + 18, ty + 11); ctx.fillStyle = '#fff'; circle(ctx, 1, -6, 2.6); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(-1, 3); ctx.lineTo(-5, 8); ctx.moveTo(-1, 3); ctx.lineTo(4, 7); ctx.moveTo(0, -2); ctx.lineTo(5, 1); ctx.moveTo(0, -2); ctx.lineTo(-5, 0); ctx.stroke(); ctx.restore();
  text(ctx, mm.timer || '1:24', x0 + S - 8, ty + 18, { size: 18, fam: 'raj', w: 700, align: 'right', color: '#fff' });
  ctx.restore();
}

// ── centre kill message ──  m: {t, n, victim, weapon, hs, knock}
function hudKillMsg(ctx, m, t, A = 1) {
  if (!m || A <= 0) return;
  const age = t - m.t, dur = (m.end ?? m.t + 1.6) - m.t; if (age < 0 || age > dur) return;
  const a = Math.min(ep(age, 0, 0.12), 1 - ep(age, dur - 0.3, dur, Ease.inQuad));
  const yy = 692 + (1 - ep(age, 0, 0.3, Ease.outQuart)) * 18;
  ctx.save(); ctx.globalAlpha *= a * A;
  const l1a = m.knock ? 'YOU KNOCKED OUT ' : 'YOU KILLED ', l1b = m.victim;
  const l2 = `WITH ${m.weapon}` + (m.hs ? '  ·  HEADSHOT' : '');
  const f1 = 34, f2 = 22;
  const w1 = tw(ctx, l1a, f1, 'bar', 700) + tw(ctx, l1b, f1, 'bar', 800), w2 = tw(ctx, l2, f2, 'bar', 700, 2);
  const tw0 = Math.max(w1, w2), numW = 92, total = numW + 22 + tw0;
  const x0 = W / 2 - total / 2;
  // backdrop streak
  const g = ctx.createLinearGradient(x0 - 80, 0, x0 + total + 80, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.2, 'rgba(0,0,0,0.5)'); g.addColorStop(0.8, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x0 - 80, yy - 48, total + 160, 84);
  // sweep highlight
  const sw = ep(age, 0.05, 0.55, Ease.inOutCubic);
  if (sw > 0 && sw < 1) { const sx = lerp(x0 - 60, x0 + total + 60, sw); const hg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0); hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(0.5, 'rgba(255,255,255,0.18)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = hg; ctx.fillRect(sx - 60, yy - 48, 120, 84); }
  // number
  const pop = 1 + 0.9 * Math.exp(-age * 9) * Math.cos(age * 22);
  ctx.save(); ctx.translate(x0 + numW / 2, yy - 4); ctx.scale(pop, pop);
  text(ctx, String(m.n), 0, 24, { size: 76, fam: 'teko', w: 600, align: 'center', color: m.knock ? '#ffffff' : '#ff3b2f', glow: m.knock ? null : 'rgba(255,40,20,0.6)', gb: 20 });
  ctx.restore();
  text(ctx, m.knock ? 'KNOCK' : (m.n > 1 ? 'KILLS' : 'KILL'), x0 + numW / 2, yy + 34, { size: 15, fam: 'bar', w: 800, ls: 3, align: 'center', color: 'rgba(255,255,255,0.85)' });
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x0 + numW + 8, yy - 34, 2, 64);
  const tx = x0 + numW + 22;
  text(ctx, l1a, tx, yy - 2, { size: f1, fam: 'bar', w: 700, color: '#fff', shadow: HUD_SHADOW, sb: 6, sy: 2 });
  text(ctx, l1b, tx + tw(ctx, l1a, f1, 'bar', 700), yy - 2, { size: f1, fam: 'bar', w: 800, color: '#ff4b3a', shadow: HUD_SHADOW, sb: 6, sy: 2 });
  text(ctx, l2, tx, yy + 26, { size: f2, fam: 'bar', w: 700, ls: 2, color: m.hs ? '#ffd24a' : 'rgba(255,255,255,0.8)', shadow: HUD_SHADOW, sb: 4, sy: 1 });
  ctx.restore();
}

// ── voice-call caption ──  c: {t0, t1, who (squad idx), parts:[[text, hi?],...]}
function hudCaption(ctx, c, t, A = 1, CX = W / 2) {
  if (!c || t < c.t0 || t > c.t1 || A <= 0) return;
  const age = t - c.t0;
  const a = Math.min(ep(t, c.t0, c.t0 + 0.15), 1 - ep(t, c.t1 - 0.2, c.t1, Ease.inQuad));
  const m = SQUAD[c.who];
  const fs = 34, maxW = CX === W / 2 ? 900 : 740;
  // layout words (with wrapping)
  const words = [];
  c.parts.forEach(([s, hi]) => s.split(' ').filter(Boolean).forEach(wd => words.push({ wd, hi })));
  ctx.save(); font(ctx, fs, 'bar', 700);
  const spaceW = ctx.measureText(' ').width;
  const lines = [[]]; let lw = 0; const lineW = [0];
  const headW = 30 + tw(ctx, m.name, 26, 'bar', 800) + 16;
  words.forEach(o => { o.w = tw(ctx, o.wd, fs, 'bar', o.hi ? 800 : 600); const cur = lines.length === 1 ? headW : 0; if (lw + o.w + cur > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; lineW.push(0); } lines[lines.length - 1].push(o); lw += o.w + spaceW; lineW[lineW.length - 1] = lw - spaceW; });
  ctx.restore();
  const lh = 44, nl = lines.length;
  const boxW = Math.max(lineW[0] + headW, ...lineW.slice(1)) + 48, boxH = nl * lh + 22;
  const bx = CX - boxW / 2, by = 888 - boxH - (1 - ep(age, 0, 0.25, Ease.outQuart)) * 14;
  ctx.save(); ctx.globalAlpha *= a * A;
  rr(ctx, bx, by, boxW, boxH, 8); ctx.fillStyle = 'rgba(8,9,10,0.62)'; ctx.fill();
  ctx.fillStyle = m.col; ctx.fillRect(bx, by + 10, 4, boxH - 20);
  // head: speaker + name
  let x = bx + 24, y = by + 12 + lh * 0.72;
  const talk = 0.55 + 0.45 * Math.abs(Math.sin(age * 13)) * (t < c.t1 - 0.3 ? 1 : 0);
  icoMic(ctx, x + 8, y - 11, 22, m.col, talk);
  x += 30;
  text(ctx, m.name, x, y, { size: 26, fam: 'bar', w: 800, color: m.col }); x += tw(ctx, m.name, 26, 'bar', 800) + 16;
  // words, revealed one by one
  let wi = 0;
  lines.forEach((ln, li) => {
    if (li > 0) { x = bx + 24; y += lh; }
    ln.forEach(o => {
      const wt = 0.08 + wi * 0.075; const wa = ep(age, wt, wt + 0.12);
      const dy = (1 - ep(age, wt, wt + 0.2, Ease.outBack)) * 10;
      if (wa > 0) text(ctx, o.wd, x, y + dy, { size: fs, fam: 'bar', w: o.hi ? 800 : 600, color: o.hi ? '#ffd24a' : '#fff', alpha: wa });
      x += o.w + spaceW; wi++;
    });
  });
  ctx.restore();
}

// ── hit marker + crosshair ──
function hudHitmarker(ctx, x, y, age, kill) {
  if (age < 0 || age > 0.35) return;
  const a = 1 - ep(age, 0.12, 0.35), s = 1 + (1 - ep(age, 0, 0.1)) * 0.6;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.strokeStyle = kill ? '#ff3b2f' : '#fff'; ctx.lineWidth = kill ? 4 : 3; ctx.lineCap = 'butt';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3;
  ctx.beginPath();
  for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { ctx.moveTo(dx * 9, dy * 9); ctx.lineTo(dx * 22, dy * 22); }
  ctx.stroke(); ctx.restore();
}
// ── revive ring ──
function hudReviveRing(ctx, cx, cy, p, m, A = 1, big = 1) {
  ctx.save(); ctx.globalAlpha *= A; ctx.translate(cx, cy); ctx.scale(big, big);
  const r = 74;
  circle(ctx, 0, 0, r + 16); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
  ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; circle(ctx, 0, 0, r); ctx.stroke();
  ctx.strokeStyle = p >= 1 ? m.col : '#fff'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); ctx.stroke();
  if (p >= 1) { text(ctx, '✓', 0, 22, { size: 64, fam: 'raj', w: 700, align: 'center', color: m.col }); }
  else text(ctx, (10 * (1 - p)).toFixed(1), 0, 14, { size: 42, fam: 'raj', w: 700, align: 'center', color: '#fff' });
  ctx.restore();
}
