/* Renders the social video frame-by-frame (deterministic, no dropped frames).
 *
 *   npm run build && npx vite preview --port 4173 &
 *   node scripts/render-social-video.cjs landscape out.mp4 [fps] [seconds]
 *
 * Formats: landscape 3840x2160 (16:9), portrait 2160x2700 (4:5), story 2160x3840 (9:16).
 * Needs Playwright + Chromium and ffmpeg on the machine.
 */
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');

const FORMATS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};
FORMATS.story = { width: 1080, height: 1920 };

const [format = 'landscape', outFile = `social-${format}.mp4`, fpsArg = '60', secArg] = process.argv.slice(2);
const fps = Number(fpsArg);
const url = process.env.STAGE_URL || 'http://localhost:4173/social-video.html';

(async () => {
  const vp = FORMATS[format];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.addInitScript(() => { window.__manual = true; });
  await page.clock.install({ time: 0 });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true && document.fonts.status === 'loaded');
  await page.clock.pauseAt(10000);

  const duration = secArg ? Number(secArg) * 1000 : await page.evaluate(() => 28000);
  const frames = Math.round((duration / 1000) * fps);

  await page.evaluate(() => {
    window.__flush = () => new Promise((resolve) => {
      let n = 0;
      const ch = new MessageChannel();
      ch.port1.onmessage = () => (++n < 4 ? ch.port2.postMessage(0) : resolve());
      ch.port2.postMessage(0);
    });
    // CSS animations/transitions are paused and stepped by the same clock.
    window.__step = (dt) => {
      document.body.getBoundingClientRect();
      for (const a of document.getAnimations()) {
        if (!a.__v) { a.__v = 1; a.pause(); a.currentTime = 0; continue; }
        const next = (a.currentTime || 0) + dt;
        const end = a.effect && a.effect.getComputedTiming().endTime;
        if (Number.isFinite(end) && next >= end) a.finish();
        else a.currentTime = next;
      }
    };
  });

  const ff = spawn('ffmpeg', [
    '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '45M', '-bufsize', '90M',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '5.2',
    '-movflags', '+faststart', '-tag:v', 'avc1', outFile,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const cdp = await page.context().newCDPSession(page);
  let last = 0;
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = Math.round((i * 1000) / fps);
    const dt = t - last;
    last = t;
    if (dt > 0) await page.clock.runFor(dt);
    await page.evaluate(async ({ t, dt }) => {
      window.__frame(t);
      await window.__flush();
      window.__frame(t);
      window.__step(dt);
    }, { t, dt });
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, optimizeForSpeed: true });
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`${format}: frame ${i}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log(`done ${outFile}`);
})();
