import { Fragment, useEffect, useRef, useState } from 'react';
import ManagementBento from '../ManagementBento.jsx';

/* ------------------------------------------------------------------
   Social video stage.
   A scripted "camera" tours the bento. Time is driven from outside:
   the renderer calls window.__frame(ms) once per video frame, so every
   frame is deterministic. Opened in a normal browser it plays itself.
   ------------------------------------------------------------------ */

export const DURATION = 28000;
const GRID_IN = 2300;

// Camera keys: [time, shot]. Between keys the camera eases; equal shots hold.
const KEYS = [
  [GRID_IN, 'enter'],
  [4300, 'all'],
  [6200, 'all'],
  [7400, 'a'], [9300, 'a'],
  [10500, 'b'], [12400, 'b'],
  [13600, 'c'], [15500, 'c'],
  [16700, 'd'], [18600, 'd'],
  [19800, 'e'], [21700, 'e'],
  [23100, 'all'],
  [24200, 'all'],
  [25800, 'exit'],
];

const clamp = (x) => Math.max(0, Math.min(1, x));
const span = (t, a, b) => clamp((t - a) / (b - a));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x) => 1 - Math.pow(1 - x, 3);

const TITLE = ['Everything', 'you', 'need', 'to', 'manage', 'your', "team's", 'work'];
const OUTRO = ['Manage', 'your', 'team', 'with', 'calm', 'clarity.'];

export default function VideoStage() {
  const [grid, setGrid] = useState(false);
  const cam = useRef(null);
  const title = useRef(null);
  const outro = useRef(null);
  const state = useRef({ rects: null, grid: false });

  useEffect(() => {
    const st = state.current;

    const measure = () => {
      const bento = cam.current?.querySelector('.bento');
      if (!bento) return null;
      const r = { all: { x: 0, y: 0, w: bento.offsetWidth, h: bento.offsetHeight } };
      ['a', 'b', 'c', 'd', 'e'].forEach((k) => {
        const el = bento.querySelector(`.bento__${k}`);
        r[k] = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      });
      return r;
    };

    // Camera state for a shot: centre (in bento px) + scale.
    const shot = (name) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const rects = st.rects;
      const key = ['enter', 'exit', 'all'].includes(name) ? 'all' : name;
      const r = rects[key];
      const pad = key === 'all' ? Math.min(W, H) * 0.07 : Math.min(W, H) * 0.09;
      let s = Math.min((W - 2 * pad) / r.w, (H - 2 * pad) / r.h);
      let cy = r.y + r.h / 2;
      if (name === 'enter') { s *= 0.9; cy -= (H * 0.12) / s; }
      if (name === 'exit') s *= 0.84;
      return { cx: r.x + r.w / 2, cy, s };
    };

    const camera = (t) => {
      if (t <= KEYS[0][0]) return shot(KEYS[0][1]);
      for (let i = 0; i < KEYS.length - 1; i++) {
        const [t0, a] = KEYS[i];
        const [t1, b] = KEYS[i + 1];
        if (t <= t1) {
          const A = shot(a);
          const B = shot(b);
          if (a === b) return A;
          const e = inOut(span(t, t0, t1));
          // Gentle dolly: pull back a touch mid-move between close-ups.
          const dip = a !== 'all' && b !== 'all' && a !== 'enter' ? 1 - 0.14 * Math.sin(Math.PI * e) : 1;
          return {
            cx: A.cx + (B.cx - A.cx) * e,
            cy: A.cy + (B.cy - A.cy) * e,
            s: Math.exp(Math.log(A.s) + (Math.log(B.s) - Math.log(A.s)) * e) * dip,
          };
        }
      }
      return shot(KEYS[KEYS.length - 1][1]);
    };

    const words = (root, t, start, step, exitAt) => {
      if (!root) return;
      [...root.querySelectorAll('[data-w]')].forEach((w, i) => {
        const k = out(span(t, start + i * step, start + i * step + 900));
        w.style.opacity = k;
        w.style.transform = `translate3d(0, ${(1 - k) * 0.45}em, 0)`;
        w.style.filter = `blur(${(1 - k) * 12}px)`;
      });
      const x = exitAt ? inOut(span(t, exitAt, exitAt + 700)) : 0;
      root.style.opacity = 1 - x;
      root.style.transform = `translate3d(0, ${-x * 6}vh, 0) scale(${1 - x * 0.04})`;
      root.style.filter = `blur(${x * 10}px)`;
    };

    window.__frame = (t) => {
      if (t >= GRID_IN && !st.grid) { st.grid = true; setGrid(true); }

      words(title.current, t, 250, 120, 2000);
      words(outro.current, t, 24900, 110, null);
      if (outro.current) {
        const tag = outro.current.querySelector('.vo__tag');
        const k = out(span(t, 25900, 26800));
        tag.style.opacity = k;
        tag.style.transform = `translate3d(0, ${(1 - k) * 14}px, 0)`;
      }

      if (!st.grid || !cam.current) return;
      if (!st.rects) st.rects = measure();
      if (!st.rects) return;
      const { cx, cy, s } = camera(t);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const el = cam.current;
      el.style.transform = `translate(${W / 2 - cx * s}px, ${H / 2 - cy * s}px) scale(${s})`;
      const fadeIn = out(span(t, GRID_IN, GRID_IN + 900));
      const fadeOut = inOut(span(t, 24200, 25800));
      el.style.opacity = fadeIn * (1 - fadeOut * 0.88);
      el.style.filter = fadeOut > 0 ? `blur(${fadeOut * 14}px)` : 'none';
    };

    // Self-play when opened directly (the renderer sets __manual first).
    if (!window.__manual) {
      const t0 = performance.now();
      let raf;
      const loop = (now) => {
        window.__frame((now - t0) % DURATION);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }
    window.__ready = true;
  }, []);

  return (
    <div className="vid">
      <div className="vid__dots" aria-hidden="true" />
      <div className="vid__cam" ref={cam}>{grid && <ManagementBento />}</div>

      <div className="vt" ref={title}>
        <h1>
          {TITLE.map((w, i) => (
            <Fragment key={i}><span data-w>{w}</span>{i === 3 ? <br /> : ' '}</Fragment>
          ))}
        </h1>
      </div>

      <div className="vt vo" ref={outro}>
        <h1>
          {OUTRO.map((w, i) => (
            <Fragment key={i}><span data-w>{w}</span>{i === 2 ? <br /> : ' '}</Fragment>
          ))}
        </h1>
        <p className="vo__tag">Designed by Gr8r Studio · gr8rstudio.com</p>
      </div>
    </div>
  );
}
