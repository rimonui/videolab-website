/* Small shared building blocks: icons, logo, section meta, stickers. */

export const Arrow = ({ className = '' }) => (
  <svg className={`icon-arrow ${className}`} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Plus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const Minus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const Bag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Star = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" fill="currentColor" />
  </svg>
);

export const Stars = ({ n = 5, size = 16 }) => (
  <span className="stars" role="img" aria-label={`${n} out of 5 stars`}>
    {Array.from({ length: n }, (_, i) => <Star key={i} size={size} />)}
  </span>
);

export const LogoMark = ({ size = 38 }) => (
  <svg className="logo-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="var(--mark-bg, #F6A70A)" />
    <path d="M9 19a11 9 0 0 1 22 0z" fill="var(--mark-bun, #4D0805)" />
    <rect x="8" y="21" width="24" height="4" rx="2" fill="var(--mark-patty, #FFF7DD)" />
    <rect x="9" y="27" width="22" height="4" rx="2" fill="var(--mark-bun, #4D0805)" />
  </svg>
);

export const Logo = () => (
  <span className="logo">
    <LogoMark />
    <span className="logo__word">Loud Bun</span>
  </span>
);

/* Editorial "01 / Label ———— 2026" header bar used across sections. */
export const SectionMeta = ({ num, label, aside = 'Loud Bun Burger Co.' }) => (
  <div className="sec-meta" data-reveal>
    <span className="sec-meta__num">{num}</span>
    <span className="sec-meta__label">{label}</span>
    <span className="sec-meta__rule" aria-hidden="true" />
    <span className="sec-meta__aside">{aside}</span>
  </div>
);

/* Starburst sticker (SVG so it scales crisply at any size). */
export const Burst = ({ children, className = '', points = 14 }) => {
  const d = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? 41 : 50;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return (
    <span className={`burst ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={d} /></svg>
      <span className="burst__text">{children}</span>
    </span>
  );
};

/* Rotating circular type ring. */
export const TextRing = ({ text, className = '' }) => (
  <svg className={`text-ring ${className}`} viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <path id={`ring-${className}`} d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
    </defs>
    <text>
      <textPath href={`#ring-${className}`} startOffset="0">{text}</textPath>
    </text>
  </svg>
);

export const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
