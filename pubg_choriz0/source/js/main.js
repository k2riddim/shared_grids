'use strict';
let MAP = null;
const CV = document.getElementById('cv'), CTX = CV.getContext('2d');
let PXS = 1;
function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function init() {
  const f = ['500 20px Oswald', '600 20px Oswald', '700 20px Oswald', '500 20px Teko', '600 20px Teko', '700 20px Teko', '500 20px BarlowC', '600 20px BarlowC', '700 20px BarlowC', '800 20px BarlowC', '600 20px Rajdhani', '700 20px Rajdhani'];
  await Promise.all(f.map(s => document.fonts.load(s)));
  try { MAP = await loadImage('/assets/map.png?v=' + Date.now()); } catch (e) { const t0 = performance.now(); MAP = bakeMap(); window.__mapBaked = true; console.log('map baked in', Math.round(performance.now() - t0), 'ms'); }
  if (typeof initScenes === 'function') initScenes();
  window.__ready = true;
}
window.getMapPNG = () => MAP.toDataURL('image/png');
window.renderFrame = (t, scale = 1) => {
  if (CV.width !== Math.round(W * scale)) { CV.width = CV.height = Math.round(W * scale); }
  PXS = scale;
  CTX.setTransform(scale, 0, 0, scale, 0, 0);
  CTX.globalAlpha = 1; CTX.globalCompositeOperation = 'source-over';
  CTX.fillStyle = '#000'; CTX.fillRect(0, 0, W, H);
  if (window.__test) { TESTS[window.__test](CTX, t); return; }
  drawFrame(CTX, t);
};
window.TESTS = {};
init();
