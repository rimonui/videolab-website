// node render.cjs [--stills t1,t2]  -> out/video_silent.mp4 (1080x1920 @30fps)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');
const types = { '.html': 'text/html', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((q, r) => {
  const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); } });
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port, fps = 30, out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(`http://127.0.0.1:${port}/loop.html`);
  await page.waitForFunction(() => window.READY, null, { timeout: 30000 });
  const i = process.argv.indexOf('--stills');
  if (i > 0) {
    for (const t of process.argv[i + 1].split(',').map(Number)) { await page.evaluate(t => render(t), t); await page.screenshot({ path: path.join(out, `still_${t}.png`) }); }
  } else {
    const total = await page.evaluate(() => TOTAL), n = Math.round(total * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium', path.join(out, 'video_silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < n; f++) {
      await page.evaluate(t => render(t), f / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${n}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close(); server.close();
})();
