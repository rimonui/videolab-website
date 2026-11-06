import { useEffect, useRef, useState } from 'react';
import FluidCanvas from '../nova/FluidCanvas.jsx';
import {
  ChatCard, AgentCursor, IDLE, USER_1, AGENT_1, USER_2, AGENT_2, STEPS_1,
  localPoint, useThreadAutoscroll, usePointerDepth, reducedMotion,
} from '../nova/AgentStage.jsx';
import { Check, CalendarMark, DriveMark, ChatMark, MailMark, TicketMark } from '../nova/icons.jsx';

/* "Work in, results out": incoming requests pile up on the left, Nova solves
   them in the middle, finished results stack up neatly on the right. The
   agent's own cursor carries each request in and each result out. */

const SOURCE = {
  slack: ChatMark,
  email: MailMark,
  ticket: TicketMark,
  docs: DriveMark,
  calendar: CalendarMark,
};

/* The request Nova picks up each loop. */
const REQUEST = {
  id: 'req', who: 'Maya Chen', initials: 'MC', c: '#FF8B6A', src: 'slack', where: '#design',
  text: 'Schedule a meeting with the design team for tomorrow at 3 PM', ago: 'now', dx: 4, rot: -1.6,
};

/* Work still waiting underneath it. */
const BACKLOG = [
  { id: 'b1', who: 'Jonah Park', initials: 'JP', c: '#3FB6F2', src: 'email', where: 'Inbox', text: 'Refund the duplicate charge on order #4821', ago: '2m', dx: 14, rot: 1.8 },
  { id: 'b2', who: 'Priya Shah', initials: 'PS', c: '#8B6CF6', src: 'ticket', where: 'Support', text: 'Summarize this week’s support tickets', ago: '6m', dx: -4, rot: -2.4 },
  { id: 'b3', who: 'Leo Martin', initials: 'LM', c: '#2FBF7A', src: 'docs', where: 'Product', text: 'Draft release notes for v2.4', ago: '11m', dx: 10, rot: 1.2 },
  { id: 'b4', who: 'Ana Ruiz', initials: 'AR', c: '#F5A524', src: 'email', where: 'Inbox', text: 'Translate the onboarding email to Spanish', ago: '14m', dx: 0, rot: -1 },
];

const DONE_START = [
  { id: 'd1', src: 'email', title: 'Welcome emails sent', meta: '32 new users', secs: '1.2s' },
  { id: 'd2', src: 'slack', title: 'Q3 report shared', meta: '#leadership', secs: '3.0s' },
  { id: 'd3', src: 'ticket', title: '14 tickets triaged', meta: 'Support queue', secs: '4.6s' },
  { id: 'd4', src: 'docs', title: 'Contract summarized', meta: 'Acme renewal', secs: '2.4s' },
];

const RESULT_1 = { src: 'calendar', title: 'Meeting booked', meta: 'Design sync · Tomorrow 3 PM', secs: '2.1s' };
const RESULT_2 = { src: 'docs', title: 'Project brief shared', meta: '4 participants', secs: '3.4s' };

const fmt = (n) => n.toLocaleString('en-US');

function RequestCard({ r, idx, state }) {
  const Mark = SOURCE[r.src];
  return (
    <div
      className="req"
      data-state={state}
      data-req={r.id === 'req' ? 'top' : undefined}
      data-over={idx >= 4 || undefined}
      style={{ '--idx': idx, '--dx': `${r.dx}px`, '--rot': `${r.rot}deg` }}
    >
      <span className="req__head">
        <span className="req__av" style={{ '--c': r.c }}>{r.initials}</span>
        <b>{r.who}</b>
        <span className="req__src"><Mark /> {r.where}</span>
        <em>{r.ago}</em>
      </span>
      <span className="req__text">{r.text}</span>
    </div>
  );
}

function ResultCard({ d, idx }) {
  const Mark = SOURCE[d.src];
  return (
    <div className="res" style={{ '--idx': idx }} data-new={d.fresh || undefined}>
      <span className="res__icon"><Mark /></span>
      <span className="res__body">
        <b>{d.title}</b>
        <small>{d.meta}</small>
      </span>
      <span className="res__done"><Check /> {d.secs}</span>
    </div>
  );
}

function Count({ value, tone }) {
  return (
    <span className={`count count--${tone}`}>
      <span key={value} className="count__n">{fmt(value)}</span>
    </span>
  );
}

export default function PipelineStage() {
  const stageRef = useRef(null);
  const threadRef = useRef(null);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState(IDLE);
  const [working, setWorking] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0, show: false, label: '', click: false, carry: false });
  const [carry, setCarry] = useState(null);
  const [reqState, setReqState] = useState('idle'); // idle | ready | lifted | taken | arriving
  const [results, setResults] = useState(DONE_START);
  const [incoming, setIncoming] = useState(12);
  const [done, setDone] = useState(1284);
  const [beam, setBeam] = useState({ in: false, out: false });

  useEffect(() => {
    if (reducedMotion()) {
      setReqState('taken');
      setMsgs([
        { id: 1, kind: 'user', from: 'Maya Chen · via Slack', text: USER_1 },
        { id: 2, kind: 'work', doneTitle: 'Checked 4 calendars', secs: '2.1s', steps: STEPS_1, done: true },
        { id: 3, kind: 'agent', words: AGENT_1.split(' '), shown: 99 },
        { id: 4, kind: 'event', state: 'done' },
        { id: 5, kind: 'user', from: 'Maya Chen', text: USER_2 },
        { id: 6, kind: 'work', doneTitle: 'Shared the brief', secs: '3.4s', steps: [], done: true },
        { id: 7, kind: 'file', sent: true },
        { id: 8, kind: 'agent', words: AGENT_2.split(' '), shown: 99 },
      ]);
      setResults([{ id: 'n2', ...RESULT_2 }, { id: 'n1', ...RESULT_1 }, ...DONE_START.slice(0, 2)]);
      setDone(1286);
      setIncoming(11);
      return undefined;
    }

    let alive = true;
    let uid = 0;
    let rid = 0;
    const timers = new Set();
    const wait = (ms) => new Promise((resolve) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) resolve(); }, ms);
      timers.add(id);
    });
    const rand = (a, b) => a + Math.random() * (b - a);
    const add = (m) => { const id = ++uid; setMsgs((l) => [...l, { id, ...m }]); return id; };
    const patch = (id, p) => setMsgs((l) => l.map((m) => (m.id === id ? { ...m, ...(typeof p === 'function' ? p(m) : p) } : m)));

    const moveTo = (sels, label, ox, oy) => {
      for (const sel of [].concat(sels)) {
        const p = localPoint(stageRef.current, sel, ox, oy);
        if (p) {
          setCursor((c) => ({ ...c, ...p, show: true, label: label ?? c.label }));
          return true;
        }
      }
      setCursor((c) => ({ ...c, show: false }));
      return false;
    };
    const click = async () => {
      setCursor((c) => ({ ...c, click: true }));
      await wait(240);
      setCursor((c) => ({ ...c, click: false }));
    };
    const stream = async (id, words) => {
      for (let i = 1; i <= words.length; i++) {
        patch(id, { shown: i });
        await wait(rand(45, 90));
      }
    };
    const deliver = async (result, fromSel) => {
      moveTo(fromSel, 'Logging result', 0.5, 0.5);
      await wait(1000);
      await click();
      setCarry({ kind: 'result', title: result.title });
      setCursor((c) => ({ ...c, carry: true }));
      setBeam((b) => ({ ...b, out: true }));
      await wait(200);
      moveTo(['.results [data-slot="0"]', '.pipe-metrics .count--done'], undefined, 0.35, 0.5);
      await wait(1150);
      setCursor((c) => ({ ...c, carry: false }));
      await click();
      setResults((l) => [{ id: `n${++rid}`, fresh: true, ...result }, ...l.map((d) => ({ ...d, fresh: false }))].slice(0, 6));
      setDone((n) => n + 1);
      await wait(500);
      setBeam((b) => ({ ...b, out: false }));
    };

    const play = async () => {
      uid = 0;
      setMsgs([]);
      setClearing(false);
      setDraft(IDLE);
      setWorking(false);
      await wait(900);

      /* 1 — Nova picks the newest request off the pile */
      setReqState('ready');
      await wait(700);
      moveTo(['[data-req="top"]', '.chat .composer'], 'Picking up request', 0.3, 0.45);
      await wait(1150);
      await click();
      setReqState('lifted');
      await wait(260);
      setReqState('taken');
      setIncoming((n) => n - 1);
      setCarry({ kind: 'request', text: REQUEST.text });
      setCursor((c) => ({ ...c, carry: true }));
      setBeam((b) => ({ ...b, in: true }));
      await wait(150);
      moveTo('.chat .composer', 'Bringing it in', 0.22, 0.32);
      await wait(1150);
      setCursor((c) => ({ ...c, carry: false }));
      setBeam((b) => ({ ...b, in: false }));
      await click();
      for (let i = 1; i <= USER_1.length; i += 2) {
        setDraft({ ...IDLE, mode: 'typing', text: USER_1.slice(0, i) });
        await wait(16);
      }
      setDraft({ ...IDLE, mode: 'typing', text: USER_1 });
      await wait(380);
      setDraft({ ...IDLE, mode: 'send', text: USER_1 });
      await wait(240);
      setDraft(IDLE);
      add({ kind: 'user', from: 'Maya Chen · via Slack', text: USER_1 });
      setCursor((c) => ({ ...c, show: false }));
      await wait(600);

      /* 2 — it solves it */
      setWorking(true);
      const w1 = add({ kind: 'work', title: 'Checking the design team’s calendars', doneTitle: 'Checked 4 calendars', secs: '2.1s', steps: [], done: false });
      await wait(900);
      for (const s of STEPS_1) {
        patch(w1, (m) => ({ steps: [...m.steps, s] }));
        await wait(720);
      }
      patch(w1, { done: true });
      await wait(420);
      const r1 = add({ kind: 'agent', words: AGENT_1.split(' '), shown: 0 });
      await stream(r1, AGENT_1.split(' '));
      await wait(220);
      const ev = add({ kind: 'event', state: 'pending' });
      await wait(850);
      moveTo('[data-target="confirm"]', 'Scheduling meeting', 0.42, 0.6);
      await wait(1100);
      await click();
      patch(ev, { state: 'done' });
      await wait(450);

      /* 3 — and files the result */
      await deliver(RESULT_1, '[data-target="confirm"]');
      setCursor((c) => ({ ...c, show: false }));
      setWorking(false);
      await wait(700);

      /* 4 — a follow-up, dictated */
      const words = USER_2.split(' ');
      setDraft({ ...IDLE, mode: 'voice' });
      await wait(450);
      for (let i = 1; i <= words.length; i++) {
        setDraft({ ...IDLE, mode: 'voice', words: words.slice(0, i), final: Math.max(0, i - 2) });
        await wait(rand(220, 300));
      }
      setDraft((d) => ({ ...d, final: words.length }));
      await wait(550);
      setDraft({ ...IDLE, mode: 'send', text: USER_2 });
      await wait(240);
      setDraft(IDLE);
      add({ kind: 'user', from: 'Maya Chen', text: USER_2 });
      await wait(600);

      /* 5 — solved */
      setWorking(true);
      const w2 = add({ kind: 'work', title: 'Finding the project brief', doneTitle: 'Shared the brief with 4 people', secs: '3.4s', steps: [], done: false });
      await wait(1100);
      patch(w2, { title: 'Sharing with 4 participants' });
      const f = add({ kind: 'file', sent: false });
      await wait(1500);
      patch(f, { sent: true });
      patch(w2, { done: true });
      await wait(350);
      const r2 = add({ kind: 'agent', words: AGENT_2.split(' '), shown: 0 });
      await stream(r2, AGENT_2.split(' '));
      await wait(300);
      await deliver(RESULT_2, '[data-target="file"]');
      setCursor((c) => ({ ...c, show: false }));
      setWorking(false);

      /* hold, then the next request lands on the pile */
      await wait(3200);
      setClearing(true);
      setReqState('arriving');
      setIncoming((n) => n + 1);
      await wait(80);
      setReqState('idle');
      await wait(650);
    };

    (async () => {
      await wait(600);
      while (alive) await play();
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  useThreadAutoscroll(threadRef, msgs);
  usePointerDepth(stageRef);

  const reqPresent = reqState !== 'taken';
  const pile = [
    { r: REQUEST, idx: 0, state: reqState },
    ...BACKLOG.map((r, i) => ({ r, idx: i + (reqPresent ? 1 : 0), state: 'idle' })),
  ];

  return (
    <div className="stage pipe-stage" ref={stageRef}>
      <FluidCanvas className="stage__gl" />
      <div className="stage__grain" aria-hidden="true" />

      <p className="sr-only">
        Demo: requests from Slack, email and support tickets pile up on the left. Nova Agent picks up a request to
        schedule a design team meeting for tomorrow at 3 PM, checks four calendars, books it, then shares the
        project brief with all four participants. Each finished task is added to the results list on the right.
      </p>

      <div className="stage__scene" aria-hidden="true" data-ui>
        <section className="pipe-col pipe-col--work">
          <header className="pipe-col__head">
            <b>Work</b>
            <span>Incoming</span>
            <Count value={incoming} tone="work" />
          </header>
          <div className="pile">
            {pile.map(({ r, idx, state }) => (
              <RequestCard key={r.id} r={r} idx={idx} state={state} />
            ))}
          </div>
        </section>

        <span className="pipe-beam pipe-beam--in" data-active={beam.in || undefined} />
        <span className="pipe-beam pipe-beam--out" data-active={beam.out || undefined} />

        <section className="pipe-col pipe-col--results">
          <header className="pipe-col__head">
            <b>Results</b>
            <span>Done today</span>
            <Count value={done} tone="done" />
          </header>
          <div className="results">
            {results.map((d, i) => (
              <div key={d.id} className="results__slot" data-slot={i} style={{ '--idx': i }}>
                <ResultCard d={d} idx={i} />
              </div>
            ))}
          </div>
        </section>

        <div className="pipe-metrics">
          <span><Count value={incoming} tone="work" /> incoming</span>
          <i />
          <span><Count value={done} tone="done" /> done today</span>
        </div>

        <ChatCard working={working} msgs={msgs} draft={draft} clearing={clearing} threadRef={threadRef} />

        <AgentCursor
          cursor={cursor}
          carry={carry && (carry.kind === 'request'
            ? <><ChatMark /> <span className="carry__text">{carry.text}</span></>
            : <><span className="carry__ok"><Check /></span> {carry.title}</>)}
        />
      </div>
    </div>
  );
}
