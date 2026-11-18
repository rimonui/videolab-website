const fs = require('fs');
const [,, name, fps, secs] = process.argv;
const dir = `frames_${name}`, frames = JSON.parse(fs.readFileSync(`${dir}/index.json`));
const out = `seq_${name}`; fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
let j = 0, maxgap = 0, last = 0;
for (let k = 0; k < fps * secs; k++) {
  const t = k / fps;
  while (j + 1 < frames.length && frames[j + 1][0] <= t) j++;
  fs.symlinkSync(fs.realpathSync(frames[j][1]), `${out}/${String(k).padStart(6, '0')}.png`);
}
for (let i = 1; i < frames.length; i++) maxgap = Math.max(maxgap, frames[i][0] - frames[i - 1][0]);
console.log('max gap between captured frames (virtual s):', maxgap.toFixed(3));
