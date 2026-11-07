const LOGOS = [
  { name: 'Northbank', style: { fontWeight: 700, letterSpacing: '-0.04em' } },
  { name: 'kova', style: { fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.05em' }, tag: 'Case study' },
  { name: 'LUMEN PAY', style: { fontWeight: 600, letterSpacing: '0.12em', fontSize: '0.8em' } },
  { name: 'fernway', style: { fontWeight: 400, letterSpacing: '-0.03em' } },
  { name: 'Atlas&Co', style: { fontWeight: 650, letterSpacing: '-0.02em' }, tag: 'NYSE: ATCO' },
  { name: 'helio', style: { fontWeight: 900, letterSpacing: '-0.06em' } },
  { name: 'Quarry', style: { fontWeight: 500, letterSpacing: '-0.01em' }, tag: 'Case study' },
];

export default function Logos() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section className="logos" id="customers">
      <p className="logos__lead" data-reveal>Trusted by fast-moving teams<br />and publicly traded companies.</p>
      <div className="logos__track" aria-label="Customer logos">
        <div className="logos__row">
          {row.map((l, i) => (
            <div className="logo-tile" key={i} aria-hidden={i >= LOGOS.length}>
              {l.tag && <span className="logo-tile__tag">{l.tag}</span>}
              <span style={l.style}>{l.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
