import { signatureBurgers } from '../data/menu.js';
import BurgerCard from './BurgerCard.jsx';
import { SectionMeta } from './ui.jsx';
import '../styles/burgers.css';

export default function BurgerGrid() {
  return (
    <section className="sig section" id="burgers" aria-labelledby="sig-title">
      <div className="container">
        <SectionMeta num="02" label="Signature burgers" aside="Six of the best" />
        <header className="sig__head">
          <h2 id="sig-title" className="display h-section" data-reveal>
            Meet the<br />heavy <span className="serif">hitters.</span>
          </h2>
          <p className="sig__aside" data-reveal style={{ '--d': '0.1s' }}>
            Six burgers we’d put our name on. Every one smashed to order on a 230°C flat-top
            and built on brioche baked this morning.
          </p>
        </header>

        <div className="sig__grid">
          {signatureBurgers.map((b, i) => (
            <BurgerCard key={b.id} {...b} delay={(i % 3) * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
