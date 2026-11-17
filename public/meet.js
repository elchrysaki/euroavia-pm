// Wingman — Meeting times (works like When2meet), loaded on demand from app.js.
//
// Create: a name, specific dates (click or drag on a calendar) or days of the week, a time window
// ("No earlier than" / "No later than") and a time zone.
// Meeting page: sign in with a name (+ optional password, only for this meeting), then click and drag
// rectangles on a 15-minute grid to toggle when you're free; every change is saved immediately.
// The group grid shades each slot by how many people are free; hover (or tap) a slot to see who.
// Specific-date meetings can be viewed in any time zone; weekday meetings aren't tied to one.

let K; // shared kit from app.js: $, esc, icon, api, toast, store, …

export function init(kit) {
  K = kit;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const DOW_MON_FIRST = [1, 2, 3, 4, 5, 6, 0];
const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const viewerTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const allTimeZones = () => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Athens", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"];
  }
};
const timeLabel = (minute) => {
  const d = new Date(2000, 0, 1, Math.floor(minute / 60) % 24, minute % 60);
  if (minute === 1440) return new Date(2000, 0, 1, 0, 0).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};
const hourLabel = (minute) => new Date(2000, 0, 1, Math.floor(minute / 60) % 24).toLocaleTimeString(undefined, { hour: "numeric" });
const store = {
  get: (k, f = null) => K.store.get(k, f),
  set: (k, v) => K.store.set(k, v),
};

const partsCache = new Map();
/** Wall-clock date key + minute of day of a UTC instant in a time zone. */
function zoned(ms, tz) {
  let f = partsCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    partsCache.set(tz, f);
  }
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minute: (+p.hour % 24) * 60 + +p.minute };
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

export function renderMeetCreate() {
  const { app, $, $$, esc, icon, api, toast, setupSegmented, todayStr, parseDate, ymd, MONTHS, navigate } = K;
  document.title = "Find a time — Wingman";
  const today = todayStr();
  const st = { kind: "dates", yes: new Set(), maybe: new Set(), mode: "yes", days: new Set([1, 2, 3, 4, 5]), month: today.slice(0, 7) };
  const tzs = allTimeZones();
  const here = viewerTz();
  const hourOpts = (from, to, sel) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)
      .map((h) => `<option value="${h * 60}" ${h * 60 === sel ? "selected" : ""}>${esc(timeLabel(h * 60))}${h === 24 ? " (midnight)" : ""}</option>`)
      .join("");

  app.innerHTML = `
    <div class="meet-create">
      <div class="fade-in">
        <div class="pass-row"><span class="pass-airline">${icon("clock")} Meeting times</span><a class="pass-code" href="/" data-link>Wingman Tools</a></div>
        <h1 class="large-title">Find the hour<br/><span class="shine">that works.</span></h1>
        <p class="subtitle">Pick the dates or weekdays and a time window. Everyone drags across the hours they’re free, and the overlap lights up.</p>
      </div>
      <form class="card pad faceplate fade-in d1" id="meetForm" autocomplete="off">
        <i class="screw tl" aria-hidden="true"></i><i class="screw tr" aria-hidden="true"></i><i class="screw bl" aria-hidden="true"></i><i class="screw br" aria-hidden="true"></i>
        <div class="section-header">New meeting</div>
        <div class="group well"><div class="row"><label for="mTitle">Name</label><input id="mTitle" name="title" maxlength="80" placeholder="IT WG weekly sync" required /></div></div>
        <div class="section-header">Survey using</div>
        <div class="segmented" data-seg="kind" role="group" aria-label="Survey using">
          <span class="thumb"></span>
          <button type="button" data-value="dates" aria-pressed="true">Specific dates</button>
          <button type="button" data-value="week" aria-pressed="false">Days of the week</button>
        </div>
        <div id="kindDates" class="mc-dates">
          <div class="mc-month">
            <div class="mc-month-head">
              <button type="button" class="btn btn-icon" data-month="-1" aria-label="Previous month">‹</button>
              <h3 id="mcMonthTitle"></h3>
              <button type="button" class="btn btn-icon" data-month="1" aria-label="Next month">›</button>
            </div>
            <div class="weekdays">${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span>${d}</span>`).join("")}</div>
            <div class="days picker" id="mcDays"></div>
          </div>
          <p class="picker-hint">Click or drag to choose dates. Selected: <b id="mcCount">0</b></p>
        </div>
        <div id="kindWeek" class="mc-week" hidden>
          <div class="chips" id="mcWeekdays">${DOW_MON_FIRST.map((d) => `<button type="button" class="chip" data-dow="${d}" aria-pressed="${st.days.has(d)}">${DOW_SHORT[d]}</button>`).join("")}</div>
        </div>
        <div class="section-header">Times that might work</div>
        <div class="group well">
          <div class="row"><label for="mStart">No earlier than</label><select id="mStart" class="time-select">${hourOpts(0, 23, 540)}</select></div>
          <div class="row"><label for="mEnd">No later than</label><select id="mEnd" class="time-select">${hourOpts(1, 24, 1020)}</select></div>
          <div class="row" id="tzRow"><label for="mTz">Time zone</label><select id="mTz" class="time-select">${tzs.map((z) => `<option ${z === here ? "selected" : ""}>${esc(z)}</option>`).join("")}</select></div>
        </div>
        <p class="range-summary" id="mcSummary"></p>
        <button class="btn btn-primary btn-block" type="submit" id="mcCreate">${icon("clock")} Create meeting</button>
      </form>
    </div>`;

  const daysEl = $("#mcDays");
  const renderMonth = () => {
    const [y, m] = st.month.split("-").map(Number);
    $("#mcMonthTitle").textContent = `${MONTHS[m - 1]} ${y}`;
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const n = new Date(y, m, 0).getDate();
    let html = "";
    for (let i = 0; i < offset; i++) html += '<span class="day blank"></span>';
    for (let d = 1; d <= n; d++) {
      const date = ymd(y, m - 1, d);
      const past = date < today;
      html += `<button type="button" class="day${past ? " past" : ""}${date === today ? " today" : ""}${st.yes.has(date) ? " yes" : ""}" data-date="${date}" ${past ? "disabled" : ""}>${d}</button>`;
    }
    daysEl.innerHTML = html;
    $('[data-month="-1"]').disabled = st.month <= today.slice(0, 7);
  };
  const summary = () => {
    const s = Number($("#mStart").value);
    const e = Number($("#mEnd").value);
    const what = st.kind === "dates" ? `${st.yes.size} ${st.yes.size === 1 ? "date" : "dates"}` : [...st.days].sort((a, b) => DOW_MON_FIRST.indexOf(a) - DOW_MON_FIRST.indexOf(b)).map((d) => DOW_SHORT[d]).join(", ") || "No days";
    const ok = e > s && (st.kind === "dates" ? st.yes.size > 0 : st.days.size > 0);
    $("#mcSummary").classList.toggle("error", e <= s);
    $("#mcSummary").innerHTML = `${icon("clock")}<span>${e <= s ? "“No later than” must be after “No earlier than”." : `<b>${esc(what)}</b> · ${esc(timeLabel(s))}–${esc(timeLabel(e))}${st.kind === "dates" ? ` · ${esc($("#mTz").value)}` : ""}`}</span>`;
    $("#mcCount").textContent = st.yes.size;
    $("#mcCreate").disabled = !ok;
  };
  renderMonth();
  K.attachPainter(daysEl, st, summary); // click to toggle, drag (or hold & drag on touch) to paint
  $$("[data-month]").forEach((b) =>
    b.addEventListener("click", () => {
      const [y, m] = st.month.split("-").map(Number);
      const d = new Date(y, m - 1 + Number(b.dataset.month), 1);
      st.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      renderMonth();
    }),
  );
  setupSegmented($('[data-seg="kind"]'), (v) => {
    st.kind = v;
    $("#kindDates").hidden = v !== "dates";
    $("#kindWeek").hidden = v !== "week";
    $("#tzRow").hidden = v !== "dates"; // weekday meetings aren't tied to a time zone
    summary();
  });
  $("#mcWeekdays").addEventListener("click", (e) => {
    const c = e.target.closest("[data-dow]");
    if (!c) return;
    const d = Number(c.dataset.dow);
    st.days.has(d) ? st.days.delete(d) : st.days.add(d);
    c.setAttribute("aria-pressed", String(st.days.has(d)));
    summary();
  });
  ["mStart", "mEnd", "mTz"].forEach((id) => $(`#${id}`).addEventListener("change", summary));
  summary();

  $("#meetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("#mTitle").value.trim();
    if (!title) {
      $("#mTitle").focus();
      return toast("Give your meeting a name", { error: true });
    }
    const body = {
      title,
      kind: st.kind,
      dates: [...st.yes],
      days: [...st.days],
      start_min: Number($("#mStart").value),
      end_min: Number($("#mEnd").value),
      tz: $("#mTz").value,
    };
    $("#mcCreate").disabled = true;
    try {
      const { id } = await api("/meetings", { method: "POST", body });
      const list = store.get("wingman:meets", []).filter((x) => x.id !== id);
      list.unshift({ id, title, kind: st.kind });
      store.set("wingman:meets", list.slice(0, 20));
      navigate(`/m/${id}`);
      K.buzz([15, 60, 15]);
    } catch (err) {
      toast(err.message, { error: true });
      $("#mcCreate").disabled = false;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Meeting page                                                        */
/* ------------------------------------------------------------------ */

let M = null; // { meeting, people, me, tz, mine:Set, page, focus }

export async function renderMeeting(id) {
  const { app, $, esc, icon, api } = K;
  app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  let data;
  try {
    data = await api(`/meetings/${id}`);
  } catch (err) {
    app.innerHTML = `<div class="empty card" style="margin-top:2.5rem"><div class="glyph">${icon("clock")}</div><h3>Meeting not found</h3><p>${esc(err.message)}</p><a class="btn btn-primary" href="/meet" data-link style="margin-top:0.75rem">Create a meeting</a></div>`;
    return;
  }
  const saved = store.get(`wingman:meet:${id}`);
  const me = saved && data.people.find((p) => p.id === saved.id) ? saved : null;
  M = {
    ...data,
    me,
    tz: data.meeting.kind === "dates" ? store.get("wingman:tz", viewerTz()) : null,
    mine: new Set(me ? data.people.find((p) => p.id === me.id).slots : []),
    page: 0,
    focus: null,
    view: "you",
  };
  const recent = store.get("wingman:meets", []);
  if (!recent.some((x) => x.id === id)) {
    recent.unshift({ id, title: data.meeting.title, kind: data.meeting.kind });
    store.set("wingman:meets", recent.slice(0, 20));
  }
  paint();
  document.addEventListener("visibilitychange", refreshOnReturn);
}

function refreshOnReturn() {
  if (document.visibilityState !== "visible" || !M || !location.pathname.startsWith(`/m/${M.meeting.id}`)) return;
  K.api(`/meetings/${M.meeting.id}`)
    .then((d) => {
      M.people = d.people;
      paintGrids();
    })
    .catch(() => {});
}

/** Columns × rows of the grid, in the viewer's time zone for date meetings. */
function layout() {
  const { meeting } = M;
  const cols = new Map(); // key -> { label, sub, cells: Map(minute -> slotKey) }
  const minutes = new Set();
  for (const s of meeting.slots) {
    let key;
    let minute;
    if (meeting.kind === "dates") {
      const z = zoned(Number(s.slice(1)) * 60000, M.tz);
      key = z.date;
      minute = z.minute;
    } else {
      const [d, mm] = s.slice(1).split(":").map(Number);
      key = String(DOW_MON_FIRST.indexOf(d)).padStart(2, "0") + d;
      minute = mm;
    }
    if (!cols.has(key)) cols.set(key, new Map());
    cols.get(key).set(minute, s);
    minutes.add(minute);
  }
  const keys = [...cols.keys()].sort();
  const columns = keys.map((k) => {
    if (meeting.kind === "dates") {
      const d = K.parseDate(k);
      return { key: k, top: DOW_SHORT[d.getDay()], bottom: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), cells: cols.get(k), long: d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) };
    }
    const dow = Number(k.slice(2));
    return { key: k, top: DOW_SHORT[dow], bottom: "", cells: cols.get(k), long: DOW_LONG[dow] };
  });
  const rows = [...minutes].sort((a, b) => a - b);
  return { columns, rows };
}

function paint() {
  const { app, esc, icon, navActions, shareLink } = K;
  const { meeting } = M;
  document.title = `${meeting.title} — Wingman`;
  const url = `${location.origin}/m/${meeting.id}`;
  navActions.innerHTML = `<button class="btn btn-tinted nav-share" id="navShare" aria-label="Share meeting">${icon("share")}<span>Share</span></button>`;
  document.getElementById("navShare").onclick = () => shareLink(url, meeting.title);
  const window_ = `${timeLabel(meeting.start_min)}–${timeLabel(meeting.end_min)}`;
  const what =
    meeting.kind === "dates"
      ? `${meeting.days.length} ${meeting.days.length === 1 ? "date" : "dates"}`
      : meeting.days
          .slice()
          .sort((a, b) => DOW_MON_FIRST.indexOf(a) - DOW_MON_FIRST.indexOf(b))
          .map((d) => DOW_SHORT[d])
          .join(", ");
  const tzs = allTimeZones();
  const days = Math.ceil((meeting.delete_at - Date.now()) / 86_400_000);
  app.innerHTML = `
    <div class="meet-page">
      <header class="meet-head pass-card fade-in">
        <div class="pass-row"><span class="pass-airline">${icon("clock")} Meeting times</span><span class="pass-code">WM-${esc(meeting.id.slice(0, 4).toUpperCase())}</span></div>
        <h1 class="large-title">${esc(meeting.title)}</h1>
        <p class="subtitle">${esc(what)} · ${esc(window_)}${meeting.kind === "dates" ? ` · created in ${esc(meeting.tz)}` : ""}</p>
        ${
          meeting.kind === "dates"
            ? `<div class="meet-tz"><label for="viewTz">${icon("clock")} Times shown in</label><select id="viewTz" class="field">${tzs.map((z) => `<option ${z === M.tz ? "selected" : ""}>${esc(z)}</option>`).join("")}</select></div>`
            : ""
        }
        ${days <= 7 ? `<p class="expiry-note">${icon("lock")}<span>This meeting will be deleted on <b>${esc(new Date(meeting.delete_at).toLocaleDateString(undefined, { month: "long", day: "numeric" }))}</b>.</span></p>` : ""}
      </header>
      <div id="meetVerdict"></div>
      <div class="segmented tabs meet-tabs" data-seg="mview" role="tablist">
        <span class="thumb"></span>
        <button type="button" data-value="you" aria-pressed="${M.view === "you"}">Your availability</button>
        <button type="button" data-value="group" aria-pressed="${M.view === "group"}">Group</button>
      </div>
      <div class="meet-grids" data-view="${M.view}">
        <section class="card meet-panel meet-you">
          <div id="youPanel"></div>
        </section>
        <section class="card meet-panel meet-group">
          <div class="mp-head"><h2>Group’s availability</h2><div class="legend" id="groupLegend"></div></div>
          <div class="mgrid-wrap" id="groupGrid"></div>
          <div class="who" id="who"></div>
        </section>
      </div>
    </div>`;
  K.setupSegmented(K.$('[data-seg="mview"]'), (v) => {
    M.view = v;
    K.$(".meet-grids").dataset.view = v;
  });
  K.$("#viewTz")?.addEventListener("change", (e) => {
    M.tz = e.target.value;
    store.set("wingman:tz", M.tz);
    M.page = 0;
    paintGrids();
  });
  paintYouPanel();
  paintGrids();
  window.addEventListener("resize", onResize);
}

let resizeT;
function onResize() {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => M && K.$(".meet-page") && paintGrids(), 150);
}

function paintYouPanel() {
  const { $, esc, icon, api, toast } = K;
  const panel = $("#youPanel");
  if (!M.me) {
    panel.innerHTML = `
      <div class="mp-head"><h2>Sign in to add your availability</h2></div>
      <form class="signin stack" id="signin">
        <div class="group well">
          <div class="row"><label for="siName">Name</label><input id="siName" maxlength="40" placeholder="Your name" autocomplete="given-name" value="${esc(store.get("convene:name", ""))}" required /></div>
          <div class="row"><label for="siPass">Password</label><input id="siPass" type="password" maxlength="100" placeholder="Optional" autocomplete="new-password" /></div>
        </div>
        <p class="fineprint">${icon("lock")}<span>Your name and password are only for this meeting. New here? Pick any password, or leave it empty. Coming back? Use the same name and password.</span></p>
        <button class="btn btn-primary btn-block" type="submit">Sign in</button>
      </form>`;
    $("#signin").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#siName").value.trim();
      if (!name) return $("#siName").focus();
      try {
        const res = await api(`/meetings/${M.meeting.id}/signin`, { method: "POST", body: { name, password: $("#siPass").value } });
        M.me = { id: res.id, token: res.token, name: res.name };
        store.set(`wingman:meet:${M.meeting.id}`, M.me);
        store.set("convene:name", res.name);
        if (!M.people.some((p) => p.id === res.id)) M.people.push({ id: res.id, name: res.name, slots: [] });
        M.mine = new Set(res.slots);
        paintYouPanel();
        paintGrids();
        K.buzz(12);
      } catch (err) {
        toast(err.message, { error: true });
      }
    });
    return;
  }
  panel.innerHTML = `
    <div class="mp-head">
      <h2>${esc(M.me.name)}’s availability</h2>
      <div class="legend"><span class="lg-key off"></span>Unavailable <span class="lg-key on"></span>Available</div>
    </div>
    <p class="picker-hint">Click and drag to mark when you’re free. <span id="saveState">Saved automatically.</span> <button type="button" class="btn-link" id="signOut">Not ${esc(M.me.name)}?</button></p>
    <div class="mgrid-wrap" id="youGrid"></div>`;
  $("#signOut").addEventListener("click", () => {
    store.set(`wingman:meet:${M.meeting.id}`, null);
    M.me = null;
    M.mine = new Set();
    paintYouPanel();
    paintGrids();
  });
}

/** How many columns fit; both grids page together on narrow screens. */
function pageSize(total) {
  const wrap = K.$(".meet-panel");
  const width = wrap ? wrap.clientWidth - 70 : 320;
  return Math.max(3, Math.min(total, Math.floor(width / 46)));
}

function gridHtml(kind, L, size) {
  const { esc } = K;
  const cols = L.columns.slice(M.page, M.page + size);
  const n = M.people.length;
  const counts = new Map();
  for (const p of M.people) for (const s of p.id === M.me?.id ? M.mine : p.slots) counts.set(s, (counts.get(s) || 0) + 1);
  const head = `<div class="mg-corner"></div>${cols.map((c) => `<div class="mg-col"><b>${esc(c.top)}</b>${c.bottom ? `<span>${esc(c.bottom)}</span>` : ""}</div>`).join("")}`;
  let body = "";
  L.rows.forEach((minute, r) => {
    const onHour = minute % 60 === 0;
    body += `<div class="mg-time${onHour ? " hour" : ""}">${onHour ? esc(hourLabel(minute)) : ""}</div>`;
    cols.forEach((c, ci) => {
      const slot = c.cells.get(minute);
      if (!slot) return void (body += `<div class="ms none${onHour ? " hour" : ""}"></div>`);
      if (kind === "you") body += `<div class="ms${M.mine.has(slot) ? " on" : ""}${onHour ? " hour" : ""}" data-s="${slot}" data-c="${ci}" data-r="${r}"></div>`;
      else {
        const k = counts.get(slot) || 0;
        body += `<div class="ms g${k ? " heat" : ""}${onHour ? " hour" : ""}${M.focus === slot ? " focus" : ""}" style="--t:${n ? (k / n).toFixed(3) : 0}" data-s="${slot}" tabindex="-1"></div>`;
      }
    });
  });
  const pager =
    L.columns.length > size
      ? `<div class="mg-pager"><button type="button" class="btn btn-icon" data-page="-1" ${M.page === 0 ? "disabled" : ""} aria-label="Earlier days">‹</button><span>${M.page + 1}–${Math.min(M.page + size, L.columns.length)} of ${L.columns.length}</span><button type="button" class="btn btn-icon" data-page="1" ${M.page + size >= L.columns.length ? "disabled" : ""} aria-label="Later days">›</button></div>`
      : "";
  return `${pager}<div class="mgrid ${kind}" style="--cols:${cols.length}">${head}${body}</div>`;
}

function paintGrids() {
  const { $ } = K;
  const L = layout();
  const size = pageSize(L.columns.length);
  M.page = Math.min(M.page, Math.max(0, L.columns.length - size));
  const you = $("#youGrid");
  if (you) {
    you.innerHTML = gridHtml("you", L, size);
    bindYouGrid(you, L, size);
  }
  const group = $("#groupGrid");
  group.innerHTML = gridHtml("group", L, size);
  const n = M.people.length;
  const steps = Math.min(Math.max(n, 1), 6);
  $("#groupLegend").innerHTML = `<span>0/${n}</span><span class="legend-scale">${Array.from({ length: steps + 1 }, (_, k) => `<i style="--t:${(k / steps).toFixed(3)}"></i>`).join("")}</span><span>${n}/${n} available</span>`;
  bindGroupGrid(group);
  [you, group].forEach((el) =>
    el?.querySelectorAll("[data-page]").forEach((b) =>
      b.addEventListener("click", () => {
        M.page = Math.max(0, M.page + Number(b.dataset.page) * size);
        paintGrids();
      }),
    ),
  );
  paintWho();
  paintVerdict(L);
}

/* When2meet-style painting: press on a cell, drag a rectangle; every cell in it becomes the
   opposite of the cell you started on. Saved as soon as you let go. */
function bindYouGrid(wrap, L, size) {
  const grid = wrap.querySelector(".mgrid");
  const cellAt = (x, y) => document.elementFromPoint(x, y)?.closest?.(".mgrid.you .ms[data-s]");
  let drag = null;
  const apply = (end) => {
    const c0 = Math.min(drag.c, end.c);
    const c1 = Math.max(drag.c, end.c);
    const r0 = Math.min(drag.r, end.r);
    const r1 = Math.max(drag.r, end.r);
    for (const el of drag.cells) {
      const c = +el.dataset.c;
      const r = +el.dataset.r;
      const inside = c >= c0 && c <= c1 && r >= r0 && r <= r1;
      const on = inside ? drag.mode : drag.before.has(el.dataset.s);
      el.classList.toggle("on", on);
    }
  };
  grid.addEventListener("pointerdown", (e) => {
    const cell = e.target.closest(".ms[data-s]");
    if (!cell) return;
    e.preventDefault();
    grid.setPointerCapture(e.pointerId);
    drag = { c: +cell.dataset.c, r: +cell.dataset.r, mode: !cell.classList.contains("on"), before: new Set(M.mine), cells: [...grid.querySelectorAll(".ms[data-s]")], last: cell };
    apply({ c: drag.c, r: drag.r });
  });
  grid.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell || cell === drag.last) return;
    drag.last = cell;
    apply({ c: +cell.dataset.c, r: +cell.dataset.r });
  });
  const end = () => {
    if (!drag) return;
    for (const el of drag.cells) el.classList.contains("on") ? M.mine.add(el.dataset.s) : M.mine.delete(el.dataset.s);
    drag = null;
    save();
    const group = K.$("#groupGrid");
    group.innerHTML = gridHtml("group", L, size); // group view follows your changes immediately
    bindGroupGrid(group);
    paintWho();
    paintVerdict(L);
  };
  grid.addEventListener("pointerup", end);
  grid.addEventListener("pointercancel", end);
  grid.addEventListener("lostpointercapture", end);
}

let saveT = null;
let saving = Promise.resolve();
function save() {
  const state = K.$("#saveState");
  if (state) state.textContent = "Saving…";
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    const slots = [...M.mine];
    const mid = M.meeting.id;
    saving = saving
      .then(() => K.api(`/meetings/${mid}/people/${M.me.id}`, { method: "PUT", body: { token: M.me.token, slots } }))
      .then(() => {
        const me = M.people.find((p) => p.id === M.me.id);
        if (me) me.slots = slots;
        const s = K.$("#saveState");
        if (s) s.textContent = "Saved.";
        K.buzz(8);
      })
      .catch((err) => {
        K.toast(err.message, { error: true });
        const s = K.$("#saveState");
        if (s) s.textContent = "Not saved — try again.";
      });
  }, 250);
}

function bindGroupGrid(wrap) {
  const grid = wrap.querySelector(".mgrid");
  const focus = (cell) => {
    if (!cell || M.focus === cell.dataset.s) return;
    grid.querySelector(".ms.focus")?.classList.remove("focus");
    cell.classList.add("focus");
    M.focus = cell.dataset.s;
    paintWho();
  };
  grid.addEventListener("pointerover", (e) => e.pointerType === "mouse" && focus(e.target.closest(".ms[data-s]")));
  grid.addEventListener("click", (e) => focus(e.target.closest(".ms[data-s]")));
}

function describeSlot(slot) {
  const { meeting } = M;
  if (meeting.kind === "dates") {
    const ms = Number(slot.slice(1)) * 60000;
    const z = zoned(ms, M.tz);
    const d = K.parseDate(z.date);
    return `${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}, ${timeLabel(z.minute)}–${timeLabel(z.minute + 15)}`;
  }
  const [d, mm] = slot.slice(1).split(":").map(Number);
  return `${DOW_LONG[d]}, ${timeLabel(mm)}–${timeLabel(mm + 15)}`;
}

function paintWho() {
  const { $, esc, avatar } = K;
  const el = $("#who");
  if (!el) return;
  const n = M.people.length;
  if (!M.focus) {
    el.innerHTML = `<p class="who-hint">${n ? "Hover over (or tap) the group grid to see who’s available." : "No one has added their availability yet."}</p>`;
    return;
  }
  const avail = [];
  const not = [];
  for (const p of M.people) ((p.id === M.me?.id ? M.mine : new Set(p.slots)).has(M.focus) ? avail : not).push(p.name);
  el.innerHTML = `
    <div class="who-head"><b>${avail.length}/${n} available</b><span>${esc(describeSlot(M.focus))}</span></div>
    <div class="who-cols">
      <div><h4><span class="swatch yes"></span>Available</h4>${avail.map((x) => `<div class="name-chip">${avatar(x, "sm")} ${esc(x)}</div>`).join("") || '<p class="who-none">No one</p>'}</div>
      <div><h4><span class="swatch erase"></span>Unavailable</h4>${not.map((x) => `<div class="name-chip">${avatar(x, "sm")} ${esc(x)}</div>`).join("") || '<p class="who-none">No one</p>'}</div>
    </div>`;
}

/** "Best time so far": the longest run of slots where the most people are free. */
function paintVerdict(L) {
  const { $, esc, icon } = K;
  const el = $("#meetVerdict");
  const n = M.people.length;
  if (!el) return;
  if (!n) return void (el.innerHTML = "");
  const count = (slot) => M.people.reduce((k, p) => k + ((p.id === M.me?.id ? M.mine : new Set(p.slots)).has(slot) ? 1 : 0), 0);
  let best = null;
  for (const c of L.columns) {
    let run = null;
    for (const minute of L.rows) {
      const slot = c.cells.get(minute);
      const k = slot ? count(slot) : 0;
      if (k && run && run.k === k && run.end === minute) run.end = minute + 15;
      else {
        if (run && (!best || run.k > best.k || (run.k === best.k && run.end - run.start > best.end - best.start))) best = run;
        run = k ? { k, start: minute, end: minute + 15, col: c } : null;
      }
    }
    if (run && (!best || run.k > best.k || (run.k === best.k && run.end - run.start > best.end - best.start))) best = run;
  }
  if (!best) return void (el.innerHTML = "");
  el.innerHTML = `<div class="card verdict">
    <div class="verdict-label">${icon("clock")} Best time so far</div>
    <div class="verdict-date">${esc(best.col.long)}, ${esc(timeLabel(best.start))}–${esc(timeLabel(best.end))}</div>
    <div class="verdict-sub"><b>${best.k} of ${n}</b> available</div>
    <div class="verdict-meter" aria-hidden="true"><i style="width:${Math.round((best.k / n) * 100)}%"></i></div>
  </div>`;
}
