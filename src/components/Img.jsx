import { useState } from 'react';
import { FALLBACK } from '../data/menu.js';

const url = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78`;

/* Responsive Unsplash image with a graceful fallback chain:
   requested photo → category fallback → warm placeholder block. */
export default function Img({ id, alt = '', w = 800, fb = 'burger', eager = false, className = '', sizes }) {
  const [src, setSrc] = useState(id);
  const [failed, setFailed] = useState(false);

  const onError = () => {
    const next = FALLBACK[fb] || FALLBACK.burger;
    if (src !== next) setSrc(next);
    else setFailed(true);
  };

  return (
    <img
      className={`img ${failed ? 'img--failed' : ''} ${className}`}
      src={url(src, w)}
      srcSet={`${url(src, Math.round(w / 2))} ${Math.round(w / 2)}w, ${url(src, w)} ${w}w, ${url(src, w * 2)} ${w * 2}w`}
      sizes={sizes || `${w}px`}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      decoding="async"
      onError={onError}
    />
  );
}
