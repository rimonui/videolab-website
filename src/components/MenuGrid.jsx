import { products, menuHighlights, menuByCategory, menuTabs, formatPrice } from '../data/menu.js';
import Img from './Img.jsx';
import { Arrow, Plus, Check, SectionMeta } from './ui.jsx';
import { useAdd } from './useAdd.js';
import '../styles/menu.css';

const labels = { burgers: 'Burger', fries: 'Fries', sides: 'Side', shakes: 'Shake', drinks: 'Drink' };

function MenuItem({ id, size, index }) {
  const [added, onAdd] = useAdd(id);
  const p = products[id];
  const isChicken = id === 'chicken';
  return (
    <article className={`mitem mitem--${size || 'sm'}`} style={{ '--i': index }}>
      <header className="mitem__meta">
        <span className="mitem__cat">{isChicken ? 'Chicken burger' : labels[p.category]}</span>
        <span className="mitem__price">{formatPrice(p.price)}</span>
      </header>
      <div className="mitem__media media">
        <Img id={p.img} fb={p.fb} w={size === 'lg' ? 900 : 520} alt={p.name} sizes={size === 'lg' ? '(max-width: 860px) 92vw, 46vw' : '(max-width: 860px) 46vw, 23vw'} />
      </div>
      <div className="mitem__body">
        <div>
          <h3 className="mitem__name display">{p.name}</h3>
          <p className="mitem__desc">{p.desc}</p>
        </div>
        <button className={`add-btn ${added ? 'is-added' : ''}`} onClick={onAdd} aria-label={`Add ${p.name} to order`}>
          {added ? <Check /> : <Plus />}
        </button>
      </div>
    </article>
  );
}

export default function MenuGrid({ filter, onFilter }) {
  const items =
    filter === 'highlights' ? menuHighlights
    : filter === 'all' ? Object.values(menuByCategory).flat()
    : menuByCategory[filter] || [];

  return (
    <section className="fullmenu section" id="full-menu" aria-labelledby="menu-title">
      <div className="container">
        <SectionMeta num="05" label="The full stack" aside="Menu · Autumn 2026" />

        <div className="fullmenu__masthead">
          <h2 id="menu-title" className="display h-section" data-reveal>
            The full<br />stack.
          </h2>
          <div className="fullmenu__intro" data-reveal style={{ '--d': '0.1s' }}>
            <p>Burgers first, always. Everything else is here to make them look even better.</p>
            <p className="fullmenu__count label">{items.length} items showing</p>
          </div>
        </div>

        <div className="fullmenu__tabs" role="toolbar" aria-label="Filter menu">
          {menuTabs.map((t) => (
            <button
              key={t.key}
              className={`chip ${filter === t.key ? 'is-active' : ''}`}
              aria-pressed={filter === t.key}
              onClick={() => onFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="fullmenu__grid" key={filter} aria-live="polite">
          {items.map((it, i) => (
            <MenuItem key={`${filter}-${it.id}`} {...it} index={i} />
          ))}
        </div>

        <div className="fullmenu__foot">
          {filter !== 'all' ? (
            <button className="btn btn--red btn--lg" onClick={() => onFilter('all')}>
              View full menu <Arrow />
            </button>
          ) : (
            <button className="btn btn--ghost btn--lg" onClick={() => onFilter('highlights')}>
              Back to highlights
            </button>
          )}
          <p className="label">Prices include tax · Lettuce wrap on request</p>
        </div>
      </div>
    </section>
  );
}
