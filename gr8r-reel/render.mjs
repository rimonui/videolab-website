// Renders gr8r-reel/index.html to an MP4 (1080x1920, 30fps) with Playwright + ffmpeg.
//   node gr8r-reel/render.mjs [out.mp4]            full video
//   node gr8r-reel/render.mjs --stills 1,5,14 dir  PNG stills at those seconds
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = "<!doctype html><meta charset=utf-8>" + readFileSync(path.join(here, "index.html"), "utf8");
const FPS = 30;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.route("http://reel.local/**", r => r.fulfill({ contentType: "text/html", body: html }));
await page.goto("http://reel.local/?render");
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const stage = page.locator("#stage");

if (process.argv[2] === "--stills") {
  const times = process.argv[3].split(",").map(Number);
  const dir = process.argv[4] || ".";
  for (const s of times) {
    await page.evaluate(s => window.__seek(s), s);
    await stage.screenshot({ path: path.join(dir, `still-${s}.png`) });
  }
} else {
  const out = process.argv[2] || path.join(here, "gr8r-reel.mp4");
  const dur = await page.evaluate(() => window.__duration);
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", out],
    { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(dur * FPS);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(s => window.__seek(s), i / FPS);
    ff.stdin.write(await stage.screenshot({ type: "png" }));
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  console.log(`wrote ${out} (${frames} frames)`);
}
await browser.close();
