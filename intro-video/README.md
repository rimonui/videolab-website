# Rimon — AI Design Engineer intro video

Code-driven motion graphic (HTML + JS timeline), rendered frame-by-frame with Playwright and encoded with ffmpeg.

```bash
node render.cjs                 # renders out/video_silent.mp4 (1920x1080, 30fps)
python3 sound.py                # synthesizes out/sound.wav (no licensed music)
ffmpeg -i out/video_silent.mp4 -i out/sound.wav -c:v copy -c:a aac -shortest rimon-intro-16x9.mp4
# vertical 9:16 for Reels/TikTok (video centered on dark background)
ffmpeg -i rimon-intro-16x9.mp4 -vf "scale=1080:-2,pad=1080:1920:0:(oh-ih)/2:color=0x0e0d12" -c:a copy rimon-intro-9x16.mp4
```

Preview live in a browser: open `intro.html?play`. Preview a single moment: `node render.cjs --stills 6.8,12`.

Edit copy (name, role, "Designing …" items, process steps) directly in `intro.html`.
Scene timing: intro 0–1.2s · HELLO 1.2–3.6 · silhouette 3.6–5.6 · name 5.6–7.6 · role 7.6–9.2 ·
UX/AI 9.2–10.6 · toggle 10.6–12.75 · Designing 12.75–15.4 · How I work 15.4–18.4 · card 18.4–20 · end 20–23.6.
