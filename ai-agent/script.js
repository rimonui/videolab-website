(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? Math.min(ms, 60) : ms));

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- Count-up numbers ---------- */
  const countUp = (el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const dur = 1600;
    const t0 = performance.now();
    const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(end * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { setTimeout(() => countUp(e.target), 700); cio.unobserve(e.target); }
    });
  });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

  /* ---------- Integration pill text cycling ---------- */
  const syncText = document.getElementById('syncText');
  const syncs = ['Calendar connected', 'CRM synced · 312 records', 'Inbox connected', 'Docs indexed · 1.2k files', 'Database linked', 'Custom API ready'];
  let si = 0;
  setInterval(() => {
    syncText.classList.add('swap');
    setTimeout(() => {
      si = (si + 1) % syncs.length;
      syncText.textContent = syncs[si];
      syncText.classList.remove('swap');
    }, 300);
  }, 2200);

  /* ---------- Live agent chat ---------- */
  const body = document.getElementById('chatBody');
  const intro = document.getElementById('chatIntro');
  const input = document.getElementById('ciText');
  const send = document.getElementById('ciSend');

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  const placeholder = '<span class="ci-ph">Ask your agent to do anything…</span>';

  async function typeInto(text) {
    input.innerHTML = '';
    input.classList.add('typing-on');
    for (let i = 0; i < text.length; i++) {
      input.textContent = text.slice(0, i + 1);
      if (i === 0) send.classList.add('ready');
      await sleep(26 + Math.random() * 30);
    }
    await sleep(350);
    send.classList.add('press');
    await sleep(160);
    send.classList.remove('press', 'ready');
    input.classList.remove('typing-on');
    input.innerHTML = placeholder;
  }

  function addUser(text) {
    intro.classList.add('gone');
    body.appendChild(el('div', 'msg user', text));
  }

  function addTyping() {
    const m = el('div', 'msg agent', '<span class="agent-avatar xs"></span><div class="bubble typing"><i></i><i></i><i></i></div>');
    body.appendChild(m);
    return m;
  }

  async function agentSay(html, think = 900) {
    const m = addTyping();
    await sleep(think);
    m.querySelector('.bubble').classList.remove('typing');
    m.querySelector('.bubble').innerHTML = html;
    m.style.animation = 'none'; // keep in place
  }

  async function runSteps(steps) {
    const box = el('div', 'steps');
    body.appendChild(box);
    for (const s of steps) {
      const row = el('div', 'step-row', `<span class="spin"></span><span>${s.run}</span>`);
      box.appendChild(row);
      await sleep(s.ms);
      row.classList.add('ok');
      row.innerHTML = `<span class="tick">✓</span><span>${s.done}</span>`;
      await sleep(180);
    }
  }

  async function showLeads(leads) {
    const box = el('div', 'result');
    body.appendChild(box);
    for (const l of leads) {
      box.appendChild(el('div', 'lead',
        `<span class="av" style="background:${l.c}">${l.i}</span>
         <span class="nm">${l.n}<small>${l.co}</small></span>
         <span class="score ${l.s < 90 ? 'mid' : ''}">${l.s}</span>`));
      await sleep(260);
    }
  }

  async function reset() {
    body.classList.add('fade-out');
    await sleep(550);
    body.querySelectorAll('.msg, .steps, .result').forEach((n) => n.remove());
    body.classList.remove('fade-out');
    intro.classList.remove('gone');
    await sleep(1400);
  }

  async function conversation() {
    await sleep(1600);
    await typeInto('Qualify yesterday’s webinar leads and book demos with the hot ones');
    addUser('Qualify yesterday’s webinar leads and book demos with the hot ones');
    await sleep(400);
    await agentSay('On it — pulling everything from your CRM now.', 1000);
    await sleep(300);
    await runSteps([
      { run: 'Fetching leads from CRM…', done: 'Fetched 42 leads from CRM', ms: 1100 },
      { run: 'Scoring buying intent…', done: 'Scored intent on 9 signals', ms: 1300 },
      { run: 'Drafting personal emails…', done: 'Sent 12 personalised emails', ms: 1100 },
      { run: 'Checking calendars…', done: 'Booked 5 demos this week', ms: 1000 },
    ]);
    await sleep(300);
    await agentSay('Done in 38s. 12 hot leads found. Top picks:', 900);
    await showLeads([
      { i: 'MR', n: 'Maya Reyes', co: 'Head of Sales · Northwind', s: 96, c: '#0A0A0A' },
      { i: 'JK', n: 'Jonas Kim', co: 'VP Growth · Lumen', s: 92, c: '#1F1F1F' },
      { i: 'AL', n: 'Ava Lindqvist', co: 'COO · Hexa', s: 87, c: '#525252' },
    ]);
    await sleep(3800);
  }

  (async function loop() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await conversation();
      if (reduce) break;
      await reset();
    }
  })();
})();
