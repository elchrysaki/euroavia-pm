// Wingman — Meeting times (works like When2meet), loaded on demand from app.js.
//
// Create, in two steps (like When2meet / LettuceMeet):
//   1. Dates: a calendar that opens on the next 4 weeks and scrolls up to 3 months ahead. Tap a day,
//      drag across many, select a whole week (›) or month, or use the quick picks.
//   2. Details: name, what it's about, "No earlier than" / "No later than" and the time zone.
// Meeting page: "Add availability" asks just for a name (this device remembers it), then click and drag
// rectangles on the half-hour grid as Available, Maybe or Unavailable; changes save as you go.
// The group grid shades each time by how many people are free (maybe counts half); hover or tap
// a time to see who, or tap a name to see only that person's times. Times show in your own time
// zone by default, and you can pick another.

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
  const { app, $, $$, esc, icon, api, toast, todayStr, parseDate, ymd, MONTHS, navigate } = K;
  document.title = "Let’s meet — Wingman";
  const today = todayStr();
  const t0 = parseDate(today);
  // the calendar runs from this week's Monday to 3 months from today
  const lastDate = (() => {
    const d = new Date(t0.getFullYear(), t0.getMonth() + 3, t0.getDate());
    return ymd(d.getFullYear(), d.getMonth(), d.getDate());
  })();
  const st = { yes: new Set(), maybe: new Set(), mode: "yes" };
  const tzs = allTimeZones();
  const here = viewerTz();
  // half-hour steps, like the grid
  const hourOpts = (from, to, sel) =>
    Array.from({ length: (to - from) * 2 + 1 }, (_, i) => from * 60 + i * 30)
      .map((m) => `<option value="${m}" ${m === sel ? "selected" : ""}>${esc(timeLabel(m))}${m === 1440 ? " (midnight)" : ""}</option>`)
      .join("");

  // weeks: Monday-first rows; a month label before the first week and before each week holding a 1st
  const start = new Date(t0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const weeks = [];
  for (let d = new Date(start); ymd(d.getFullYear(), d.getMonth(), d.getDate()) <= lastDate; ) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(ymd(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setDate(d.getDate() + 1);
    }
    weeks.push(days);
  }
  const open = (date) => date >= today && date <= lastDate;
  const monthKey = (date) => date.slice(0, 7);
  const monthName = (key) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
  let rows = "";
  weeks.forEach((days, w) => {
    const firstOpen = days.find(open) || days[0];
    const newMonth = w === 0 ? monthKey(firstOpen) : days.find((x) => x.endsWith("-01") && open(x)) && monthKey(days.find((x) => x.endsWith("-01")));
    if (newMonth)
      rows += `<div class="mc-monthrow"><h3>${esc(monthName(newMonth))}</h3><button type="button" class="btn-link" data-selmonth="${newMonth}">Select month</button></div>`;
    rows += `<div class="mc-weekrow"><button type="button" class="wk-handle" data-week="${w}" aria-label="Select the week of ${esc(fmtShort(days[0]))}" ${days.some(open) ? "" : "disabled"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>${days
      .map((date) => {
        const ok = open(date);
        const n = Number(date.slice(8));
        const label = n; // the month name sits above each month, like Apple Calendar
        return `<button type="button" class="day${ok ? "" : " past"}${date === today ? " today" : ""}${n === 1 ? " first" : ""}" data-date="${date}" ${ok ? "" : "disabled"} aria-label="${esc(fmtShort(date))}">${label}</button>`;
      })
      .join("")}</div>`;
  });

  app.innerHTML = `
    <div class="meet-create">
      <div class="fade-in">
        <div class="pass-row"><span class="pass-airline">${icon("clock")} Meeting times</span><a class="pass-code" href="/new" data-link>Wingman Tools</a></div>
        <h1 class="large-title">Let’s <span class="shine">meet.</span></h1>
        <p class="subtitle" id="mcLede">Pick the days that could work. Tap a day, drag across several, or select a whole week or month.</p>
      </div>

      <section class="card pad faceplate fade-in d1" id="step1">
        <i class="screw tl" aria-hidden="true"></i><i class="screw tr" aria-hidden="true"></i><i class="screw bl" aria-hidden="true"></i><i class="screw br" aria-hidden="true"></i>
        <div class="mc-steps" aria-hidden="true"><span class="on">1 · Dates</span><span>2 · Details</span></div>
        <div class="chips mc-quick">
          <button type="button" class="btn btn-tinted" data-quick="7">Next 7 days</button>
          <button type="button" class="btn btn-tinted" data-quick="14">Next 2 weeks</button>
          <button type="button" class="btn btn-tinted" data-quick="28">Next 4 weeks</button>
          <button type="button" class="btn btn-tinted" data-quick="wd">Weekdays only</button>
          <button type="button" class="btn btn-tinted" data-quick="clear">Clear</button>
        </div>
        <div class="mc-cal">
          <div class="mc-weekrow mc-head"><span></span>${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span>${d}</span>`).join("")}</div>
          <div class="mc-scroll picker" id="mcScroll">${rows}</div>
        </div>
        <p class="picker-hint">Drag to select many days. On a touch screen, hold a day, then drag. <span class="mc-arrow-hint">Tap ${`<b>›</b>`} to select a whole week.</span></p>
        <div class="mc-cta">
          <span id="mcSel">No dates selected</span>
          <button type="button" class="btn btn-primary" id="mcNext" disabled>Let’s meet ${icon("arrow")}</button>
        </div>
      </section>

      <form class="card pad faceplate" id="step2" autocomplete="off" hidden>
        <i class="screw tl" aria-hidden="true"></i><i class="screw tr" aria-hidden="true"></i><i class="screw bl" aria-hidden="true"></i><i class="screw br" aria-hidden="true"></i>
        <div class="mc-steps" aria-hidden="true"><span>1 · Dates</span><span class="on">2 · Details</span></div>
        <button type="button" class="btn-link mc-back" id="mcBack">‹ Change dates</button>
        <p class="range-summary" id="mcDatesSummary"></p>
        <div class="section-header">About the meeting</div>
        <div class="group well">
          <div class="row"><label for="mTitle">Name</label><input id="mTitle" maxlength="80" placeholder="IT WG weekly sync" required /></div>
          <div class="row"><label for="mDesc">What’s it about</label><textarea id="mDesc" maxlength="400" placeholder="Optional"></textarea></div>
          <div class="row"><label for="mBy">Created by</label><input id="mBy" maxlength="40" placeholder="Your name (optional)" autocomplete="name" value="${esc(store.get("convene:name", ""))}" /></div>
        </div>
        <div class="section-header">Hours</div>
        <div class="group well">
          <div class="row"><label for="mStart">No earlier than</label><select id="mStart" class="time-select">${hourOpts(0, 23.5, 540)}</select></div>
          <div class="row"><label for="mEnd">No later than</label><select id="mEnd" class="time-select">${hourOpts(0.5, 24, 1020)}</select></div>
          <div class="row"><label for="mTz">Time zone</label><select id="mTz" class="time-select">${tzs.map((z) => `<option ${z === here ? "selected" : ""}>${esc(z)}</option>`).join("")}</select></div>
        </div>
        <p class="fineprint">${icon("clock")}<span>These hours are in the time zone above. Everyone who opens the link sees the times converted to their own time zone, and can switch to another one.</span></p>
        <p class="range-summary" id="mcSummary"></p>
        <button class="btn btn-primary btn-block" type="submit" id="mcCreate">${icon("check")} Create meeting</button>
      </form>
    </div>`;

  const scroller = $("#mcScroll");
  const allDays = () => $$(".day[data-date]:not([disabled])", scroller);
  const sync = () => {
    allDays().forEach((el) => el.classList.toggle("yes", st.yes.has(el.dataset.date)));
    // picked days next to each other in a week run together as one band (Apple Calendar style)
    allDays().forEach((el) => {
      const on = el.classList.contains("yes");
      const prev = el.previousElementSibling;
      const next = el.nextElementSibling;
      el.classList.toggle("join-l", on && !!prev?.classList.contains("yes"));
      el.classList.toggle("join-r", on && !!next?.classList.contains("yes"));
    });
    changed();
  };
  const changed = () => {
    const n = st.yes.size;
    const sorted = [...st.yes].sort();
    $("#mcSel").innerHTML = n ? `<b>${n}</b> ${n === 1 ? "date" : "dates"} · ${esc(fmtShort(sorted[0]))}${n > 1 ? ` – ${esc(fmtShort(sorted[n - 1]))}` : ""}` : "No dates selected";
    $("#mcNext").disabled = !n;
  };
  // toggle a group: if every open day in it is selected, clear them; otherwise select them all
  const toggleGroup = (dates) => {
    const ok = dates.filter(open);
    const all = ok.length && ok.every((d) => st.yes.has(d));
    ok.forEach((d) => (all ? st.yes.delete(d) : st.yes.add(d)));
    sync();
    K.buzz?.(8);
  };
  attachRangeDrag(scroller, st, open, sync);
  scroller.addEventListener("click", (e) => {
    const h = e.target.closest("[data-week]");
    if (h) toggleGroup(weeks[Number(h.dataset.week)]);
    const m = e.target.closest("[data-selmonth]");
    if (m) toggleGroup(weeks.flat().filter((d) => monthKey(d) === m.dataset.selmonth));
  });
  $$("[data-quick]").forEach((b) =>
    b.addEventListener("click", () => {
      const q = b.dataset.quick;
      if (q === "clear") {
        st.yes.clear();
        return sync();
      }
      if (q === "wd") {
        // keep only Monday–Friday from what's selected; with nothing selected, pick weekdays of the next 4 weeks
        const base = st.yes.size ? [...st.yes] : weeks.flat().filter(open).slice(0, 28);
        st.yes = new Set(base.filter((d) => parseDate(d).getDay() % 6 !== 0));
        return sync();
      }
      st.yes = new Set(weeks.flat().filter(open).slice(0, Number(q)));
      sync();
    }),
  );

  // show four weeks at a time; the rest scrolls
  const fit = () => {
    const wk = $$(".mc-weekrow", scroller);
    if (wk.length < 4) return;
    const end = wk[3].offsetTop + wk[3].offsetHeight;
    scroller.style.maxHeight = `${end + 2}px`;
  };
  requestAnimationFrame(fit);
  new ResizeObserver(fit).observe(scroller);

  const toStep = (n) => {
    $("#step1").hidden = n !== 1;
    $("#step2").hidden = n !== 2;
    $("#step2").classList.toggle("fade-in", n === 2);
    $("#mcLede").textContent =
      n === 1 ? "Pick the days that could work. Tap a day, drag across several, or select a whole week or month." : "Name it, say what it’s about, and set the hours.";
    window.scrollTo({ top: 0, behavior: K.reducedMotion?.() ? "auto" : "smooth" });
    if (n === 2) {
      const sorted = [...st.yes].sort();
      $("#mcDatesSummary").innerHTML = `${icon("calendar")}<span><b>${sorted.length} ${sorted.length === 1 ? "date" : "dates"}</b> · ${esc(fmtShort(sorted[0]))}${sorted.length > 1 ? ` – ${esc(fmtShort(sorted[sorted.length - 1]))}` : ""}</span>`;
      setTimeout(() => $("#mTitle").focus({ preventScroll: true }), 50);
      summary();
    }
  };
  $("#mcNext").addEventListener("click", () => toStep(2));
  $("#mcBack").addEventListener("click", () => toStep(1));

  const summary = () => {
    const s = Number($("#mStart").value);
    const e = Number($("#mEnd").value);
    $("#mcSummary").classList.toggle("error", e <= s);
    $("#mcSummary").innerHTML = `${icon("clock")}<span>${e <= s ? "“No later than” must be after “No earlier than”." : `<b>${esc(timeLabel(s))}–${esc(timeLabel(e))}</b> · ${esc($("#mTz").value)}`}</span>`;
    $("#mcCreate").disabled = e <= s;
  };
  ["mStart", "mEnd", "mTz"].forEach((id) => $(`#${id}`).addEventListener("change", summary));

  $("#step2").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("#mTitle").value.trim();
    if (!title) {
      $("#mTitle").focus();
      return toast("Give your meeting a name", { error: true });
    }
    const body = {
      title,
      description: $("#mDesc").value.trim(),
      creator: $("#mBy").value.trim(),
      kind: "dates",
      dates: [...st.yes].sort(),
      start_min: Number($("#mStart").value),
      end_min: Number($("#mEnd").value),
      tz: $("#mTz").value,
    };
    $("#mcCreate").disabled = true;
    try {
      const { id, admin } = await api("/meetings", { method: "POST", body });
      if (admin) store.set(`wingman:admin:${id}`, admin); // you're the host of this meeting
      const list = store.get("wingman:meets", []).filter((x) => x.id !== id);
      list.unshift({ id, title, kind: "dates", mine: true });
      if (body.creator) store.set("convene:name", body.creator);
      store.set("wingman:meets", list.slice(0, 20));
      navigate(`/m/${id}`);
      K.buzz([15, 60, 15]);
    } catch (err) {
      toast(err.message, { error: true });
      $("#mcCreate").disabled = false;
    }
  });
}

/* Tap a day to toggle it. Press and drag (on touch: hold, then drag) to select the RECTANGLE between the
   day you started on and the one under your finger, like the times grid; the calendar scrolls
   when you drag near its top or bottom edge. Starting on a selected day removes the range instead. */
function attachRangeDrag(root, st, open, sync) {
  let drag = null;
  let hold = null;
  let start = null;
  let scrollRaf = 0;
  const cellAt = (x, y) => {
    const c = document.elementFromPoint(x, y)?.closest?.(".day[data-date]");
    return c && !c.disabled && root.contains(c) ? c : null;
  };
  // the rectangle between the day you pressed and the day under your finger, like the times grid
  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const between = (a, b) => {
    const ea = root.querySelector(`.day[data-date="${a}"]`);
    const eb = root.querySelector(`.day[data-date="${b}"]`);
    if (!ea || !eb) return [a];
    const p = centre(ea);
    const q = centre(eb);
    const x0 = Math.min(p.x, q.x) - 2;
    const x1 = Math.max(p.x, q.x) + 2;
    const y0 = Math.min(p.y, q.y) - 2;
    const y1 = Math.max(p.y, q.y) + 2;
    return [...root.querySelectorAll(".day[data-date]")]
      .filter((el) => {
        const c = centre(el);
        return c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1;
      })
      .map((el) => el.dataset.date)
      .filter(open);
  };
  const paint = (to) => {
    const range = new Set(between(drag.from, to));
    st.yes = new Set(drag.before);
    range.forEach((d) => (drag.add ? st.yes.add(d) : st.yes.delete(d)));
    root.querySelectorAll(".day[data-date]").forEach((el) => el.classList.toggle("ranging", range.has(el.dataset.date)));
    sync();
  };
  const begin = (cell) => {
    document.body.classList.add("dragging-dates");
    drag = { from: cell.dataset.date, add: !st.yes.has(cell.dataset.date), before: new Set(st.yes), last: cell.dataset.date, y: 0 };
    paint(drag.from);
  };
  const autoscroll = () => {
    cancelAnimationFrame(scrollRaf);
    if (!drag) return;
    const r = root.getBoundingClientRect();
    const edge = 36;
    const dy = drag.y < r.top + edge ? -8 : drag.y > r.bottom - edge ? 8 : 0;
    if (dy) {
      root.scrollTop += dy;
      const c = cellAt(drag.x, Math.min(Math.max(drag.y, r.top + 4), r.bottom - 4));
      if (c && c.dataset.date !== drag.last) {
        drag.last = c.dataset.date;
        paint(drag.last);
      }
      scrollRaf = requestAnimationFrame(autoscroll);
    }
  };
  const move = (x, y) => {
    if (!drag) return;
    drag.x = x;
    drag.y = y;
    const c = cellAt(x, y);
    if (c && c.dataset.date !== drag.last) {
      drag.last = c.dataset.date;
      paint(drag.last);
    }
    autoscroll();
  };
  const finish = () => {
    start?.cell.classList.remove("pressing");
    document.body.classList.remove("dragging-dates");
    clearTimeout(hold);
    hold = null;
    cancelAnimationFrame(scrollRaf);
    root.querySelectorAll(".ranging").forEach((el) => el.classList.remove("ranging"));
    drag = null;
    start = null;
  };
  root.addEventListener("contextmenu", (e) => e.preventDefault());
  root.addEventListener("pointerdown", (e) => {
    const cell = e.target.closest(".day[data-date]");
    if (!cell || cell.disabled) return;
    start = { x: e.clientX, y: e.clientY, cell, type: e.pointerType };
    cell.classList.add("pressing");
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      e.preventDefault();
      begin(cell);
    } else {
      hold = setTimeout(() => {
        hold = null;
        begin(cell);
        navigator.vibrate?.(8);
      }, 260);
    }
  });
  root.addEventListener("pointermove", (e) => {
    if (!drag && hold && start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) {
      clearTimeout(hold); // moved before the hold: it's a scroll
      hold = null;
      start.cell.classList.remove("pressing");
      start = null;
    }
    if (drag && start?.type !== "touch") move(e.clientX, e.clientY);
  });
  window.addEventListener("pointerup", (e) => {
    if (start && hold && e.type === "pointerup") {
      // a quick tap on touch: toggle that one day
      clearTimeout(hold);
      hold = null;
      const d = start.cell.dataset.date;
      st.yes.has(d) ? st.yes.delete(d) : st.yes.add(d);
      sync();
    }
    finish();
  });
  root.addEventListener("pointercancel", () => !drag && finish());
  root.addEventListener(
    "touchmove",
    (e) => {
      if (!drag) return;
      e.preventDefault(); // selecting, not scrolling
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    },
    { passive: false },
  );
  root.addEventListener("touchend", finish);
}

const fmtShort = (date) => K.parseDate(date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

/* ------------------------------------------------------------------ */
/* Meeting page                                                        */
/* ------------------------------------------------------------------ */

let M = null; // { meeting, people, me, tz, mine:{yes:Set, maybe:Set}, page, focus, filter, editing, mode }

export async function renderMeeting(id) {
  const { app, esc, icon, api } = K;
  app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  let data;
  try {
    data = await api(`/meetings/${id}`);
  } catch (err) {
    app.innerHTML = `<div class="empty card" style="margin-top:2.5rem"><div class="glyph">${icon("clock")}</div><h3>Meeting not found</h3><p>${esc(err.message)}</p><a class="btn btn-primary" href="/meet" data-link style="margin-top:0.75rem">Create a meeting</a></div>`;
    return;
  }
  const saved = store.get(`wingman:meet:${id}`);
  const meRow = saved && data.people.find((p) => p.id === saved.id);
  M = {
    ...data,
    me: meRow ? saved : null,
    tz: viewerTz(), // your own time zone by default; you can pick another
    mine: { yes: new Set(meRow ? meRow.slots : []), maybe: new Set(meRow ? meRow.maybe || [] : []) },
    page: 0,
    focus: null,
    filter: null,
    editing: false,
    mode: "yes",
  };
  const recent = store.get("wingman:meets", []);
  if (!recent.some((x) => x.id === id)) {
    recent.unshift({ id, title: data.meeting.title, kind: data.meeting.kind });
    store.set("wingman:meets", recent.slice(0, 20));
  }
  K.markViewed?.("meet", id, data.meeting.title);
  paint();
  document.removeEventListener("visibilitychange", refreshOnReturn);
  document.addEventListener("visibilitychange", refreshOnReturn);
}

function refreshOnReturn() {
  if (document.visibilityState !== "visible" || !M || M.editing || !location.pathname.startsWith(`/m/${M.meeting.id}`)) return;
  K.api(`/meetings/${M.meeting.id}`)
    .then((d) => {
      M.people = d.people;
      paintBody();
    })
    .catch(() => {});
}

const step = () => M.meeting.step || 15;
const ROW = 30; // minutes per row, for every meeting (older 15-minute ones show two slots per row)
/** A grid cell is a space-separated list of slot keys (one, or two for older meetings). */
const keysOf = (cell) => cell.split(" ");
/** "yes" when every slot in the cell is available, "maybe" when each is at least a maybe, else "". */
function stateIn(sets, cell) {
  const ks = keysOf(cell);
  if (ks.every((k) => sets.yes.has(k))) return "yes";
  if (ks.every((k) => sets.yes.has(k) || sets.maybe.has(k))) return "maybe";
  return "";
}
/** Each person's sets; yours come from what you're editing right now. */
const setsOf = (p) => (M.me && p.id === M.me.id ? M.mine : { yes: new Set(p.slots), maybe: new Set(p.maybe || []) });

/** Columns × rows of the grid, in the viewer's time zone for date meetings. */
function layout() {
  const { meeting } = M;
  const cols = new Map();
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
    const row = minute - (minute % ROW);
    if (!cols.has(key)) cols.set(key, new Map());
    const cells = cols.get(key);
    cells.set(row, cells.has(row) ? `${cells.get(row)} ${s}` : s);
    minutes.add(row);
  }
  const columns = [...cols.keys()].sort().map((k) => {
    if (meeting.kind === "dates") {
      const d = K.parseDate(k);
      return { key: k, top: DOW_SHORT[d.getDay()], bottom: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), cells: cols.get(k), long: d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) };
    }
    const dow = Number(k.slice(2));
    return { key: k, top: DOW_SHORT[dow], bottom: "", cells: cols.get(k), long: DOW_LONG[dow] };
  });
  return { columns, rows: [...minutes].sort((a, b) => a - b) };
}

function paint() {
  const { app, esc, icon, navActions, shareLink } = K;
  const { meeting } = M;
  document.title = `${meeting.title} — Wingman`;
  const url = `${location.origin}/m/${meeting.id}`;
  navActions.innerHTML = `<button class="btn btn-tinted nav-share" id="navShare" aria-label="Share meeting">${icon("share")}<span>Share</span></button>`;
  document.getElementById("navShare").onclick = () => shareLink(url, meeting.title);
  const tzs = allTimeZones();
  if (!tzs.includes(M.tz)) tzs.unshift(M.tz);
  const days = Math.ceil((meeting.delete_at - Date.now()) / 86_400_000);
  const pin = /^\d{6}$/.test(meeting.id) ? K.pinText(meeting.id) : "";
  app.innerHTML = `
    <div class="mtg">
      <header class="mtg-head">
        <p class="eyebrow">Meeting times${pin ? ` · PIN ${esc(pin)}` : ""}</p>
        <h1 class="display">${esc(meeting.title)}</h1>
        ${meeting.description ? `<p class="lede">${esc(meeting.description)}</p>` : ""}
        <p class="mtg-meta">${meeting.creator ? `Created by <b>${esc(meeting.creator)}</b> · ` : ""}${esc(String(meeting.days.length))} ${meeting.days.length === 1 ? "date" : "dates"} · ${esc(timeLabel(meeting.start_min))}–${esc(timeLabel(meeting.end_min))} ${meeting.kind === "dates" ? `in ${esc(meeting.tz)}` : ""}</p>
        ${
          meeting.kind === "dates"
            ? `<label class="tz-pick">${icon("clock")}<span>Times shown in</span><select id="viewTz">${tzs.map((z) => `<option ${z === M.tz ? "selected" : ""}>${esc(z)}</option>`).join("")}</select></label>`
            : ""
        }
        ${days <= 7 ? `<p class="expiry-note">${icon("lock")}<span>This meeting will be deleted on <b>${esc(new Date(meeting.delete_at).toLocaleDateString(undefined, { month: "long", day: "numeric" }))}</b>.</span></p>` : ""}
      </header>
      <div id="mtgBody"></div>
    </div>`;
  K.$("#viewTz")?.addEventListener("change", (e) => {
    M.tz = e.target.value;
    M.page = 0;
    paintBody();
  });
  paintBody();
  window.removeEventListener("resize", onResize);
  window.addEventListener("resize", onResize);
}

let resizeT;
function onResize() {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => M && K.$("#mtgBody") && paintGridOnly(), 150);
}

/** Everything under the header: best time, the grid, and the people panel. */
function paintBody() {
  const { $, esc, icon, avatar } = K;
  const body = $("#mtgBody");
  if (!body) return;
  const n = M.people.length;
  const meName = M.me?.name;
  const editing = M.editing;
  body.innerHTML = `
    ${finalHtml()}
    <div id="mtgBest"></div>
    <div class="mtg-main">
      <section class="card mtg-grid-card">
        <div class="mtg-grid-head">
          ${
            editing
              ? `<div><h2>Your availability</h2><p class="mtg-hint">Drag across the times you can make. <span id="saveState">Saved automatically.</span></p></div>
                 <div class="paint-modes" role="group" aria-label="Mark as">
                   <button type="button" data-mode="yes" aria-pressed="${M.mode === "yes"}"><span class="sw yes"></span>Available</button>
                   <button type="button" data-mode="maybe" aria-pressed="${M.mode === "maybe"}"><span class="sw maybe"></span>Maybe</button>
                   <button type="button" data-mode="erase" aria-pressed="${M.mode === "erase"}"><span class="sw none"></span>Unavailable</button>
                 </div>`
              : `<div><h2>${M.filter ? `${esc(M.people.find((p) => p.id === M.filter)?.name || "")}’s availability` : "Group availability"}</h2>
                 <p class="mtg-hint">${M.filter ? `<button type="button" class="btn-link" id="clearFilter">Show everyone</button>` : n ? "Darker means more people are free. Hover over or tap a time to see who." : "No one has added their availability yet."}</p></div>
                 <div class="legend mtg-legend" id="mtgLegend"></div>`
          }
        </div>
        <div id="mtgGrid"></div>
      </section>
      <aside class="mtg-side">
        ${
          editing
            ? `<button type="button" class="btn btn-primary btn-block" id="doneEdit">${icon("check")} Done</button>
               <p class="mtg-side-note">Signed in as <b>${esc(meName)}</b> on this device. <button type="button" class="btn-link" id="notMe">Not you?</button></p>`
            : `<button type="button" class="btn btn-primary btn-block" id="addAvail">${icon(M.me ? "pencil" : "plus")} ${M.me ? "Edit your availability" : "Add availability"}</button>`
        }
        <div class="card mtg-people">
          <h3>Responses <span>${n}</span>${M.host ? '<small class="host-tag">You’re the host</small>' : ""}</h3>
          ${
            n
              ? `<ul class="mtg-plist">${M.people
                  .map(
                    (p) => `<li class="person-row"><button type="button" class="person${M.filter === p.id ? " on" : ""}" data-person="${esc(p.id)}" aria-pressed="${M.filter === p.id}">${avatar(p.name, "sm")}<span>${esc(p.name)}${
                      M.me && p.id === M.me.id ? ' <small>(you)</small>' : ""
                    }</span></button>${!editing ? `<button type="button" class="person-remove" data-remove-person="${esc(p.id)}" aria-label="Remove ${esc(p.name)}’s entry">${icon("x")}</button>` : ""}</li>`,
                  )
                  .join("")}</ul><p class="mtg-side-note">Tap a name to see only their times.</p>`
              : `<p class="mtg-side-note">Be the first: add the times you can make.</p>`
          }
        </div>
        <div class="card mtg-who" id="who"></div>
        ${K.changeLogHtml(M.meeting.log || [], (e) => (e.start ? fmtLogTime(e.start, e.end) : ""))}
      </aside>
    </div>`;

  $("#addAvail")?.addEventListener("click", startEditing);
  bindFinal();
  $("#doneEdit")?.addEventListener("click", () => {
    M.editing = false;
    flushSave();
    paintBody();
    K.toast("Your availability is saved");
  });
  $("#notMe")?.addEventListener("click", () => {
    store.set(`wingman:meet:${M.meeting.id}`, null);
    M.me = null;
    M.mine = { yes: new Set(), maybe: new Set() };
    M.editing = false;
    paintBody();
  });
  $("#clearFilter")?.addEventListener("click", () => {
    M.filter = null;
    paintBody();
  });
  // the creator can remove someone's entry
  body.querySelectorAll("[data-remove-person]").forEach((b) =>
    b.addEventListener("click", async () => {
      const p = M.people.find((x) => x.id === b.dataset.removePerson);
      if (!p || !confirm(`Remove ${p.name}’s entry? This can’t be undone, and it shows in the change log.`)) return;
      const by = await K.actorName();
      if (!by) return;
      try {
        const res = await K.api(`/meetings/${M.meeting.id}/people/${p.id}?by=${encodeURIComponent(by)}`, { method: "DELETE" });
        if (res.log) M.meeting.log = res.log;
        M.people = M.people.filter((x) => x.id !== p.id);
        if (M.filter === p.id) M.filter = null;
        if (M.focus) M.focus = null;
        if (M.me && M.me.id === p.id) {
          store.set(`wingman:meet:${M.meeting.id}`, null);
          M.me = null;
          M.mine = { yes: new Set(), maybe: new Set() };
        }
        K.toast(`${p.name}’s entry was removed`);
        paintBody();
      } catch (err) {
        K.toast(err.message, { error: true });
      }
    }),
  );
  body.querySelectorAll("[data-person]").forEach((b) =>
    b.addEventListener("click", () => {
      if (M.editing) return;
      M.filter = M.filter === b.dataset.person ? null : b.dataset.person;
      M.focus = null;
      paintBody();
    }),
  );
  body.querySelectorAll("[data-mode]").forEach((b) =>
    b.addEventListener("click", () => {
      M.mode = b.dataset.mode;
      body.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }),
  );
  paintGridOnly();
}

/** Ask for a name (remembered on this device), then switch the grid to editing your times. */
async function startEditing() {
  const { esc, icon, api, toast } = K;
  if (M.me) {
    M.editing = true;
    M.filter = null;
    return paintBody();
  }
  K.openSheet(`
    <div class="sheet-head"><div><h2>Add your availability</h2><div class="sheet-sub">Just your name. This device remembers you for this meeting.</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
    <form class="stack" id="nameForm"><input class="big-input" name="name" maxlength="40" placeholder="Your name" autocomplete="name" value="${esc(store.get("convene:name", ""))}" required />
    <button class="btn btn-primary btn-block" type="submit">Continue</button></form>`);
  const f = document.getElementById("nameForm");
  setTimeout(() => f.name.focus(), 50);
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = f.name.value.trim();
    if (!name) return;
    try {
      const res = await api(`/meetings/${M.meeting.id}/signin`, { method: "POST", body: { name } });
      M.me = { id: res.id, token: res.token, name: res.name };
      store.set(`wingman:meet:${M.meeting.id}`, M.me);
      store.set("convene:name", res.name);
      if (!M.people.some((p) => p.id === res.id)) M.people.push({ id: res.id, name: res.name, slots: [], maybe: [] });
      M.mine = { yes: new Set(res.slots), maybe: new Set(res.maybe || []) };
      K.closeSheet();
      M.editing = true;
      M.filter = null;
      paintBody();
      K.buzz(12);
    } catch (err) {
      toast(err.message, { error: true });
    }
  });
}

/** How many day columns fit; on narrow screens the grid pages through the days. */
function pageSize(total) {
  const card = K.$(".mtg-grid-card");
  const width = card ? card.clientWidth - 90 : 320;
  return Math.max(3, Math.min(total, Math.floor(width / 64)));
}

function score(cell) {
  let s = 0;
  for (const p of M.people) {
    const st = stateIn(setsOf(p), cell);
    if (st === "yes") s += 1;
    else if (st === "maybe") s += 0.5;
  }
  return s;
}

function paintGridOnly() {
  const { $, esc } = K;
  const host = $("#mtgGrid");
  if (!host) return;
  const L = layout();
  const size = pageSize(L.columns.length);
  M.page = Math.min(M.page, Math.max(0, L.columns.length - size));
  const cols = L.columns.slice(M.page, M.page + size);
  const n = M.people.length;
  const filterSets = M.filter ? setsOf(M.people.find((p) => p.id === M.filter) || { slots: [], maybe: [] }) : null;
  const head = `<div class="g-corner"></div>${cols.map((c) => `<div class="g-col"><b>${esc(c.top)}</b>${c.bottom ? `<span>${esc(c.bottom)}</span>` : ""}</div>`).join("")}`;
  let rows = "";
  L.rows.forEach((minute, r) => {
    const onHour = minute % 60 === 0;
    rows += `<div class="g-time${onHour ? " hour" : ""}">${esc(timeLabel(minute))}</div>`;
    cols.forEach((c, ci) => {
      const slot = c.cells.get(minute);
      const cls = `g-cell${onHour ? " hour" : ""}`;
      if (!slot) return void (rows += `<div class="${cls} none"></div>`);
      if (M.editing) {
        const st = stateIn(M.mine, slot);
        rows += `<div class="${cls} edit${st ? ` ${st}` : ""}" data-s="${slot}" data-c="${ci}" data-r="${r}"></div>`;
      } else if (filterSets) {
        const st = stateIn(filterSets, slot);
        rows += `<div class="${cls} solo${st ? ` ${st}` : ""}" data-s="${slot}"></div>`;
      } else {
        const k = score(slot);
        const fin = M.meeting.final && keysOf(slot).some((key) => { const v = Number(key.slice(1)); return v >= M.meeting.final.start && v < M.meeting.final.end; }) ? " final" : "";
        rows += `<div class="${cls} g${k ? " heat" : ""}${fin}${M.focus === slot ? " focus" : ""}" style="--t:${n ? (k / n).toFixed(3) : 0}" data-s="${slot}"></div>`;
      }
    });
  });
  const pager =
    L.columns.length > size
      ? `<div class="g-pager"><button type="button" class="btn btn-icon" data-page="-1" ${M.page === 0 ? "disabled" : ""} aria-label="Earlier days">‹</button><span>Days ${M.page + 1}–${Math.min(M.page + size, L.columns.length)} of ${L.columns.length}</span><button type="button" class="btn btn-icon" data-page="1" ${M.page + size >= L.columns.length ? "disabled" : ""} aria-label="Later days">›</button></div>`
      : "";
  host.innerHTML = `${pager}<div class="tgrid${M.editing ? " editing" : ""}" style="--cols:${cols.length}">${head}${rows}</div>`;
  host.querySelectorAll("[data-page]").forEach((b) =>
    b.addEventListener("click", () => {
      M.page = Math.max(0, M.page + Number(b.dataset.page) * size);
      paintGridOnly();
    }),
  );
  if (M.editing) bindEditGrid(host.querySelector(".tgrid"));
  else bindGroupGrid(host.querySelector(".tgrid"));
  const legend = $("#mtgLegend");
  if (legend && !M.filter) {
    const steps = Math.min(Math.max(n, 1), 5);
    legend.innerHTML = `<span>0/${n}</span><span class="legend-scale">${Array.from({ length: steps + 1 }, (_, k) => `<i style="--t:${(k / steps).toFixed(3)}"></i>`).join("")}</span><span>${n}/${n} free</span>`;
  } else if (legend) legend.innerHTML = `<span class="sw yes"></span>Available <span class="sw maybe"></span>Maybe`;
  paintWho();
  paintBest(L);
}

/* When2meet-style painting: press on a time and drag a rectangle; every time in it gets the chosen
   mark (Available / Maybe / Unavailable). Saved a moment after you let go. */
function bindEditGrid(grid) {
  const cellAt = (x, y) => document.elementFromPoint(x, y)?.closest?.(".tgrid.editing .g-cell[data-s]");
  let drag = null;
  const cells = [...grid.querySelectorAll(".g-cell[data-s]")];
  const show = (el, yes, maybe) => {
    el.classList.toggle("yes", yes);
    el.classList.toggle("maybe", !yes && maybe);
  };
  const apply = (end) => {
    const c0 = Math.min(drag.c, end.c);
    const c1 = Math.max(drag.c, end.c);
    const r0 = Math.min(drag.r, end.r);
    const r1 = Math.max(drag.r, end.r);
    for (const el of cells) {
      const c = +el.dataset.c;
      const r = +el.dataset.r;
      const s = el.dataset.s;
      if (c >= c0 && c <= c1 && r >= r0 && r <= r1) show(el, drag.mode === "yes", drag.mode === "maybe");
      else {
        const st = stateIn(drag, s);
        show(el, st === "yes", st === "maybe");
      }
    }
  };
  grid.addEventListener("pointerdown", (e) => {
    const cell = e.target.closest(".g-cell[data-s]");
    if (!cell) return;
    e.preventDefault();
    grid.setPointerCapture(e.pointerId);
    // tapping a time that already has the chosen mark clears it
    const s = cell.dataset.s;
    const has = M.mode !== "erase" && stateIn(M.mine, s) === M.mode;
    drag = { c: +cell.dataset.c, r: +cell.dataset.r, mode: has ? "erase" : M.mode, yes: new Set(M.mine.yes), maybe: new Set(M.mine.maybe), last: cell };
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
    for (const el of cells) {
      const before = stateIn(drag, el.dataset.s);
      const now = el.classList.contains("yes") ? "yes" : el.classList.contains("maybe") ? "maybe" : "";
      if (now === before) continue; // untouched: keep exactly what was there
      for (const k of keysOf(el.dataset.s)) {
        M.mine.yes.delete(k);
        M.mine.maybe.delete(k);
        if (now) M.mine[now].add(k);
      }
    }
    drag = null;
    save();
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
  saveT = setTimeout(flushSave, 300);
}
function flushSave() {
  clearTimeout(saveT);
  if (!M?.me) return;
  const slots = [...M.mine.yes];
  const maybe = [...M.mine.maybe];
  const mid = M.meeting.id;
  const me = M.me;
  saving = saving
    .then(() => K.api(`/meetings/${mid}/people/${me.id}`, { method: "PUT", body: { token: me.token, slots, maybe } }))
    .then(() => {
      const p = M.people.find((x) => x.id === me.id);
      if (p) Object.assign(p, { slots, maybe });
      const s = K.$("#saveState");
      if (s) s.textContent = "Saved.";
    })
    .catch((err) => {
      K.toast(err.message, { error: true });
      const s = K.$("#saveState");
      if (s) s.textContent = "Not saved — try again.";
    });
}

function bindGroupGrid(grid) {
  const focus = (cell) => {
    if (!cell || M.focus === cell.dataset.s) return;
    grid.querySelector(".g-cell.focus")?.classList.remove("focus");
    cell.classList.add("focus");
    M.focus = cell.dataset.s;
    paintWho();
  };
  grid.addEventListener("pointerover", (e) => e.pointerType === "mouse" && focus(e.target.closest(".g-cell[data-s]")));
  grid.addEventListener("click", (e) => focus(e.target.closest(".g-cell[data-s]")));
}

function describeSlot(cell) {
  const { meeting } = M;
  const slot = keysOf(cell)[0];
  const len = ROW;
  if (meeting.kind === "dates") {
    const z = zoned(Number(slot.slice(1)) * 60000, M.tz);
    const d = K.parseDate(z.date);
    return `${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}, ${timeLabel(z.minute)}–${timeLabel(z.minute + len)}`;
  }
  const [d, mm] = slot.slice(1).split(":").map(Number);
  return `${DOW_LONG[d]}, ${timeLabel(mm)}–${timeLabel(mm + len)}`;
}

function paintWho() {
  const { $, esc, avatar } = K;
  const el = $("#who");
  if (!el) return;
  const n = M.people.length;
  if (M.editing || !n) return void (el.hidden = true);
  el.hidden = false;
  if (!M.focus) {
    el.innerHTML = `<p class="mtg-side-note">Hover over or tap a time in the grid to see who can make it.</p>`;
    return;
  }
  const yes = [];
  const maybe = [];
  const no = [];
  for (const p of M.people) {
    const st = stateIn(setsOf(p), M.focus);
    (st === "yes" ? yes : st === "maybe" ? maybe : no).push(p.name);
  }
  const list = (names) => names.map((x) => `<li>${avatar(x, "sm")}<span>${esc(x)}</span></li>`).join("");
  el.innerHTML = `
    <div class="who-head"><b>${esc(describeSlot(M.focus))}</b><span>${yes.length} of ${n} available${maybe.length ? ` · ${maybe.length} maybe` : ""}</span></div>
    ${yes.length ? `<h4><span class="sw yes"></span>Available</h4><ul class="who-list">${list(yes)}</ul>` : ""}
    ${maybe.length ? `<h4><span class="sw maybe"></span>Maybe</h4><ul class="who-list">${list(maybe)}</ul>` : ""}
    ${no.length ? `<h4><span class="sw none"></span>Unavailable</h4><ul class="who-list dim">${list(no)}</ul>` : ""}
    ${M.meeting.kind === "dates" ? `<button type="button" class="btn btn-tinted btn-block who-final" data-make-final="${esc(M.focus)}">Save this time</button>` : ""}`;
  el.querySelector("[data-make-final]")?.addEventListener("click", (e) => {
    const start = Number(keysOf(e.currentTarget.dataset.makeFinal)[0].slice(1));
    setFinal({ start, end: start + ROW });
  });
}

/** A logged time, in the viewer's time zone: "Fri, Nov 20, 10:00–10:30 AM". */
function fmtLogTime(start, end) {
  const a = new Date(start * 60000);
  const b = new Date(end * 60000);
  const day = a.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: M.tz });
  const t = (d) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: M.tz });
  return `${day}, ${t(a)}–${t(b)}`;
}

/* ---- The decided time: everyone sees it and can add it to their calendar (in their own time zone) ---- */
function finalItem() {
  const f = M.meeting.final;
  if (!f) return null;
  return {
    title: M.meeting.title,
    details: M.meeting.description || "Planned with Wingman",
    url: `${location.origin}/m/${M.meeting.id}`,
    start: new Date(f.start * 60000),
    end: new Date(f.end * 60000),
  };
}
function finalHtml() {
  const { esc, icon } = K;
  const it = finalItem();
  if (!it) return "";
  const day = it.start.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: M.tz });
  const t = (d) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: M.tz });
  let yes = 0;
  let maybe = 0;
  const keys = M.meeting.slots.filter((k) => {
    const v = Number(k.slice(1));
    return v >= M.meeting.final.start && v < M.meeting.final.end;
  });
  for (const p of M.people) {
    const st = setsOf(p);
    if (keys.length && keys.every((k) => st.yes.has(k))) yes += 1;
    else if (keys.length && keys.every((k) => st.yes.has(k) || st.maybe.has(k))) maybe += 1;
  }
  return `<div class="card final-card" id="mtgFinal">
    <div class="final-label">${icon("check")} It’s decided</div>
    <div class="final-when"><span>${esc(day)}</span><span>${esc(t(it.start))}–${esc(t(it.end))}</span></div>
    <div class="final-sub">Shown in ${esc(M.tz)} · ${yes} of ${M.people.length} available${maybe ? ` · ${maybe} maybe` : ""}</div>
    <div class="final-actions">
      <button type="button" class="btn btn-primary" data-final-ics>${icon("calendar")} Add to calendar</button>
      <button type="button" class="btn btn-plain" data-final-clear>Unsave this time</button>
    </div>
  </div>`;
}
function bindFinal() {
  const card = K.$("#mtgFinal");
  if (!card) return;
  card.querySelector("[data-final-ics]").addEventListener("click", () => K.openAddToCalendar(M.meeting.title, [finalItem()]));
  card.querySelector("[data-final-clear]")?.addEventListener("click", () => {
    if (confirm("Unsave this time? Everyone will see the group grid again. This goes in the change log.")) setFinal(null);
  });
}
async function setFinal(final) {
  const by = await K.actorName();
  if (!by) return;
  try {
    const res = await K.api(`/meetings/${M.meeting.id}`, { method: "PATCH", body: { final, by } });
    M.meeting.final = res.final;
    if (res.log) M.meeting.log = res.log;
    K.toast(final ? "Time saved — everyone can see it" : "The time was unsaved");
    K.buzz?.([15, 60, 15]);
    paintBody();
    if (final) window.scrollTo({ top: 0, behavior: K.reducedMotion?.() ? "auto" : "smooth" });
  } catch (err) {
    K.toast(err.message, { error: true });
  }
}

/** "Best time so far": the longest stretch where the most people are free (maybe counts half). */
function paintBest(L) {
  const { $, esc, icon } = K;
  const el = $("#mtgBest");
  if (!el) return;
  const n = M.people.length;
  if (!n || M.editing) return void (el.innerHTML = "");
  const len = ROW;
  let best = null;
  const better = (a) => !best || a.k > best.k || (a.k === best.k && a.end - a.start > best.end - best.start);
  for (const c of L.columns) {
    let run = null;
    for (const minute of L.rows) {
      const slot = c.cells.get(minute);
      const k = slot ? score(slot) : 0;
      if (k && run && run.k === k && run.end === minute) run.end = minute + len;
      else {
        if (run && better(run)) best = run;
        run = k ? { k, start: minute, end: minute + len, col: c, slot } : null;
      }
    }
    if (run && better(run)) best = run;
  }
  if (!best) return void (el.innerHTML = "");
  let yes = 0;
  for (const p of M.people) if (stateIn(setsOf(p), best.slot) === "yes") yes += 1;
  el.innerHTML = `<div class="card best-time">
    <span class="best-ico">${icon("clock")}</span>
    <div><span class="best-label">Best time so far</span>
    <b>${esc(best.col.long)}, ${esc(timeLabel(best.start))}–${esc(timeLabel(best.end))}</b>
    <span class="best-sub">${yes} of ${n} available${best.k > yes ? ` · ${Math.round((best.k - yes) * 2)} maybe` : ""}</span></div>
    ${M.meeting.kind === "dates" ? '<button type="button" class="btn btn-tinted best-final" id="bestFinal">Save this time</button>' : ""}
  </div>`;
  el.querySelector("#bestFinal")?.addEventListener("click", () => {
    const start = Number(keysOf(best.slot)[0].slice(1));
    setFinal({ start, end: start + (best.end - best.start) });
  });
}
