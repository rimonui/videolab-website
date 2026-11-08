# Rimon — personal brand reel v2 (Gr8r Studio palette)

Vertical 1080x1920, 30s. Flame #FE370B · ink #0B0B0C · dark #181818 · paper #F5F5F4 · cream #F9F3EB.

```bash
node render.cjs      # -> out/video_silent.mp4
python3 sound.py     # -> out/sound.wav (synthesized)
ffmpeg -i out/video_silent.mp4 -i out/sound.wav -c:v copy -c:a aac -shortest rimon-brand-reel-9x16.mp4
```
Edit name, roles and disciplines at the top of `brand.html`. Preview live: `brand.html?play`.
