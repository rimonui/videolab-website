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

// Team portraits from gr8rstudio.com/about, cropped to small avatars.
const photos = import.meta.glob('./avatars/*.jpg', { eager: true, import: 'default' });
const photo = (k) => photos[`./avatars/${k}.jpg`];

const PEOPLE = {
  tanjim: { name: 'Tanjim Islam', role: 'Founder & CEO' },
  abu: { name: 'Abu Hasan', role: 'Managing Director' },
  ikram: { name: 'Ikram Sakib', role: 'Senior Product Designer' },
  sayttom: { name: 'Sayttom Das', role: 'Senior Product Designer' },
  rimon: { name: 'Abdul Ahad Rimon', role: 'Product Designer' },
  abid: { name: 'Abid Hasan', role: 'Marketing Strategist' },
  najmul: { name: 'Najmul Hossain', role: 'Full Stack Developer' },
  shohag: { name: 'Shohag Sorkar', role: 'Framer Developer' },
  tamim: { name: 'Tamim Dary', role: 'Digital Communication Specialist' },
};
Object.entries(PEOPLE).forEach(([k, p]) => { p.src = photo(k); });

function Avatar({ person, size = 28, online = false }) {
  return (
    <span className={`av${online ? ' av--online' : ''}`} style={{ '--av': `${size}px` }} aria-hidden="true">
      <img src={person.src} alt="" width={size} height={size} loading="lazy" decoding="async" />
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

const CREW = ['ikram', 'najmul', 'abid', 'rimon'];
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
  { who: 'sayttom', dept: 'Product Design', by: 'On-site', rest: ['Completed', 'ok'] },
  { who: 'abid', dept: 'Marketing', by: 'Remote', rest: ['In Review', 'warn'] },
  { who: 'shohag', dept: 'Development', by: 'Hybrid', rest: ['Completed', 'ok'] },
  { who: 'tamim', dept: 'Communication', by: 'Remote', rest: ['Pending', 'mute'] },
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
/*  3 · Calendar — Days / Meetings toggle; meeting badges morph in     */
/* ------------------------------------------------------------------ */

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// December, Monday-first, starting on a Wednesday.
const CELLS = [
  { d: 29, muted: true }, { d: 30, muted: true },
  ...Array.from({ length: 31 }, (_, i) => ({ d: i + 1 })),
  { d: 1, muted: true }, { d: 2, muted: true },
];
const TODAY = 26;
// Meeting badges: kind picks the glyph, `urgent` turns it red.
const MEETINGS = { 8: 'video', 9: 'team', 15: 'one', 20: 'urgent', 23: 'video' };
const BAND = [8, 9]; // multi-day offsite

const BADGE = {
  video: <path d="M3.5 6.5h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zM10.5 9l3-2v6l-3-2z" fill="#fff" />,
  team: (
    <>
      <circle cx="7" cy="7.5" r="2" fill="#fff" />
      <circle cx="12" cy="8" r="1.6" fill="#fff" opacity=".85" />
      <path d="M3.5 14c.4-2 1.8-3 3.5-3s3.1 1 3.5 3zM10.6 13.6c.2-1.3 1-2.1 2-2.1 1.2 0 2 .8 2.3 2.1z" fill="#fff" />
    </>
  ),
  one: (
    <>
      <circle cx="9" cy="7" r="2.4" fill="#fff" />
      <path d="M4.5 14.5c.5-2.4 2.3-3.6 4.5-3.6s4 1.2 4.5 3.6z" fill="#fff" />
    </>
  ),
  urgent: <path d="M9 4.5v6M9 13.2v.3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />,
};

function CalendarDemo({ play }) {
  const tick = useTick(3200, play);
  const meetings = tick % 2 === 1;
  const bandStart = CELLS.findIndex((c) => !c.muted && c.d === BAND[0]);
  return (
    <Window className="win--calendar">
      <div className="cal__top">
        <div className="cal__month">
          <strong>December</strong>
          <span className="cal__nav" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
        <div className={`seg${meetings ? ' is-right' : ''}`} role="tablist">
          <span className="seg__pill" aria-hidden="true" />
          <button type="button" role="tab" aria-selected={!meetings}>Days</button>
          <button type="button" role="tab" aria-selected={meetings}>Meetings</button>
        </div>
      </div>

      <div className="cal__dow">
        {DOW.map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className={`cal__grid${meetings ? ' is-meetings' : ''}`}>
        <span
          className="cal__band"
          style={{ '--c': bandStart % 7, '--r': Math.floor(bandStart / 7), '--n': BAND.length }}
          aria-hidden="true"
        />
        {CELLS.map((c, i) => {
          const kind = !c.muted && MEETINGS[c.d];
          const today = !c.muted && c.d === TODAY;
          return (
            <span
              key={i}
              className={`cal__day${c.muted ? ' is-muted' : ''}${today ? ' is-today' : ''}${kind ? ' has-meet' : ''}${kind && BAND.includes(c.d) ? ' in-band' : ''}`}
              style={{ '--i': kind ? Object.keys(MEETINGS).indexOf(String(c.d)) : 0 }}
            >
              <span className="cal__num">{c.d}</span>
              {kind && (
                <span className={`cal__badge${kind === 'urgent' ? ' is-urgent' : ''}`} aria-hidden="true">
                  <svg viewBox="0 0 18 18" width="15" height="15">{BADGE[kind]}</svg>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/*  4 · Employee list — slow continuous roll, presence pulse            */
/* ------------------------------------------------------------------ */

const TEAM = ['tanjim', 'abu', 'sayttom', 'ikram', 'rimon', 'najmul'];

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
