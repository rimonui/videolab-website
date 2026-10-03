import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartContext.jsx';
import { navLinks, formatPrice } from '../data/menu.js';
import { Logo, Bag, Arrow } from './ui.jsx';
import '../styles/navbar.css';

export default function Navbar() {
  const { count, subtotal, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight * 0.8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const orderNow = () => { closeMenu(); open(); };

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${menuOpen ? 'nav--open' : ''}`}>
        <div className="nav__inner">
          <a href="#top" className="nav__logo" aria-label="Loud Bun — back to top" onClick={closeMenu}>
            <Logo />
          </a>

          <nav className="nav__links" aria-label="Primary">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>

          <div className="nav__actions">
            <button className="nav__cart" onClick={open} aria-label={`Your order: ${count} item${count === 1 ? '' : 's'}`}>
              <Bag />
              <span className={`nav__count ${count ? 'is-active' : ''}`} key={count}>{count}</span>
            </button>
            <button className="btn btn--sm nav__order" onClick={orderNow}>
              Order now <Arrow />
            </button>
            <button
              className="nav__burger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span /><span />
            </button>
          </div>
        </div>
        <span className="nav__progress" ref={progress} aria-hidden="true" />
      </header>

      <div id="mobile-menu" className={`mnav ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {navLinks.map((l, i) => (
            <a key={l.href} href={l.href} onClick={closeMenu} style={{ '--i': i }} tabIndex={menuOpen ? 0 : -1}>
              <span className="mnav__num">0{i + 1}</span>{l.label}
            </a>
          ))}
        </nav>
        <div className="mnav__foot">
          <button className="btn btn--lime btn--lg" onClick={orderNow} tabIndex={menuOpen ? 0 : -1}>
            Order now <Arrow />
          </button>
          <p className="label">Open today · 11:00 — 23:00</p>
        </div>
      </div>

      {/* Mobile: keep the primary action within thumb reach after the hero */}
      <button
        className={`order-fab ${pastHero && !menuOpen ? 'is-visible' : ''}`}
        onClick={open}
        tabIndex={pastHero ? 0 : -1}
      >
        <span>Order now</span>
        {count > 0 && <span className="order-fab__meta">{count} · {formatPrice(subtotal)}</span>}
        <Arrow />
      </button>
    </>
  );
}
