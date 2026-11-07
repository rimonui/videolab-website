let uid = 0;

export function Logo({ light = true }) {
  return (
    <a href="#top" className={`logo ${light ? 'logo--light' : ''}`} aria-label="Relay home">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="currentColor" />
        <path d="M10 23V10h7a4 4 0 0 1 0 8h-3.5l6 5" stroke="var(--logo-ink)" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Relay</span>
    </a>
  );
}

// Embossed plaster relief, generated with SVG lighting filters (no image files).
export function Relief({ seed = 3, freq = 0.004, tint = '#ebe5da', elevation = 44, depth = 14, className = '' }) {
  const id = `relief-${seed}-${uid++}`;
  return (
    <svg className={`relief ${className}`} preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 800" aria-hidden="true">
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="turbulence" baseFrequency={freq} numOctaves="3" seed={seed} result="n" />
        <feGaussianBlur in="n" stdDeviation="1.5" result="b" />
        <feDiffuseLighting in="b" surfaceScale={depth} diffuseConstant="1.05" lightingColor={tint}>
          <feDistantLight azimuth="235" elevation={elevation} />
        </feDiffuseLighting>
      </filter>
      <rect width="800" height="800" filter={`url(#${id})`} />
    </svg>
  );
}

export const Check = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Play = () => (
  <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>
);
export const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
