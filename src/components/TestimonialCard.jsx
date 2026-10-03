import Img from './Img.jsx';
import { Stars } from './ui.jsx';

export default function TestimonialCard({ quote, name, meta, avatar, theme, index }) {
  return (
    <figure className={`tcard tcard--${theme}`} data-reveal style={{ '--d': `${index * 0.08}s` }}>
      <Stars />
      <blockquote className="tcard__quote">“{quote}”</blockquote>
      <figcaption className="tcard__who">
        <span className="tcard__avatar">
          <Img id={avatar} fb="person" w={120} alt="" sizes="48px" />
        </span>
        <span>
          <strong>{name}</strong>
          <small>{meta}</small>
        </span>
      </figcaption>
    </figure>
  );
}
