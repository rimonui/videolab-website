import { menuByCategory } from '../data/menu.js';
import Img from './Img.jsx';
import { Arrow } from './ui.jsx';

export default function CategoryCard({ cat, index, onSelect }) {
  const count = menuByCategory[cat.key]?.length ?? 0;
  return (
    <a
      href="#full-menu"
      className={`ccard ccard--${cat.theme} ccard--${cat.key}`}
      onClick={(e) => { e.preventDefault(); onSelect(cat.key); }}
      data-reveal
      style={{ '--d': `${index * 0.06}s` }}
    >
      <div className="ccard__top">
        <span className="ccard__index">0{index + 1}</span>
        <span className="ccard__count">{count} items</span>
      </div>
      <div className="ccard__media" aria-hidden="true">
        <Img id={cat.img} fb={cat.fb} w={600} sizes="(max-width: 860px) 60vw, 30vw" />
      </div>
      <div className="ccard__bottom">
        <h3 className="ccard__name display">{cat.name}</h3>
        <p className="ccard__blurb">{cat.blurb}</p>
      </div>
      <span className="ccard__go" aria-hidden="true"><Arrow /></span>
      <span className="visually-hidden">— view {cat.name.toLowerCase()} on the menu</span>
    </a>
  );
}
