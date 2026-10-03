import { testimonials } from '../data/menu.js';
import TestimonialCard from './TestimonialCard.jsx';
import Img from './Img.jsx';
import { SectionMeta, Stars } from './ui.jsx';
import '../styles/testimonials.css';

export default function Testimonials() {
  return (
    <section className="love section" id="reviews" aria-labelledby="love-title">
      <div className="container love__grid">
        <div className="love__intro">
          <SectionMeta num="08" label="Customer love" aside="Real reviews" />
          <h2 id="love-title" className="display h-section" data-reveal>
            People<br />love the<br /><span className="serif">stack.</span>
          </h2>
          <div className="love__score" data-reveal style={{ '--d': '0.1s' }}>
            <span className="love__num">4.9</span>
            <div>
              <Stars size={20} />
              <p>From 2,380+ reviews on Google &amp; Yelp</p>
              <div className="love__faces" aria-hidden="true">
                {testimonials.map((t) => (
                  <span key={t.name}><Img id={t.avatar} fb="person" w={96} sizes="36px" /></span>
                ))}
                <span className="love__more">+2k</span>
              </div>
            </div>
          </div>
        </div>

        <div className="love__cards">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
