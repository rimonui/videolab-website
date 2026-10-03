import '../styles/marquee.css';

const words = ['Smashed to order', '100% beef', 'Fresh daily', 'Baked at 5am', 'Made loud', 'Since 2026'];

export default function Marquee() {
  const row = (hidden) => (
    <div className="marquee__row" aria-hidden={hidden || undefined}>
      {words.map((w) => (
        <span key={w} className="marquee__item">{w}<span className="marquee__star">✺</span></span>
      ))}
    </div>
  );
  return (
    <div className="marquee" role="presentation">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
