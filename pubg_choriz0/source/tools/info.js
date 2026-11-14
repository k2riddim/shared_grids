const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const srv = http.createServer((q, r) => { fs.readFile(path.join(root, decodeURIComponent(q.url.split('?')[0])), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.end(d); }); }).listen(0, async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto(`http://localhost:${srv.address().port}/index.html`);
  await p.waitForFunction(() => window.__ready === true);
  console.log(JSON.stringify(await p.evaluate(() => window.MONTAGE_INFO)));
  await b.close(); srv.close();
});
