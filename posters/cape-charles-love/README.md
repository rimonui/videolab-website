# Cape Charles "LOVE" sign — A4 travel poster

Two versions of the same vector illustration, as the client asked for "blue sky or a nice sunset":

| File | What it is |
|---|---|
| `cape-charles-love-poster-sunset.svg` | Sunset version (layered vector, open in Illustrator) |
| `cape-charles-love-poster-blue-sky.svg` | Blue-sky version (same layers) |
| `*_bleed-proof.pdf` | Print proofs at 216 × 303 mm (A4 + 3 mm bleed) |
| `preview-*.png` | Quick previews |
| `source/generate_poster.py` | Script that builds both SVGs (colours, layout, text) |

## Print setup
- Artboard = A4 (210 × 297 mm). The artwork runs 3 mm past every edge for bleed.
  In Illustrator: **File › Document Setup › Bleed = 3 mm** on all sides.
- Keep text and key details at least 5 mm inside the trim (already done).
- The colours are RGB. For offset print, switch to **File › Document Color Mode › CMYK**
  and check the sunset gradients and the blue sky after converting.
- All text is outlined, so no fonts are needed. Fonts used (free, SIL OFL): Bebas Neue (title),
  Montserrat Bold/SemiBold ("VISIT", footer) and Playfair Display Italic (subtitle).
  Group names say which font each line uses, so it's easy to retype.

## Layers (bottom → top)
01 Sky · 02 Sun · 03 Clouds · 04 Birds · 05 Sea (reflection, waves, ships, tall ship) ·
06 Fishing Pier (deck, pilings, rails, shelter) · 07 Beach · 08 Dunes · 09 Rock Jetty ·
10 Boardwalk · 11 Dune Grass · 12 Sign Shadow · 13 Grass Behind Sign ·
14 LOVE Sign (Base, L oyster shells, O tractor tyre, V kayaks, E crab-pot mesh) ·
15 Foreground Grass · 16 Typography · 17 Footer
