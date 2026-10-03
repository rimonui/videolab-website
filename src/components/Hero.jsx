import { PHOTO, products, formatPrice } from '../data/menu.js';
import { useCart } from './CartContext.jsx';
import Img from './Img.jsx';
import { Arrow, Plus, Burst, TextRing } from './ui.jsx';
import '../styles/hero.css';

export default function Hero() {
  const { add } = useCart();
  const hero = products.double;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow label">
            <span className="hero__live" aria-hidden="true" /> Smash burgers · Brooklyn, NY
          </p>

          <h1 id="hero-title" className="hero__title display h-hero" data-speed="-0.08">
            <span className="line">Stacked</span>
            <span className="line">to stand</span>
            <span className="line">out<span className="hero__dot">.</span></span>
          </h1>

          <p className="hero__lede lede">
            Fresh-ground beef smashed hard on a screaming-hot flat-top.
            Crispy edges, melted cheddar, a brioche baked this morning.
          </p>

          <div className="hero__ctas">
            <a className="btn btn--lime btn--lg" href="#burgers">Order a burger <Arrow /></a>
            <a className="btn btn--ghost btn--lg" href="#menu">Explore menu</a>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__stage">
            <div className="hero__disc" aria-hidden="true" />
            <TextRing className="hero__ring" text="Fresh off the grill ✺ 100% beef ✺ smashed to order ✺ " />
            <div className="hero__burger">
              <div className="hero__burger-inner">
                <Img id={PHOTO.hero} w={900} eager alt="A double cheeseburger with melted cheddar, lettuce and tomato on a toasted brioche bun" sizes="(max-width: 860px) 90vw, 46vw" />
              </div>
            </div>

            <span className="hero__sticker hero__sticker--beef" style={{ '--rot': '-12deg' }}>
              100%<br />Beef
            </span>
            <span className="hero__sticker hero__sticker--stack" style={{ '--rot': '7deg' }}>
              Double stack
            </span>
            <Burst className="hero__sticker hero__sticker--fresh">Fresh<br />daily</Burst>

            <div className="hero__note">
              <span className="hero__note-num">No. 01</span>
              <div>
                <p className="hero__note-name">{hero.name}</p>
                <p className="hero__note-desc">Two patties · double cheddar</p>
              </div>
              <span className="hero__note-price">{formatPrice(hero.price)}</span>
              <button className="add-btn" onClick={() => add('double')} aria-label={`Add ${hero.name} to order`}>
                <Plus />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__foot">
        <a href="#burgers" className="hero__scroll">
          <span className="hero__scroll-track" aria-hidden="true"><span /></span>
          Scroll for burgers
        </a>
        <p className="label">Open today · 11:00 — 23:00</p>
        <p className="label hero__foot-end">Pickup ready in ~12 min</p>
      </div>
    </section>
  );
}
