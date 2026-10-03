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
