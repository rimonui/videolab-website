# v3 soundtrack: trap-style score (808 slides, hat rolls, FM bell lead) + REAL recorded SFX (CC0, see assets/sfx/LICENSE.txt)
# Output: out/sound.wav — synced to brand.html timings.
import numpy as np, wave, glob, os

SR = 48000; T = 30.0; N = int(SR * T)
rng = np.random.default_rng(21)
HERE = os.path.dirname(os.path.abspath(__file__))
mus = np.zeros((N, 2)); drums = np.zeros((N, 2)); bass = np.zeros(N); sfx = np.zeros((N, 2))

def tt(d): return np.arange(int(SR * d)) / SR
def note(m): return 440 * 2 ** ((m - 69) / 12)
def band(x, lo=20, hi=20000):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4), len(x))
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def put(buf, sig, at, g=1.0, pan=0.0):
    if buf.ndim == 1:
        s = sig if sig.ndim == 1 else sig.mean(1)
        i = int(at * SR); j = min(N, i + len(s))
        if j > i: buf[i:j] += s[:j - i] * g
        return
    if sig.ndim == 1:
        sig = np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
    i = int(at * SR); j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * g
def reverb(x, secs=2.0, wet=.25, lo=250, hi=9000, decay=5):
    n = int(SR * secs); L = len(x) + n
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR * decay)[:, None]
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = band(np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir[:, c], L), L)[:len(x)], lo, hi)
    return x + out * (np.max(np.abs(x)) / (np.max(np.abs(out)) + 1e-9)) * wet

# ---------- real samples ----------
def load(path):
    w = wave.open(path); n = w.getnframes(); ch = w.getnchannels()
    a = np.frombuffer(w.readframes(n), '<i2').astype(np.float32) / 32768
    a = a.reshape(-1, ch); a = a[:, 0] if ch == 1 else a
    return a / (np.max(np.abs(a)) + 1e-9)
A = os.path.join(HERE, 'assets', 'sfx')
KEYS = [load(f) for f in sorted(glob.glob(f'{A}/keys/*.wav'))]
SWISH = [load(f) for f in sorted(glob.glob(f'{A}/swish/swish-*.wav'))]
WHOOSH = load(f'{A}/swish/whoosh-long.wav')
SWITCH = [load(f) for f in sorted(glob.glob(f'{A}/ui/switch*.wav'))]
CLICK = [load(f) for f in sorted(glob.glob(f'{A}/ui/click*.wav')) + sorted(glob.glob(f'{A}/ui/c10-*.wav'))]
MOUSE = load(f'{A}/ui/mouseclick1.wav'); MOUSEUP = load(f'{A}/ui/mouserelease1.wav')
ROLL = [load(f) for f in sorted(glob.glob(f'{A}/ui/rollover*.wav'))]

def key(at, g=.55):   # one real keystroke, random key + tiny pitch/level humanization
    s = KEYS[rng.integers(len(KEYS))]
    r = rng.uniform(.96, 1.05); idx = np.arange(0, len(s) - 1, r); s = np.interp(idx, np.arange(len(s)), s)
    put(sfx, s, at + rng.uniform(-.006, .006), 1.7 * g * rng.uniform(.8, 1.05), rng.uniform(-.25, .25))
def typing(at, n, cps, g=.55):
    for i in range(n): key(at + i / cps, g)
def swish(at, g=.6, pan=0, which=None, stretch=1.0):
    s = SWISH[(which % len(SWISH)) if which is not None else rng.integers(len(SWISH))]
    if stretch != 1.0:
        idx = np.arange(0, len(s) - 1, 1 / stretch); s = np.stack([np.interp(idx, np.arange(len(s)), s[:, c]) for c in range(2)], 1)
    put(sfx, s, at - .03, g)
def whoosh(at, d=.7, g=.5, start=1.2):
    i = int(start * SR); s = WHOOSH[i:i + int(d * SR)].copy()
    s *= np.sin(np.linspace(0, np.pi, len(s)))[:, None] ** 1.5
    put(sfx, s, at - d * .55, g)
def ui(at, g=.5, kind='switch', i=None):
    pool = {'switch': SWITCH, 'click': CLICK, 'roll': ROLL}[kind]
    put(sfx, pool[i if i is not None else rng.integers(len(pool))], at, g, rng.uniform(-.2, .2))

# ---------- designed sounds ----------
def reverse_swell(d=1.0):
    n = int(SR * d); x = band(rng.standard_normal(n), 2000, 14000) * np.linspace(0, 1, n) ** 3
    tone = sum(np.sin(2 * np.pi * note(m) * tt(d)) for m in (77, 84)) * np.linspace(0, 1, n) ** 4 * .2
    return (x / (np.max(np.abs(x)) + 1e-9) + tone)
def impact(d=2.2):
    t = tt(d); f = 32 + 110 * np.exp(-t * 14)
    sub = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .001, .55) * 2.5)
    crack = band(rng.standard_normal(len(t)), 300, 9000) * env(len(t), .0005, .06)
    return sub + crack * .7
def scanner(d=.6):  # photo scan: digital sweep with stutter
    t = tt(d); f = 500 + 2600 * (t / d) ** 1.5
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 + np.sin(2 * np.pi * np.cumsum(f * .5) / SR)
    s *= (0.6 + 0.4 * (np.sin(2 * np.pi * 28 * t) > 0)) * np.sin(np.pi * t / d)
    return band(s, 300, 9000) * .5
def marker(d):  # pen drawing texture (felt tip on paper)
    t = tt(d); x = band(rng.standard_normal(len(t)), 1800, 7000)
    return x * (.5 + .5 * np.abs(np.sin(2 * np.pi * 5.5 * t))) * np.minimum(1, t / .08) * np.minimum(1, (d - t) / .1)

# ---------- instruments ----------
def kick():
    t = tt(.5); f = 42 + 190 * np.exp(-t * 38)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .001, .2)
    return np.tanh(s * 2.4) + band(rng.standard_normal(len(t)), 2000, 9000) * env(len(t), .0003, .003) * .6
def snare():
    t = tt(.4); n = rng.standard_normal(len(t)); e = np.zeros(len(t))
    for k in (0, .009, .018): i = int(k * SR); e[i:] += env(len(t) - i, .0004, .008)
    e += env(len(t), .002, .12) * .7
    body = np.sin(2 * np.pi * 190 * t) * env(len(t), .001, .05) * .6
    return band(n, 900, 9000) * e + body
def hat(op=False):
    t = tt(.3 if op else .05)
    x = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (3200, 4250, 5340, 6670, 8100, 9300)) + rng.standard_normal(len(t)) * 2
    return band(x, 7000, 16000) * env(len(t), .0003, .09 if op else .014) * .5
def b808(f0, d, f1=None, glide=.12):
    t = tt(d); f = np.full(len(t), f0)
    if f1: f = f0 + (f1 - f0) * np.clip(t / glide, 0, 1)
    f = f * (1 + .5 * np.exp(-t * 40))
    s = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * 2.5) / np.tanh(2.5)
    return s * np.minimum(1, t / .004) * np.exp(-t / 1.1) * np.minimum(1, (d - t) / .04)
def bell(f, d=1.4):  # FM bell, classic trap lead
    t = tt(d); m = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 3)
    return np.sin(2 * np.pi * f * t + m) * np.exp(-t * 2.4) * np.minimum(1, t / .002)
def pad(f, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * 2 ** (dt / 1200) * t + dt) for dt in (-9, 0, 8)) / 3
    s += .25 * np.sin(2 * np.pi * f * 2 * t)
    return s * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.2)

BEAT = .547; BAR = BEAT * 4
DROP = 21.65 - 2 * BEAT
# F minor: Fm - Db - Ab - Eb
PROG = [(41, [65, 68, 72]), (37, [61, 65, 68]), (44, [68, 72, 75]), (39, [63, 67, 70])]
MEL = [77, 80, 84, 80, 79, 75, 77, 72]

# ===== ambient bed 0 – DROP =====
for i, m in enumerate([53, 60, 63, 68]):
    put(mus, pad(note(m), 9.6), .3, .03, (i - 1.5) * .3)
for b in range(int((DROP - 9.8) / BAR) + 1):
    root, ch = PROG[b % 4]
    for i, m in enumerate(ch): put(mus, pad(note(m), BAR + 1), 9.8 + b * BAR, .016, (i - 1) * .4)

# bell melody: sparse & filtered in intro, fuller from roles
def bell_line(start, end, g, every=1):
    k = 0; tb = start
    while tb < end:
        if k % every == 0: put(mus, bell(note(MEL[k % 8])), tb, g, (-.35, .35)[k % 2]); put(mus, bell(note(MEL[k % 8])), tb + BEAT * .75, g * .3, (.35, -.35)[k % 2])
        tb += BEAT; k += 1
bell_line(2.3, 5.9, .09, 2)
bell_line(5.9, 14.45, .1)
bell_line(15.5, DROP, .06)

# ===== groove =====
def groove(start, end, level, with808=True, claps=True, lp=False):
    tb = start; b = 0
    while tb < end - .01:
        beat_in_bar = b % 4; bar = b // 4; root = PROG[bar % 4][0]
        if beat_in_bar in (0, 2) or (beat_in_bar == 3 and bar % 2): put(drums, kick(), tb, .9 * level)
        if with808 and beat_in_bar in (0, 2):
            put(bass, b808(note(root - 12), BEAT * 2 - .02), tb, .9 * level)
        if claps and beat_in_bar in (1, 3): put(drums, snare(), tb, .6 * level, .05)
        for s in range(4):  # 16th hats, with 32nd roll at the end of every 2nd bar
            th = tb + s * BEAT / 4
            if th >= end: break
            if beat_in_bar == 3 and bar % 2 == 1 and s >= 2:
                for r in range(3): put(drums, hat(), th + r * BEAT / 12, .16 * level * (.7 + .3 * r), .25)
            else: put(drums, hat(), th, (.2 if s % 2 == 0 else .1) * level, .25)
        tb += BEAT; b += 1

groove(5.9, 9.8, .55, with808=False, claps=False)        # roles: light kick + hats
groove(9.8, 14.45, .55, with808=False)                                  # quote: full groove
groove(15.5, DROP - BAR, .7, claps=True)                  # wheel
# build bar: snare roll + riser
for i in range(16): put(drums, snare(), DROP - BAR + i * BAR / 16, .25 + .4 * i / 16)
put(sfx, reverse_swell(BAR), DROP - BAR, .35)

# ===== DROP: full trap section with 808 slides =====
tb = DROP; b = 0
pattern808 = [(0, 41, None), (1.5, 41, None), (2.5, 44, 48), (4, 37, None), (5.5, 37, 41), (6.5, 39, None)]
while tb < 26.3 - .01:
    bi = b % 4; bar = b // 4
    if bi in (0, 2) or (bi == 1 and bar % 2): put(drums, kick(), tb + (BEAT / 2 if bi == 1 else 0), 1.0)
    if bi in (1, 3): put(drums, snare(), tb, .75); put(drums, hat(True), tb + BEAT / 2, .12, -.3)
    for s in range(4):
        th = tb + s * BEAT / 4
        if (bar % 2 == 1 and bi == 3) or (bar % 2 == 0 and bi == 1 and s == 3):
            for r in range(3): put(drums, hat(), th + r * BEAT / 12, .2, .25)
        else: put(drums, hat(), th, .24 if s % 2 == 0 else .13, .25)
    tb += BEAT; b += 1
for rep in range(3):
    base = DROP + rep * BAR * 2
    for off, m, m2 in pattern808:
        at = base + off * BEAT
        if at < 26.3: put(bass, b808(note(m - 12), BEAT * 1.4, note(m2 - 12) if m2 else None), at, 1.0)
k = 0; tb = DROP
while tb < 26.3:
    put(mus, bell(note(MEL[k % 8] + (12 if k % 16 >= 8 else 0))), tb, .085, (-.3, .3)[k % 2]); tb += BEAT / 2 if k % 4 == 3 else BEAT; k += 1
for b in range(3):
    for i, m in enumerate(PROG[b % 4][1]): put(mus, pad(note(m), BAR * 2 + .5), DROP + b * BAR * 2, .02, (i - 1) * .4)

# ===== SFX (real recordings) =====
typing(.82, 2, 5, .7)                                   # He
typing(1.3, 3, 7.5, .7)                                 # llo
ui(1.84, .45, 'click', 2)                               # dot pop
swish(2.55, .45, which=4)                               # I'm -> eyebrow
typing(2.9, len('Rimon'), 10, .75)
ui(3.5, .45, 'switch', 5); swish(3.5, .3, which=11)     # title pill
put(sfx, marker(1.0), 3.35, .07, .2)                    # pen drawing
ui(4.3, .4, 'click', 7)
for i in range(5): key(4.3 + i * .045, .45)             # backspace burst
put(sfx, scanner(.6), 4.65, .18)                        # photo scan
typing(4.6, len('I’m your'), 15, .7)
whoosh(5.6, .6, .5)                                     # silhouette out
seg = (8.7 - 5.9) / 4
for i in range(4):                                      # role transitions
    whoosh(5.9 + i * seg, .55, .55, start=1.0 + i * .7)
    swish(5.9 + i * seg + .05, .5, which=(0, 3, 6, 9)[i])
    ui(5.9 + i * seg + .12, .25, 'click', i)
ui(9.18, .5, 'switch', 12); swish(9.15, .35, which=7)   # chip forms
ui(9.55, .45, 'click', 3)                               # check badge
whoosh(9.95, .8, .6)                                    # red circle wipe
for tw in (10.05, 10.35, 10.65, 10.9, 11.05): swish(tw, .22, which=12)
for tw in (10.35, 10.75, 11.05): ui(tw, .35, 'click', 5)          # selection boxes
swish(11.5, .5, which=8); ui(11.55, .4, 'switch', 20)             # toolbar appears
hops = np.floor(np.linspace(0, 9, 200, endpoint=False))
for j in range(9): t_h = 11.75 + j * (13.0 - 11.75) / 9; put(sfx, MOUSE, t_h, .55); put(sfx, MOUSEUP, t_h + .07, .35)
swish(13.2, .4, which=2)
for tw in (13.5, 13.62, 13.74, 13.9, 14.02): swish(tw, .15, which=13)
put(sfx, impact(), 14.5, .7); whoosh(14.5, .7, .45)    # "to play." hit (beat breaks here)
put(sfx, reverse_swell(1.0), 13.5, .25)
swish(15.15, .45, which=5)
for k2 in np.arange(15.8, 21.4, .42): ui(k2, .3, 'click', 8)   # wheel ratchet
for i in range(17): swish(21.65 + i * (26.3 - 21.65) / 17, .3, (-1) ** i * .3, which=i % 13)  # montage cuts
put(sfx, reverse_swell(.9), 25.4, .4)
put(sfx, impact(), 26.3, 1.0); put(bass, b808(note(29), 2.2), 26.3, .9)
for m, d in ((77, 0), (84, .08), (89, .16)): put(mus, bell(note(m), 2.5), 26.3 + d, .09)
for i, m in enumerate([53, 60, 65, 68, 72]): put(mus, pad(note(m), 3.6), 26.4, .02, (i - 2) * .3)
typing(27.2, 28, 28, .45)
ui(28.15, .55, 'switch', 30); swish(28.1, .35, which=10)   # CTA pill
put(sfx, reverse_swell(.6), 29.4, .12)

# ===== mix =====
# sidechain: duck music/pads under kicks in the drop
duck = np.ones(N)
for tb in np.arange(DROP, 26.3, BEAT):
    i = int(tb * SR); n = int(.25 * SR); duck[i:i + n] = np.minimum(duck[i:i + n], 1 - .55 * np.exp(-np.arange(n) / SR / .08))
mus *= duck[:, None]
b2 = band(bass, 25, 500)
mix = reverb(mus, 2.4, .3) + reverb(drums, .8, .08, decay=10) + np.stack([b2, b2], 1) * .95 + reverb(sfx, 1.0, .1) * 2.6
fi = int(SR * .03); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(SR * .5); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.stack([band(mix[:, c], 25, 16000) for c in range(2)], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.8) / np.tanh(1.8) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
w = wave.open(os.path.join(HERE, 'out', 'sound.wav'), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close(); print('ok')
