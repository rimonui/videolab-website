import { useEffect, useState } from 'react';
import { Relief, Check, Play } from './ui.jsx';
import { reducedMotion } from './motion.js';

// Script for the live agent demo. `at` is ms from the start of the loop.
const SCRIPT = [
  { at: 400, type: 'user', text: 'I was charged twice for my March invoice. Can you sort it out?' },
  { at: 1700, type: 'tool', text: 'Looking up account', meta: 'Billing API' },
  { at: 2600, type: 'tool', text: 'Duplicate charge found · $49.00', meta: 'Stripe' },
  { at: 3500, type: 'tool', text: 'Refund issued', meta: 'Policy ✓' },
  { at: 4600, type: 'agent', text: "Done — I've refunded the duplicate $49.00. It'll land in 3–5 business days." },
  { at: 6600, type: 'user', text: 'That was fast. Thank you!' },
  { at: 7600, type: 'done' },
];
const LOOP = 11500;

function useScript() {
  const [step, setStep] = useState(reducedMotion() ? SCRIPT.length : 0);
  useEffect(() => {
    if (reducedMotion()) return;
    let timers = [];
    const run = () => {
      setStep(0);
      timers = SCRIPT.map((s, i) => setTimeout(() => setStep(i + 1), s.at));
      timers.push(setTimeout(run, LOOP));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);
  return step;
}

function AgentCard() {
  const step = useScript();
  const shown = SCRIPT.slice(0, step);
  const lastTool = shown.filter((s) => s.type === 'tool').length;
  const thinking = step >= 1 && step < 5;
  const done = step >= SCRIPT.length;
  const tools = shown.filter((s) => s.type === 'tool');

  return (
    <div className="agent" aria-label="Live demo of a Relay agent resolving a billing request">
      <div className="agent__body">
        <div className="agent__head">
          <span className="avatar avatar--a">MK</span>
          <span className="agent__name">Maya</span>
          <span className="chip">Billing request</span>
          <span className="agent__time">now</span>
        </div>
        <div className="agent__thread">
          {shown.map((s, i) => {
            if (s.type === 'user') return <p key={i} className="msg msg--user pop">{s.text}</p>;
            if (s.type === 'agent') return (
              <div key={i} className="msg-row pop"><p className="msg msg--agent">{s.text}</p><span className="dot-avatar" /></div>
            );
            if (s.type === 'tool' && s === tools[0]) return (
              <div key={i} className="tools pop">
                {tools.map((t, j) => (
                  <div key={j} className={`tool ${j === lastTool - 1 && thinking ? 'tool--live' : ''}`}>
                    <span className="tool__ic">{j === lastTool - 1 && thinking ? <span className="spin" /> : <Check />}</span>
                    <span>{t.text}</span>
                    <span className="tool__meta">{t.meta}</span>
                  </div>
                ))}
              </div>
            );
            return null;
          })}
          {thinking && step < 2 && <div className="typing pop"><i /><i /><i /></div>}
        </div>
      </div>
      <div className="agent__foot">
        <span className="mark"><svg viewBox="0 0 32 32" width="22" height="22"><rect width="32" height="32" rx="6" fill="#ff5a1f" /><path d="M10 23V10h7a4 4 0 0 1 0 8h-3.5l6 5" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        {done
          ? <span className="foot__done"><b>Resolved</b> by Relay agent · 38s · no handoff</span>
          : <span className="foot__live"><span className="pulse" />Agent working…</span>}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__left">
        <div className="hero__content">
          <a className="hero__story" href="#customers" data-reveal>
            <div className="hero__thumb">
              <Relief seed={9} freq={0.012} tint="#c9b9a6" />
              <span className="thumb__stat">82%</span>
            </div>
            <div>
              <p>See how Northbank resolved 82% of support requests with Relay agents.</p>
              <span className="hero__watch"><Play /> Watch story</span>
            </div>
          </a>
          <h1 className="hero__title" data-reveal>
            <span className="line"><span>AI agents that resolve,</span></span>
            <span className="line"><span>not just reply.</span></span>
          </h1>
          <p className="hero__sub" data-reveal>
            Relay deploys AI agents that read every request, take action in your tools, and close the loop —
            with full visibility into every decision your team needs to trust.
          </p>
          <div className="hero__cta" data-reveal>
            <a href="#demo" className="btn btn--accent">Book a Demo</a>
            <a href="#product" className="btn btn--ghost">How it works</a>
          </div>
        </div>
      </div>
      <div className="hero__right">
        <Relief seed={4} className="hero__relief" />
        <AgentCard />
      </div>
    </section>
  );
}
