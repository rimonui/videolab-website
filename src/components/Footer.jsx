import { Logo, Arrow } from './ui.jsx';

const COLS = {
  Product: ['Agents', 'Guardrails', 'Integrations', 'Analytics', 'Pricing'],
  Company: ['About', 'Customers', 'Careers', 'Contact'],
  Resources: ['Docs', 'Changelog', 'Trust Center', 'Status'],
};

export default function Footer() {
  return (
    <footer className="footer" id="demo">
      <div className="cta" data-reveal>
        <h2 className="h2">Put your first agent<br />to work this week.</h2>
        <form className="cta__form" onSubmit={(e) => { e.preventDefault(); e.currentTarget.classList.add('is-sent'); }}>
          <input type="email" required placeholder="Work email" aria-label="Work email" />
          <button className="btn btn--accent">Book a Demo <Arrow /></button>
          <span className="cta__ok">Thanks — we'll be in touch within a day.</span>
        </form>
      </div>
      <div className="footer__grid">
        <div className="footer__brand"><Logo /><p>AI agents that resolve,<br />not just reply.</p></div>
        {Object.entries(COLS).map(([h, l]) => (
          <div key={h} className="footer__col"><h4>{h}</h4>{l.map((x) => <a key={x} href="#top">{x}</a>)}</div>
        ))}
      </div>
      <div className="footer__base"><span>© 2026 Relay Labs, Inc.</span><span>Privacy · Terms · Cookies</span></div>
    </footer>
  );
}
