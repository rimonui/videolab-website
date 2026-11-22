# Loud Bun — Smash Burgers, Made Loud

A premium, editorial landing page for an independent burger brand. Built with React + Vite.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

## Structure

```
src/
  data/menu.js          # all content: products, burgers, categories, ingredients, testimonials, locations
  components/           # one component per section + shared primitives
    Navbar · Hero · Marquee · BurgerGrid/BurgerCard · EditorialStory
    Categories/CategoryCard · MenuGrid · Ingredients/IngredientCard
    PromoBanner · Testimonials/TestimonialCard · LocationSection · FinalCTA · Footer
    OrderDrawer + CartContext   # working cart: add, qty, remove, checkout
    Img                         # Unsplash image with fallback chain
    motion.js                   # scroll reveals + parallax (respects reduced motion)
    ui.jsx                      # icons, logo, section meta bar, starburst, text ring
  styles/               # base.css (tokens, type, buttons) + one stylesheet per section
```

## Design system

- **Palette:** Burger Red `#720B07`, Burgundy `#4D0805`, Cream `#FFF7DD`, Soft White `#FFFDF5`,
  Golden Orange `#F6A70A`, Lime `#D8F34A`, Food Green `#00483A`, Charcoal `#171512`
- **Type:** Archivo Expanded Black (display), Instrument Serif Italic (editorial accent), Inter (UI/body) — self-hosted via Fontsource
- **Shape:** 20–28px radii, pill buttons, 1px hairlines, sticker badges

Photography is hot-linked from Unsplash; swap the ids in `PHOTO` (src/data/menu.js) for brand shoots.

## Management bento + social video

- `management.html` — animated management bento section (`src/management/`).
- `social-video.html` — a scripted camera tour of the bento used to render social videos (`src/management/video/`).

Render 4K/60fps videos frame-by-frame (needs Playwright with Chromium, and ffmpeg):

```bash
npm run build && npx vite preview --port 4173 &
npm run render:video -- landscape workspace-16x9.mp4   # 3840×2160 — X, LinkedIn
npm run render:video -- portrait  workspace-4x5.mp4    # 2160×2700 — Instagram, Threads, LinkedIn feed
npm run render:video -- story     workspace-9x16.mp4   # 2160×3840 — Reels, Stories
```
