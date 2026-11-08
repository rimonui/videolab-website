# Sound design modelled on the reference reel's structure (fully synthesized, no samples):
#   intro: bright plucked arpeggio + crisp mechanical key clicks
#   build: riser under the silhouette drawing
#   drop:  120 BPM beat with deep 808 (F#1), syncopated kicks, claps, hats
#   toggle: loud crisp switch click, beat cuts for a moment
#   outro: bass out, bell chime + soft keys
# Output: out/sound.wav (cues synced to intro.html scene timings)
import numpy as np, wave

SR = 48000
T = 23.6
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


# ---------- arrangement ----------
BEAT = 0.5          # 120 BPM
DROP = 5.9          # name reveal = beat drop
CUT = (11.45, 12.3) # beat cut for the toggle
END = 19.85         # bass out for the end card

# intro arpeggio (16ths), Cmaj7 -> Am7, sparkle on top — like the reference intro
arp_chords = [[60, 64, 67, 71, 76], [57, 60, 64, 67, 72]]
step = BEAT / 4
t = 0.9; k = 0
while t < DROP - 0.05:
    ch = arp_chords[int((t - 0.9) // 2) % 2]
    seq = [ch[4] + 12, ch[3], ch[2], ch[0], ch[1], ch[3], ch[2], ch[4]]
    m = seq[k % 8]
    g = 0.11 if t < 3.6 else 0.11 * (1 - 0.5 * (t - 3.6) / (DROP - 3.6))
    put(mus, pluck(note(m), .45, 1.4), t, g, pan=(-.4 if k % 2 else .4))
    put(mus, pluck(note(m), .45, 1.4), t + BEAT * .75, g * .3, pan=(.4 if k % 2 else -.4))   # echo
    t += step; k += 1

# build: filtered keys pulse + riser under the silhouette
for i, tb in enumerate(np.arange(3.6, DROP, BEAT)):
    for m in (55, 59, 62, 66):
        put(mus, keys(note(m), .4), tb, .03 + .02 * i / 5)
    put(bass, b808(note(30) / 2 * 2, .3), tb, .15 + .25 * (tb - 3.6) / (DROP - 3.6))  # light bass pulse
put(sfx, riser(DROP - 4.0), 4.0, .35)

# main groove (per 1 s cycle, from the reference): kick 0 / clap .125 / kick .25 / hat .3125 / clap .625 / kick .75
prog = [(30, [55, 59, 62, 66]),   # F#1 808, G-B-D-F# keys (Gmaj7 colour)
        (30, [55, 59, 62, 67]),
        (24, [57, 60, 64, 67]),   # C1 808, A-C-E-G (Am7 / C6)
        (30, [55, 59, 62, 66])]
c = DROP; bar = 0
while c < END - 0.01:
    if not (CUT[0] <= c < CUT[1]):
        root, ch = prog[(bar // 2) % 4]
        for off, inst, g, pan in ((0, 'k', .9, 0), (.125, 'c', .45, .1), (.25, 'k', .7, 0), (.3125, 'h', .12, .3),
                                  (.625, 'c', .55, -.1), (.75, 'k', .8, 0)):
            ts = c + off
            if ts >= END or CUT[0] <= ts < CUT[1]: continue
            if inst == 'k':
                put(mus, kick(), ts, g)
                put(bass, b808(note(root + 12 * 0) * 2 if root < 28 else note(root), .24 if off < .5 else .45), ts, g * .9)
            elif inst == 'c': put(mus, clap(), ts, g, pan)
            else: put(mus, hat(True), ts, g, pan)
        for e8 in np.arange(0, 1, .125):     # closed hats on 16ths, swung accent
            ts = c + e8
            if ts < END and not (CUT[0] <= ts < CUT[1]):
                put(mus, hat(), ts, .04 if (e8 * 8) % 2 else .08, .25)
        if bar % 2 == 0:                     # keys chord stab every 2 s
            for m in ch: put(mus, keys(note(m), 1.6), c, .05, pan=rng.uniform(-.3, .3))
        # bright pluck melody on top
        mel = [ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12]
        for j, m in enumerate(mel):
            put(mus, pluck(note(m), .4, 1.5), c + j * .25 + .0625, .045, pan=(-.3 if j % 2 else .3))
    c += 1.0; bar += 1

# ---------- SFX synced to visuals ----------
put(sfx, key_click(), 0.88, .8)                                   # H
for i in range(1, 5): put(sfx, key_click(), 1.2 + i * .18, .8, -.1 + i * .05)  # E L L O
put(sfx, pluck(note(88), .4), 2.1, .25, .2)                        # purple dot "plink"
put(sfx, key_click(), 2.55, .5); put(sfx, key_click(), 3.0, .5)   # select / frame
put(sfx, whoosh(.4, False), 3.3, .3)
for k2 in np.arange(3.75, 5.0, .125): put(sfx, key_click(), k2, .12, rng.uniform(-.3, .3))  # pen anchor points
put(sfx, impact(), DROP, .55)                                      # drop
put(sfx, whoosh(.5, True), DROP - .3, .35)
put(sfx, whoosh(.5, False), 7.1, .3); put(sfx, whoosh(.45, True), 7.55, .35)
put(sfx, key_click(), 8.3, .4)
put(sfx, whoosh(.45, True), 9.1, .35); put(sfx, impact(), 9.25, .35)
put(sfx, whoosh(.45, False), 10.3, .25)
put(sfx, switch_click(), 11.47, 1.0)                               # toggle — loud & crisp
put(sfx, riser(.6), 11.7, .3)
put(sfx, whoosh(.6, True), 12.3, .45); put(sfx, impact(), CUT[1], .4)
seg = (15.4 - 12.75) / 5
for i in range(5): put(sfx, whoosh(.3, True), 12.75 + i * seg - .08, .2, (-1) ** i * .3)
for k2 in (15.5, 16.2, 16.9, 17.6): put(sfx, whoosh(.4, True), k2 - .05, .35); put(sfx, key_click(), k2 + .33, .4)
put(sfx, whoosh(.45, False), 18.1, .3); put(sfx, whoosh(.5, True), 18.35, .35)
put(sfx, whoosh(.45, False), 19.7, .3)
# outro: bass out, bell chime + soft keys + typing
for m, d in ((84, 0), (91, .06), (88, .12)): put(mus, bell(note(m), 2.5), END + d, .12)
for m in (57, 64, 67, 71, 72): put(mus, keys(note(m), 3.0), END, .05, rng.uniform(-.3, .3))
msg = "Let's build something users love."
for i, ch in enumerate(msg):
    if ch != ' ': put(sfx, key_click(), 20.7 + i * .045, .35, rng.uniform(-.2, .2))
for i, m in enumerate([76, 72, 67, 64]): put(mus, pluck(note(m), .8), 22.0 + i * .25, .06, (-.3, .3)[i % 2])

# ---------- mix ----------
bass = np.stack([band(bass[:, 0], 25, 400)] * 2, 1)
mix = reverb(mus, 1.6, .18) + bass * 0.9 + reverb(sfx, 1.0, .12)
fo = int(SR * .8); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
mix = np.stack([band(mix[:, c], 25, 11000) for c in range(2)], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.5) / np.tanh(1.5) * .89    # punchy, loud like a reel
w = wave.open('out/sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close(); print('ok')
