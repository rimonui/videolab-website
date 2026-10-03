import { ingredients, specSheet } from '../data/menu.js';
import IngredientCard from './IngredientCard.jsx';
import { SectionMeta } from './ui.jsx';
import '../styles/ingredients.css';

export default function Ingredients() {
  return (
    <section className="ingr section" id="ingredients" aria-labelledby="ingr-title">
      <div className="container">
        <SectionMeta num="06" label="Ingredients" aside="The spec sheet" />

        <div className="ingr__head">
          <h2 id="ingr-title" className="display h-section" data-reveal>
            Good burgers<br />start with<br /><span className="serif">good stuff.</span>
          </h2>

          <div className="ingr__spec" data-reveal style={{ '--d': '0.12s' }}>
            <p className="label ingr__spec-title">What goes in a Loud Bun</p>
            <dl>
              {specSheet.map(([k, v]) => (
                <div key={k} className="ingr__row">
                  <dt>{k}</dt>
                  <span className="ingr__leader" aria-hidden="true" />
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="ingr__grid">
          {ingredients.map((ing, i) => (
            <IngredientCard key={ing.num} {...ing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
