# Relay — AI agents that resolve, not just reply

Minimal, editorial landing page for an AI agent product. React + Vite, no UI libraries.
Layout inspired by rulebase.co (split dark hero with a live product card over a textured panel).

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

A ready-built static copy lives in `preview/` (open `preview/index.html` through any static server).

## Sections
Navbar · Hero (looping live agent demo) · Logo marquee · Agent loop (animated line diagrams, tabbed) ·
Feature bento (sticky tabs + mini product UIs) · Customer proof (count-up stats) · Security · Scroll-lit statement · CTA + footer

## Design
- **Palette:** Ink `#1a1716`, Paper `#efedea`, Stone `#e4e0db`, Accent `#ff5a1f`
- **Type:** Inter Variable, tight tracking, regular weight headlines
- **Texture:** carved-plaster relief generated with SVG lighting filters (`Relief` in `src/components/ui.jsx`) — no image files
- **Motion:** scroll reveals, line drawing, marquee, live chat script; all disabled under `prefers-reduced-motion`
