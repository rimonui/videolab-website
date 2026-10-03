import { products, formatPrice } from '../data/menu.js';
import { useAdd } from './useAdd.js';
import Img from './Img.jsx';
import { Plus, Check } from './ui.jsx';

/* One signature burger. `variant` changes composition, not content:
   feature · tall · default · dark · wide */
export default function BurgerCard({ id, num, tag, variant = 'default', note, delay = 0 }) {
  const [added, onAdd] = useAdd(id);
  const p = products[id];
  const tagClass = variant === 'dark' ? 'tag' : variant === 'wide' ? 'tag tag--orange' : 'tag';

  return (
    <article className={`bcard bcard--${variant}`} data-reveal style={{ '--d': `${delay}s` }}>
      <div className="bcard__media media">
        <Img id={p.img} fb={p.fb} w={variant === 'feature' || variant === 'wide' ? 900 : 640} alt={`${p.name} burger`} sizes="(max-width: 860px) 92vw, 40vw" />
      </div>

      {variant === 'wide' && <span className="bcard__big" aria-hidden="true">3×</span>}

      <div className="bcard__body">
        <div className="bcard__top">
          <span className="bcard__num">{num}</span>
          <span className={tagClass}>{tag}</span>
        </div>
        <h3 className="bcard__name display">{p.name}</h3>
        <p className="bcard__desc">{p.desc}</p>
        {note && <p className="bcard__note">{note}</p>}
        <div className="bcard__foot">
          <span className="bcard__price">{formatPrice(p.price)}</span>
          <button className={`btn btn--sm bcard__add ${added ? 'is-added' : ''}`} onClick={onAdd} aria-label={`Add ${p.name} to order`}>
            {added ? <>Added <Check /></> : <>Add to order <Plus /></>}
          </button>
        </div>
      </div>
    </article>
  );
}
