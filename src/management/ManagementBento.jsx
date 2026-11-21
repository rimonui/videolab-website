import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
      <div className="bc__stage">{children(visible && !reduced)}</div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  1 · Employee activity — live feed, new items push in from the top  */
/* ------------------------------------------------------------------ */

const ACTIVITY = [
  { who: 'john', pre: 'Reviewed and forwarded the invoice to', link: 'sarah@email.com', post: 'for their attention.' },
  { who: 'hanni', pre: 'Published the weekly campaign report to', link: '#marketing', post: '' },
  { who: 'bang', pre: 'Moved', link: 'Q3 Roadmap', post: 'to “In review” and assigned 3 tasks.' },
  { who: 'leo', pre: 'Shipped the onboarding fix and closed', link: '4 tickets', post: 'before the deadline.' },
  { who: 'mia', pre: 'Shared new interview notes with', link: 'Design Team', post: '' },
];
const AGO = ['Just now', '12m ago', '30m ago', '1h ago'];

function ActivityDemo({ play }) {
  const tick = useTick(3200, play);
  const feed = [tick, tick - 1, tick - 2, tick - 3]; // newest first; negatives wrap to earlier items
  const listRef = useRef(null);

  // FLIP: when a new item lands on top, start the whole list shifted up by
  // that item's height, then glide to rest on the compositor (transform only).
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || tick === 0) return;
    const first = list.firstElementChild;
    const h = first ? first.getBoundingClientRect().height : 0;
    list.style.transition = 'none';
    list.style.transform = `translate3d(0, ${-h}px, 0)`;
    list.getBoundingClientRect(); // commit the start position
    list.style.transition = '';
    list.style.transform = '';
  }, [tick]);
  return (
    <Window className="win--activity">
      <div className="win__bar">
        <div>
          <h4 className="win__h">Employee Activity</h4>
          <p className="win__sub">See what&apos;s your employee is up to.</p>
        </div>
        <button className="ghost-btn" type="button">See All</button>
      </div>
      <ul className="feed" ref={listRef}>
        {feed.map((n, i) => {
          const idx = ((n % ACTIVITY.length) + ACTIVITY.length) % ACTIVITY.length;
          const a = ACTIVITY[idx];
          const p = PEOPLE[a.who];
          return (
            <li key={n} className={`feed__item${i === 0 && tick > 0 ? ' is-new' : ''}`} data-pos={i}>
              <div className="feed__inner">
                <div className="feed__who">
                  <Avatar person={p} size={30} online={i === 0} />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{AGO[i]}</span>
                  </div>
                </div>
                <p className="feed__msg">
                  {a.pre} <a href="#activity" onClick={(e) => e.preventDefault()}>{a.link}</a> {a.post}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
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
            {(play) => <ActivityDemo play={play} />}
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
