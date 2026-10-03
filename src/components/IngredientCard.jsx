import Img from './Img.jsx';

export default function IngredientCard({ num, title, note, label, img, fb, index }) {
  return (
    <article className="icard" data-reveal style={{ '--d': `${index * 0.08}s` }}>
      <div className="icard__media media">
        <Img id={img} fb={fb} w={560} alt={title} sizes="(max-width: 860px) 46vw, 20vw" />
        <span className="icard__label" style={{ '--rot': `${index % 2 ? 4 : -5}deg` }}>{label}</span>
      </div>
      <div className="icard__body">
        <span className="icard__num">{num}</span>
        <h3 className="icard__title display">{title}</h3>
        <p className="icard__note">{note}</p>
      </div>
    </article>
  );
}
