import { PHOTO } from '../data/menu.js';
import { useCart } from './CartContext.jsx';
import Img from './Img.jsx';
import { Arrow, Burst, TextRing } from './ui.jsx';
import '../styles/final.css';

export default function FinalCTA() {
  const { open } = useCart();
  return (
    <section className="final section" id="order" aria-labelledby="final-title">
      <div className="container final__inner">
        <p className="label final__eyebrow" data-reveal>Last call — the grill is hot</p>
        <h2 id="final-title" className="display final__title" data-speed="-0.05">
          <span className="line">Your next</span>
          <span className="line final__indent">favorite</span>
          <span className="line">burger</span>
          <span className="line final__indent2">is <span className="serif">waiting.</span></span>
        </h2>

        <div className="final__visual" aria-hidden="true">
          <TextRing className="final__ring" text="Order now ✺ pickup in 12 min ✺ order now ✺ pickup in 12 min ✺ " />
          <div className="final__burger"><Img id={PHOTO.smokehouse} w={700} sizes="(max-width: 860px) 60vw, 30vw" /></div>
        </div>

        <div className="final__cta" data-reveal style={{ '--d': '0.1s' }}>
          <button className="btn btn--lime btn--lg final__btn" onClick={open}>
            Order now <Arrow />
          </button>
          <p className="final__copy">Fresh off the grill.<br />Straight to your hands.</p>
        </div>

        <Burst className="final__burst" points={12}>Made<br />to<br />order</Burst>
      </div>
    </section>
  );
}
