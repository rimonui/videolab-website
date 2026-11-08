# Rimon — brand reel v3 (Gr8r Studio)
1080x1920, 30s. Funnel Display + Gr8r palette (#FE370B flame, ink, paper, cream).
- assets/silhouette.png, portrait.png, outline.json — cut out from Rimon's photo (BiRefNet, MIT)
- assets/sfx — real recorded sounds, CC0 (see assets/sfx/LICENSE.txt); music is produced in sound.py

```bash
node render.cjs     # -> out/video_silent.mp4 (serves this folder locally)
python3 sound.py    # -> out/sound.wav
ffmpeg -i out/video_silent.mp4 -i out/sound.wav -af loudnorm=I=-14:TP=-1 -c:v copy -c:a aac -shortest rimon-brand-reel-v3.mp4
```
Edit copy at the top of brand.html.
