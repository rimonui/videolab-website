"""Cape Charles LOVE sign travel poster — layered vector SVG generator.

Units: 1 unit = 0.1 mm. Canvas with 3 mm bleed = 2160 x 3030 (216 x 303 mm).
Trim (A4) = 30..2130 x 30..3000.
"""
import math, random, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from shapely.geometry import Polygon, Point, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

FONT_DIR = sys.argv[1]
OUT = sys.argv[2]
MODE = sys.argv[3]  # sunset | day
BLEED_VIEW = len(sys.argv) > 4 and sys.argv[4] == "bleed"

W, H = 2160, 3030
HORIZON = 1640

def f(n):
    s = f"{n:.1f}"
    return s[:-2] if s.endswith(".0") else s

def pts_d(pts, close=True):
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    return d + (" Z" if close else "")

def geom_d(g):
    polys = [g] if isinstance(g, Polygon) else list(getattr(g, "geoms", []))
    out = []
    for p in polys:
        if p.is_empty:
            continue
        out.append(pts_d(list(p.exterior.coords)[:-1]))
        for r in p.interiors:
            out.append(pts_d(list(r.coords)[:-1]))
    return " ".join(out)

# ---------------------------------------------------------------- palettes
PAL = {
 "sunset": dict(
  sky=[(0,'#16234a'),(0.28,'#2c3a76'),(0.50,'#6c4a8e'),(0.68,'#c95f84'),(0.82,'#f2835a'),(0.93,'#fbb262'),(1,'#ffd78a')],
  glow='#ffd27a', sun='#fff0c2', sun_edge='#ffd98a',
  clouds=['#4a3f80','#8d4f8e','#e0708a','#f79a74','#ffc48c'],
  sea=[(0,'#f9b56e'),(0.10,'#e08a78'),(0.35,'#7a5690'),(0.7,'#463f7a'),(1,'#36396a')],
  sea_hi='#ffdc9a', wave='#f3a07e', ship='#3a2b52',
  pier='#3d2e4c', pier_dark='#271d35', rock='#6e5260', rock_hi='#b08378',
  dune='#e59a68', dune_shade='#c27658', grass='#5c5034', grass_hi='#8c7642',
  sand=[(0,'#f2b47c'),(1,'#d08a5e')], wet='#c98066', foam='#ffe6c0', ripple='#e09a6a',
  board='#7a5048', board_dark='#4c3240',
  shadow='#6b3442', shadow_op=0.32,
  L='#2f66b3', L_side='#1d3e78', L_in='#5f5a5a', shells=['#e6dccb','#cfc3b0','#b3a794','#f5ede0','#9c917f','#d8c6ad'],
  O='#26232c', O_side='#121016', O_wall='#3a3440', O_hi='#5a4a58',
  kayak='#e8482e', kayak_side='#9e2a22', kayak_hi='#ff8256', cockpit='#2a1718', bungee='#2a1718',
  E='#f3c74a', E_side='#b8862c', mesh_bg='#4b3f33', mesh='#a39470',
  base='#ece2da', base_top='#fbf3ea', base_side='#bfb0a8', slot='#3b3036',
  rim='#ffb36b',
  title='#fff2d4', title_shadow='#141d42', script='#ffd9a6', kicker='#ffe2b8',
  footer='#141d42', footer_text='#ffe6b8', accent='#f58a55'),
 "day": dict(
  sky=[(0,'#1b5fb0'),(0.40,'#3a8ad3'),(0.78,'#8ac2ea'),(1,'#d8eef8')],
  glow='#ffffff', sun='#fffbe8', sun_edge='#fff1b8',
  clouds=['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff'],
  sea=[(0,'#7fb8dc'),(0.15,'#4e98c8'),(0.6,'#3a8cbc'),(1,'#4fb0c0')],
  sea_hi='#d8f0ff', wave='#bfe4f4', ship='#4a5568',
  pier='#8a7a6a', pier_dark='#5c5046', rock='#7f7a74', rock_hi='#b9b2a8',
  dune='#f3e5c8', dune_shade='#ddc9a3', grass='#7d7d42', grass_hi='#b0a75e',
  sand=[(0,'#f7ecd6'),(1,'#ead6b2')], wet='#dcc49c', foam='#ffffff', ripple='#e2cfa8',
  board='#a89582', board_dark='#76685a',
  shadow='#9a8562', shadow_op=0.38,
  L='#2f82db', L_side='#1d58a0', L_in='#6f6a66', shells=['#eae2d4','#d4cab8','#bab09e','#f8f2e8','#a39a8a','#ddd0bc'],
  O='#2a2a30', O_side='#141418', O_wall='#3c3c44', O_hi='#6a6a74',
  kayak='#e3392a', kayak_side='#a2241c', kayak_hi='#ff6e55', cockpit='#2b1a1a', bungee='#2b1a1a',
  E='#f5d660', E_side='#c9a23a', mesh_bg='#5c5a4c', mesh='#b0aa8c',
  base='#eef0f2', base_top='#ffffff', base_side='#c6ccd2', slot='#3b4048',
  rim='#ffffff',
  title='#ffffff', title_shadow='#0f3566', script='#ffffff', kicker='#e8f4ff',
  footer='#0f3566', footer_text='#ffffff', accent='#f5d660'),
}
P = PAL[MODE]
rnd = random.Random(7)

# ---------------------------------------------------------------- fonts
class Font:
    def __init__(self, path):
        self.f = TTFont(path)
        self.gs = self.f.getGlyphSet()
        self.cmap = self.f.getBestCmap()
        self.upm = self.f['head'].unitsPerEm
        self.hmtx = self.f['hmtx']
    def width(self, text, size, track=0.0):
        s = size / self.upm
        return sum(self.hmtx[self.cmap[ord(c)]][0] * s for c in text) + track * size * (len(text) - 1)
    def path(self, text, x, y, size, track=0.0, anchor="middle"):
        s = size / self.upm
        w = self.width(text, size, track)
        cx = x - w / 2 if anchor == "middle" else x
        pen = SVGPathPen(self.gs, ntos=lambda v: f(v))
        for c in text:
            g = self.cmap[ord(c)]
            self.gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
            cx += self.hmtx[g][0] * s + track * size
        return pen.getCommands()

BEBAS = Font(f"{FONT_DIR}/bebas.woff")
MONT = Font(f"{FONT_DIR}/montserrat700.woff")
MONT6 = Font(f"{FONT_DIR}/montserrat600.woff")
PLAY = Font(f"{FONT_DIR}/playfair500i.woff")

# ---------------------------------------------------------------- svg builder
out = []
defs = []
def add(s): out.append(s)
def grad_lin(id_, stops, x1=0, y1=0, x2=0, y2=1, units=None, extra=""):
    u = f' gradientUnits="userSpaceOnUse"' if units else ""
    st = "".join(f'<stop offset="{o}" stop-color="{c}"{"" if len(s)==2 else f" stop-opacity=\"{s[2]}\""}/>'
                 for s in stops for o, c in [s[:2]])
    defs.append(f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{u}{extra}>{st}</linearGradient>')
def grad_rad(id_, cx, cy, r, stops):
    st = "".join(f'<stop offset="{s[0]}" stop-color="{s[1]}" stop-opacity="{s[2]}"/>' for s in stops)
    defs.append(f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}" gradientUnits="userSpaceOnUse">{st}</radialGradient>')
def clip(id_, d):
    defs.append(f'<clipPath id="{id_}"><path d="{d}"/></clipPath>')

def layer(name):
    add(f'<g id="{name}">')
def end():
    add('</g>')

# ================================================================ 1. SKY
grad_lin("skyGrad", P["sky"], 0, 0, 0, HORIZON, units=True)
layer("01_Sky")
add(f'<rect id="Sky_Gradient" x="0" y="0" width="{W}" height="{HORIZON+20}" fill="url(#skyGrad)"/>')
SUNX, SUNY = 1580, 1585
if MODE == "sunset":
    grad_rad("glowGrad", SUNX, HORIZON, 1100, [(0, P["glow"], 0.85), (0.35, P["glow"], 0.35), (1, P["glow"], 0)])
    add(f'<rect id="Sun_Glow" x="0" y="0" width="{W}" height="{HORIZON+20}" fill="url(#glowGrad)"/>')
else:
    grad_rad("glowGrad", W/2, HORIZON, 1400, [(0, '#ffffff', 0.55), (1, '#ffffff', 0)])
    add(f'<rect id="Horizon_Haze" x="0" y="0" width="{W}" height="{HORIZON+20}" fill="url(#glowGrad)"/>')
end()

# ================================================================ 2. SUN
if MODE == "sunset":
    layer("02_Sun")
    add(f'<circle id="Sun_Halo" cx="{SUNX}" cy="{SUNY}" r="190" fill="{P["sun_edge"]}" opacity="0.35"/>')
    add(f'<circle id="Sun_Disc" cx="{SUNX}" cy="{SUNY}" r="120" fill="{P["sun"]}"/>')
    end()

# ================================================================ 3. CLOUDS
def cloud_streak(cx, cy, length, thick, n=4):
    """Long, soft sunset cloud built from overlapping capsules (one compound shape)."""
    parts = []
    for i in range(n):
        l = length * rnd.uniform(0.45, 1.0)
        t = thick * rnd.uniform(0.6, 1.1)
        ox = rnd.uniform(-length * 0.3, length * 0.3)
        oy = rnd.uniform(-thick * 0.8, thick * 0.8)
        parts.append(affinity.translate(affinity.scale(Point(0, 0).buffer(1, 40), l / 2, t / 2), cx + ox, cy + oy))
    return unary_union(parts).simplify(0.6)

def cloud_puff(cx, cy, w, h):
    parts = [affinity.translate(affinity.scale(Point(0, 0).buffer(1, 40), w / 2, h * 0.28), cx, cy + h * 0.2)]
    k = 6
    for i in range(k):
        x = cx - w * 0.38 + w * 0.76 * i / (k - 1) + rnd.uniform(-20, 20)
        r = h * (0.30 + 0.32 * math.sin(math.pi * (i + 0.5) / k)) * rnd.uniform(0.85, 1.1)
        parts.append(Point(x, cy + h * 0.25 - r * 0.9).buffer(r, 40))
    g = unary_union(parts)
    return g.intersection(Polygon([(cx - w, cy - h * 2), (cx + w, cy - h * 2), (cx + w, cy + h * 0.45), (cx - w, cy + h * 0.45)])).simplify(0.6)

layer("03_Clouds")
if MODE == "sunset":
    specs = [  # (y, x, len, thick, color idx, opacity)
        (1000, 1700, 900, 40, 0, 0.55), (1080, 420, 800, 34, 0, 0.5),
        (1210, 1250, 1100, 38, 1, 0.55), (1300, 300, 700, 30, 1, 0.5),
        (1390, 1850, 700, 30, 2, 0.6), (1440, 800, 900, 26, 2, 0.6),
        (1515, 250, 600, 22, 3, 0.7), (1540, 1200, 700, 20, 3, 0.65),
        (1600, 600, 500, 14, 4, 0.75), (1590, 1980, 420, 14, 4, 0.75)]
    for i, (y, x, l, t, ci, op) in enumerate(specs):
        add(f'<path id="Cloud_{i+1:02d}" d="{geom_d(cloud_streak(x, y, l, t))}" fill="{P["clouds"][ci]}" opacity="{op}"/>')
else:
    for i, (x, y, w, h, op) in enumerate([(380, 1120, 620, 200, 0.95), (1780, 1010, 760, 240, 0.95),
                                          (1150, 1380, 520, 150, 0.9), (220, 1500, 420, 110, 0.85),
                                          (1950, 1480, 480, 120, 0.85), (900, 1560, 360, 80, 0.8)]):
        g = cloud_puff(x, y, w, h)
        add(f'<g id="Cloud_{i+1:02d}"><path d="{geom_d(g)}" fill="#ffffff" opacity="{op}"/>'
            f'<path d="{geom_d(g.intersection(Polygon([(x-w,y+h*0.15),(x+w,y+h*0.15),(x+w,y+h),(x-w,y+h)])))}" fill="#d3e5f3" opacity="{op}"/></g>')
    for i, (y, x, l) in enumerate([(1290, 700, 700), (1660-420, 1650, 500)]):
        add(f'<path id="Cirrus_{i+1}" d="{geom_d(cloud_streak(x, y, l, 18))}" fill="#ffffff" opacity="0.45"/>')
end()

# ================================================================ 4. BIRDS
layer("04_Birds")
bird_col = P["title_shadow"] if MODE == "sunset" else "#1d3f6e"
for i, (x, y, s) in enumerate([(560, 1180, 1.0), (640, 1235, 0.75), (500, 1265, 0.6), (1830, 1300, 0.7)]):
    w = 34 * s
    d = (f"M{f(x-w)},{f(y-6*s)} Q{f(x-w*0.5)},{f(y-16*s)} {f(x)},{f(y)} "
         f"Q{f(x+w*0.5)},{f(y-16*s)} {f(x+w)},{f(y-6*s)} Q{f(x+w*0.5)},{f(y-9*s)} {f(x)},{f(y+5*s)} "
         f"Q{f(x-w*0.5)},{f(y-9*s)} {f(x-w)},{f(y-6*s)} Z")
    add(f'<path id="Gull_{i+1}" d="{d}" fill="{bird_col}" opacity="0.85"/>')
end()

# ================================================================ 5. SEA
grad_lin("seaGrad", P["sea"], 0, HORIZON, 0, 2450, units=True)
layer("05_Sea")
add(f'<rect id="Sea_Base" x="0" y="{HORIZON}" width="{W}" height="{2500-HORIZON}" fill="url(#seaGrad)"/>')
# sun / sky reflection
refl = []
rx_c = SUNX if MODE == "sunset" else 1100
for i in range(34):
    y = HORIZON + 6 + i * i * 0.42 + i * 4
    if y > 2060: break
    half = (150 - i * 2.2) * rnd.uniform(0.5, 1.0)
    x0 = rx_c + rnd.uniform(-25, 25) - half
    th = 3 + i * 0.25
    refl.append(f"M{f(x0)},{f(y)} h{f(half*2)} a{f(th/2)},{f(th/2)} 0 0 1 0,{f(th)} h{f(-half*2)} a{f(th/2)},{f(th/2)} 0 0 1 0,{f(-th)} Z")
add(f'<path id="Sun_Reflection" d="{" ".join(refl)}" fill="{P["sea_hi"]}" opacity="{0.85 if MODE=="sunset" else 0.45}"/>')
waves = []
for i in range(140):
    y = HORIZON + 20 + (rnd.random() ** 1.6) * 700
    sc = 0.4 + (y - HORIZON) / 700 * 1.6
    x = rnd.uniform(0, W)
    l = rnd.uniform(20, 60) * sc
    th = 1.2 * sc
    waves.append(f"M{f(x)},{f(y)} h{f(l)} a{f(th)},{f(th)} 0 0 1 0,{f(th*2)} h{f(-l)} a{f(th)},{f(th)} 0 0 1 0,{f(-th*2)} Z")
add(f'<path id="Wave_Highlights" d="{" ".join(waves)}" fill="{P["wave"]}" opacity="0.5"/>')
# distant breakwater + ships on the horizon
add(f'<path id="Distant_Breakwater" d="M0,{HORIZON-3} H760 L775,{HORIZON+2} H0 Z" fill="{P["ship"]}" opacity="0.8"/>')
ships = []
def cargo(x, s):
    y = HORIZON
    return (f"M{f(x)},{f(y)} l{f(8*s)},{f(-9*s)} h{f(96*s)} l{f(4*s)},{f(-5*s)} h{f(8*s)} l{f(-4*s)},{f(14*s)} Z "
            f"M{f(x+86*s)},{f(y-9*s)} v{f(-14*s)} h{f(14*s)} v{f(14*s)} Z M{f(x+20*s)},{f(y-9*s)} v{f(-6*s)} h{f(56*s)} v{f(6*s)} Z")
for x, s in [(240, 1.0), (560, 0.8), (1050, 0.9), (1960, 0.7)]:
    ships.append(cargo(x, s))
add(f'<path id="Cargo_Ships" d="{" ".join(ships)}" fill="{P["ship"]}" opacity="0.85"/>')
# tall ship (schooner) like in the client photo
tx, ty = 1290, HORIZON
ts = (f"M{tx-40},{ty-4} h80 l-8,8 h-64 Z "
      f"M{tx-24},{ty-6} l2,-52 l18,0 l-4,52 Z M{tx-2},{ty-6} l2,-62 l20,0 l-4,62 Z M{tx+22},{ty-6} l2,-48 l16,0 l-4,48 Z "
      f"M{tx-40},{ty-6} l-14,-30 l30,30 Z")
add(f'<path id="Tall_Ship" d="{ts}" fill="{P["ship"]}" opacity="0.85"/>')
end()

# ================================================================ 6. FISHING PIER
PIER_A = (150, 1745)    # far (sea) end
PIER_B = (1470, 1935)   # shore end
def pier_at(s):  # s: 0 far end .. 1 shore end
    return (PIER_A[0] + (PIER_B[0] - PIER_A[0]) * s, PIER_A[1] + (PIER_B[1] - PIER_A[1]) * s)
def sc(s): return 0.35 + 0.65 * s
layer("06_Fishing_Pier")
deck_top = [pier_at(s) for s in (0, 1)]
th = lambda s: 6 + 14 * s
deck = [deck_top[0], deck_top[1], (PIER_B[0], PIER_B[1] + th(1)), (PIER_A[0], PIER_A[1] + th(0))]
piles, rails = [], []
n = 46
for i in range(n + 1):
    s = (i / n) ** 1.15
    x, y = pier_at(s)
    pw, ph = 2 + 4 * sc(s), 18 + 46 * s
    piles.append(f"M{f(x-pw/2)},{f(y+th(s))} h{f(pw)} v{f(ph)} h{f(-pw)} Z")
    rh = 10 + 24 * s
    rw = 1.2 + 2.2 * s
    rails.append(f"M{f(x-rw/2)},{f(y)} h{f(rw)} v{f(-rh)} h{f(-rw)} Z")
# cross bracing under deck
br = []
for i in range(0, n, 2):
    s1, s2 = (i / n) ** 1.15, ((i + 2) / n) ** 1.15
    x1, y1 = pier_at(s1); x2, y2 = pier_at(s2)
    br.append(f"M{f(x1)},{f(y1+th(s1))} L{f(x2)},{f(y2+th(s2)+30*s2)}")
add(f'<path id="Pier_Pilings" d="{" ".join(piles)}" fill="{P["pier_dark"]}"/>')
add(f'<path id="Pier_Bracing" d="{" ".join(br)}" fill="none" stroke="{P["pier_dark"]}" stroke-width="2" opacity="0.7"/>')
add(f'<path id="Pier_Deck" d="{pts_d(deck)}" fill="{P["pier"]}"/>')
add(f'<path id="Pier_Rail_Posts" d="{" ".join(rails)}" fill="{P["pier"]}"/>')
rail_top = [(x, y - (10 + 24 * s)) for s in (0, 1) for x, y in [pier_at(s)]]
rail_mid = [(x, y - (5 + 12 * s)) for s in (0, 1) for x, y in [pier_at(s)]]
for nm, line in [("Pier_Top_Rail", rail_top), ("Pier_Mid_Rail", rail_mid)]:
    a, b = line
    add(f'<path id="{nm}" d="M{f(a[0])},{f(a[1])} L{f(b[0])},{f(b[1])} L{f(b[0])},{f(b[1]+4)} L{f(a[0])},{f(a[1]+1.6)} Z" fill="{P["pier"]}"/>')
# shelter hut near the far end + T-head
hx, hy = pier_at(0.06)
add(f'<g id="Pier_Shelter">'
    f'<path d="M{f(hx-70)},{f(hy-2)} h150 v8 h-150 Z" fill="{P["pier"]}"/>'
    f'<path d="M{f(hx-46)},{f(hy-2)} v-44 h6 v44 Z M{f(hx+52)},{f(hy-2)} v-44 h6 v44 Z" fill="{P["pier_dark"]}"/>'
    f'<path d="M{f(hx-62)},{f(hy-44)} L{f(hx+6)},{f(hy-70)} L{f(hx+74)},{f(hy-44)} Z" fill="{P["pier_dark"]}"/>'
    f'</g>')
# light pole
lx, ly = pier_at(0.32)
add(f'<path id="Pier_Lamp" d="M{f(lx-1.5)},{f(ly)} v-60 h3 v60 Z M{f(lx-6)},{f(ly-66)} h12 v8 h-12 Z" fill="{P["pier_dark"]}"/>')
end()

# ================================================================ 7. LAND: beach, dunes, rocks
SHORE = [(-20, 2390), (300, 2260), (700, 2130), (1100, 2025), (1470, 1950), (1800, 1880), (2180, 1790)]
def smooth_d(points):
    """Catmull-Rom -> cubic Bezier path through points (open)."""
    d = f"M{f(points[0][0])},{f(points[0][1])}"
    for i in range(len(points) - 1):
        p0 = points[i - 1] if i > 0 else points[i]
        p1, p2 = points[i], points[i + 1]
        p3 = points[i + 2] if i + 2 < len(points) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{f(c1[0])},{f(c1[1])} {f(c2[0])},{f(c2[1])} {f(p2[0])},{f(p2[1])}"
    return d

grad_lin("sandGrad", P["sand"], 0, 1850, 0, 3030, units=True)
layer("07_Beach")
shore_d = smooth_d(SHORE)
add(f'<path id="Shallow_Water" d="{smooth_d([(x, y-38) for x, y in SHORE])} L2180,{W} L-20,{W} Z" fill="{P["sea_hi"]}" opacity="{0.18 if MODE=="sunset" else 0.35}"/>')
add(f'<path id="Foam_Line" d="{smooth_d([(x, y-10) for x, y in SHORE])} L2180,3040 L-20,3040 Z" fill="{P["foam"]}" opacity="0.85"/>')
add(f'<path id="Wet_Sand" d="{smooth_d([(x, y-2) for x, y in SHORE])} L2180,3040 L-20,3040 Z" fill="{P["wet"]}"/>')
add(f'<path id="Dry_Sand" d="{smooth_d([(x, y+26 + (6 if i % 2 else -4)) for i, (x, y) in enumerate(SHORE)])} L2180,3040 L-20,3040 Z" fill="url(#sandGrad)"/>')
# sand ripples
rip = []
for i in range(70):
    x = rnd.uniform(-20, W); y = rnd.uniform(2150, 2860)
    l = rnd.uniform(60, 180); bend = rnd.uniform(-8, 8)
    rip.append(f"M{f(x)},{f(y)} q{f(l/2)},{f(bend-6)} {f(l)},{f(bend)} q{f(-l/2)},{f(-bend-3)} {f(-l)},{f(-bend)} Z")
add(f'<path id="Sand_Ripples" d="{" ".join(rip)}" fill="{P["ripple"]}" opacity="0.55"/>')
end()

layer("08_Dunes")
dune1 = [(1420, 1990), (1600, 1860), (1760, 1770), (1930, 1735), (2060, 1700), (2180, 1690), (2180, 2060), (1420, 2060)]
dune2 = [(1700, 2010), (1840, 1890), (2000, 1840), (2180, 1830), (2180, 2120), (1700, 2120)]
add(f'<path id="Dune_Back" d="{smooth_d(dune1[:6])} L2180,2060 L1420,2060 Z" fill="{P["dune_shade"]}"/>')
add(f'<path id="Dune_Front" d="{smooth_d(dune2[:4])} L2180,2120 L1700,2120 Z" fill="{P["dune"]}"/>')
end()

# rock jetty (riprap) along the shore by the pier
layer("09_Rock_Jetty")
rocks, rocks_hi, rocks_sh = [], [], []
def shore_y(x):
    for (x1, y1), (x2, y2) in zip(SHORE, SHORE[1:]):
        if x1 <= x <= x2:
            return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
    return SHORE[-1][1]
for row, (x0, x1, n, rmin, rmax, dy) in enumerate([(1010, 1500, 26, 14, 22, -14), (980, 1490, 30, 16, 26, 2)]):
    for i in range(n):
        x = x0 + (x1 - x0) * i / (n - 1) + rnd.uniform(-8, 8)
        y = shore_y(x) + dy + rnd.uniform(-4, 4)
        r = rnd.uniform(rmin, rmax)
        g = affinity.rotate(affinity.scale(Point(x, y).buffer(r, 10), 1.3, 0.75), rnd.uniform(-20, 20)).simplify(1.0)
        rocks_sh.append(geom_d(affinity.translate(g, 3, 6)))
        rocks.append(geom_d(g))
        rocks_hi.append(geom_d(g.intersection(affinity.translate(g, -r * 0.35, -r * 0.4)).simplify(1.0)))
add(f'<path id="Rock_Shadows" d="{" ".join(rocks_sh)}" fill="{P["pier_dark"]}" opacity="0.35"/>')
add(f'<path id="Rocks" d="{" ".join(rocks)}" fill="{P["rock"]}"/>')
add(f'<path id="Rock_Highlights" d="{" ".join(rocks_hi)}" fill="{P["rock_hi"]}" opacity="0.8"/>')
end()

# ---------------------------------------------------------------- grass helper
def tuft(x, y, h, n=9, lean=0.0, spread=1.0):
    blades = []
    for i in range(n):
        a = (i / (n - 1) - 0.5) * 1.3 * spread + lean + rnd.uniform(-0.12, 0.12)
        L = h * rnd.uniform(0.55, 1.0)
        bw = max(2.2, h * 0.045)
        tipx = x + math.sin(a) * L
        tipy = y - math.cos(a) * L
        cx_ = x + math.sin(a) * L * 0.5 - a * L * 0.15
        cy_ = y - math.cos(a) * L * 0.55
        blades.append(f"M{f(x-bw)},{f(y)} Q{f(cx_-bw*0.5)},{f(cy_)} {f(tipx)},{f(tipy)} Q{f(cx_+bw*0.5)},{f(cy_)} {f(x+bw)},{f(y)} Z")
    return " ".join(blades)
def seed_heads(x, y, h, n=3):
    out_ = []
    for i in range(n):
        a = rnd.uniform(-0.4, 0.4)
        L = h * rnd.uniform(0.9, 1.25)
        tx_, ty_ = x + math.sin(a) * L, y - math.cos(a) * L
        out_.append(f"M{f(x)},{f(y)} L{f(tx_)},{f(ty_)} L{f(tx_+1.5)},{f(ty_)} L{f(x+1.5)},{f(y)} Z")
        out_.append(f"M{f(tx_-3)},{f(ty_+2)} q3,-26 6,0 q-3,12 -6,0 Z")
    return " ".join(out_)

# ================================================================ 10. BOARDWALK
layer("10_Boardwalk")
segs = [((2190, 2520), (1830, 2230), 38, 22), ((1830, 2230), (2030, 2040), 22, 15), ((2030, 2040), (1880, 1905), 15, 10)]
deck_d, edge_d, posts_d, rail_d = [], [], [], []
for (a, b, wa, wb) in segs:
    deck_d.append(pts_d([a, b, (b[0], b[1] + wb), (a[0], a[1] + wa)]))
    edge_d.append(pts_d([(a[0], a[1] + wa), (b[0], b[1] + wb), (b[0], b[1] + wb * 1.35), (a[0], a[1] + wa * 1.35)]))
    npost = 9
    for k in range(npost + 1):
        t = k / npost
        x = a[0] + (b[0] - a[0]) * t
        y = a[1] + (b[1] - a[1]) * t
        w_ = wa + (wb - wa) * t
        ph = w_ * 1.5
        pw = max(2.5, w_ * 0.16)
        for yy in (y, y + w_):  # far rail + near rail
            posts_d.append(f"M{f(x-pw/2)},{f(yy)} h{f(pw)} v{f(-ph)} h{f(-pw)} Z")
    for off in (0, 1):
        ya, yb = a[1] + wa * off, b[1] + wb * off
        rail_d.append(pts_d([(a[0], ya - wa * 1.5), (b[0], yb - wb * 1.5), (b[0], yb - wb * 1.36), (a[0], ya - wa * 1.36)]))
        rail_d.append(pts_d([(a[0], ya - wa * 0.85), (b[0], yb - wb * 0.85), (b[0], yb - wb * 0.75), (a[0], ya - wa * 0.75)]))
add(f'<path id="Boardwalk_Deck_Edge" d="{" ".join(edge_d)}" fill="{P["board_dark"]}"/>')
add(f'<path id="Boardwalk_Deck" d="{" ".join(deck_d)}" fill="{P["board"]}"/>')
add(f'<path id="Boardwalk_Posts" d="{" ".join(posts_d)}" fill="{P["board_dark"]}"/>')
add(f'<path id="Boardwalk_Rails" d="{" ".join(rail_d)}" fill="{P["board"]}"/>')
end()

layer("11_Dune_Grass")
g_d, g2_d, sh_d = [], [], []
for x, y, h in [(1560, 1915, 70), (1640, 1880, 90), (1720, 1830, 80), (1790, 1800, 100), (1900, 1770, 85), (2000, 1745, 95),
                (2090, 1735, 80), (2150, 1730, 90), (1760, 1990, 110), (1900, 2010, 120), (2110, 1900, 120),
                (2150, 2130, 150), (1960, 2150, 130), (1700, 2080, 90), (1500, 1990, 60), (1380, 2010, 55)]:
    g_d.append(tuft(x, y, h, n=9 + int(h / 30)))
    g2_d.append(tuft(x + 10, y + 3, h * 0.7, n=5, lean=0.25))
    sh_d.append(seed_heads(x + 4, y, h * 1.05, n=2))
add(f'<path id="Grass_Dark" d="{" ".join(g_d)}" fill="{P["grass"]}"/>')
add(f'<path id="Grass_Light" d="{" ".join(g2_d)}" fill="{P["grass_hi"]}"/>')
add(f'<path id="Sea_Oats" d="{" ".join(sh_d)}" fill="{P["grass_hi"]}"/>')
end()

# ================================================================ 12. LOVE SIGN
BASE_Y = 2600          # letters stand on this line
LH = 520               # letter height
TOP = BASE_Y - LH
D = (18, -14)          # extrusion (depth) vector — viewer sees right side + top
def extrude(poly, d=D):
    parts = [poly, affinity.translate(poly, *d)]
    c = list(poly.exterior.coords)
    for p, q in zip(c, c[1:]):
        quad = Polygon([p, q, (q[0] + d[0], q[1] + d[1]), (p[0] + d[0], p[1] + d[1])])
        if quad.area > 0.01:
            parts.append(quad)
    return unary_union(parts).difference(poly).buffer(0.01).buffer(-0.01)

# letter outlines
Lx = 330
L_out = Polygon([(Lx, TOP), (Lx+140, TOP), (Lx+140, BASE_Y-118), (Lx+270, BASE_Y-118), (Lx+270, BASE_Y), (Lx, BASE_Y)])
L_in = L_out.buffer(-22, join_style=2)
OCX, OCY, OR, ORI = 850, BASE_Y - 262, 262, 118
Ex = 1490
E_out = Polygon([(Ex, TOP), (Ex+290, TOP), (Ex+290, TOP+108), (Ex+124, TOP+108), (Ex+124, TOP+206), (Ex+250, TOP+206),
                 (Ex+250, TOP+314), (Ex+124, TOP+314), (Ex+124, BASE_Y-108), (Ex+290, BASE_Y-108), (Ex+290, BASE_Y), (Ex, BASE_Y)])
E_in = E_out.buffer(-22, join_style=2)

def kayak_geom(B, T, Wd):
    """Returns (path d, shapely polygon, frame fn) for a kayak from bottom tip B to top tip T."""
    Lk = math.dist(B, T)
    u = ((T[0]-B[0])/Lk, (T[1]-B[1])/Lk)
    nrm = (-u[1], u[0])
    def P_(a, w): return (B[0] + u[0]*a + nrm[0]*w, B[1] + u[1]*a + nrm[1]*w)
    c = [P_(0.10*Lk, Wd*1.25), P_(0.58*Lk, Wd*1.0), P_(0.10*Lk, -Wd*1.25), P_(0.58*Lk, -Wd*1.0)]
    d = (f"M{f(B[0])},{f(B[1])} C{f(c[0][0])},{f(c[0][1])} {f(c[1][0])},{f(c[1][1])} {f(T[0])},{f(T[1])} "
         f"C{f(c[3][0])},{f(c[3][1])} {f(c[2][0])},{f(c[2][1])} {f(B[0])},{f(B[1])} Z")
    # sampled polygon (for shadow / half-width lookup)
    def bez(t, p0, p1, p2, p3):
        m = 1 - t
        return tuple(m**3*p0[i] + 3*m*m*t*p1[i] + 3*m*t*t*p2[i] + t**3*p3[i] for i in (0, 1))
    side1 = [bez(i/40, B, c[0], c[1], T) for i in range(41)]
    side2 = [bez(i/40, T, c[3], c[2], B) for i in range(41)]
    poly = Polygon(side1 + side2[1:])
    return d, poly, P_, Lk, side1

def kayak_halfwidth(side1, P_, a, B, u):
    # nearest sampled point along axis
    best = min(side1, key=lambda p: abs((p[0]-B[0])*u[0] + (p[1]-B[1])*u[1] - a))
    return abs((best[0]-B[0])*(-u[1]) + (best[1]-B[1])*u[0])

VB = BASE_Y - 4
K1 = ((1268, VB), (1140, TOP - 70))
K2 = ((1302, VB), (1440, TOP - 70))

# ---- shadow (projected away from the light)
def project(poly):
    if MODE == "sunset":
        lx_, k_x, k_y = SUNX, -0.0, 0.52
    else:
        lx_, k_x, k_y = 1600, 0.0, 0.30
    def m(x, y):
        hgt = (BASE_Y - y) / LH
        sx = x + (x - lx_) * 0.22 * hgt + (-160 if MODE == "sunset" else -120) * hgt
        sy = BASE_Y + 70 + (BASE_Y - y) * k_y
        return (sx, sy)
    return Polygon([m(x, y) for x, y in poly.exterior.coords])

kd1, kp1, kP1, kL1, ks1 = kayak_geom(K1[0], K1[1], 62)
kd2, kp2, kP2, kL2, ks2 = kayak_geom(K2[0], K2[1], 62)
O_poly = Point(OCX, OCY).buffer(OR, 64)
O_hole = Point(OCX, OCY).buffer(ORI, 64)
shadow_parts = [project(L_out), project(Polygon(list(O_poly.exterior.coords))), project(kp1), project(kp2), project(E_out)]
shadow = unary_union(shadow_parts)
hole_sh = project(Polygon(list(O_hole.exterior.coords)))
shadow = shadow.difference(hole_sh)
base_front = Polygon([(290, BASE_Y + 4), (1830, BASE_Y + 4), (1830, BASE_Y + 74), (290, BASE_Y + 74)])
base_sh = Polygon([(290, BASE_Y + 74), (1830, BASE_Y + 74), (1790, BASE_Y + 110), (250, BASE_Y + 110)])
shadow = unary_union([shadow, base_sh]).simplify(0.8)
grad_lin("shadowGrad", [(0, P["shadow"], 1), (1, P["shadow"], 0.15)], 0, BASE_Y + 60, 0, 2900, units=True)
layer("12_Sign_Shadow")
add(f'<path id="Cast_Shadow" d="{geom_d(shadow)}" fill="url(#shadowGrad)" opacity="{P["shadow_op"]}" fill-rule="evenodd"/>')
end()

# grass behind the sign
layer("13_Grass_Behind_Sign")
gb = []
for x, y, h in [(300, 2560, 120), (380, 2540, 90), (620, 2560, 100), (1110, 2550, 120), (1460, 2545, 110), (1820, 2560, 130), (1880, 2570, 100)]:
    gb.append(tuft(x, y, h, n=11))
add(f'<path id="Grass_Behind" d="{" ".join(gb)}" fill="{P["grass"]}" opacity="0.9"/>')
end()

layer("14_LOVE_Sign")
# ---- base platform (4 modules)
add('<g id="Sign_Base">')
top_face = Polygon([(290, BASE_Y + 4), (1830, BASE_Y + 4), (1830 + D[0]*1.8, BASE_Y + 4 + D[1]*1.8), (290 + D[0]*1.8, BASE_Y + 4 + D[1]*1.8)])
side_face = Polygon([(1830, BASE_Y + 4), (1830 + D[0]*1.8, BASE_Y + 4 + D[1]*1.8), (1830 + D[0]*1.8, BASE_Y + 74 + D[1]*1.8), (1830, BASE_Y + 74)])
add(f'<path id="Base_Top" d="{geom_d(top_face)}" fill="{P["base_top"]}"/>')
add(f'<path id="Base_Side" d="{geom_d(side_face)}" fill="{P["base_side"]}"/>')
add(f'<path id="Base_Front" d="{geom_d(base_front)}" fill="{P["base"]}"/>')
seams, slots = [], []
for i in range(1, 4):
    x = 290 + (1830 - 290) * i / 4
    seams.append(f"M{f(x-1.5)},{f(BASE_Y+4)} h3 v70 h-3 Z")
for i in range(4):
    x0 = 290 + (1830 - 290) * i / 4
    for k in (0.28, 0.72):
        x = x0 + (1830 - 290) / 4 * k
        slots.append(f"M{f(x-20)},{f(BASE_Y+52)} h40 v14 h-40 Z")
add(f'<path id="Base_Seams" d="{" ".join(seams)}" fill="{P["base_side"]}"/>')
add(f'<path id="Base_Slots" d="{" ".join(slots)}" fill="{P["slot"]}"/>')
add('</g>')

# ---- L : blue frame filled with oyster shells
add('<g id="Letter_L_Oyster_Shells">')
add(f'<path id="L_Depth" d="{geom_d(extrude(L_out))}" fill="{P["L_side"]}"/>')
add(f'<path id="L_Frame" d="{geom_d(L_out.difference(L_in))}" fill="{P["L"]}"/>')
clip("clipL", geom_d(L_in))
add(f'<g id="L_Shells" clip-path="url(#clipL)">')
add(f'<path d="{geom_d(L_in)}" fill="{P["L_in"]}"/>')
minx, miny, maxx, maxy = L_in.bounds
shell_paths = {c: [] for c in P["shells"]}
for i in range(520):
    x = rnd.uniform(minx - 10, maxx + 10); y = rnd.uniform(miny - 10, maxy + 10)
    if not L_in.buffer(14).contains(Point(x, y)): continue
    rx, ry = rnd.uniform(9, 17), rnd.uniform(6, 11)
    g = affinity.rotate(affinity.scale(Point(x, y).buffer(1, 8), rx, ry), rnd.uniform(0, 180))
    shell_paths[rnd.choice(P["shells"])].append(geom_d(g))
for ci, (c, ds) in enumerate(shell_paths.items()):
    add(f'<path id="Shells_Tone_{ci+1}" d="{" ".join(ds)}" fill="{c}"/>')
# inner shadow for depth
add(f'<path id="L_Inner_Shadow" d="{geom_d(L_in.difference(affinity.translate(L_in, 10, 12)))}" fill="#000000" opacity="0.35"/>')
add('</g>')
add(f'<path id="L_Rim_Light" d="{geom_d(L_out.difference(affinity.translate(L_out, -4, 5)).intersection(L_out.buffer(0.5)))}" fill="{P["rim"]}" opacity="0.6"/>')
add('</g>')

# ---- O : tractor tyre
add('<g id="Letter_O_Tractor_Tire">')
tread_side = Point(OCX + D[0], OCY + D[1]).buffer(OR - 4, 64)
add(f'<path id="Tire_Tread_Depth" d="{geom_d(unary_union([tread_side, O_poly]).convex_hull.difference(O_poly))}" fill="{P["O_side"]}"/>')
lugs = []
NL = 34
for i in range(NL):
    a0 = 2 * math.pi * i / NL
    sk = 0.05 if i % 2 else -0.05
    r1, r2, aw = OR - 20, OR + 14, 0.062
    pts = [(OCX + r1*math.cos(a0-aw), OCY + r1*math.sin(a0-aw)), (OCX + r2*math.cos(a0-aw*0.7+sk), OCY + r2*math.sin(a0-aw*0.7+sk)),
           (OCX + r2*math.cos(a0+aw*0.7+sk), OCY + r2*math.sin(a0+aw*0.7+sk)), (OCX + r1*math.cos(a0+aw), OCY + r1*math.sin(a0+aw))]
    lugs.append(pts_d(pts))
add(f'<path id="Tire_Lugs" d="{" ".join(lugs)}" fill="{P["O"]}"/>')
ring = O_poly.difference(O_hole)
add(f'<path id="Tire_Sidewall" d="{geom_d(ring)}" fill="{P["O"]}" fill-rule="evenodd"/>')
wall = Point(OCX, OCY).buffer(OR - 46, 64).difference(Point(OCX, OCY).buffer(ORI + 26, 64))
add(f'<path id="Tire_Inner_Wall" d="{geom_d(wall)}" fill="{P["O_wall"]}" fill-rule="evenodd"/>')
bead = Point(OCX, OCY).buffer(ORI + 14, 64).difference(Point(OCX, OCY).buffer(ORI + 6, 64))
add(f'<path id="Tire_Bead" d="{geom_d(bead)}" fill="{P["O_hi"]}" fill-rule="evenodd" opacity="0.8"/>')
# rim light on upper-right of the tyre
arc = Point(OCX, OCY).buffer(OR + 2, 64).difference(Point(OCX - 6, OCY + 7).buffer(OR, 64))
add(f'<path id="Tire_Rim_Light" d="{geom_d(arc)}" fill="{P["rim"]}" opacity="0.55"/>')
hole_light = Point(OCX, OCY).buffer(ORI, 64).difference(Point(OCX + 7, OCY + 6).buffer(ORI, 64))
add(f'<path id="Tire_Hole_Edge" d="{geom_d(hole_light)}" fill="{P["O_side"]}"/>')
add('</g>')

# ---- V : two kayaks
def kayak_svg(name, kd, kp, kP_, kL, ks, B, T, flip):
    u = ((T[0]-B[0])/kL, (T[1]-B[1])/kL)
    s = []
    s.append(f'<g id="{name}">')
    s.append(f'<path id="{name}_Depth" d="{geom_d(extrude(kp, (D[0]*0.6, D[1]*0.6)))}" fill="{P["kayak_side"]}"/>')
    s.append(f'<path id="{name}_Hull" d="{kd}" fill="{P["kayak"]}"/>')
    # highlight stripe along one side
    hl = kp.difference(affinity.translate(kp, 9 * flip, 4))
    s.append(f'<path id="{name}_Highlight" d="{geom_d(hl)}" fill="{P["kayak_hi"]}" opacity="0.9"/>')
    # deck ridge
    a1, a2 = kP_(0.06*kL, 0), kP_(0.94*kL, 0)
    s.append(f'<path id="{name}_Ridge" d="M{f(a1[0])},{f(a1[1])} L{f(a2[0])},{f(a2[1])}" fill="none" stroke="{P["kayak_side"]}" stroke-width="2.5" opacity="0.6"/>')
    # bungee cords
    bl = []
    for (a0, a1_, nz) in [(0.10, 0.30, 5), (0.60, 0.84, 5)]:
        pts = []
        for k in range(nz + 1):
            a = kL * (a0 + (a1_ - a0) * k / nz)
            hw = kayak_halfwidth(ks, kP_, a, B, u) * 0.78
            pts.append(kP_(a, hw if k % 2 else -hw))
        bl.append("M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts))
        # deck-line along edges
        p1, p2 = kP_(kL*a0, kayak_halfwidth(ks, kP_, kL*a0, B, u)*0.8), kP_(kL*a1_, kayak_halfwidth(ks, kP_, kL*a1_, B, u)*0.8)
        q1, q2 = kP_(kL*a0, -kayak_halfwidth(ks, kP_, kL*a0, B, u)*0.8), kP_(kL*a1_, -kayak_halfwidth(ks, kP_, kL*a1_, B, u)*0.8)
        bl.append(f"M{f(p1[0])},{f(p1[1])} L{f(p2[0])},{f(p2[1])} M{f(q1[0])},{f(q1[1])} L{f(q2[0])},{f(q2[1])}")
    s.append(f'<path id="{name}_Bungees" d="{" ".join(bl)}" fill="none" stroke="{P["bungee"]}" stroke-width="2.6" stroke-linejoin="round" opacity="0.85"/>')
    # cockpit
    cxk, cyk = kP_(0.44 * kL, 0)
    ang = math.degrees(math.atan2(u[1], u[0]))
    hw = kayak_halfwidth(ks, kP_, 0.44 * kL, B, u)
    s.append(f'<ellipse id="{name}_Cockpit_Rim" cx="{f(cxk)}" cy="{f(cyk)}" rx="{f(kL*0.13)}" ry="{f(hw*0.62)}" transform="rotate({f(ang)} {f(cxk)} {f(cyk)})" fill="{P["kayak_side"]}"/>')
    s.append(f'<ellipse id="{name}_Cockpit" cx="{f(cxk)}" cy="{f(cyk)}" rx="{f(kL*0.115)}" ry="{f(hw*0.5)}" transform="rotate({f(ang)} {f(cxk)} {f(cyk)})" fill="{P["cockpit"]}"/>')
    # bow toggle handle
    hx_, hy_ = kP_(0.975 * kL, 0)
    s.append(f'<circle id="{name}_Toggle" cx="{f(hx_)}" cy="{f(hy_)}" r="5" fill="none" stroke="{P["bungee"]}" stroke-width="2.5"/>')
    s.append('</g>')
    return "".join(s)
add('<g id="Letter_V_Kayaks">')
add(kayak_svg("Kayak_Left", kd1, kp1, kP1, kL1, ks1, K1[0], K1[1], -1))
add(kayak_svg("Kayak_Right", kd2, kp2, kP2, kL2, ks2, K2[0], K2[1], 1))
add('</g>')

# ---- E : yellow frame with crab-pot wire mesh
add('<g id="Letter_E_Crab_Pot">')
add(f'<path id="E_Depth" d="{geom_d(extrude(E_out))}" fill="{P["E_side"]}"/>')
clip("clipE", geom_d(E_in))
add('<g id="E_Crab_Pot_Mesh" clip-path="url(#clipE)">')
add(f'<path d="{geom_d(E_in)}" fill="{P["mesh_bg"]}"/>')
minx, miny, maxx, maxy = E_in.bounds
# back mesh (darker, offset) then front mesh
for nm, off, op, sw in [("Mesh_Back", (10, -8), 0.45, 2), ("Mesh_Front", (0, 0), 0.95, 2.6)]:
    lines = []
    step = 24
    x = minx - 30
    while x < maxx + 30:
        lines.append(f"M{f(x+off[0])},{f(miny-30+off[1])} V{f(maxy+30+off[1])}"); x += step
    y = miny - 30
    while y < maxy + 30:
        lines.append(f"M{f(minx-30+off[0])},{f(y+off[1])} H{f(maxx+30+off[0])}"); y += step
    add(f'<path id="{nm}" d="{" ".join(lines)}" fill="none" stroke="{P["mesh"]}" stroke-width="{sw}" opacity="{op}"/>')
# rope + float inside the crab pot
ry0 = TOP + 250
add(f'<path id="E_Rope" d="M{f(Ex+40)},{f(TOP+130)} C{f(Ex+90)},{f(TOP+190)} {f(Ex+20)},{f(TOP+260)} {f(Ex+80)},{f(TOP+330)} '
    f'S{f(Ex+40)},{f(TOP+420)} {f(Ex+180)},{f(BASE_Y-60)}" fill="none" stroke="#e8dcc0" stroke-width="5" stroke-linecap="round" opacity="0.85"/>')
add(f'<ellipse id="E_Float" cx="{f(Ex+215)}" cy="{f(BASE_Y-52)}" rx="38" ry="20" fill="{P["accent"]}" stroke="#ffffff" stroke-width="3"/>')
add(f'<path id="E_Inner_Shadow" d="{geom_d(E_in.difference(affinity.translate(E_in, 10, 12)))}" fill="#000000" opacity="0.4"/>')
add('</g>')
add(f'<path id="E_Frame" d="{geom_d(E_out.difference(E_in))}" fill="{P["E"]}"/>')
add(f'<path id="E_Rim_Light" d="{geom_d(E_out.difference(affinity.translate(E_out, -4, 5)))}" fill="{P["rim"]}" opacity="0.55"/>')
add('</g>')
end()

# ================================================================ 15. FOREGROUND
layer("15_Foreground_Grass")
fg, fg2, fs = [], [], []
for x, y, h in [(40, 2840, 230), (150, 2860, 180), (90, 2700, 140), (2080, 2840, 220), (1990, 2860, 160), (2130, 2700, 170)]:
    fg.append(tuft(x, y, h, n=14, spread=1.2))
    fg2.append(tuft(x + 18, y + 4, h * 0.7, n=7, lean=0.3))
    fs.append(seed_heads(x + 6, y, h * 1.1, n=3))
add(f'<path id="Grass_Dark" d="{" ".join(fg)}" fill="{P["grass"]}"/>')
add(f'<path id="Grass_Light" d="{" ".join(fg2)}" fill="{P["grass_hi"]}"/>')
add(f'<path id="Sea_Oats" d="{" ".join(fs)}" fill="{P["grass_hi"]}"/>')
# a few shells on the sand
sh = []
for x, y, r in [(620, 2790, 14), (1580, 2760, 11), (1250, 2820, 9), (420, 2735, 8)]:
    g = affinity.rotate(affinity.scale(Point(x, y).buffer(r, 10), 1.3, 0.8), rnd.uniform(0, 90))
    sh.append(geom_d(g))
add(f'<path id="Beach_Shells" d="{" ".join(sh)}" fill="{P["base_top"]}" opacity="0.9"/>')
end()

# ================================================================ 16. TYPOGRAPHY (outlined)
layer("16_Typography")
CX = 1080
title = "CAPE CHARLES"
tw = 1720
size = tw / (BEBAS.width(title, 1, 0.02))
ty_ = 690
add('<g id="Title_CAPE_CHARLES__Bebas_Neue">')
add(f'<path id="Title_Shadow" d="{BEBAS.path(title, CX + 10, ty_ + 10, size, 0.02)}" fill="{P["title_shadow"]}" opacity="0.8"/>')
add(f'<path id="Title_Text" d="{BEBAS.path(title, CX, ty_, size, 0.02)}" fill="{P["title"]}"/>')
add('</g>')
kick = "VISIT"
add(f'<path id="Kicker_VISIT__Montserrat_Bold" d="{MONT.path(kick, CX, 300, 64, 0.6)}" fill="{P["kicker"]}"/>')
kw = MONT.width(kick, 64, 0.6)
add(f'<path id="Kicker_Rules" d="M{f(CX-kw/2-260)},{f(277)} h200 v4 h-200 Z M{f(CX+kw/2+60)},{f(277)} h200 v4 h-200 Z" fill="{P["kicker"]}"/>')
add('<g id="Subtitle_Chesapeake_Bay__Playfair_Display_Italic">')
add(f'<path id="Subtitle_Shadow" d="{PLAY.path("on the Chesapeake Bay", CX + 5, 885, 128, 0.0)}" fill="{P["title_shadow"]}" opacity="0.55"/>')
add(f'<path id="Subtitle_Text" d="{PLAY.path("on the Chesapeake Bay", CX, 880, 128, 0.0)}" fill="{P["script"]}"/>')
add('</g>')
end()

layer("17_Footer")
add(f'<rect id="Footer_Band" x="0" y="2830" width="{W}" height="{W}" fill="{P["footer"]}"/>')
add(f'<rect id="Footer_Accent_Line" x="0" y="2818" width="{W}" height="12" fill="{P["accent"]}"/>')
ft = "VIRGINIA'S EASTERN SHORE"
add(f'<path id="Footer_Text__Montserrat_Bold" d="{MONT.path(ft, CX, 2918, 56, 0.32)}" fill="{P["footer_text"]}"/>')
add(f'<path id="Footer_Coordinates__Montserrat_SemiBold" d="{MONT6.path("37.27° N  ·  76.02° W", CX, 2962, 28, 0.3)}" fill="{P["footer_text"]}" opacity="0.7"/>')
end()

# ---------------------------------------------------------------- write
if BLEED_VIEW:
    vb, wmm, hmm = "0 0 2160 3030", 216, 303
else:
    vb, wmm, hmm = "30 30 2100 2970", 210, 297
svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
       f'<!-- Cape Charles, VA — LOVE sign travel poster ({MODE}). A4 210x297 mm artboard; artwork extends 3 mm beyond for bleed. '
       f'1 unit = 0.1 mm. Text is outlined (fonts: Bebas Neue, Montserrat, Playfair Display Italic — SIL OFL). -->\n'
       f'<svg xmlns="http://www.w3.org/2000/svg" width="{wmm}mm" height="{hmm}mm" viewBox="{vb}">\n'
       f'<title>Cape Charles LOVE — Travel Poster ({MODE})</title>\n'
       f'<defs>{"".join(defs)}</defs>\n' + "\n".join(out) + "\n</svg>\n")
open(OUT, "w").write(svg)
print(OUT, len(svg) // 1024, "KB")
