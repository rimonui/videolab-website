(() => {
  const looks = window.LOOKS;
  const n = looks.length;
  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const itemsEl = $("items");
  const panel = $("panel");
  const scrim = $("scrim");
  const bagCount = document.querySelector(".bag-count");
  const bagBtn = document.querySelector(".bag-btn");
  const mobile = window.matchMedia("(max-width: 960px)");

  const money = (v) => "$" + v.toLocaleString("en-US");
  const pad = (v) => String(v).padStart(2, "0");
  const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  let active = 0;
  let selected = null; // selected item id
  let bag = 0;
  let lastDir = 1;
  const prevD = new Array(n).fill(null);

  // ---------- Build models + pins ----------
  const models = looks.map((look, i) => {
    const el = document.createElement("div");
    el.className = "model";
    el.dataset.index = i;
    el.innerHTML = `<img src="${look.photo}" alt="Look ${i + 1}: ${look.name}" draggable="false" ${i > 2 ? 'loading="lazy"' : ""}>`;
    look.items.forEach((item) => {
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "pin" + (item.pin[0] > 58 ? " flip" : "");
      pin.style.left = item.pin[0] + "%";
      pin.style.top = item.pin[1] + "%";
      pin.dataset.id = item.id;
      pin.setAttribute("aria-label", `${item.name}, ${money(item.price)}`);
      pin.innerHTML = `<span class="pulse"></span><span class="tag"><b>${item.name}</b>${money(item.price)}</span>`;
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        selectItem(item.id, true);
      });
      el.appendChild(pin);
    });
    el.addEventListener("click", () => {
      if (wasDrag) return;
      if (i !== active) go(i);
    });
    stage.appendChild(el);
    return el;
  });

  // ---------- Dots ----------
  const dots = looks.map((look, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Look ${i + 1}: ${look.name}`);
    b.addEventListener("click", () => go(i));
    $("dots").appendChild(b);
    return b;
  });

  // ---------- Layout ----------
  // Shortest signed distance from the active look, biased toward the
  // direction we're moving so the wrapping model enters from the right side.
  function dist(i) {
    let d = (((i - active) % n) + n) % n; // 0..n-1
    const half = n / 2;
    if (d > half || (d === half && lastDir < 0)) d -= n;
    return d;
  }

  function layout(dragPx = 0) {
    const h = stage.clientHeight;
    const w = h * (2 / 3);
    const narrow = stage.clientWidth < 520;
    const step = w * (narrow ? 0.5 : 0.44);
    const step2 = w * (narrow ? 0.36 : 0.34);

    models.forEach((el, i) => {
      const d = dist(i);
      const a = Math.abs(d);
      const x = Math.sign(d) * (Math.min(a, 1) * step + Math.max(a - 1, 0) * step2) + dragPx;
      const scale = [1, 0.84, 0.72, 0.64][Math.min(a, 3)];
      const blur = [0, 2.5, 5, 7][Math.min(a, 3)];
      const opacity = a > 2 ? 0 : [1, 0.78, 0.45][a];

      // A model jumping across the stage (looping) shouldn't animate the jump.
      const jumped = prevD[i] !== null && Math.abs(prevD[i] - d) > 1;
      if (jumped) el.style.transition = "none";

      el.style.transform = `translateX(calc(-50% + ${x}px)) scale(${scale})`;
      el.style.filter = blur ? `blur(${blur}px)` : "none";
      el.style.opacity = opacity;
      el.style.zIndex = 10 - a;
      el.classList.toggle("is-active", d === 0);
      el.setAttribute("aria-hidden", d === 0 ? "false" : "true");
      el.querySelectorAll(".pin").forEach((p) => (p.tabIndex = d === 0 ? 0 : -1));

      if (jumped) {
        el.offsetWidth; // flush styles
        el.style.transition = "";
      }
      prevD[i] = d;
    });
  }

  // ---------- Panel ----------
  function thumbStyle(look, item) {
    const tw = 78, th = 96;
    const W = tw * item.zoom;
    const H = W * 1.5;
    const x = Math.min(0, Math.max(tw - W, tw / 2 - (item.pin[0] / 100) * W));
    const y = Math.min(0, Math.max(th - H, th / 2 - (item.pin[1] / 100) * H));
    return `background-image:url('${look.photo}');background-size:${W}px ${H}px;background-position:${x}px ${y}px`;
  }

  function renderPanel() {
    const look = looks[active];
    const total = look.items.reduce((s, it) => s + it.price, 0);
    $("panelCount").textContent = `${look.items.length} pieces`;
    $("sheetCount").textContent = look.items.length;
    $("total").textContent = money(total);
    itemsEl.innerHTML = look.items
      .map(
        (it, k) => `
      <li class="item" data-id="${it.id}" style="animation-delay:${k * 60}ms">
        <button type="button" class="thumb" style="${thumbStyle(look, it)}" aria-label="Show ${it.name} on the model"></button>
        <div>
          <div class="item-type">${it.type}</div>
          <div class="item-name">${it.name}</div>
          <div class="item-color">${it.color}</div>
          <div class="item-price">${money(it.price)}</div>
        </div>
        <button type="button" class="add-one" aria-label="Add ${it.name} to bag">${PLUS}</button>
      </li>`
      )
      .join("");

    itemsEl.querySelectorAll(".item").forEach((li) => {
      const id = li.dataset.id;
      li.querySelector(".thumb").addEventListener("click", () => selectItem(id, false));
      li.querySelector(".add-one").addEventListener("click", (e) => {
        const it = look.items.find((x) => x.id === id);
        addToBag(1, `${it.name} added to bag`);
        const btn = e.currentTarget;
        btn.classList.add("added");
        btn.innerHTML = CHECK;
        setTimeout(() => {
          btn.classList.remove("added");
          btn.innerHTML = PLUS;
        }, 1400);
      });
    });
  }

  function selectItem(id, fromPin) {
    selected = selected === id && !fromPin ? null : id;
    stage.querySelectorAll(".pin").forEach((p) => p.classList.toggle("is-selected", p.dataset.id === selected));
    itemsEl.querySelectorAll(".item").forEach((li) => li.classList.toggle("is-selected", li.dataset.id === selected));
    if (fromPin && mobile.matches) openSheet();
    const li = itemsEl.querySelector(`[data-id="${id}"]`);
    if (li && selected) li.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function openSheet() {
    panel.classList.add("open");
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add("show"));
  }
  function closeSheet() {
    panel.classList.remove("open");
    scrim.classList.remove("show");
    setTimeout(() => (scrim.hidden = true), 400);
  }
  $("sheetOpen").addEventListener("click", openSheet);
  $("panelClose").addEventListener("click", closeSheet);
  scrim.addEventListener("click", closeSheet);

  // ---------- Bag ----------
  let toastTimer;
  function addToBag(qty, msg) {
    bag += qty;
    bagCount.textContent = bag;
    bagCount.dataset.count = bag;
    bagBtn.setAttribute("aria-label", `Bag, ${bag} items`);
    bagCount.classList.remove("bump");
    void bagCount.offsetWidth;
    bagCount.classList.add("bump");
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  $("addAll").addEventListener("click", () => {
    const look = looks[active];
    addToBag(look.items.length, `${look.name} — ${look.items.length} pieces added to bag`);
  });

  // ---------- Navigation ----------
  function go(i) {
    const next = ((i % n) + n) % n;
    if (next === active) return;
    const fwd = (next - active + n) % n;
    lastDir = fwd <= n / 2 ? 1 : -1;
    active = next;
    selected = null;
    update();
  }

  function update() {
    layout();
    const look = looks[active];
    $("lookNum").textContent = `${pad(active + 1)} / ${pad(n)}`;
    $("lookName").textContent = look.name;
    dots.forEach((d, i) => d.setAttribute("aria-selected", i === active ? "true" : "false"));
    stage.querySelectorAll(".pin").forEach((p) => p.classList.remove("is-selected"));
    renderPanel();
  }

  $("prev").addEventListener("click", () => go(active - 1));
  $("next").addEventListener("click", () => go(active + 1));
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") go(active + 1);
    if (e.key === "ArrowLeft") go(active - 1);
    if (e.key === "Escape") closeSheet();
  });

  // ---------- Drag / swipe ----------
  let startX = 0, startY = 0, dx = 0, dragging = false, wasDrag = false, pointerId = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".pin")) return;
    dragging = true;
    wasDrag = false;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    pointerId = e.pointerId;
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dx = e.clientX - startX;
    if (!wasDrag && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - startY)) {
      wasDrag = true;
      stage.classList.add("dragging");
      stage.setPointerCapture(pointerId);
    }
    if (wasDrag) layout(dx * 0.6);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging");
    if (wasDrag) {
      if (dx < -50) go(active + 1);
      else if (dx > 50) go(active - 1);
      else layout();
      // let the click event that follows a drag see wasDrag, then reset
      setTimeout(() => (wasDrag = false), 0);
    }
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => layout());
  mobile.addEventListener?.("change", () => !mobile.matches && closeSheet());

  update();
})();
