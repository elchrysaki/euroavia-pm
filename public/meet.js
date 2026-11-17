// Wingman — Meeting times (works like When2meet), loaded on demand from app.js.
//
// Create, in two steps (like When2meet / LettuceMeet):
//   1. Dates: a calendar that opens on the next 4 weeks and scrolls up to 3 months ahead. Tap a day,
//      drag across many, select a whole week (›) or month, or use the quick picks.
//   2. Details: name, what it's about, "No earlier than" / "No later than" and the time zone.
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
  const hourOpts = (from, to, sel) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)
      .map((h) => `<option value="${h * 60}" ${h * 60 === sel ? "selected" : ""}>${esc(timeLabel(h * 60))}${h === 24 ? " (midnight)" : ""}</option>`)
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
        const label = n === 1 ? `${MONTHS[Number(date.slice(5, 7)) - 1].slice(0, 3)} 1` : n;
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
        </div>
        <div class="section-header">Hours</div>
        <div class="group well">
          <div class="row"><label for="mStart">No earlier than</label><select id="mStart" class="time-select">${hourOpts(0, 23, 540)}</select></div>
          <div class="row"><label for="mEnd">No later than</label><select id="mEnd" class="time-select">${hourOpts(1, 24, 1020)}</select></div>
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
      kind: "dates",
      dates: [...st.yes].sort(),
      start_min: Number($("#mStart").value),
      end_min: Number($("#mEnd").value),
      tz: $("#mTz").value,
    };
    $("#mcCreate").disabled = true;
    try {
      const { id } = await api("/meetings", { method: "POST", body });
      const list = store.get("wingman:meets", []).filter((x) => x.id !== id);
      list.unshift({ id, title, kind: "dates" });
      store.set("wingman:meets", list.slice(0, 20));
      navigate(`/m/${id}`);
      K.buzz([15, 60, 15]);
    } catch (err) {
      toast(err.message, { error: true });
      $("#mcCreate").disabled = false;
    }
  });
}

/* Tap a day to toggle it. Press and drag (on touch: hold, then drag) to select EVERY date between the
   day you started on and the one under your finger, across weeks and months; the calendar scrolls
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
  const between = (a, b) => {
    const [lo, hi] = a < b ? [a, b] : [b, a];
    return [...root.querySelectorAll(".day[data-date]")].map((el) => el.dataset.date).filter((d) => d >= lo && d <= hi && open(d));
  };
  const paint = (to) => {
    const range = new Set(between(drag.from, to));
    st.yes = new Set(drag.before);
    range.forEach((d) => (drag.add ? st.yes.add(d) : st.yes.delete(d)));
    root.querySelectorAll(".day[data-date]").forEach((el) => el.classList.toggle("ranging", range.has(el.dataset.date)));
    sync();
  };
  const begin = (cell) => {
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
        ${meeting.description ? `<p class="meet-desc">${esc(meeting.description)}</p>` : ""}
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
