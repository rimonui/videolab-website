import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/* Tracks visibility: `seen` flips once (entrance), `visible` follows the
   viewport so looping demos pause while off-screen. */
function useInView(ref) {
  const [state, setState] = useState({ seen: false, visible: false });
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setState({ seen: true, visible: true });
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) =>
        setState((s) => ({
          seen: s.seen || entry.isIntersecting,
          visible: entry.isIntersecting,
        })),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return state;
}

function useTick(ms, active) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms, active]);
  return tick;
}

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */

const PEOPLE = {
  john: { name: 'John Doe', role: 'Account Manager', tone: '#E9DFD3' },
  bang: { name: 'Bang Chan', role: 'Product Manager', tone: '#DCE3EC' },
  hanni: { name: 'Pham Hanni', role: 'Social Specialist', tone: '#EEDCE0' },
  leo: { name: 'Leo Park', role: 'Frontend Engineer', tone: '#DDE9DF' },
  mia: { name: 'Mia Chen', role: 'UX Researcher', tone: '#E6E1F0' },
  omar: { name: 'Omar Faruk', role: 'Data Analyst', tone: '#F1E6CF' },
  sara: { name: 'Sara Kim', role: 'HR Lead', tone: '#DCEAEA' },
};

function Avatar({ person, size = 28, online = false }) {
  const initials = person.name.split(' ').map((p) => p[0]).join('');
  return (
    <span
      className={`av${online ? ' av--online' : ''}`}
      style={{ '--av': `${size}px`, '--tone': person.tone }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function Window({ children, className = '' }) {
  return (
    <div className={`win ${className}`}>
      <div className="win__dots" aria-hidden="true">
        <i /><i /><i />
      </div>
      {children}
    </div>
  );
}

const Chevron = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  activity: (
    <path d="M5 16l4.5-5 3.5 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  layers: (
    <>
      <rect x="8.5" y="4.5" width="11" height="11" rx="3" fill="currentColor" opacity=".55" />
      <rect x="4.5" y="8.5" width="11" height="11" rx="3" fill="currentColor" />
    </>
  ),
  calendar: (
    <>
      <rect x="4.5" y="6" width="15" height="13.5" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 10.5h15M9 4v4M15 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9.5" cy="14.5" r="1.3" fill="currentColor" />
      <circle cx="14.5" cy="14.5" r="1.3" fill="currentColor" />
    </>
  ),
  chat: (
    <path d="M12 4.5c4.4 0 8 3 8 6.9s-3.6 6.9-8 6.9c-.9 0-1.8-.1-2.6-.4L5 19.5l1.2-3.6C4.8 14.7 4 13.1 4 11.4 4 7.5 7.6 4.5 12 4.5z" fill="currentColor" />
  ),
  search: (
    <>
      <path d="M5 5h14l-5.5 6.5V17l-3 2v-7.5z" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18.4 18.4l1.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

function Card({ icon, title, text, layout = 'stack', className = '', delay = 0, children }) {
  const ref = useRef(null);
  const { seen, visible } = useInView(ref);
  const reduced = useReducedMotion();
  return (
    <article
      ref={ref}
      className={`bc bc--${layout} ${className}${seen ? ' is-in' : ''}`}
      style={{ '--d': `${delay}ms` }}
    >
      <header className="bc__head">
        <span className="bc__icon">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">{ICONS[icon]}</svg>
        </span>
        <div className="bc__copy">
          <h3 className="bc__title">{title}</h3>
          <p className="bc__text">{text}</p>
        </div>
      </header>
      <div className="bc__stage">{children(visible && !reduced, reduced)}</div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  1 · Team workload — donut + availability table, values morph live  */
/* ------------------------------------------------------------------ */

/* Eases a number toward `target` on rAF (ease-out cubic). */
function useTween(target, ms = 1400) {
  const [value, setValue] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    if (from === target) return;
    let raf;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      cur.current = from + (target - from) * e;
      setValue(cur.current);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

const CREW = ['mia', 'leo', 'hanni', 'bang'];
// Availability % and open tasks per member, one set per "week".
const WEEKS = [
  [[80, 8], [40, 4], [60, 6], [90, 5]],
  [[85, 9], [55, 5], [75, 7], [80, 6]],
  [[70, 7], [35, 3], [50, 5], [90, 6]],
];
const avg = (w) => Math.round(w.reduce((s, [a]) => s + a, 0) / w.length);
const tone = (v) => (v >= 70 ? 'ok' : v >= 50 ? 'mid' : 'low');

const R = 64;
const C = 2 * Math.PI * R;

function WorkloadRow({ person, avail, tasks, delay }) {
  const a = useTween(avail, 1300);
  const t = useTween(tasks, 1300);
  return (
    <li className="wl__row" style={{ '--i': delay }}>
      <span className="wl__member">
        <Avatar person={person} size={28} />
        <span>{person.name}</span>
      </span>
      <span className="wl__avail">
        <i className={`wl__dot wl__dot--${tone(Math.round(a))}`} />
        {Math.round(a)}%
      </span>
      <span className="wl__tasks">{Math.round(t)}</span>
    </li>
  );
}

function WorkloadDemo({ play, reduced }) {
  const started = useRef(false);
  if (play || reduced) started.current = true;
  const tick = useTick(4200, play);
  const week = WEEKS[tick % WEEKS.length];
  const total = started.current ? avg(week) : 0;
  const pct = useTween(total, reduced ? 1 : 1600);
  const rows = started.current ? week : week.map(() => [0, 0]);
  return (
    <Window className="win--workload">
      <div className="wl__head">
        <h4 className="wl__title">
          Team Workload
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
            <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="5.1" r=".85" fill="currentColor" />
          </svg>
        </h4>
        <button className="wl__more" type="button" aria-label="More options">
          <i /><i /><i />
        </button>
      </div>

      <div className="wl__body">
        <div className="wl__donut">
          <svg viewBox="0 0 180 180" aria-hidden="true">
            <defs>
              <linearGradient id="wl-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6aa5ff" />
                <stop offset="1" stopColor="#1f5fee" />
              </linearGradient>
              <pattern id="wl-stripes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="7" height="7" fill="#f1f2f4" />
                <rect width="2.2" height="7" fill="#dfe2e7" />
              </pattern>
            </defs>
            <circle cx="90" cy="90" r={R} fill="none" stroke="url(#wl-stripes)" strokeWidth="22" />
            <circle
              className="wl__arc"
              cx="90" cy="90" r={R}
              fill="none" stroke="url(#wl-grad)" strokeWidth="22" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - Math.max(0.001, pct / 100))}
            />
          </svg>
          <div className="wl__center">
            <strong>{Math.round(pct)}%</strong>
            <span>Total Capacity</span>
          </div>
        </div>

        <div className="wl__table">
          <div className="wl__row wl__row--head">
            <span>Member</span><span>Availability</span><span className="wl__tasks">Tasks</span>
          </div>
          <ul>
            {CREW.map((k, i) => (
              <WorkloadRow key={k} person={PEOPLE[k]} avail={rows[i][0]} tasks={rows[i][1]} delay={i} />
            ))}
          </ul>
        </div>
      </div>

      <button className="wl__cta" type="button">
        View Full Team
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/*  2 · Schedule management — a cursor walks the table, status morphs  */
/* ------------------------------------------------------------------ */

const ROWS = [
  { who: 'bang', dept: 'General Manager', by: 'Remote', rest: ['Completed', 'ok'] },
  { who: 'hanni', dept: 'Social Specialist', by: 'On-site', rest: ['In Review', 'warn'] },
  { who: 'leo', dept: 'Engineering', by: 'Hybrid', rest: ['Completed', 'ok'] },
  { who: 'mia', dept: 'Research', by: 'Remote', rest: ['Pending', 'mute'] },
];

function ScheduleDemo({ play }) {
  const tick = useTick(2200, play);
  const active = tick % ROWS.length;
  return (
    <Window className="win--schedule">
      <div className="win__bar">
        <div>
          <h4 className="win__h">Schedule Management</h4>
          <p className="win__sub">Manage all your existing schedules or add a new schedule for your employee</p>
        </div>
        <button className="ghost-btn" type="button">See All Schedule</button>
      </div>
      <div className="table" role="table" aria-label="Schedules">
        <div className="table__row table__row--head" role="row">
          <span>No</span><span>Employee</span><span>Department</span><span>Work By</span><span>Work Status</span><span>Actions</span>
        </div>
        <div className="table__body">
          <span className="table__glow" style={{ '--r': active }} aria-hidden="true" />
          {ROWS.map((r, i) => {
            const p = PEOPLE[r.who];
            const on = i === active;
            return (
              <div key={r.who} className={`table__row${on ? ' is-active' : ''}`} role="row">
                <span>{i + 1}</span>
                <span className="table__emp"><Avatar person={p} size={20} />{p.name}</span>
                <span>{r.dept}</span>
                <span>{r.by}</span>
                <span>
                  <em className={`pill pill--${on ? 'info' : r.rest[1]}`}>
                    {on ? 'Manage' : r.rest[0]}
                  </em>
                </span>
                <span className="table__actions">
                  <i className="act act--edit" /><i className="act act--more" />
                </span>
              </div>
            );
          })}
          <svg className="cursor" style={{ '--r': active }} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M5 3l14 7.5-6.2 1.6L10 18z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/*  3 · Calendar — selection glides between meeting days              */
/* ------------------------------------------------------------------ */

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// January 2025 starts on a Wednesday.
const CELLS = [
  ...[29, 30, 31].map((d) => ({ d, muted: true })),
  ...Array.from({ length: 31 }, (_, i) => ({ d: i + 1 })),
  { d: 1, muted: true },
];
const EVENTS = { 6: ['y'], 7: ['k'], 8: ['y', 'k'], 13: ['k'], 14: ['y'], 16: ['k'], 21: ['y', 'k'], 23: ['y'], 28: ['k'] };
const STOPS = [6, 8, 14, 16, 21, 23, 28];

function CalendarDemo({ play }) {
  const tick = useTick(1700, play);
  const sel = STOPS[tick % STOPS.length];
  const idx = CELLS.findIndex((c) => !c.muted && c.d === sel);
  return (
    <Window className="win--calendar">
      <div className="cal__top">
        <span className="cal__label">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">{ICONS.calendar}</svg>
          Calendar
        </span>
        <strong>January 2025</strong>
      </div>
      <div className="cal">
        {DAYS.map((d) => <span key={d} className="cal__dow">{d}</span>)}
        <div className="cal__grid">
          <span className="cal__sel" style={{ '--c': idx % 7, '--r': Math.floor(idx / 7) }} aria-hidden="true"><i /></span>
          {CELLS.map((c, i) => {
            const ev = !c.muted && EVENTS[c.d];
            const on = i === idx;
            return (
              <span key={i} className={`cal__day${c.muted ? ' is-muted' : ''}${on ? ' is-on' : ''}`}>
                {c.d}
                {ev && (
                  <span className="cal__dots">
                    {ev.map((t, j) => <i key={j} className={`dot dot--${t}`} />)}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/*  4 · Employee list — slow continuous roll, presence pulse            */
/* ------------------------------------------------------------------ */

const TEAM = ['bang', 'hanni', 'leo', 'mia', 'omar', 'sara'];

function TeamDemo({ play }) {
  return (
    <Window className="win--team">
      <div className="win__bar">
        <h4 className="win__h">Employee List</h4>
        <button className="ghost-btn" type="button">See All</button>
      </div>
      <div className={`roll${play ? '' : ' is-paused'}`}>
        <ul className="roll__track">
          {[...TEAM, ...TEAM].map((k, i) => (
            <li key={i} className="person" aria-hidden={i >= TEAM.length || undefined}>
              <Avatar person={PEOPLE[k]} size={30} online={i % 3 !== 2} />
              <div>
                <strong>{PEOPLE[k].name}</strong>
                <span>{PEOPLE[k].role}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/*  5 · Filtered search — types, picks filters, applies, shows result   */
/* ------------------------------------------------------------------ */

const QUERY = 'Dhaka, Remote';

function SearchDemo({ play }) {
  const t = useTick(100, play) % 72; // 7.2s loop
  const typed = QUERY.slice(0, Math.max(0, Math.min(QUERY.length, t - 4)));
  const typing = t > 3 && t < 4 + QUERY.length + 6;
  const dept = t >= 26;
  const status = t >= 34;
  const pressing = t >= 44 && t < 47;
  const result = t >= 47 && t < 68;
  return (
    <Window className="win--search">
      <div className="search__row">
        <label className="field field--grow">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M12 21s-6-5.6-6-10.5A6 6 0 0 1 18 10.5C18 15.4 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="10.5" r="2.2" fill="currentColor" />
          </svg>
          <span className={typed ? 'field__val' : 'field__ph'}>
            {typed || 'Location'}
            {typing && <i className="caret" />}
          </span>
        </label>
        <button className="ghost-btn ghost-btn--icon" type="button">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Filter
        </button>
      </div>
      <div className="search__selects">
        <label className="sel">
          <span className="sel__lbl">Team</span>
          <span className="sel__box is-set"><span>All Teams</span><Chevron /></span>
        </label>
        <label className="sel">
          <span className="sel__lbl">Department</span>
          <span className={`sel__box${dept ? ' is-set' : ''}`}>
            <span key={dept ? 'a' : 'b'} className="sel__txt">{dept ? 'Design' : 'Select Department'}</span>
            <Chevron />
          </span>
        </label>
        <label className="sel">
          <span className="sel__lbl">Status</span>
          <span className={`sel__box${status ? ' is-set' : ''}`}>
            <span key={status ? 'a' : 'b'} className="sel__txt">{status ? 'Active now' : 'Select Status'}</span>
            <Chevron />
          </span>
        </label>
      </div>
      <button className={`apply${pressing ? ' is-pressing' : ''}${result ? ' is-done' : ''}`} type="button">
        <span className="apply__shine" aria-hidden="true" />
        <span className="apply__txt" key={result ? 'r' : 'a'}>
          {result ? '18 employees found' : 'Apply'}
        </span>
      </button>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function ManagementBento() {
  return (
    <main className="mb">
      <section className="mb__section" aria-labelledby="mb-title">
        <header className="mb__intro">
          <span className="mb__eyebrow">Workspace</span>
          <h2 id="mb-title">Everything you need to manage your team&apos;s work</h2>
          <p>Track activity, plan schedules, book meetings and find the right people — in one calm, focused place.</p>
        </header>

        <div className="bento">
          <Card
            icon="activity"
            layout="row"
            className="bento__a"
            title="Manage Employees Work"
            text="Optimize employee performance and foster a positive work environment."
            delay={0}
          >
            {(play, reduced) => <WorkloadDemo play={play} reduced={reduced} />}
          </Card>

          <Card
            icon="layers"
            layout="row"
            className="bento__b"
            title="Track Team Schedules"
            text="Plan every shift, assign work and keep each schedule moving forward."
            delay={90}
          >
            {(play) => <ScheduleDemo play={play} />}
          </Card>

          <Card
            icon="calendar"
            className="bento__c"
            title="Organize Meetings"
            text="Effortlessly schedule meetings using the calendar tool."
            delay={180}
          >
            {(play) => <CalendarDemo play={play} />}
          </Card>

          <Card
            icon="chat"
            className="bento__d"
            title="Supervise Your Employees"
            text="Optimize employee performance and foster a positive work environment."
            delay={260}
          >
            {(play) => <TeamDemo play={play} />}
          </Card>

          <Card
            icon="search"
            className="bento__e"
            title="Filtered Search"
            text="Embark on an enlightening quest with our streamlined filtered search for precise insights."
            delay={340}
          >
            {(play) => <SearchDemo play={play} />}
          </Card>
        </div>
      </section>
    </main>
  );
}
