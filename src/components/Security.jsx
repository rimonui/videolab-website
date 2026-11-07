const ITEMS = [
  ['SOC 2 Type II', 'Audited controls for how data is stored, accessed, and processed across every system.', 'M30 8l18 7v13c0 12-8 20-18 24C20 48 12 40 12 28V15z'],
  ['GDPR', 'Data residency options in the EU and US, with full support for access and deletion requests.', 'M30 10a20 20 0 1 0 0.01 0M10 30h40M30 10c7 7 7 33 0 40M30 10c-7 7-7 33 0 40'],
  ['Zero training', 'Your data is never used to train models. Ever. Retention is configurable per workspace.', 'M14 30h32M30 14v32M18 18l24 24'],
  ['Encryption', 'AES-256 at rest and TLS 1.3 in transit, with customer-managed keys on Enterprise.', 'M18 28h24v20H18zM22 28v-6a8 8 0 0 1 16 0v6'],
];

export default function Security() {
  return (
    <section className="security" id="security">
      <div className="security__top">
        <h2 className="h2" data-reveal>Security and guardrails<br />built in.</h2>
        <div data-reveal>
          <p>SOC 2 Type II. GDPR. Zero AI training on your data. Built for teams that can't afford for an agent to get it wrong.</p>
          <a href="#trust" className="btn btn--white">Visit Trust Center</a>
        </div>
      </div>
      <div className="security__grid">
        {ITEMS.map(([t, d, path], i) => (
          <article className="sec-card" key={t} data-reveal style={{ '--d': `${i * 90}ms` }}>
            <svg viewBox="0 0 60 60" width="64" height="64" fill="none" stroke="#ff5a1f" strokeWidth="1.3" aria-hidden="true"><path d={path} className="draw" /></svg>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
