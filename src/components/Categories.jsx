import { categories } from '../data/menu.js';
import CategoryCard from './CategoryCard.jsx';
import { SectionMeta } from './ui.jsx';
import '../styles/categories.css';

export default function Categories({ onSelect }) {
  return (
    <section className="cats section" id="menu" aria-labelledby="cats-title">
      <div className="container">
        <SectionMeta num="04" label="The menu" aside="Pick a lane" />
        <div className="cats__head">
          <h2 id="cats-title" className="display h-section" data-reveal>
            What are you<br /><span className="serif">craving?</span>
          </h2>
          <p className="cats__aside" data-reveal style={{ '--d': '0.1s' }}>
            Tap a category to jump straight to it on the menu.
          </p>
        </div>
        <div className="cats__grid">
          {categories.map((c, i) => (
            <CategoryCard key={c.key} cat={c} index={i} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}
