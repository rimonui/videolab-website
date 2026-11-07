import { useState } from 'react';

const O = '#ff5a1f';
const Dot = ({ x, y, r = 3.2, soft }) => <circle cx={x} cy={y} r={r} fill={O} opacity={soft ? 0.45 : 1} />;
const Pulse = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="14" fill={O} opacity="0.12" className="ring" />
    <circle cx={x} cy={y} r="9" fill={O} opacity="0.18" />
    <circle cx={x} cy={y} r="4.5" fill={O} />
  </g>
);

const DIAGRAMS = {
  understand: (
    <>
      {[60, 110, 160].map((y) => <path key={y} className="draw" d={`M40 ${y}H260`} stroke={O} strokeOpacity=".35" />)}
      <path className="draw" d="M150 30V190" stroke={O} />
      {[60, 110, 160].flatMap((y) => [<Dot key={`a${y}`} x={40} y={y} r={2.4} soft />, <Dot key={`b${y}`} x={260} y={y} r={2.4} soft />])}
      <Dot x={150} y={60} /><Dot x={150} y={160} /><Pulse x={150} y={110} />
    </>
  ),
  plan: (
    <>
      <path className="draw" d="M40 110H120C160 110 160 55 200 55H262" stroke={O} />
      <path className="draw" d="M120 110H262" stroke={O} strokeOpacity=".35" />
      <path className="draw" d="M120 110C160 110 160 165 200 165H262" stroke={O} strokeOpacity=".35" />
      <Dot x={40} y={110} r={2.4} soft /><Pulse x={120} y={110} />
      <Dot x={262} y={55} /><Dot x={262} y={110} r={2.4} soft /><Dot x={262} y={165} r={2.4} soft />
    </>
  ),
  act: (
    <>
      <path className="draw" d="M30 160H110L150 50L190 160H270" stroke={O} />
      {[30, 70, 110, 190, 230, 270].map((x) => <Dot key={x} x={x} y={160} r={2.4} soft />)}
      <Pulse x={150} y={50} />
    </>
  ),
  learn: (
    <>
      <path className="draw" d="M40 150C90 175 150 185 200 150C230 125 250 95 262 60" stroke={O} strokeOpacity=".35" />
      <path className="draw" d="M40 150L95 128L150 112L200 92L262 60" stroke={O} />
      <Dot x={40} y={150} /><Dot x={95} y={128} /><Dot x={150} y={112} /><Dot x={200} y={92} />
      <Pulse x={262} y={60} />
    </>
  ),
};

const MODES = {
  'AI agents': [
    ['understand', 'Understand', 'Reads every ticket, email, and call with full customer context from your systems.'],
    ['plan', 'Plan', 'Chooses the right next step from your policies, playbooks, and past resolutions.'],
    ['act', 'Act', 'Takes real action — refunds, updates, bookings — inside the tools you already use.'],
    ['learn', 'Learn', 'Measures every outcome and improves from the cases your best people resolve.'],
  ],
  'Human team': [
    ['understand', 'Triage', 'Agents pre-read and summarise every case before it reaches a person.'],
    ['plan', 'Escalate', 'Hand off edge cases with the evidence and a suggested resolution attached.'],
    ['act', 'Approve', 'Keep humans in the loop for sensitive actions with one-click approvals.'],
    ['learn', 'Coach', 'Spot gaps in knowledge and process, and turn fixes into agent behaviour.'],
  ],
};

export default function Loop() {
  const [mode, setMode] = useState('AI agents');
  return (
    <section className="loop" id="product">
      <div className="tabs" role="tablist" data-reveal>
        {Object.keys(MODES).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'is-on' : ''} onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>
      <div className="loop__grid" key={mode}>
        {MODES[mode].map(([d, title, text], i) => (
          <article className="loop__card" data-reveal style={{ '--d': `${i * 90}ms` }} key={title}>
            <svg viewBox="0 0 300 220" className="diagram" fill="none" strokeWidth="1.4" aria-hidden="true">{DIAGRAMS[d]}</svg>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
