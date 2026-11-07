import { useEffect, useState } from 'react';
import { Relief, Check } from './ui.jsx';
import { useInView } from './motion.js';

const TABS = [
  ['Resolution', 'Agents close requests end to end — not just deflect them — and show their work at every step.'],
  ['Oversight', 'Set guardrails, approvals, and escalation rules. Every action is logged and reviewable.'],
  ['Insight', 'Turn every conversation into structured data on friction, demand, and customer outcomes.'],
];

function Queue() {
  const rows = [
    ['Refund duplicate charge', 'Billing', '12s', 'ok'],
    ['Change delivery address', 'Orders', '21s', 'ok'],
    ['Cancel subscription', 'Retention', '—', 'live'],
    ['Dispute: missing item', 'Claims', '—', 'wait'],
  ];
  return (
    <div className="ui-card">
      <div className="ui-card__title"><span className="bars"><i /><i /><i /></span>Live queue</div>
      {rows.map(([t, tag, time, st], i) => (
        <div className="q-row" key={t} style={{ '--d': `${i * 120}ms` }}>
          <span className={`q-st q-st--${st}`}>{st === 'ok' ? <Check /> : st === 'live' ? <span className="spin spin--sm" /> : ''}</span>
          <span className="q-t">{t}</span>
          <span className="q-tag">{tag}</span>
          <span className="q-time">{time}</span>
        </div>
      ))}
    </div>
  );
}

function Approval() {
  const [state, setState] = useState('idle');
  return (
    <div className="ui-card ui-card--wide">
      <div className="appr__head"><span className="avatar avatar--b">JS</span><b>James Smith</b><span className="q-time">2 min</span></div>
      <div className="appr__box">
        <div className="appr__row"><b>Goodwill credit · $120</b><span className="chip chip--warn">Needs approval</span></div>
        <p>Order arrived 9 days late and the customer is on a yearly plan. Policy allows up to $150. Recommending credit + apology.</p>
        <div className="appr__actions">
          <button className={`btn btn--dark btn--sm ${state === 'ok' ? 'is-done' : ''}`} onClick={() => setState('ok')}>
            {state === 'ok' ? <><Check /> Approved</> : 'Approve'}
          </button>
          <button className="btn btn--line btn--sm" onClick={() => setState('idle')}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function Alerts() {
  return (
    <>
      <div className="ui-card">
        <div className="ui-card__title ui-card__title--red">⚑ Signals</div>
        {[['Customer threatening to churn', 'Just now'], ['Policy question unanswered', '1m ago'], ['Repeat contact in 24h', '3m ago']].map(([t, a]) => (
          <div className="sig" key={t}><span>{t}</span><span className="q-time">{a}</span></div>
        ))}
      </div>
      <div className="note">
        <span className="mark mark--sm" />
        <p>I spotted 3 new churn signals this morning and opened cases for each. They're in your Signals view.</p>
        <span className="q-time">Just now</span>
      </div>
    </>
  );
}

function Steps() {
  const [ref, seen] = useInView(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const id = setInterval(() => setN((x) => (x + 1) % 5), 1100);
    return () => clearInterval(id);
  }, [seen]);
  const steps = [['Request received & classified', 'Payment dispute', 'auto-tagged'], ['Evidence gathered', 'Order, payment, chat history'], ['Action taken', 'Refund issued via Stripe'], ['Customer notified', 'Email + in-app']];
  return (
    <div className="ui-card" ref={ref}>
      <div className="ui-card__title ui-card__title--red">⚑ Transfer failed, funds not returned</div>
      {steps.map(([t, s, tag], i) => (
        <div className={`step ${i < n ? 'is-done' : i === n ? 'is-live' : ''}`} key={t}>
          <span className="step__dot" />
          <div><b>{t}</b><small>{s}</small></div>
          {tag && <span className="q-time">{tag}</span>}
        </div>
      ))}
    </div>
  );
}

function Flow() {
  return (
    <div className="flow">
      <span className="flow__node">New request</span>
      <span className="flow__line" />
      <span className="flow__node flow__node--on">Agent decides</span>
      <span className="flow__split"><i /><i /></span>
      <div className="flow__row"><span className="flow__node">Resolve</span><span className="flow__node">Escalate with notes</span></div>
    </div>
  );
}

const CARDS = [
  { ui: <Queue />, bg: 'relief', title: 'Resolve, end to end', text: 'Agents finish the job inside your billing, order, and CRM tools — and log every step.' },
  { ui: <Approval />, bg: 'dark', title: 'Humans approve what matters', text: 'Sensitive actions route to your team with the evidence and a recommendation attached.' },
  { ui: <Alerts />, bg: 'relief2', title: 'Catch risk before it escalates', text: 'Detect churn signals, policy gaps, and repeat contact — with the conversation as proof.' },
  { ui: <Steps />, bg: 'plain', title: 'Every case keeps moving', text: 'Track each request from intake to resolution, with deadlines handled automatically.' },
  { ui: <Flow />, bg: 'plain', title: 'Your rules, not a black box', text: 'Write guardrails in plain language. Test changes on past cases before they go live.' },
];

export default function Features() {
  const [tab, setTab] = useState(0);
  return (
    <section className="features" id="agents">
      <h2 className="h2" data-reveal>Every request.<br />Actually resolved.</h2>
      <div className="features__grid">
        <aside className="features__tabs" data-reveal>
          {TABS.map(([t, d], i) => (
            <button key={t} className={`ftab ${tab === i ? 'is-on' : ''}`} onClick={() => setTab(i)}>
              <span className="ftab__t">{t}</span>
              <span className="ftab__d">{d}</span>
              <span className="ftab__bar" />
            </button>
          ))}
        </aside>
        <div className="bento">
          {CARDS.map((c, i) => (
            <article className="bento__item" key={c.title} data-reveal style={{ '--d': `${(i % 3) * 90}ms` }}>
              <div className={`bento__stage bento__stage--${c.bg}`}>
                {c.bg === 'relief' && <Relief seed={11} freq={0.009} tint="#ece6dc" className="relief--corner" />}
                {c.bg === 'relief2' && <Relief seed={21} freq={0.014} tint="#bfcdb4" className="relief--corner2" />}
                <div className="bento__ui">{c.ui}</div>
              </div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
