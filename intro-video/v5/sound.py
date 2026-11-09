# v3 soundtrack: trap-style score (808 slides, hat rolls, FM bell lead) + REAL recorded SFX (CC0, see assets/sfx/LICENSE.txt)
# Output: out/sound.wav — synced to brand.html timings.
import numpy as np, wave, glob, os

SR = 48000; T = 20*60/83; N = int(SR * T)
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
def put_lin(buf, sig, at, g=1.0, pan=0.0):
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


def put(buf, sig, at, g=1.0, pan=0.0):
    """like put_lin but wraps tails past the end back to the start (seamless loop)"""
    at = at % T
    if buf.ndim == 1:
        s = (sig if sig.ndim == 1 else sig.mean(1)) * g
    else:
        s = sig if sig.ndim == 2 else np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
        s = s * g
    i = int(at * SR); n = len(s)
    while n > 0:
        j = min(N, i + n); buf[i:j] += s[:j - i]; s = s[j - i:]; n = len(s); i = 0

def pluck(f, d=.5):
    t = tt(d)
    return sum(np.sin(2*np.pi*f*h*t)*g*np.exp(-t*(7+h*4)) for h, g in ((1,1),(2,.45),(3,.2))) * np.minimum(1, t/.002)
BEAT = 60 / 83; BAR = BEAT * 4
def B(n): return n * BEAT
# C minor lo-fi: Cm9 | Abmaj7 | Fm9 | Ebmaj7 | Gsus->G
CH = [(36, [60, 63, 67, 70, 74]), (32, [56, 60, 63, 67, 72]), (29, [53, 56, 60, 63, 67]), (27, [51, 55, 58, 62, 67]), (31, [55, 60, 62, 65, 71])]
def epiano(f, d):
    t = tt(d); s = np.sin(2 * np.pi * f * t + .9 * np.sin(2 * np.pi * f * t) * np.exp(-t * 4)) * np.exp(-t * 1.2)
    s += .2 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
    return s * np.minimum(1, t / .004) * np.minimum(1, (d - t) / .08) * (1 + .15 * np.sin(2 * np.pi * 4.5 * t))
def lofi_kick():
    t = tt(.45); f = 48 + 110 * np.exp(-t * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .002, .16) * 1.8)
def rim():
    t = tt(.25); n = band(rng.standard_normal(len(t)), 1200, 7000) * env(len(t), .001, .05)
    return n + np.sin(2 * np.pi * 330 * t) * env(len(t), .001, .03) * .5
DIP = (B(11.4), B(13.0))  # selection moment: drums drop out
for bar in range(5):
    root, ch = CH[bar]; t0 = B(bar * 4)
    for i, m in enumerate(ch):
        put(mus, epiano(note(m), BAR + .3), t0 + i * .018, .05, (i - 2) * .25)          # strum
    put(mus, epiano(note(ch[2] + 12), BEAT * 1.5), t0 + B(2.5), .03, .3)                  # answer
    put(bass, b808(note(root), BAR * .9) * .7, t0, .55)
    put(bass, b808(note(root + 7), BEAT * .9) * .7, t0 + B(3), .35)
    for b in range(4):
        tb = t0 + B(b)
        if DIP[0] <= tb < DIP[1]: continue
        if b in (0,) or (b == 2 and bar % 2 == 0): put(drums, lofi_kick(), tb, .8)
        if b == 2 and bar % 2 == 1: put(drums, lofi_kick(), tb + B(.5), .6)
        if b in (1, 3): put(drums, rim(), tb, .45, .05)
        for e in (0, .5):                                         # swung hats
            sw = .58 if e else 0
            put(drums, hat(), tb + B(sw), .13 if e else .19, .25)
# vinyl-ish air bed
air = band(rng.standard_normal(N), 3000, 9000) * .006
mus[:, 0] += air; mus[:, 1] += np.roll(air, 300)

# ----- SFX on the interactions (real recordings) -----
put(sfx, MOUSE, B(.6), .7); put(sfx, MOUSEUP, B(.82), .5)          # press Ship it
ui(B(.85), .5, 'switch', 6); swish(B(.85), .35, which=4)             # Shipped!
swish(B(2.0), .5, which=8, stretch=.8)                               # morph to notification
for i, m in enumerate((84, 91, 96)): put(mus, bell(note(m), 1.2), B(2.5) + i * .06, .05)   # sparkle
for i in range(3): swish(B(3.6) + i * B(.28), .3, which=12); put(mus, pluck(note((72, 76, 79)[i]), .5), B(3.6) + i * B(.28), .1)
put(sfx, MOUSE, B(5.6), .7); put(sfx, MOUSEUP, B(5.85), .5); ui(B(5.62), .35, 'roll', 2)   # open message
swish(B(6.6), .4, which=2)                                            # collapse
ui(B(7.0), .4, 'click', 3)                                            # avatar pop
for k in np.arange(B(7.3), B(8.1), .21): ui(k, .08, 'roll', 4)        # typing dots
put(mus, pluck(note(84), .5), B(8.2), .12); ui(B(8.2), .35, 'switch', 18)     # bubble 1
ui(B(8.7), .35, 'click', 6)                                           # +opportunity tag
put(mus, pluck(note(88), .5), B(9.1), .12); ui(B(9.1), .3, 'switch', 19)      # bubble 2
whoosh(B(9.9), .8, .4)                                                # zoom to headline
swish(B(11.4), .35, which=10, stretch=.6)                             # selection sweep
for i in range(3): key(B(12.5) + i * .05, .5)                         # delete
for i in range(len('What happens after')):
    if i % 2 == 0: key(B(13) + i * B(1.1) / 18, .55)
swish(B(14.15), .3, which=10, stretch=.7)                             # select
swish(B(14.65), .45, which=5)                                         # squash
put(sfx, impact(1.0), B(15), .3); ui(B(15.05), .5, 'switch', 24)      # button pops back
for i, m in enumerate((79, 84, 88)): put(mus, bell(note(m), 1.6), B(16.4) + i * .08, .05)   # brand chime

b2 = band(bass, 25, 400)
mix = reverb(mus, 2.0, .28) + reverb(drums, .6, .06, decay=12) + np.stack([b2, b2], 1) * .8 + reverb(sfx, .9, .1) * 2.2
mix = np.stack([band(mix[:, c], 30, 15000) for c in range(2)], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.5) / np.tanh(1.5) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
w = wave.open(os.path.join(HERE, 'out', 'sound.wav'), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close(); print('ok')
