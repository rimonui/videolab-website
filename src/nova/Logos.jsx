/* Placeholder customer wordmarks — fictional, swap for real logos before launch. */

const Northpeak = () => (
  <span className="lg lg--northpeak">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20L9.5 6l4 7.2L16 9l6 11z" fill="currentColor" /></svg>
    northpeak
  </span>
);

const Fernway = () => (
  <span className="lg lg--fernway">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16zm0 0l9-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
    FERNWAY
  </span>
);

const Kitewing = () => (
  <span className="lg lg--kitewing">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 9-7 11-7-11z" fill="currentColor" /><path d="M5 11h14" stroke="var(--bg)" strokeWidth="1.6" /></svg>
    Kitewing
  </span>
);

const Basalt = () => <span className="lg lg--basalt">basalt.</span>;

const Orbitly = () => (
  <span className="lg lg--orbitly">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>
    orbitly
  </span>
);

const Pinebox = () => (
  <span className="lg lg--pinebox">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" /><path d="M12 5l5 7h-3l3 5H7l3-5H7z" fill="var(--bg)" /></svg>
    Pinebox
  </span>
);

const Halden = () => (
  <span className="lg lg--halden">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="3.5" fill="currentColor" /><rect x="14" y="3" width="7" height="18" rx="3.5" fill="currentColor" opacity=".55" /></svg>
    Halden
  </span>
);

const Quarry = () => (
  <span className="lg lg--quarry">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8.7 5v10L12 22l-8.7-5V7z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>
    quarry
  </span>
);

const Lumen = () => (
  <span className="lg lg--lumen">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor" /><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
    Lumen&amp;Co
  </span>
);

const Vertex = () => (
  <span className="lg lg--vertex">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h6l4 8 4-8h6L12 22z" fill="currentColor" /></svg>
    VERTEX
  </span>
);

export const LOGO_PAIRS = [
  [Northpeak, Pinebox],
  [Fernway, Halden],
  [Kitewing, Quarry],
  [Basalt, Lumen],
  [Orbitly, Vertex],
];
