// node render.js [--test name --t 0] | [--out dir --fps 30 --from 0 --to 27.6 --step 1 --workers 4 --scale 1 --fmt png] | [--times 1,2,3 --out dir]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('out', 'frames')), FPS = +arg('fps', 30), FROM = +arg('from', 0), TO = +arg('to', 27.6), STEP = +arg('step', 1);
const WORKERS = +arg('workers', 4), SCALE = +arg('scale', 1), FMT = arg('fmt', 'png'), TIMES = arg('times', null), TEST = arg('test', null);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(d); });
});
async function openPage(browser, port) {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  pg.on('console', m => console.log('[page]', m.text()));
  pg.on('pageerror', e => { console.log('[pageerror]', e.message); });
  await pg.goto(`http://localhost:${port}/index.html`);
  await pg.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  if (await pg.evaluate(() => !!window.__mapBaked)) {
    const d = await pg.evaluate(() => window.getMapPNG());
    fs.writeFileSync(path.join(root, 'assets/map.png'), Buffer.from(d.split(',')[1], 'base64'));
    console.log('saved assets/map.png');
  }
  return pg;
}
async function grab(pg, t, file, test) {
  const d = await pg.evaluate(([t, s, fmt, test]) => { window.__test = test || null; renderFrame(t, s); return document.getElementById('cv').toDataURL(fmt === 'jpg' ? 'image/jpeg' : 'image/png', 0.93); }, [t, SCALE, FMT, test]);
  fs.writeFileSync(file, Buffer.from(d.split(',')[1], 'base64'));
}
srv.listen(0, async () => {
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  fs.mkdirSync(OUT, { recursive: true });
  const t0 = Date.now();
  if (TEST) {
    const pg = await openPage(browser, port);
    await grab(pg, +arg('t', 0), path.join(OUT, `test_${TEST}.${FMT}`), TEST);
  } else {
    let jobs = [];
    if (TIMES) jobs = TIMES.split(',').map(s => ({ t: +s, f: path.join(OUT, `t_${(+s).toFixed(2).padStart(6, '0')}.${FMT}`) }));
    else for (let i = Math.round(FROM * FPS); i < Math.round(TO * FPS); i += STEP) jobs.push({ t: i / FPS, f: path.join(OUT, `f_${String(i).padStart(5, '0')}.${FMT}`) });
    const first = await openPage(browser, port);
    const pages = [first];
    for (let w = 1; w < Math.min(WORKERS, jobs.length); w++) pages.push(await openPage(browser, port));
    let next = 0, done = 0;
    await Promise.all(pages.map(async pg => { while (next < jobs.length) { const j = jobs[next++]; await grab(pg, j.t, j.f); done++; if (done % 60 === 0) console.log(`${done}/${jobs.length}`); } }));
    console.log(`rendered ${jobs.length} frames`);
  }
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close(); srv.close();
});
