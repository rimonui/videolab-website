import { useEffect, useRef, useState } from 'react';

const TEXT = 'Most AI only answers. Customers still wait, tickets still pile up, and your best people spend their day copying data between tools. Relay agents do the work.';

export default function Statement() {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  const words = TEXT.split(' ');
  useEffect(() => {
    const on = () => {
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      setP(Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height * 0.9))));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const lit = Math.round(p * words.length);
  return (
    <section className="statement" ref={ref}>
      <p>
        {words.map((w, i) => (
          <span key={i} className={i < lit ? 'lit' : ''}>{w} </span>
        ))}
      </p>
    </section>
  );
}
