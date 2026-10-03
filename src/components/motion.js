import { useEffect } from 'react';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Fade/slide elements marked [data-reveal] into view once. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (reduced() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Elements marked [data-speed] drift relative to scroll for depth.
   Writes a --py custom property so it never fights other transforms. */
export function useParallax() {
  useEffect(() => {
    if (reduced()) return;
    const els = [...document.querySelectorAll('[data-speed]')];
    let frame = 0;
    const update = () => {
      frame = 0;
      if (window.innerWidth < 860) {
        els.forEach((el) => el.style.setProperty('--py', '0px'));
        return;
      }
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const delta = r.top + r.height / 2 - vh / 2;
        el.style.setProperty('--py', `${(delta * parseFloat(el.dataset.speed)).toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
