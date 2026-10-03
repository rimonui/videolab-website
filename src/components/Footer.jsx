import { Logo } from './ui.jsx';
import '../styles/footer.css';

export default function Footer({ onCategory }) {
  const filter = (key) => (e) => { e.preventDefault(); onCategory(key); };
  const columns = [
    { title: 'Menu', links: [
      { label: 'Burgers', href: '#burgers' },
      { label: 'Sides', href: '#full-menu', onClick: filter('sides') },
      { label: 'Drinks', href: '#full-menu', onClick: filter('drinks') },
      { label: 'Combos', href: '#combo' },
    ] },
    { title: 'About', links: [
      { label: 'Our Story', href: '#story' },
      { label: 'Ingredients', href: '#ingredients' },
      { label: 'Careers', href: 'mailto:jobs@loudbun.com?subject=I%20want%20to%20smash%20burgers' },
    ] },
    { title: 'Help', links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: 'mailto:hello@loudbun.com' },
      { label: 'Delivery', href: '#faq' },
    ] },
    { title: 'Social', links: [
      { label: 'Instagram', href: 'https://instagram.com', external: true },
      { label: 'TikTok', href: 'https://tiktok.com', external: true },
      { label: 'Facebook', href: 'https://facebook.com', external: true },
    ] },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>Smash burgers, made loud.<br />Williamsburg &amp; Lower East Side, NYC.</p>
          </div>
          <nav className="footer__cols" aria-label="Footer">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="label footer__h">{c.title}</p>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        onClick={l.onClick}
                        {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="footer__word display" aria-hidden="true">Loud Bun</p>

        <div className="footer__bottom">
          <span>© 2026 Loud Bun Burger Co.</span>
          <span className="footer__legal">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
          </span>
          <a href="#top" className="footer__top-link">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
