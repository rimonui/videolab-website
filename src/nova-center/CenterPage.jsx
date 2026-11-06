import { useEffect, useRef } from 'react';
import PipelineStage from './PipelineStage.jsx';
import { Navbar, TrustedBy } from '../nova/NovaPage.jsx';
import { ArrowRight, Check } from '../nova/icons.jsx';

const TITLE = [
  ['AI', ''], ['agents', ''], ['that', 'dim'], ['turn', 'dim'],
  ['work', ''], ['into', 'dim'], ['results.', 'glow'],
];

/* The agent panel starts tilted back and settles flat as the page scrolls. */
function useSettleOnScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1');
      return undefined;
    }
    let raf = 0;
    let started = false;
    const update = () => {
      raf = 0;
      if (!started) return;
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      // tilted while the panel sits low on screen, flat once its top reaches mid-screen
      const p = Math.min(1, Math.max(0, (vh * 0.95 - top) / (vh * 0.45)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    // let the panel arrive tilted, then settle to where the scroll puts it
    const t = setTimeout(() => { started = true; update(); }, 450);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);
}

export default function CenterPage() {
  const frameRef = useRef(null);
  useSettleOnScroll(frameRef);

  return (
    <div className="nc" id="top">
      <Navbar />
      <main>
        <section className="nc-hero" aria-labelledby="hero-title">
          <div className="nc-hero__blobs" aria-hidden="true"><i /><i /><i /></div>

          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            Trusted by forward-thinking teams
          </p>

          <h1 id="hero-title" className="hero__title">
            {TITLE.map(([w, tone], i) => (
              <span key={w} className={`tw${tone ? ` tw--${tone}` : ''}`} style={{ '--i': i }}>
                {w}
              </span>
            )).reduce((acc, el, i) => (i ? [...acc, ' ', el] : [el]), [])}
          </h1>

          <p className="nc-hero__sub">
            Meet your AI workforce. Intelligent agents that understand requests, make decisions, and complete
            tasks across your tools — automatically, accurately, and around the clock.
          </p>

          <div className="nc-hero__ctas">
            <a className="btn btn--primary btn--lg" href="#trial">
              Start free trial
              <ArrowRight className="btn__arrow" />
            </a>
            <a className="btn btn--ghost btn--lg" href="#demo">Book a demo</a>
          </div>

          <ul className="nc-hero__micro">
            <li><Check /> No credit card required</li>
            <li><Check /> Set up in minutes</li>
          </ul>

          <div className="nc-frame" ref={frameRef}>
            <PipelineStage />
          </div>
        </section>

        <TrustedBy />
      </main>
    </div>
  );
}
