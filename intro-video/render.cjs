// Usage: node render.js [--stills t1,t2,...] ; default renders full video to out/frames.mp4 (silent)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'); const fs = require('fs');
(async () => {
  const fps = 30; const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'intro.html'));
  await page.waitForFunction(() => window.READY);
  const i = process.argv.indexOf('--stills');
  if (i > 0) {
    for (const t of process.argv[i + 1].split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(out, `still_${t}.png`) });
    }
  } else {
    const total = await page.evaluate(() => TOTAL);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', path.join(out, 'video_silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(total * fps);
    for (let f = 0; f < n; f++) {
      await page.evaluate(t => render(t), f / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 60 === 0) console.log(`frame ${f}/${n}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
