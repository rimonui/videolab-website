import { PHOTO } from '../data/menu.js';
import Img from './Img.jsx';
import { Arrow, SectionMeta } from './ui.jsx';
import '../styles/story.css';

const stats = [
  { value: '05:00', label: 'Buns out of the oven' },
  { value: '2×', label: 'Smashed, for the crust' },
  { value: '0', label: 'Freezers in the building' },
];

export default function EditorialStory() {
  return (
    <section className="story section" id="story" aria-labelledby="story-title">
      <div className="container story__grid">
        <figure className="story__visual" data-reveal>
          {/* Photo clipped into a burger silhouette: dome bun, patty, base bun */}
          <svg className="story__mask-defs" width="0" height="0" aria-hidden="true">
            <clipPath id="bun-stack" clipPathUnits="objectBoundingBox">
              <path d="M0.04,0.4 C0.04,0.16 0.24,0.02 0.5,0.02 C0.76,0.02 0.96,0.16 0.96,0.4 L0.96,0.42 C0.96,0.44 0.95,0.45 0.93,0.45 L0.07,0.45 C0.05,0.45 0.04,0.44 0.04,0.42 Z" />
              <rect x="0" y="0.48" width="1" height="0.17" rx="0.085" ry="0.085" />
              <path d="M0.04,0.68 L0.96,0.68 L0.96,0.86 C0.96,0.94 0.9,0.98 0.82,0.98 L0.18,0.98 C0.1,0.98 0.04,0.94 0.04,0.86 Z" />
            </clipPath>
          </svg>
          <div className="story__photo" data-speed="0.05">
            <Img id={PHOTO.burgerAlt} w={1000} alt="Close-up of a cheeseburger with dripping cheese" sizes="(max-width: 860px) 92vw, 46vw" />
          </div>
          <div className="story__inset">
            <Img id={PHOTO.grill} w={420} alt="Patties searing on a flat-top grill" sizes="220px" />
          </div>
          <figcaption className="story__caption">
            <span>Fig. 03</span> The Smokehouse, 6:42pm, Wythe Ave.
          </figcaption>
        </figure>

        <div className="story__copy">
          <SectionMeta num="03" label="Our story" aside="Brooklyn, NY" />
          <h2 id="story-title" className="display h-section" data-reveal>
            Built<br />from the<br /><span className="serif">bun</span> up.
          </h2>
          <blockquote className="story__quote" data-reveal style={{ '--d': '0.1s' }}>
            Fresh-ground beef. Toasted brioche. Sharp cheese. Crisp vegetables.
            <strong> Nothing unnecessary.</strong>
          </blockquote>
          <p className="story__body" data-reveal style={{ '--d': '0.15s' }}>
            We started Loud Bun with one flat-top, one recipe and a strong opinion: a great burger
            is about doing a few simple things obsessively well. We still grind the beef every morning,
            and we still smash every patty by hand.
          </p>

          <dl className="story__stats" data-reveal style={{ '--d': '0.2s' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          <a className="link-arrow story__cta" href="#ingredients" data-reveal style={{ '--d': '0.25s' }}>
            Discover our story <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
