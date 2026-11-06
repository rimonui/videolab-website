/* Small inline icon set. Stroke icons inherit currentColor. */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Spark = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M12 2.5c.7 4.9 3.6 7.8 8.5 8.5v1c-4.9.7-7.8 3.6-8.5 8.5h-1c-.7-4.9-3.6-7.8-8.5-8.5v-1C7.4 10.3 10.3 7.4 11 2.5z" fill="currentColor" transform="translate(.5 .5)" />
  </svg>
);

export const ArrowRight = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const ArrowUp = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} strokeWidth="2.2" d="M12 19V5M6 11l6-6 6 6" /></svg>
);

export const Check = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} strokeWidth="2.4" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export const Chevron = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} strokeWidth="2" d="M7 10l5 5 5-5" /></svg>
);

export const Plus = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} d="M12 5v14M5 12h14" /></svg>
);

export const Mic = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <rect {...S} x="9" y="3" width="6" height="11" rx="3" />
    <path {...S} d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);

export const Sliders = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path {...S} d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle {...S} cx="15" cy="7" r="2" /><circle {...S} cx="9" cy="17" r="2" />
  </svg>
);

export const Dots = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <circle cx="5" cy="12" r="1.7" fill="currentColor" /><circle cx="12" cy="12" r="1.7" fill="currentColor" /><circle cx="19" cy="12" r="1.7" fill="currentColor" />
  </svg>
);

export const Menu = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} d="M4 8h16M4 16h16" /></svg>
);

export const Close = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path {...S} d="M6 6l12 12M18 6L6 18" /></svg>
);

export const Video = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <rect {...S} x="3" y="6.5" width="12.5" height="11" rx="2.5" /><path {...S} d="M15.5 10.5l5-3v9l-5-3" />
  </svg>
);

export const Clock = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><circle {...S} cx="12" cy="12" r="8.5" /><path {...S} d="M12 7.5V12l3 2" /></svg>
);

/* Agent pointer, drawn like a design-tool cursor. */
export const Pointer = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M4.2 2.9l15.1 7.3c.9.4.8 1.7-.1 2l-6.1 1.9-2.6 5.9c-.4.9-1.7.8-2-.1L3 4.3c-.3-.9.5-1.7 1.2-1.4z" fill="currentColor" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

/* Tool marks: simple, generic glyphs in their own colours. */
export const CalendarMark = (p) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <rect x="4" y="6" width="24" height="22" rx="5" fill="#fff" />
    <path d="M4 11a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v1H4z" fill="#2F6BFF" />
    <rect x="10" y="3" width="2.6" height="6" rx="1.3" fill="#1A3FB8" /><rect x="19.4" y="3" width="2.6" height="6" rx="1.3" fill="#1A3FB8" />
    <text x="16" y="24.5" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0A1022" fontFamily="Geist Variable, system-ui, sans-serif">14</text>
  </svg>
);

export const DriveMark = (p) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <path d="M8 4h11l7 7v15a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#fff" />
    <path d="M19 4l7 7h-5a2 2 0 0 1-2-2z" fill="#B9CCF7" />
    <rect x="9" y="15" width="13" height="2.2" rx="1.1" fill="#F2545B" /><rect x="9" y="19.5" width="10" height="2.2" rx="1.1" fill="#C7D0E0" /><rect x="9" y="24" width="12" height="2.2" rx="1.1" fill="#C7D0E0" />
  </svg>
);

export const ChatMark = (p) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <path d="M6 5h20a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H14l-6 5v-5H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" fill="#fff" />
    <path d="M12.5 10l-1.6 10M19.1 10l-1.6 10M9.5 13.4h13M8.8 17h13" stroke="#7B5CFF" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const PdfMark = (p) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <path d="M8 3h11l7 7v16a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" fill="#FFE9EA" />
    <path d="M19 3l7 7h-5a2 2 0 0 1-2-2z" fill="#F9B8BC" />
    <rect x="7" y="16" width="16" height="8" rx="2" fill="#F2545B" />
    <text x="15" y="22.3" textAnchor="middle" fontSize="6" fontWeight="800" fill="#fff" fontFamily="Geist Variable, system-ui, sans-serif">PDF</text>
  </svg>
);

export const MailMark = (p) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <rect x="3" y="7" width="26" height="19" rx="4" fill="#fff" />
    <path d="M4.5 9.5l11.5 8.5 11.5-8.5" fill="none" stroke="#EA4C3B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TicketMark = (p) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <path d="M5 8h22a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6v-3a2 2 0 0 1 2-2z" fill="#fff" />
    <path d="M12 12h9M12 16h7M12 20h8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
