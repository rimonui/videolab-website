import { useEffect, useState } from 'react';
import AgentStage from './AgentStage.jsx';
import { LOGO_PAIRS } from './Logos.jsx';
import { Spark, ArrowRight, Check, Chevron, Menu, Close } from './icons.jsx';

const LINKS = [
  { label: 'Product', href: '#product', menu: true },
  { label: 'Solutions', href: '#solutions', menu: true },
  { label: 'Resources', href: '#resources', menu: true },
  { label: 'Customers', href: '#customers' },
  { label: 'Pricing', href: '#pricing' },
];

export function Brand() {
  return (
    <a href="#top" className="brand" aria-label="Nova home">
      <span className="brand__mark"><Spark /></span>
      <span className="brand__name">Nova</span>
    </a>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 1080 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header className="nav" data-open={open || undefined}>
      <div className="nav__in">
        <Brand />
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
              {l.menu && <Chevron className="nav__chev" />}
            </a>
          ))}
        </nav>
        <div className="nav__actions">
          <a className="nav__login" href="#login">Log in</a>
          <a className="btn btn--ghost btn--sm nav__demo" href="#demo">Book a demo</a>
          <a className="btn btn--primary btn--sm" href="#trial">Start free trial</a>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      <div id="nav-menu" className="nav__menu" hidden={!open}>
        <nav aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <div className="nav__menu-actions">
          <a className="btn btn--ghost" href="#login">Log in</a>
          <a className="btn btn--ghost" href="#demo">Book a demo</a>
        </div>
      </div>
    </header>
  );
}

const TITLE = [
  ['AI', ''], ['agents', ''], ['that', 'dim'], ['turn', 'dim'],
  ['work', ''], ['into', 'dim'], ['results.', 'glow'],
];

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
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

        <p className="hero__sub">
          Meet your AI workforce. Intelligent agents that understand requests, make decisions, and complete
          tasks across your tools — automatically, accurately, and around the clock.
        </p>

        <div className="hero__ctas">
          <a className="btn btn--primary btn--lg" href="#trial">
            Start free trial
            <ArrowRight className="btn__arrow" />
          </a>
          <a className="btn btn--ghost btn--lg" href="#demo">Book a demo</a>
        </div>

        <ul className="hero__micro">
          <li><Check /> No credit card required</li>
          <li><Check /> Set up in minutes</li>
        </ul>
      </div>

      <div className="hero__visual">
        <AgentStage />
      </div>
    </section>
  );
}

export function TrustedBy() {
  return (
    <section className="trust" aria-labelledby="trust-title">
      <p id="trust-title" className="trust__label">Trusted by teams building the future of work.</p>
      <ul className="trust__row">
        {LOGO_PAIRS.map(([A, B], i) => (
          <li key={i} className="trust__cell" style={{ '--d': `${i * -1.3}s` }}>
            <span className="trust__logo trust__logo--a"><A /></span>
            <span className="trust__logo trust__logo--b" aria-hidden="true"><B /></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function NovaPage() {
  return (
    <div className="nv" id="top">
      <Navbar />
      <main className="frame">
        <Hero />
        <TrustedBy />
      </main>
    </div>
  );
}
