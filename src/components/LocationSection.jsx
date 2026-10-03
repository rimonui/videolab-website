import { useState } from 'react';
import { locations, faqs, PHOTO } from '../data/menu.js';
import { useCart } from './CartContext.jsx';
import Img from './Img.jsx';
import { Arrow, SectionMeta, LogoMark } from './ui.jsx';
import '../styles/location.css';

/* Stylised illustrated map — no third-party tiles, no tracking. */
function MapArt() {
  const streetsH = [40, 78, 116, 154, 192, 230, 268];
  const streetsV = [60, 110, 160, 210, 260, 310, 360];
  return (
    <svg className="map__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill="#FFF7DD" />
      {streetsH.map((y) => <line key={`h${y}`} x1="0" x2="400" y1={y} y2={y} stroke="#4D0805" strokeOpacity="0.12" strokeWidth="5" />)}
      {streetsV.map((x) => <line key={`v${x}`} y1="0" y2="300" x1={x} x2={x} stroke="#4D0805" strokeOpacity="0.12" strokeWidth="5" />)}
      <line x1="0" y1="290" x2="400" y2="20" stroke="#4D0805" strokeOpacity="0.18" strokeWidth="9" />
      <line x1="40" y1="0" x2="330" y2="300" stroke="#F6A70A" strokeOpacity="0.55" strokeWidth="6" />
      <rect x="215" y="160" width="90" height="62" rx="10" fill="#D8F34A" fillOpacity="0.55" />
      <path d="M150 0 C120 70 170 120 140 180 C115 230 150 270 130 300 L60 300 C80 250 40 200 70 150 C100 100 60 50 90 0 Z" fill="#00483A" fillOpacity="0.16" />
      <text x="82" y="120" fontFamily="Inter Variable, Inter, sans-serif" fontSize="8" fontWeight="700" letterSpacing="2" fill="#00483A" fillOpacity="0.55" transform="rotate(-70 82 120)">EAST RIVER</text>
    </svg>
  );
}

export default function LocationSection() {
  const [active, setActive] = useState(locations[0].key);
  const { open } = useCart();
  const loc = locations.find((l) => l.key === active);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address.join(', '))}`;

  return (
    <section className="visit section" id="locations" aria-labelledby="visit-title">
      <div className="container visit__grid">
        <div className="visit__info">
          <SectionMeta num="09" label="Visit us" aside="Two shops, one grill mindset" />
          <h2 id="visit-title" className="display h-section" data-reveal>
            Come get<br />your hands<br /><span className="serif">dirty.</span>
          </h2>

          <div className="visit__tabs" role="tablist" aria-label="Choose a location" data-reveal>
            {locations.map((l) => (
              <button
                key={l.key}
                role="tab"
                aria-selected={active === l.key}
                className={`visit__tab ${active === l.key ? 'is-active' : ''}`}
                onClick={() => setActive(l.key)}
              >
                {l.name}
              </button>
            ))}
          </div>

          <div className="visit__card" role="tabpanel" key={loc.key}>
            <div className="visit__block">
              <p className="label visit__k">Address <span className="tag">{loc.badge}</span></p>
              <address className="visit__addr">{loc.address.map((a) => <span key={a}>{a}</span>)}</address>
              <a className="visit__phone" href={`tel:${loc.phone.replace(/\D/g, '')}`}>{loc.phone}</a>
            </div>
            <div className="visit__block">
              <p className="label visit__k">Opening hours</p>
              <dl className="visit__hours">
                {loc.hours.map(([d, h]) => (
                  <div key={d}><dt>{d}</dt><dd>{h}</dd></div>
                ))}
              </dl>
            </div>
          </div>

          <div className="visit__ctas">
            <a className="btn btn--lime btn--lg" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Get directions <Arrow />
            </a>
            <button className="btn btn--ghost btn--lg" onClick={open}>
              Order online <Arrow />
            </button>
          </div>
        </div>

        <div className="visit__side">
          <div className="map" data-reveal>
            <MapArt />
            <div className="map__pin" style={{ left: `${loc.pin.x}%`, top: `${loc.pin.y}%` }}>
              <span className="map__pulse" aria-hidden="true" />
              <LogoMark size={44} />
              <span className="map__chip">Loud Bun · {loc.name}</span>
            </div>
            <span className="map__walk label">~ 4 min from the L train</span>
          </div>
          <div className="visit__burger" aria-hidden="true" data-speed="-0.06">
            <Img id={PHOTO.closeup} w={500} sizes="260px" />
          </div>

          <div className="faq" id="faq" data-reveal>
            <p className="label faq__title">Good to know</p>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span aria-hidden="true">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
