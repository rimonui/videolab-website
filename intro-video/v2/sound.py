# Sound design modelled on the reference reel's structure (fully synthesized, no samples):
#   intro: bright plucked arpeggio + crisp mechanical key clicks
#   build: riser under the silhouette drawing
#   drop:  120 BPM beat with deep 808 (F#1), syncopated kicks, claps, hats
#   toggle: loud crisp switch click, beat cuts for a moment
#   outro: bass out, bell chime + soft keys
# Output: out/sound.wav (cues synced to intro.html scene timings)
import numpy as np, wave

SR = 48000
T = 30.0
N = int(SR * T)
rng = np.random.default_rng(3)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); bass = np.zeros((N, 2))


def tt(d): return np.arange(int(SR * d)) / SR
def note(m): return 440 * 2 ** ((m - 69) / 12)


def band(x, lo=20, hi=20000):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4), len(x))


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def put(buf, sig, at, g=1.0, pan=0.0):
    if sig.ndim == 1:
        sig = np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
    i = int(at * SR); j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * g


def reverb(x, secs=1.8, wet=0.2, lo=300, hi=8000):
    n = int(SR * secs); L = len(x) + n
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR * 6)[:, None]
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = band(np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir[:, c], L), L)[:len(x)], lo, hi)
    return x + out * (np.max(np.abs(x)) / (np.max(np.abs(out)) + 1e-9)) * wet


# ---------- instruments ----------
def pluck(f, d=0.5, bright=1.0):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * h * t) * g * np.exp(-t * (7 + h * 6 / bright)) for h, g in ((1, 1), (2, .5), (3, .25), (4, .12)))
    return s * np.minimum(1, t / .002)


def keys(f, d=1.2):  # electric-piano style: tine attack + warm body
    t = tt(d)
    body = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t * 6)) * np.exp(-t * 1.8)
    tine = np.sin(2 * np.pi * f * 7 * t) * np.exp(-t * 30) * 0.15
    return (body + tine) * np.minimum(1, t / .003)


def bell(f, d=2.0):
    t = tt(d)
    return sum(np.sin(2 * np.pi * f * r * t) * g * np.exp(-t * k) for r, g, k in ((1, 1, 2), (2.76, .4, 4), (5.4, .2, 7), (8.9, .08, 10)))


def kick():
    t = tt(.45); f = 45 + 160 * np.exp(-t * 40)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .001, .16)
    s += band(rng.standard_normal(len(t)), 1500, 7000) * env(len(t), .0003, .004) * .5  # beater click
    return np.tanh(s * 1.8)


def b808(f, d=0.7):
    t = tt(d); ff = f * (1 + 0.6 * np.exp(-t * 30))   # slight pitch drop on attack
    s = np.sin(2 * np.pi * np.cumsum(ff) / SR)
    s = np.tanh(s * 2.2) / np.tanh(2.2)               # saturation -> audible on phones
    e = np.minimum(1, t / .003) * np.exp(-t / .45) * np.minimum(1, (d - t) / .03)
    return s * e


def clap():
    t = tt(.3); n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for k in (0, .011, .022):
        i = int(k * SR); e[i:] += env(len(t) - i, .0004, .007)
    e += env(len(t), .03, .09) * .5
    return band(n, 900, 6000) * e * .8


def hat(open_=False):
    t = tt(.25 if open_ else .06); n = rng.standard_normal(len(t))
    return band(n, 7000, 16000) * env(len(t), .0005, .07 if open_ else .015)


def key_click():  # crisp mechanical keyboard switch (bright, like the reference)
    t = tt(.08)
    a = band(rng.standard_normal(len(t)), 2500, 12000) * env(len(t), .0002, .006)
    body = np.sin(2 * np.pi * rng.uniform(2300, 2900) * t) * env(len(t), .0003, .01) * .6
    thock = np.sin(2 * np.pi * 300 * t) * env(len(t), .001, .015) * .5
    up = np.zeros(len(t)); i = int(.035 * SR)
    up[i:] = band(rng.standard_normal(len(t) - i), 4000, 12000) * env(len(t) - i, .0002, .003) * .35  # key release
    return a + body + thock + up


def switch_click():  # loud crisp toggle: press + snap, with a tiny slide between
    out = np.zeros(int(SR * .35)); t = tt(.06)
    snap = (band(rng.standard_normal(len(t)), 2000, 14000) * env(len(t), .0001, .004)
            + np.sin(2 * np.pi * 3400 * t) * env(len(t), .0002, .006) * .8
            + np.sin(2 * np.pi * 180 * t) * env(len(t), .001, .02) * .9)
    out[:len(t)] += snap * .45
    s = tt(.09); out[int(.01 * SR):int(.01 * SR) + len(s)] += band(rng.standard_normal(len(s)), 3000, 9000) * np.sin(np.pi * s / .09) ** 2 * .07
    i = int(.1 * SR); out[i:i + len(t)] += snap * 1.0
    return out


def whoosh(d=.45, rise=True):
    n = int(SR * d); x = rng.standard_normal(n); k = np.linspace(0, 1, n)
    k = k if rise else 1 - k
    y = band(x, 300, 1200) * (1 - k) + band(x, 2500, 9000) * k
    y *= np.sin(np.pi * np.linspace(0, 1, n)) ** 3; y /= np.max(np.abs(y)) + 1e-9
    p = np.linspace(-.6, .6, n) * (1 if rise else -1)
    return np.stack([y * np.cos((p + 1) * np.pi / 4), y * np.sin((p + 1) * np.pi / 4)], 1)


def riser(d):
    n = int(SR * d); k = np.linspace(0, 1, n); x = rng.standard_normal(n)
    y = band(x, 500, 3000) * (1 - k) + band(x, 3000, 12000) * k
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1600 * k ** 2) / SR) * .3
    return (y / (np.max(np.abs(y)) + 1e-9) + sweep) * k ** 2.5


def impact():
    t = tt(1.4); f = 35 + 90 * np.exp(-t * 12)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .002, .5) * 2) + band(rng.standard_normal(len(t)), 200, 4000) * env(len(t), .001, .08) * .5



# ---------- arrangement for brand.html (v2) ----------
BEAT = 0.547                 # ~110 BPM, card cuts land on 8ths
CARDS0 = 21.65
DROP = CARDS0 - 2*BEAT       # bass/beat drop just before the name-card montage
HIT = 26.3                   # outro impact
F1 = note(29)                # F1 808

# light ambient bed (Fm9) + soft ticking pulse before the drop
for i, m in enumerate([53, 56, 60, 63, 67]):
    put(mus, keys(note(m), 11.0) * 0, 0, 0)
def padv(f, d):
    t = tt(d); s = sum(np.sin(2*np.pi*f*h*t + h) * g for h, g in ((1,1),(2,.3),(3,.1)))
    return s * np.minimum(1, t/1.2) * np.minimum(1, (d-t)/1.0)
for i, m in enumerate([65, 68, 72, 75, 79]):
    put(mus, padv(note(m), DROP + 0.6), 0.2, .012, (i-2)*.3)
for k, tp in enumerate(np.arange(1.25, DROP, BEAT/2)):
    put(mus, hat(), tp, .05 if k % 2 else .08, .3)

# ---- SFX ----
put(sfx, key_click(), .85, .8); put(sfx, key_click(), 1.05, .8)                     # H e
for i in range(3): put(sfx, key_click(), 1.38 + i*.13, .8, -.1 + i*.1)             # l l o
put(sfx, pluck(note(88), .4), 1.8, .3, .2)                                          # dot
put(sfx, whoosh(.35, False), 2.45, .25)                                             # I'm shrinks
for i in range(len('Rimon')): put(sfx, key_click(), 2.8 + i/9, .8, rng.uniform(-.2,.2))
for i in range(0, 32, 2): put(sfx, key_click(), 3.45 + i/40, .3, rng.uniform(-.3,.3))   # sub line
for i in range(12): put(sfx, key_click(), 4.15 + i*.03, .35)                        # backspace
for i in range(8): put(sfx, key_click(), 4.65 + i/14, .75, rng.uniform(-.2,.2))     # I'm your
put(sfx, whoosh(.5, True), 3.6, .25); put(sfx, whoosh(.4, False), 5.4, .25)          # silhouette
seg = (8.65 - 5.8) / 4
for i in range(4):
    put(sfx, whoosh(.32, True), 5.8 + i*seg - .1, .35, (-1)**i*.3)
    put(sfx, switch_click()[:int(.08*SR)], 5.8 + i*seg + .05, .5)
put(sfx, whoosh(.3, True), 8.6, .3); put(sfx, whoosh(.4, False), 9.2, .3)
for i, (tw, m) in enumerate([(9.85, 77), (10.15, 80), (10.45, 84), (10.75, 82), (10.95, 87)]):
    put(sfx, pluck(note(m), .5, 1.4), tw, .16, (-.3, .3)[i % 2]); put(sfx, key_click(), tw, .3)
for k in np.arange(11.45, 13.3, .25): put(sfx, key_click(), k, .45, rng.uniform(-.4,.4))   # tool icons swap
put(sfx, whoosh(.3, False), 13.15, .25)
for tw in (13.5, 13.6, 13.7, 13.85, 13.95): put(sfx, key_click(), tw, .4)
put(sfx, impact(), 14.45, .4); put(sfx, whoosh(.45, True), 14.3, .35)               # "to play." moment
put(sfx, whoosh(.35, False), 15.1, .3)
for k in np.arange(15.75, 21.4, .42):                                               # wheel ratchet
    for j in range(3): put(sfx, key_click(), k + j*.035, .22 - j*.06, .2)
put(sfx, riser(DROP - 18.6), 18.6, .45)

# ---- drop: beat + 808 under the card montage ----
b = 0
tb = DROP
while tb < HIT - .01:
    put(mus, kick(), tb, .9)
    put(bass, b808(F1 if (b // 8) % 2 == 0 else note(32), .5), tb, .9)
    if b % 2 == 1: put(mus, clap(), tb, .55)
    put(mus, hat(), tb + BEAT/2, .14, .25)
    if b % 4 == 3: put(mus, hat(True), tb + BEAT*.75, .1, -.25)
    tb += BEAT; b += 1
for i in range(17): put(sfx, whoosh(.18, True), CARDS0 + i*(26.3-CARDS0)/17 - .06, .12, (-1)**i*.4)  # card cuts
for i, m in enumerate([65, 68, 72]):
    for k in range(8): put(mus, pluck(note(m+12), .3, 1.5), DROP + k*BEAT + i*BEAT/3, .03)

# ---- outro: big hit, then near silence, typing, loop riser ----
put(sfx, impact(), HIT, .8); put(bass, b808(F1, 1.8), HIT, .9)
for m, d in ((84, 0), (91, .06)): put(mus, bell(note(m), 2.5), HIT + .05 + d, .07)
for i in range(0, 32, 2): put(sfx, key_click(), 27.0 + i/30, .3, rng.uniform(-.2,.2))
put(sfx, whoosh(.5, True), 27.85, .15)
put(sfx, riser(.9), 29.05, .15)

bass = np.stack([band(bass[:, 0], 25, 400)] * 2, 1)
mix = reverb(mus, 1.6, .18) + bass * .9 + reverb(sfx, 1.0, .12)
fi = int(SR*.05); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(SR*.4); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.stack([band(mix[:, c], 25, 12000) for c in range(2)], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6) * .89
w = wave.open('out/sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close(); print('ok')
