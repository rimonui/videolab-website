import { useEffect, useRef, useState } from 'react';
import FluidCanvas from './FluidCanvas.jsx';
import {
  Spark, ArrowUp, Check, Plus, Mic, Sliders, Dots, Pointer, Clock, Video,
  CalendarMark, DriveMark, ChatMark, PdfMark,
} from './icons.jsx';

/* ------------------------------------------------------------------ */
/* Script content                                                      */
/* ------------------------------------------------------------------ */

export const USER_1 = 'Can you schedule a meeting with our design team for tomorrow at 3 PM?';
export const AGENT_1 = 'Absolutely! I found 4 available team members. Tomorrow at 3:00 PM works for everyone.';
export const USER_2 = 'Great. Also send them the project brief.';
export const AGENT_2 = 'Done! Meeting scheduled and the project brief has been shared with all 4 participants.';

export const TEAM = [
  { i: 'MA', name: 'Maya', c: '#FF8B6A' },
  { i: 'JO', name: 'Jonah', c: '#3FB6F2' },
  { i: 'PR', name: 'Priya', c: '#8B6CF6' },
  { i: 'LE', name: 'Leo', c: '#2FBF7A' },
];

const TOOLS = [
  { id: 'calendar', name: 'Calendar', Mark: CalendarMark, busy: 'Checking 4 calendars', done: 'Slot found' },
  { id: 'drive', name: 'Drive', Mark: DriveMark, busy: 'Opening the brief', done: 'File attached' },
  { id: 'chat', name: 'Team chat', Mark: ChatMark, busy: 'Posting to #design', done: 'Team notified' },
];

export const STEPS_1 = ['Found Design team · 4 members', 'Compared calendars for tomorrow', '3:00 PM is free for everyone'];

/* The finished conversation, shown as-is when motion is reduced. */
const FINAL = [
  { id: 1, kind: 'user', text: USER_1 },
  { id: 2, kind: 'work', title: '', doneTitle: 'Checked 4 calendars', secs: '2.1s', steps: STEPS_1, done: true },
  { id: 3, kind: 'agent', words: AGENT_1.split(' '), shown: 99 },
  { id: 4, kind: 'event', state: 'done' },
  { id: 5, kind: 'user', text: USER_2 },
  { id: 6, kind: 'work', title: '', doneTitle: 'Shared the brief · notified #design', secs: '3.4s', steps: [], done: true },
  { id: 7, kind: 'file', sent: true },
  { id: 8, kind: 'agent', words: AGENT_2.split(' '), shown: 99 },
];

export const IDLE = { mode: 'idle', text: '', words: [], final: 0 };

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

export function Avatars({ size = 'md' }) {
  return (
    <span className={`avs avs--${size}`}>
      {TEAM.map((p, i) => (
        <span key={p.i} className="av" style={{ '--c': p.c, '--i': i }} title={p.name}>{p.i}</span>
      ))}
    </span>
  );
}

export function Orb({ working, small }) {
  return (
    <span className={`orb${small ? ' orb--sm' : ''}`} data-working={working || undefined}>
      <Spark />
    </span>
  );
}

export function Message({ m }) {
  if (m.kind === 'user') {
    return (
      <div className="msg msg--user">
        {m.from && <small className="msg__from">{m.from}</small>}
        <p>{m.text}</p>
      </div>
    );
  }

  if (m.kind === 'agent') {
    return (
      <div className="msg msg--agent">
        <Orb small />
        <p>
          {m.words.slice(0, m.shown).map((w, i) => (
            <span key={i} className="word">{w} </span>
          ))}
        </p>
      </div>
    );
  }

  if (m.kind === 'work') {
    return (
      <div className="msg work" data-done={m.done || undefined}>
        <div className="work__head">
          <span className="work__icon">{m.done ? <Check /> : <Spark />}</span>
          {m.done
            ? <span>{m.doneTitle} <em>· {m.secs}</em></span>
            : <span className="shimmer" key={m.title}>{m.title}</span>}
        </div>
        {m.steps.length > 0 && (
          <div className="work__fold">
            <ul className="work__steps">
              {m.steps.map((s) => (
                <li key={s}><Check />{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (m.kind === 'event') {
    const done = m.state === 'done';
    return (
      <div className="msg event" data-done={done || undefined}>
        <div className="event__top">
          <span className="event__date"><small>Fri</small><b>14</b></span>
          <span className="event__info">
            <b>Design team sync</b>
            <span><Clock /> Tomorrow · 3:00 – 3:45 PM</span>
            <span><Video /> Video call · 4 guests</span>
          </span>
        </div>
        <div className="event__foot">
          <Avatars size="sm" />
          <span className="event__btn" data-target="confirm" data-state={m.state}>
            {done ? <><Check /> Scheduled</> : 'Confirm'}
          </span>
        </div>
      </div>
    );
  }

  if (m.kind === 'file') {
    return (
      <div className="msg file" data-sent={m.sent || undefined} data-target="file">
        <PdfMark className="file__icon" />
        <span className="file__info">
          <b>Project-brief-v3.pdf</b>
          <small>{m.sent ? 'Shared with 4 participants' : '2.4 MB · Sharing…'}</small>
          <span className="file__bar"><i /></span>
        </span>
        <Avatars size="xs" />
      </div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/* Position of an element inside the stage, from layout offsets rather than
   screen rects, so it stays right when the stage itself is tilted or scaled. */
export function localPoint(root, sel, ox = 0.5, oy = 0.5) {
  const el = root && root.querySelector(sel);
  if (!el || el.offsetParent === null || !el.offsetWidth) return null;
  let x = 0;
  let y = 0;
  let n = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const parent = n.offsetParent;
    for (let s = n.parentElement; s && s !== parent; s = s.parentElement) {
      x -= s.scrollLeft;
      y -= s.scrollTop;
    }
    n = parent;
  }
  if (n !== root) return null;
  x += el.offsetWidth * ox;
  y += el.offsetHeight * oy;
  return { x, y, flip: x > root.clientWidth - 200 };
}

/* Keep the newest message in view. */
export function useThreadAutoscroll(threadRef, msgs) {
  useEffect(() => {
    const t = threadRef.current;
    if (!t) return;
    t.scrollTo({ top: t.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [threadRef, msgs]);
}

/* Pointer depth: card tilts, side pieces drift (sets --mx / --my on the stage). */
export function usePointerDepth(stageRef) {
  useEffect(() => {
    const el = stageRef.current;
    if (!el || reducedMotion() || !window.matchMedia('(hover: hover)').matches) return undefined;
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty('--mx', nx.toFixed(3));
      el.style.setProperty('--my', ny.toFixed(3));
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => { nx = 0; ny = 0; if (!raf) raf = requestAnimationFrame(apply); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [stageRef]);
}

/* The agent's chat card: header, thread, composer. */
export function ChatCard({ working, msgs, draft, clearing, threadRef, placeholder = 'Ask your AI agent anything...' }) {
  const voice = draft.mode === 'voice';
  const hasText = !!draft.text || draft.words.length > 0;
  return (
    <div className="chat">
      <header className="chat__head">
        <Orb working={working} />
        <span className="chat__who">
          <b>Nova Agent</b>
          <small>
            <i className="status-dot" data-working={working || undefined} />
            AI Agent · {working ? 'Working…' : 'Online'}
          </small>
        </span>
        <span className="chat__pill"><i />Autopilot</span>
        <span className="chat__more"><Dots /></span>
      </header>

      <div className="thread-wrap">
        <div className="welcome" data-hidden={msgs.length > 0 || undefined}>
          <span className="welcome__orb"><Spark /></span>
          <b>How can I help today?</b>
          <small>I work across your calendar, files and team chat.</small>
          <span className="welcome__chips">
            <span data-active={draft.mode === 'typing' || undefined}><CalendarMark /> Schedule a meeting</span>
            <span><DriveMark /> Share a file</span>
            <span><ChatMark /> Update the team</span>
          </span>
        </div>
        <div className="thread" ref={threadRef} data-clearing={clearing || undefined}>
          <div className="thread__day">Today</div>
          {msgs.map((m) => <Message key={m.id} m={m} />)}
        </div>
      </div>

      <div className="composer" data-mode={draft.mode} data-has-text={hasText || undefined}>
        <div className="composer__field">
          {voice ? (
            <span className="composer__text">
              {draft.words.map((w, i) => (
                <span key={i} className="vword" data-final={i < draft.final || undefined}>{w} </span>
              ))}
              <span className="caret" />
            </span>
          ) : draft.text ? (
            <span className="composer__text">{draft.text}<span className="caret" /></span>
          ) : (
            <span className="composer__ph">{placeholder}</span>
          )}
        </div>
        <div className="composer__bar">
          <span className="cbtn"><Plus /></span>
          {voice ? (
            <span className="listening">
              <span className="wave"><i /><i /><i /><i /><i /></span>
              Listening…
            </span>
          ) : (
            <span className="cchip"><Sliders /> Tools</span>
          )}
          <span className="composer__gap" />
          <span className="apps"><CalendarMark /><DriveMark /><ChatMark /></span>
          <span className="cbtn cbtn--mic" data-on={voice || undefined}><Mic /></span>
          <span className="send"><ArrowUp /></span>
        </div>
      </div>
    </div>
  );
}

/* The agent's pointer with its name flag, and whatever it is carrying. */
export function AgentCursor({ cursor, carry }) {
  return (
    <div
      className="cursor"
      data-show={cursor.show || undefined}
      data-click={cursor.click || undefined}
      data-flip={cursor.flip || undefined}
      style={{ '--x': `${cursor.x}px`, '--y': `${cursor.y}px` }}
    >
      <Pointer className="cursor__ptr" />
      <span className="cursor__flag"><Spark /> Nova · {cursor.label}</span>
      <span className="cursor__carry" data-on={cursor.carry || undefined}>{carry}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage                                                               */
/* ------------------------------------------------------------------ */

export default function AgentStage() {
  const stageRef = useRef(null);
  const threadRef = useRef(null);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState(IDLE);
  const [working, setWorking] = useState(false);
  const [tool, setTool] = useState({ id: null, state: 'idle' });
  const [cursor, setCursor] = useState({ x: 0, y: 0, show: false, label: '', click: false, carry: false });
  const [clearing, setClearing] = useState(false);
  const [ready, setReady] = useState(false);

  /* The scripted run. Loops while mounted. */
  useEffect(() => {
    if (reducedMotion()) {
      setMsgs(FINAL);
      setReady(true);
      return undefined;
    }

    let alive = true;
    let uid = 0;
    const timers = new Set();
    const wait = (ms) => new Promise((resolve) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) resolve(); }, ms);
      timers.add(id);
    });
    const rand = (a, b) => a + Math.random() * (b - a);

    const add = (m) => { const id = ++uid; setMsgs((l) => [...l, { id, ...m }]); return id; };
    const patch = (id, p) => setMsgs((l) => l.map((m) => (m.id === id ? { ...m, ...(typeof p === 'function' ? p(m) : p) } : m)));

    const point = (sel, ox, oy) => localPoint(stageRef.current, sel, ox, oy);
    const moveTo = (sel, label, ox, oy) => {
      const p = point(sel, ox, oy);
      setCursor((c) => ({ ...c, ...(p || {}), show: !!p, label: label ?? c.label }));
    };
    const click = async () => {
      setCursor((c) => ({ ...c, click: true }));
      await wait(240);
      setCursor((c) => ({ ...c, click: false }));
    };
    const stream = async (id, words) => {
      for (let i = 1; i <= words.length; i++) {
        patch(id, { shown: i });
        await wait(rand(45, 95));
      }
    };

    const play = async () => {
      // reset
      uid = 0;
      setMsgs([]);
      setClearing(false);
      setDraft(IDLE);
      setWorking(false);
      setTool({ id: null, state: 'idle' });
      const start = point('.chat', 0.5, 0.96);
      if (start) setCursor((c) => ({ ...c, ...start, show: false, carry: false }));
      await wait(1100);

      /* 1 — the user types a request */
      for (let i = 1; i <= USER_1.length; i++) {
        setDraft({ ...IDLE, mode: 'typing', text: USER_1.slice(0, i) });
        await wait(USER_1[i - 1] === ' ' ? rand(60, 110) : rand(22, 52));
      }
      await wait(420);
      setDraft({ ...IDLE, mode: 'send', text: USER_1 });
      await wait(260);
      setDraft(IDLE);
      add({ kind: 'user', text: USER_1 });
      await wait(650);

      /* 2 — the agent checks calendars */
      setWorking(true);
      const w1 = add({ kind: 'work', title: 'Checking the design team’s calendars', doneTitle: 'Checked 4 calendars', secs: '2.1s', steps: [], done: false });
      setTool({ id: 'calendar', state: 'busy' });
      moveTo('[data-tool="calendar"] .tool__tile', 'Checking calendars', 0.62, 0.62);
      await wait(1000);
      for (const s of STEPS_1) {
        patch(w1, (m) => ({ steps: [...m.steps, s] }));
        await wait(780);
      }
      setTool({ id: 'calendar', state: 'done' });
      patch(w1, { done: true });
      await wait(450);

      /* 3 — reply + meeting card, confirmed by the agent's cursor */
      const r1 = add({ kind: 'agent', words: AGENT_1.split(' '), shown: 0 });
      await stream(r1, AGENT_1.split(' '));
      await wait(250);
      const ev = add({ kind: 'event', state: 'pending' });
      await wait(900);
      moveTo('[data-target="confirm"]', 'Scheduling meeting', 0.42, 0.6);
      await wait(1150);
      await click();
      patch(ev, { state: 'done' });
      setTool({ id: null, state: 'idle' });
      await wait(700);
      setCursor((c) => ({ ...c, show: false }));
      setWorking(false);
      await wait(1300);

      /* 4 — the user dictates a follow-up */
      const words = USER_2.split(' ');
      setDraft({ ...IDLE, mode: 'voice' });
      await wait(500);
      for (let i = 1; i <= words.length; i++) {
        setDraft({ ...IDLE, mode: 'voice', words: words.slice(0, i), final: Math.max(0, i - 2) });
        await wait(rand(230, 330));
      }
      setDraft((d) => ({ ...d, final: words.length }));
      await wait(650);
      setDraft({ ...IDLE, mode: 'send', text: USER_2 });
      await wait(260);
      setDraft(IDLE);
      add({ kind: 'user', text: USER_2 });
      await wait(650);

      /* 5 — the agent fetches the brief and drags it into the thread */
      setWorking(true);
      const w2 = add({ kind: 'work', title: 'Finding the project brief', doneTitle: 'Shared the brief · notified #design', secs: '3.4s', steps: [], done: false });
      setTool({ id: 'drive', state: 'busy' });
      moveTo('[data-tool="drive"] .tool__tile', 'Finding the brief', 0.62, 0.62);
      await wait(1250);
      await click();
      setTool({ id: 'drive', state: 'done' });
      setCursor((c) => ({ ...c, carry: true, label: 'Sharing brief' }));
      patch(w2, { title: 'Sharing with 4 participants' });
      await wait(250);
      moveTo('.thread', undefined, 0.42, 0.9);
      await wait(1100);
      setCursor((c) => ({ ...c, carry: false }));
      const f = add({ kind: 'file', sent: false });
      await click();
      await wait(1300);
      patch(f, { sent: true });

      /* 6 — and lets the team know */
      setTool({ id: 'chat', state: 'busy' });
      patch(w2, { title: 'Posting a note in #design' });
      moveTo('[data-tool="chat"] .tool__tile', 'Notifying team', 0.62, 0.62);
      await wait(1400);
      await click();
      setTool({ id: 'chat', state: 'done' });
      patch(w2, { done: true });
      await wait(350);
      setCursor((c) => ({ ...c, show: false }));
      const r2 = add({ kind: 'agent', words: AGENT_2.split(' '), shown: 0 });
      await stream(r2, AGENT_2.split(' '));
      setWorking(false);
      await wait(900);
      setTool({ id: null, state: 'idle' });

      /* hold, then start over */
      await wait(5200);
      setClearing(true);
      await wait(650);
    };

    setReady(true);
    (async () => {
      await wait(700);
      while (alive) await play();
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  useThreadAutoscroll(threadRef, msgs);
  usePointerDepth(stageRef);

  return (
    <div className="stage" ref={stageRef} data-ready={ready || undefined}>
      <FluidCanvas className="stage__gl" />
      <div className="stage__grain" aria-hidden="true" />

      <p className="sr-only">
        Demo conversation. A user asks Nova Agent to schedule a meeting with the design team for tomorrow at 3 PM.
        Nova checks four calendars, confirms 3:00 PM works for everyone and books the meeting. The user then asks
        it to send the project brief; Nova shares the file with all four participants and posts a note in the team chat.
      </p>

      <div className="stage__scene" aria-hidden="true" data-ui>
        {TOOLS.map(({ id, name, Mark, busy, done }) => {
          const state = tool.id === id ? tool.state : 'idle';
          return (
            <div key={id} className={`tool tool--${id}`} data-tool={id} data-state={state}>
              <span className="tool__tile"><Mark /></span>
              <span className="tool__label">
                <b>{name}</b>
                <small>{state === 'busy' ? busy : state === 'done' ? done : 'Connected'}</small>
              </span>
            </div>
          );
        })}

        <ChatCard working={working} msgs={msgs} draft={draft} clearing={clearing} threadRef={threadRef} />

        <AgentCursor cursor={cursor} carry={<><PdfMark /> Project-brief-v3.pdf</>} />
      </div>
    </div>
  );
}
