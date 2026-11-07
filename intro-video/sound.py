# Clean, modern sound design — fully synthesized (no samples, no licensed music).
# Output: out/sound.wav  (cues are synced to the scene timings in intro.html)
import numpy as np, wave

SR = 48000
T = 23.6
N = int(SR * T)
rng = np.random.default_rng(11)
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


# ---------- helpers ----------
def tt(d):
    return np.arange(int(SR * d)) / SR


def band(x, lo=20, hi=20000):
    """Smooth FFT band-pass."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def env(n, a, d, sustain=0.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * (sustain + (1 - sustain) * np.exp(-t / d))


def put(buf, sig, at, gain=1.0, pan=0.0):
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    i = int(at * SR)
    j = min(N, i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i] * gain


def reverb(x, secs=2.2, wet=0.25, lo=200, hi=7000):
    n = int(SR * secs)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR * 5.5)[:, None]
    out = np.zeros_like(x)
    L = len(x) + n
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir[:, c], L), L)[: len(x)]
        out[:, c] = band(y, lo, hi)
    out *= np.max(np.abs(x)) / (np.max(np.abs(out)) + 1e-9)
    return x + out * wet


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------- UI sounds ----------
def key_tick(pitch=1.0):
    # soft keyboard tap: tiny pitched body + filtered noise transient
    d = tt(0.06)
    body = np.sin(2 * np.pi * 1400 * pitch * d) * env(len(d), 0.0006, 0.006)
    thock = np.sin(2 * np.pi * 220 * pitch * d) * env(len(d), 0.001, 0.012) * 0.6
    air = band(rng.standard_normal(len(d)), 2500, 9000) * env(len(d), 0.0003, 0.004) * 0.5
    return (body * 0.5 + thock + air) * 0.9


def pop(f0=420, f1=980):
    # bubbly "plip" for dots / selection
    d = tt(0.12)
    f = f0 + (f1 - f0) * (1 - np.exp(-d * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(d), 0.002, 0.035)


def soft_click(f=2600):
    d = tt(0.05)
    return (np.sin(2 * np.pi * f * d) * env(len(d), 0.0004, 0.005)
            + band(rng.standard_normal(len(d)), 3000, 10000) * env(len(d), 0.0002, 0.003) * 0.4)


def whoosh(dur=0.5, rise=True, lo=300, hi=5000):
    # airy swell: noise crossfaded from dark band to bright band (or reverse), smooth bell envelope, stereo drift
    n = int(SR * dur)
    x = rng.standard_normal(n)
    dark, bright = band(x, lo, lo * 3), band(x, hi / 3, hi)
    k = np.linspace(0, 1, n)
    k = k if rise else 1 - k
    y = dark * (1 - k) + bright * k * 0.8
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 3
    y = y * shape
    y /= np.max(np.abs(y)) + 1e-9
    pan = np.linspace(-0.5, 0.5, n) if rise else np.linspace(0.5, -0.5, n)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([y * l, y * r], 1) * 1.4


def toggle_on():
    # iOS-style switch: soft press tick, short slide, firm latch "thock" + gentle confirmation chime
    out = np.zeros(int(SR * 0.9))
    def at(sig, s, g=1.0):
        i = int(s * SR); out[i:i + len(sig)] += sig[: len(out) - i] * g
    at(soft_click(3200), 0.0, 0.5)                                    # finger press
    sl = tt(0.16)
    at(band(rng.standard_normal(len(sl)), 1500, 6000) * np.sin(np.pi * sl / 0.16) ** 2 * 0.12, 0.01)  # knob glide
    d = tt(0.12)
    at(np.sin(2 * np.pi * 160 * d) * env(len(d), 0.001, 0.02), 0.17, 0.9)   # latch thock
    at(soft_click(2100), 0.17, 0.7)
    c = tt(0.7)
    chime = sum(np.sin(2 * np.pi * f * c) * g for f, g in [(note(84), 1), (note(91), 0.5), (note(96), 0.18)])
    at(chime * env(len(c), 0.004, 0.18) * 0.22, 0.2)
    return out


def sub_hit():
    # deep, clean impact for the big reveals (no distortion, no click)
    d = tt(1.6)
    f = 38 + 50 * np.exp(-d * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(d), 0.004, 0.45)
    return s


def riser(dur):
    n = int(SR * dur)
    k = np.linspace(0, 1, n)
    x = band(rng.standard_normal(n), 2000, 9000) * k ** 3
    return x / (np.max(np.abs(x)) + 1e-9)


# ---------- music bed: soft ambient chords + plucks, 100 BPM ----------
BPM = 100
beat = 60 / BPM
bar = beat * 4
chords = [  # Am9 / Fmaj7 / Cmaj9 / Gsus — warm, modern
    [57, 60, 64, 67, 71],
    [53, 57, 60, 64, 69],
    [48, 55, 59, 62, 64],
    [55, 60, 62, 67, 71],
]


def pad_voice(f, dur):
    d = tt(dur)
    s = np.zeros(len(d))
    for det in (-0.12, 0.0, 0.11):      # detuned, harmonically soft
        ff = f * 2 ** (det / 12)
        for h, g in ((1, 1), (2, 0.35), (3, 0.12), (4, 0.05)):
            s += np.sin(2 * np.pi * ff * h * d + rng.uniform(0, 6.28)) * g
    a = np.minimum(1, d / 0.8) * np.minimum(1, (dur - d) / 0.9)
    return s * np.clip(a, 0, 1)


def pluck(f, dur=0.9):
    d = tt(dur)
    s = sum(np.sin(2 * np.pi * f * h * d) * g * np.exp(-d * (5 + h * 4)) for h, g in ((1, 1), (2, 0.4), (3, 0.15)))
    return s * np.minimum(1, d / 0.003)


def soft_kick():
    d = tt(0.35)
    f = 48 + 70 * np.exp(-d * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(d), 0.002, 0.11)


def shaker():
    d = tt(0.07)
    return band(rng.standard_normal(len(d)), 6000, 14000) * env(len(d), 0.004, 0.018)


start = 1.15
nbars = int((T - start) / bar) + 1
for b in range(nbars):
    t0 = start + b * bar
    ch = chords[b % 4]
    for i, m in enumerate(ch):
        put(music, pad_voice(note(m), bar + 0.9), t0, 0.022, pan=(i - 2) * 0.25)
    put(music, pad_voice(note(ch[0] - 12), bar + 0.6), t0, 0.03)  # warm bass
    # arpeggio pluck, 8ths, with a dotted delay echo
    seq = [ch[0] + 12, ch[2] + 12, ch[4] + 12, ch[3] + 12, ch[1] + 12, ch[4] + 12, ch[2] + 12, ch[3] + 12]
    for s, m in enumerate(seq):
        ts = t0 + s * beat / 2
        if ts < 3.6:
            continue  # arp enters with the silhouette
        pan = 0.35 if s % 2 else -0.35
        put(music, pluck(note(m)), ts, 0.05, pan)
        put(music, pluck(note(m)), ts + beat * 0.75, 0.018, -pan)
    # light groove from the name reveal, paused during the toggle moment
    for q in range(4):
        tq = t0 + q * beat
        if 5.9 <= tq < 20.2 and not (10.55 < tq < 12.3):
            put(music, soft_kick(), tq, 0.35)
        for e in (0.5,):
            te = tq + beat * e
            if 7.6 <= te < 19.8 and not (10.55 < te < 12.3):
                put(music, shaker(), te, 0.05, 0.3)

# duck the music around the toggle so the switch sound reads clearly
duck = np.ones(N)
a, b = int(10.6 * SR), int(12.5 * SR)
duck[a:b] = 0.45
duck = np.convolve(duck, np.ones(4800) / 4800, mode='same')
music *= duck[:, None]
# gentle fade-in / fade-out
fi = int(SR * 1.2); music[:fi] *= np.linspace(0, 1, fi)[:, None]

# ---------- SFX timeline (synced to intro.html) ----------
put(sfx, key_tick(1.0), 0.88, 0.5)                                   # "H"
for i in range(1, 5):
    put(sfx, key_tick(1 + i * 0.03), 1.2 + i * 0.18, 0.45, pan=-0.1 + i * 0.05)
put(sfx, pop(), 2.1, 0.35, 0.2)                                       # purple dot
put(sfx, soft_click(2400), 2.55, 0.25)                               # select
put(sfx, soft_click(2000), 3.0, 0.25)                                # frame
put(sfx, whoosh(0.45, False, 250, 4000), 3.3, 0.18)                   # HELLO out
# pen drawing: very soft graphite-like texture
pd = tt(1.3)
pen = band(rng.standard_normal(len(pd)), 2500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * pd) ** 2)
pen *= np.minimum(1, pd / 0.15) * np.minimum(1, (1.3 - pd) / 0.2)
put(sfx, pen, 3.7, 0.035, 0.2)
put(sfx, whoosh(0.4, True, 400, 6000), 5.0, 0.1)                     # fill
put(sfx, riser(0.5), 5.45, 0.04)
put(sfx, sub_hit(), 5.95, 0.55)                                       # RIMON reveal
put(sfx, whoosh(0.55, True), 5.8, 0.22)
put(sfx, pop(500, 1100), 5.62, 0.22)                                  # I'M
put(sfx, whoosh(0.5, False), 7.1, 0.2)                                # letters drop
put(sfx, whoosh(0.5, True), 7.55, 0.22)                               # AI DESIGN
put(sfx, whoosh(0.5, True, 350, 6000), 7.7, 0.15, 0.3)                # ENGINEER
put(sfx, soft_click(2600), 8.3, 0.18)                                 # annotations
put(sfx, whoosh(0.5, True), 9.1, 0.2)
put(sfx, sub_hit(), 9.25, 0.4)                                        # UX / AI
put(sfx, whoosh(0.45, False), 10.3, 0.18)
put(sfx, toggle_on(), 11.48, 0.9)                                     # the switch
put(sfx, riser(0.35), 12.05, 0.05)
put(sfx, whoosh(0.6, True, 300, 7000), 12.3, 0.3)                     # white circle wipe
seg = (15.4 - 12.75) / 5
for i in range(5):                                                    # each "Designing" word
    put(sfx, whoosh(0.3, True, 600, 7000), 12.75 + i * seg - 0.08, 0.1, (-1) ** i * 0.3)
    put(sfx, soft_click(2200 + i * 120), 12.75 + i * seg + 0.02, 0.18)
for k in (15.5, 16.2, 16.9, 17.6):                                    # process steps slide
    put(sfx, whoosh(0.45, True, 300, 5000), k - 0.05, 0.22)
    put(sfx, pop(380, 760), k + 0.32, 0.2)
put(sfx, whoosh(0.45, False), 18.1, 0.18)
put(sfx, whoosh(0.5, True), 18.35, 0.22)                              # name card
put(sfx, sub_hit(), 18.42, 0.35)
put(sfx, whoosh(0.45, False), 19.7, 0.15)
put(sfx, pop(300, 900), 19.88, 0.3)                                   # end card
put(sfx, sub_hit(), 19.88, 0.35)
msg = "Let's build something users love."
for i, ch in enumerate(msg):
    if ch != ' ':
        put(sfx, key_tick(0.95 + rng.uniform(0, 0.12)), 20.7 + i * 0.045, 0.22, rng.uniform(-0.15, 0.15))
# final music tail: one sustained resolving chord
for i, m in enumerate([57, 64, 69, 72, 76]):
    put(music, pad_voice(note(m), 2.6), 20.9, 0.02, (i - 2) * 0.3)

# ---------- mix & master ----------
mix = reverb(music, 2.8, 0.35) * 0.9 + reverb(sfx, 1.4, 0.18)
fo = int(SR * 0.9); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
mix = band_st = np.stack([band(mix[:, 0], 30, 16000), band(mix[:, 1], 30, 16000)], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.3) / np.tanh(1.3) * 0.89   # gentle soft-clip, ~-1 dBFS peak

w = wave.open('out/sound.wav', 'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
print('ok')
