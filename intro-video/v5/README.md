# Gr8r Studio — "Ship it" micro-interaction loop (v5)
1080x1080 (plus 9:16 padded), 14.5s seamless loop at 83 BPM. Gr8r palette + Funnel Display, real CC0 UI sounds.
```bash
node render.cjs && python3 sound.py
ffmpeg -i out/video_silent.mp4 -i out/sound.wav -af loudnorm=I=-14:TP=-1 -c:v copy -c:a aac -shortest gr8r-ship-it-loop-1x1.mp4
```
Copy lives at the top of loop.html.
