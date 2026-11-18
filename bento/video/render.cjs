const { chromium } = require('playwright');
const fs = require('fs');
const [,, name, vw, vh, outW, secs] = process.argv;
const S = 10, DPR = outW / vw, DUR = +secs;
(async () => {
  const dir = `frames_${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +vw, height: +vh }, deviceScaleFactor: DPR });
  const p = await ctx.newPage();
  await p.addInitScript(S => {
    const st = setTimeout, si = setInterval, raf = requestAnimationFrame.bind(window), pn = performance.now.bind(performance);
    const t0 = pn();
    performance.now = () => t0 + (pn() - t0) / S;
    window.setTimeout = (f, ms = 0, ...a) => st(f, ms * S, ...a);
    window.setInterval = (f, ms = 0, ...a) => si(f, ms * S, ...a);
    window.requestAnimationFrame = cb => raf(ts => cb(t0 + (ts - t0) / S));
  }, S);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / S });
  await p.goto('file:///home/user/videolab-website/bento/agents.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const clip = { x: 0, y: 0, width: +vw, height: +vh, scale: DPR };
  const frames = []; let lastSlot = -1;
  const start = Date.now();
  for (;;) {
    const a = Date.now();
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', clip });
    const v = ((a + Date.now()) / 2 - start) / 1000 / S;
    if (v > DUR) break;
    const slot = Math.floor(v * 60);
    if (slot > lastSlot) {
      lastSlot = slot;
      const file = `${dir}/${String(frames.length).padStart(6, '0')}.png`;
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
      frames.push([v, file]);
    }
  }
  await b.close();
  fs.writeFileSync(`${dir}/index.json`, JSON.stringify(frames));
  console.log(name, frames.length, 'frames');
})();
