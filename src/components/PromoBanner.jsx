import { PHOTO, products, formatPrice } from '../data/menu.js';
import { useCart } from './CartContext.jsx';
import Img from './Img.jsx';
import { Arrow, Burst } from './ui.jsx';
import '../styles/promo.css';

const parts = [
  { label: 'Burger', img: PHOTO.classic, fb: 'burger' },
  { label: 'Fries', img: PHOTO.fries, fb: 'fries' },
  { label: 'Drink', img: PHOTO.lemonade, fb: 'drink' },
];

export default function PromoBanner() {
  const { add } = useCart();
  const combo = products.combo;

  return (
    <section className="promo section" id="combo" aria-labelledby="promo-title">
      <div className="container promo__card" data-reveal>
      <span className="promo__bg display" aria-hidden="true">Combo Combo Combo</span>
      <span className="promo__notch promo__notch--top" aria-hidden="true" />
      <span className="promo__notch promo__notch--bottom" aria-hidden="true" />
      <div className="promo__grid">
        <div className="promo__copy">
          <p className="promo__kicker" data-reveal>
            <span className="tag tag--outline">07 — Lunch deal</span>
            <span className="tag">Every day 11 – 4</span>
          </p>
          <h2 id="promo-title" className="display promo__title" data-reveal>
            Make it<br />a combo.
          </h2>
          <p className="promo__text" data-reveal style={{ '--d': '0.1s' }}>
            Any signature burger, a basket of Loud Fries and a cold drink.
            One price. No maths. Just lunch.
          </p>
          <div className="promo__buy" data-reveal style={{ '--d': '0.15s' }}>
            <div className="promo__price">
              <s>$25</s>
              <span>{formatPrice(combo.price)}</span>
            </div>
            <button className="btn btn--sticker btn--lg" onClick={() => add('combo', { open: true })}>
              Order the combo <Arrow />
            </button>
          </div>
        </div>

        <div className="promo__equation" data-reveal style={{ '--d': '0.1s' }}>
          {parts.map((p, i) => (
            <div key={p.label} className={`promo__part promo__part--${i}`}>
              <div className="promo__disc">
                <Img id={p.img} fb={p.fb} w={500} alt={p.label} sizes="260px" />
              </div>
              <span className="promo__part-label">{p.label}</span>
              {i < parts.length - 1 && <span className="promo__op" aria-hidden="true">+</span>}
            </div>
          ))}
          <Burst className="promo__burst" points={16}>Save<br />$6</Burst>
        </div>
      </div>
      </div>
    </section>
  );
}
