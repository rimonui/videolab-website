# Tanjim Islam — Gr8r Studio founder reel (v4)
1080x1920, ~63s. Same system as v3 (Funnel Display, Gr8r palette, real CC0 SFX in assets/sfx).
Copy sources: gr8rstudio.com, Tanjim's X bio + pinned post, Facebook bio.

```bash
node render.cjs && python3 sound.py
ffmpeg -i out/video_silent.mp4 -i out/sound.wav -af loudnorm=I=-14:TP=-1 -c:v copy -c:a aac -shortest tanjim-gr8r-founder-reel.mp4
```
Edit copy at the top of brand.html (NAME, TITLE, ROLES, DISCIPLINES, STATS, STEPS, WORK, QUOTES).
