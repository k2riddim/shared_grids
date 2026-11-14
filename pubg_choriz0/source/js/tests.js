'use strict';
TESTS.map = (ctx) => { drawMapBase(ctx, MAP, { x: 4, y: 4, s: 1080 / 8.6 }); };
TESTS.mapzoom = (ctx) => {
  const cam = { x: 4.85, y: 2.75, s: 420 };
  drawMapBase(ctx, MAP, cam);
  drawZones(ctx, cam, { x: 4.7, y: 3.2, r: 2.2 }, { x: 5.35, y: 2.4, r: 0.75 });
};
TESTS.vista = (ctx, t) => { drawVista(ctx, { ax: 0, ay: 1.2, s: 16 }, { t }); };
TESTS.scope = (ctx, t) => {
  const v = { ax: 2, ay: 2.0, s: 70 };
  drawVista(ctx, v, { t });
  for (let i = 0; i < 3; i++) { const [x, y] = P2S(v, -1 + i * 2.2, 2.3 + i * 0.1); soldier(ctx, x, y, 1.6 * v.s, { type: 'run', ph: t * 9 + i * 2 }, { rim: { c: '#f3b36b', dx: -0.008, dy: -0.006 } }); }
};
TESTS.soldiers = (ctx, t) => {
  ctx.fillStyle = '#c98a5a'; ctx.fillRect(0, 0, W, H);
  const poses = [{ type: 'run', ph: 0 }, { type: 'run', ph: 1.6 }, { type: 'run', ph: 3.2 }, { type: 'run', ph: 4.7 }, { type: 'aim' }, { type: 'stand' }, { type: 'hero', weapon: 'awm' }, { type: 'crouch' }, { type: 'down' }];
  poses.forEach((p, i) => { const x = 110 + (i % 5) * 210, y = i < 5 ? 480 : 980; soldier(ctx, x, y, 380, p, { rim: { c: '#ffd29a', dx: -0.01, dy: -0.006 }, lvl3: i === 6 }); });
};
TESTS.guns = (ctx) => {
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(0, 0, W, H);
  ['m416', 'kar98k', 'awm', 'pan'].forEach((g, i) => gun(ctx, g, 80, 160 + i * 230, 880, 0, '#f2f2f2'));
};
TESTS.air = (ctx, t) => {
  drawSky(ctx, { ax: 0, ay: -14, s: 22 }, {});
  c130(ctx, 120, 300, 760, t, { blink: 1 });
  parachute(ctx, 760, 760, 300, 1, 0.1);
  crate(ctx, 760, 870, 120, { beacon: 1 });
};
TESTS.icons = (ctx) => {
  ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H);
  const fns = [icoHelmet, icoVest, icoBackpack, icoSyringe, icoMedkit, icoAmmo, icoGhillie, icoMic, icoSkullHS, icoPin];
  fns.forEach((f, i) => f(ctx, 120 + (i % 5) * 200, 260 + Math.floor(i / 5) * 300, 120, i === 9 ? C.p1 : '#fff'));
  SQUAD.forEach((s, i) => badge(ctx, 200 + i * 80, 900, 48, s.n, s.col));
};
TESTS.soldiers = (ctx, t) => {
  ctx.fillStyle = '#c98a5a'; ctx.fillRect(0, 0, W, H);
  const poses = [{ type: 'run', ph: 0 }, { type: 'run', ph: 1.6 }, { type: 'run', ph: 3.2 }, { type: 'run', ph: 4.7 }, { type: 'aim' }, { type: 'stand' }, { type: 'hero', weapon: 'awm' }, { type: 'shoulder', weapon: 'm416' }, { type: 'crouch', weapon: 'kar98k' }, { type: 'down' }];
  poses.forEach((p, i) => { const x = 110 + (i % 5) * 210, y = i < 5 ? 480 : 980; soldier(ctx, x, y, 380, p, { rim: { c: '#ffd29a', dx: -0.01, dy: -0.006 }, lvl3: i === 6 }); });
};
