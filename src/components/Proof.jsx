import { useEffect, useState } from 'react';
import { Relief, Play } from './ui.jsx';
import { useInView, reducedMotion } from './motion.js';

function Count({ to, suffix = '', run }) {
  const [v, setV] = useState(reducedMotion() ? to : 0);
  useEffect(() => {
    if (!run || reducedMotion()) return;
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1400);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v}{suffix}</>;
}

export default function Proof() {
  const [ref, seen] = useInView(0.4);
  return (
    <section className="proof">
      <div className="proof__top">
        <h2 className="h2 h2--md" data-reveal>See how leading teams put AI agents to work across support and operations.</h2>
        <blockquote data-reveal>
          “Relay agents now close most of our requests before a person ever sees them — and when they do hand off,
          the case arrives already solved. It changed how our whole team works.”
        </blockquote>
      </div>
      <div className="proof__mid" ref={ref}>
        <div className="stats">
          <div className="stat" data-reveal><b><Count to={82} suffix="%" run={seen} /></b><span>Requests resolved autonomously</span></div>
          <div className="stat" data-reveal style={{ '--d': '90ms' }}><b><Count to={31} suffix="hrs" run={seen} /></b><span>Saved per agent, per week</span></div>
        </div>
        <div className="person" data-reveal>
          <span className="avatar avatar--c">AR</span>
          <div><b>Amara Reyes</b><span>VP Customer Operations, Northbank</span></div>
        </div>
      </div>
      <div className="film" data-reveal>
        <Relief seed={33} freq={0.003} tint="#d8cbbb" elevation={38} depth={18} />
        <div className="film__shade" />
        <div className="film__copy">
          <span className="film__kicker">Customer story</span>
          <p>From 14,000 tickets a month<br />to a team that only sees<br />the ones that matter.</p>
        </div>
        <button className="film__play"><Play /> Watch video</button>
      </div>
    </section>
  );
}
