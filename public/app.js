// Wingman — client app (no build step, no framework)

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $("#app");
const navActions = $("#navActions");

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode, quota etc. — non-essential */
    }
  },
  setRaw(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* non-essential */
    }
  },
};

/* ------------------------------------------------------------------ */
/* Performance mode — fully automatic, never shown to the user.        */
/* "full" = glass + long animations, "lite" = smooth mode. index.html  */
/* picks a mode before first paint; here we measure how this device    */
/* actually loads and renders, and quietly switch to smooth mode when  */
/* full effects are too heavy. The result is remembered for 7 days,   */
/* then measured again (browsers and devices change).                  */
/* ------------------------------------------------------------------ */

const root = document.documentElement;
const perf = {
  get mode() {
    return root.dataset.perf === "lite" ? "lite" : "full";
  },
  get reason() {
    return root.dataset.perfReason || "default";
  },
  get lite() {
    return this.mode === "lite";
  },
  set(mode, reason) {
    root.dataset.perf = mode;
    root.dataset.perfReason = reason;
  },
};
const measurable = () => !perf.lite && perf.reason !== "override";

function remember(mode, stats) {
  store.setRaw("convene:perf-auto", JSON.stringify({ mode, at: Date.now(), stats }));
}

/**
 * Records ~frames of rendering. Judges smoothness against the screen’s own pace (its fastest
 * steady frames), so a phone capped at 30fps by Low Power Mode isn’t mistaken for a struggling one.
 */
function sampleFrames(frames) {
  return new Promise((resolve) => {
    const deltas = [];
    let last = 0;
    const step = (t) => {
      if (document.visibilityState !== "visible") return resolve(null); // background tabs are throttled: no verdict
      if (last) deltas.push(t - last);
      last = t;
      if (deltas.length < frames) return void requestAnimationFrame(step);
      const sorted = [...deltas].sort((a, b) => a - b);
      const pace = sorted[Math.floor(sorted.length * 0.1)]; // the display’s natural frame interval
      const dropped = deltas.filter((d) => d > pace * 1.6).length / deltas.length; // frames that missed it
      resolve({ median: sorted[sorted.length >> 1], pace, janky: dropped, struggling: dropped > 0.25 || sorted[sorted.length >> 1] > 45 });
    };
    requestAnimationFrame(step);
  });
}

/** Main-thread time blocked by long frames/tasks (Chromium; 0 where unsupported). */
const blocked = { ms: 0 };
for (const type of ["long-animation-frame", "longtask"]) {
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) blocked.ms += e.blockingDuration ?? Math.max(0, e.duration - 50);
    }).observe({ type, buffered: true });
    break;
  } catch {
    /* not supported: try the next one */
  }
}

/**
 * Startup measurement: how long this device took to turn the downloaded page into a working app,
 * how much the main thread was blocked, and how smoothly the opening animations render.
 */
async function measureDevice() {
  if (!measurable()) return;
  const frames = await sampleFrames(48);
  if (!frames || !measurable()) return;
  const nav = performance.getEntriesByType?.("navigation")[0];
  const stats = {
    frameMedian: Math.round(frames.median * 10) / 10,
    framePace: Math.round(frames.pace * 10) / 10,
    jankyPct: Math.round(frames.janky * 100),
    loadWorkMs: nav ? Math.round(nav.domContentLoadedEventEnd - nav.responseEnd) : null, // parse + run + first render
    networkMs: nav ? Math.round(nav.responseEnd - nav.requestStart) : null,
    blockedMs: Math.round(blocked.ms),
  };
  let score = 0;
  if (frames.struggling) score += 2; // drops >25% of frames vs. its own screen pace, or below ~22fps
  if (stats.loadWorkMs != null && stats.loadWorkMs > 500) score += 1; // slow to start up
  if (stats.blockedMs > 400) score += 1; // main thread busy → taps feel late
  if (score >= 2) {
    perf.set("lite", "measured");
    remember("lite", stats);
  } else if (perf.reason === "default") {
    remember("full", stats);
  }
  window.__wingmanPerf = { mode: perf.mode, reason: perf.reason, score, ...stats }; // for debugging only
}

/** The availability flow is the most animated screen: check it once more the first time it opens. */
async function probeFlow() {
  if (!measurable()) return;
  const frames = await sampleFrames(40);
  if (frames && measurable() && frames.struggling) {
    perf.set("lite", "measured");
    remember("lite", { flowFrameMedian: Math.round(frames.median * 10) / 10, flowJankyPct: Math.round(frames.janky * 100) });
  }
}

const conn = navigator.connection;
conn?.addEventListener?.("change", () => {
  if (!measurable()) return;
  if (conn.saveData) perf.set("lite", "data-saver");
  else if (/(^|-)2g|3g/.test(conn.effectiveType || "")) perf.set("lite", "slow-network");
});

const CHEVRON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const icon = (name) => {
  const paths = {
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M8 11H6.5A2.5 2.5 0 0 0 4 13.5v5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-5a2.5 2.5 0 0 0-2.5-2.5H16"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.2A5 5 0 0 1 21.5 19"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
    thumb: '<path d="M7 11v9H4.5A1.5 1.5 0 0 1 3 18.5v-6A1.5 1.5 0 0 1 4.5 11z"/><path d="M7 11l4-7.5a2 2 0 0 1 2.9 2.1L13 10h5.6a2 2 0 0 1 2 2.4l-1.4 6.5A2 2 0 0 1 17.2 20H7"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
    bolt: '<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z"/>',
    plane: '<path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5v5l-2 1.5V21l3.5-1 3.5 1v-1.5l-2-1.5v-5z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
};

let toastTimer;
function toast(message, { error = false } = {}) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.toggle("error", error);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const headers = {};
  if (options.body) headers["content-type"] = "application/json";
  // creator of this trip / meeting? send the admin key kept in this browser (lets the server show host tools)
  const own = path.match(/^\/(events|meetings)\/([A-Za-z0-9]{6,16})/);
  const admin = own && store.get(`wingman:admin:${own[2]}`);
  if (admin) headers["x-wingman-admin"] = admin;
  const res = await fetch(`/api${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

const hue = (name) => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return 190 + (h % 60); // keep avatars in the blue/cyan family
};
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
const avatar = (name, cls = "") => `<span class="avatar ${cls}" style="--h:${hue(name)}" title="${esc(name)}">${esc(initials(name))}</span>`;

const animatedTitle = (text) => {
  let i = 0;
  return text
    .split(" ")
    .map((w) => {
      const hl = /^\*.*\*$/.test(w);
      const clean = hl ? w.slice(1, -1) : w;
      return `<span class="w${hl ? " hl" : ""}" style="--i:${i++}">${esc(clean)}</span>`;
    })
    .join(" ");
};

const domainOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

async function shareLink(url, title) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `Mark your available days for “${title}”`, url });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied");
  } catch {
    prompt("Copy this link", url);
  }
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const pad = (n) => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => {
  const t = new Date();
  return ymd(t.getFullYear(), t.getMonth(), t.getDate());
};
const parseDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const fmtDate = (s, opts = { weekday: "short", month: "short", day: "numeric" }) => parseDate(s).toLocaleDateString(undefined, opts);
const fmtLong = (s) => fmtDate(s, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const toStr = (dt) => ymd(dt.getFullYear(), dt.getMonth(), dt.getDate());
/** Same day n months later, minus one day (e.g. 6 Nov + 3 months -> 5 Feb), clamped to month length. */
function addMonths(dateStr, n) {
  const d = parseDate(dateStr);
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), last));
  target.setDate(target.getDate() - 1);
  return toStr(target);
}
const daysInRange = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86_400_000) + 1;
/* ---- Add to calendar: an .ics file (Apple Calendar, Outlook, Google…) and a Google Calendar link ---- */
const icsText = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsUtc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsDay = (date) => date.replace(/-/g, "");
/**
 * items: [{ title, details, url, allDay: { start, end } }] (dates, end inclusive)
 *     or [{ title, details, url, start: Date, end: Date }] (a timed event)
 */
function downloadIcs(filename, items) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wingman//Group planner//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  items.forEach((it, i) => {
    lines.push("BEGIN:VEVENT", `UID:${Date.now()}-${i}-${Math.random().toString(36).slice(2)}@wingman`, `DTSTAMP:${icsUtc(new Date())}`);
    if (it.allDay) lines.push(`DTSTART;VALUE=DATE:${icsDay(it.allDay.start)}`, `DTEND;VALUE=DATE:${icsDay(addDays(it.allDay.end, 1))}`);
    else lines.push(`DTSTART:${icsUtc(it.start)}`, `DTEND:${icsUtc(it.end)}`);
    lines.push(`SUMMARY:${icsText(it.title)}`);
    if (it.details) lines.push(`DESCRIPTION:${icsText(it.details)}`);
    if (it.url) lines.push(`URL:${it.url}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "event"}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
function googleCalUrl(it) {
  const dates = it.allDay ? `${icsDay(it.allDay.start)}/${icsDay(addDays(it.allDay.end, 1))}` : `${icsUtc(it.start)}/${icsUtc(it.end)}`;
  const q = new URLSearchParams({ action: "TEMPLATE", text: it.title, dates, details: [it.details, it.url].filter(Boolean).join("\n\n") });
  return `https://calendar.google.com/calendar/render?${q}`;
}
function outlookUrl(it, host = "outlook.live.com") {
  const q = new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: it.title, body: [it.details, it.url].filter(Boolean).join("\n\n") });
  if (it.allDay) {
    q.set("startdt", it.allDay.start);
    q.set("enddt", addDays(it.allDay.end, 1));
    q.set("allday", "true");
  } else {
    q.set("startdt", it.start.toISOString());
    q.set("enddt", it.end.toISOString());
  }
  return `https://${host}/calendar/0/action/compose?${q}`;
}
/** "Add to calendar": one button, then pick Google, Apple, Microsoft Outlook (personal or work) or a file. */
function openAddToCalendar(filename, items) {
  const many = items.length > 1;
  const note = many ? `<p class="sheet-sub cal-note">These dates are in ${items.length} separate blocks. Apple Calendar and the file add all of them; Google and Outlook open one block at a time.</p>` : "";
  const per = (fn) =>
    many
      ? items.map((it) => `<a class="cal-sub" href="${esc(fn(it))}" target="_blank" rel="noopener noreferrer">${esc(fmtRunLong(it.allDay))}</a>`).join("")
      : "";
  openSheet(`
    <div class="sheet-head"><div><h2>Add to calendar</h2><div class="sheet-sub">${esc(filename)}</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
    ${note}
    <div class="cal-menu">
      <a class="cal-opt" ${many ? "" : `href="${esc(googleCalUrl(items[0]))}" target="_blank" rel="noopener noreferrer"`} data-cal="google">
        <span class="cal-ico g">G</span><span><b>Google Calendar</b><small>Opens Google Calendar with it filled in</small></span></a>
      ${per(googleCalUrl)}
      <button type="button" class="cal-opt" data-cal="apple"><span class="cal-ico a">${icon("calendar")}</span><span><b>Apple Calendar</b><small>iPhone, iPad and Mac</small></span></button>
      <a class="cal-opt" ${many ? "" : `href="${esc(outlookUrl(items[0]))}" target="_blank" rel="noopener noreferrer"`} data-cal="outlook">
        <span class="cal-ico o">O</span><span><b>Microsoft Outlook</b><small>Outlook.com, Hotmail, Live</small></span></a>
      ${per((it) => outlookUrl(it))}
      <a class="cal-opt" ${many ? "" : `href="${esc(outlookUrl(items[0], "outlook.office.com"))}" target="_blank" rel="noopener noreferrer"`} data-cal="m365">
        <span class="cal-ico o">O</span><span><b>Outlook for work or school</b><small>Microsoft 365</small></span></a>
      ${per((it) => outlookUrl(it, "outlook.office.com"))}
      <button type="button" class="cal-opt" data-cal="ics"><span class="cal-ico f">${icon("arrow")}</span><span><b>Download a calendar file</b><small>.ics — works with any calendar app</small></span></button>
    </div>`);
  const wrap = $(".sheet-wrap");
  // Apple Calendar opens .ics files directly (iPhone / Mac); the file option is the same for other apps
  $$('[data-cal="apple"], [data-cal="ics"]', wrap).forEach((b) => b.addEventListener("click", () => downloadIcs(filename, items)));
  if (many) $$('a.cal-opt', wrap).forEach((a) => a.addEventListener("click", (e) => (e.preventDefault(), a.nextElementSibling?.focus())));
}
/** Consecutive dates grouped into runs: ["2027-04-10","2027-04-11","2027-04-14"] → [{start,end},{start,end}] */
function dateRuns(dates) {
  const runs = [];
  for (const d of [...dates].sort()) {
    const last = runs[runs.length - 1];
    if (last && addDays(last.end, 1) === d) last.end = d;
    else runs.push({ start: d, end: d });
  }
  return runs;
}
const fmtRunLong = (r) => {
  const a = fmtDate(r.start, { weekday: "short", day: "numeric", month: "short" });
  if (r.start === r.end) return `${a}, ${r.start.slice(0, 4)}`;
  return `${a} – ${fmtDate(r.end, { weekday: "short", day: "numeric", month: "short" })}, ${r.end.slice(0, 4)}`;
};

/** The date n days after dateStr. */
function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return toStr(d);
}
function fmtRange(a, b) {
  const sameYear = a.slice(0, 4) === b.slice(0, 4);
  const left = fmtDate(a, sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
  return `${left} – ${fmtDate(b, { month: "short", day: "numeric", year: "numeric" })}`;
}
/** Event date window; events from before ranges existed cover their calendar year. */
const eventRange = (e) => ({ start: e.start_date || `${e.year}-01-01`, end: e.end_date || `${e.year}-12-31` });

/**
 * Builds month cards covering range.start..range.end. Days outside the range are shown faded and inert.
 * cell(date, isPast, isToday) -> { cls, style, inner, attrs, label }
 */
function monthsHtml(range, cell, { quick = false } = {}) {
  const today = todayStr();
  const first = parseDate(range.start);
  const last = parseDate(range.end);
  const multiYear = range.start.slice(0, 4) !== range.end.slice(0, 4);
  let out = '<div class="months">';
  for (let y = first.getFullYear(), m = first.getMonth(); y < last.getFullYear() || (y === last.getFullYear() && m <= last.getMonth()); m === 11 ? (y++, (m = 0)) : m++) {
    const days = new Date(y, m + 1, 0).getDate();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
    const key = `${y}-${pad(m + 1)}`;
    const title = multiYear && !quick ? MONTHS[m] : `${MONTHS[m]}${multiYear ? ` <span class="month-year">${y}</span>` : ""}`;
    out += `<section class="card month" data-month="${key}">
      <h3><span>${title}</span>${
        quick
          ? `<span class="month-quick"><button type="button" data-fill="${key}">Fill</button><button type="button" data-clear="${key}">Clear</button></span>`
          : `<small>${y}</small>`
      }</h3>
      <div class="weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="days">`;
    for (let i = 0; i < offset; i++) out += '<span class="day blank"></span>';
    for (let d = 1; d <= days; d++) {
      const date = ymd(y, m, d);
      if (date < range.start || date > range.end) {
        out += `<span class="day out" aria-hidden="true">${d}</span>`;
        continue;
      }
      const past = date < today;
      const c = cell(date, past, date === today) || {};
      out += `<button type="button" class="day${past ? " past" : ""}${date === today ? " today" : ""} ${c.cls || ""}" data-date="${date}" ${
        c.style ? `style="${c.style}"` : ""
      } ${c.attrs || ""} aria-label="${esc(fmtLong(date))}${c.label ? ", " + esc(c.label) : ""}">${d}${c.inner || ""}</button>`;
    }
    out += "</div></section>";
  }
  return out + "</div>";
}

/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */

function aggregate(responses, { excludeId = null } = {}) {
  const list = responses.filter((r) => r.id !== excludeId);
  const days = new Map();
  const dest = new Map();
  const activities = [];
  const likesById = new Map();

  for (const r of list) {
    for (const d of r.yes) {
      if (!days.has(d)) days.set(d, { yes: [], maybe: [] });
      days.get(d).yes.push(r.name);
    }
    for (const d of r.maybe) {
      if (!days.has(d)) days.set(d, { yes: [], maybe: [] });
      days.get(d).maybe.push(r.name);
    }
    for (const name of r.destinations) {
      const key = name.toLowerCase();
      if (!dest.has(key)) dest.set(key, { name, voters: [] });
      dest.get(key).voters.push(r.name);
    }
    for (const a of r.activities) activities.push({ ...a, by: r.name, byId: r.id });
    for (const id of r.likes || []) {
      if (!likesById.has(id)) likesById.set(id, []);
      likesById.get(id).push(r.name);
    }
  }
  for (const a of activities) a.likes = (likesById.get(a.id) || []).filter((n) => n !== a.by);
  activities.sort((a, b) => b.likes.length - a.likes.length);

  const destinations = [...dest.values()].sort((a, b) => b.voters.length - a.voters.length || a.name.localeCompare(b.name));
  return { n: list.length, days, destinations, activities };
}

const scoreOf = (stat, n) => (n ? (stat.yes.length + stat.maybe.length * 0.5) / n : 0);

/* ------------------------------------------------------------------ */
/* Motion: springs (apple-design §4–6)                                 */
/* response = how fast it gets there (s), damping 1 = no overshoot.    */
/* Always starts from the current value and carries velocity, so any  */
/* animation can be grabbed and redirected mid-flight.                 */
/* ------------------------------------------------------------------ */

function spring({ from, to, velocity = 0, damping = 1, response = 0.35, epsilon = 0.5, onUpdate, onDone }) {
  const k = (2 * Math.PI / response) ** 2;
  const c = (4 * Math.PI * damping) / response;
  let x = from;
  let v = velocity;
  let last = 0;
  let raf = 0;
  const step = (t) => {
    const dt = last ? Math.min(0.032, (t - last) / 1000) : 1 / 60;
    last = t;
    for (let i = 0; i < 4; i++) {
      const h = dt / 4;
      v += (-k * (x - to) - c * v) * h;
      x += v * h;
    }
    if (Math.abs(v) < epsilon * 10 && Math.abs(x - to) < epsilon) {
      onUpdate(to);
      onDone?.();
      return;
    }
    onUpdate(x);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return {
    stop() {
      cancelAnimationFrame(raf);
    },
    get value() {
      return x;
    },
    get velocity() {
      return v;
    },
  };
}

/** Apple’s momentum projection: where a flick would come to rest. */
const project = (velocity, rate = 0.998) => ((velocity / 1000) * rate) / (1 - rate);
/** Progressive resistance past a boundary instead of a hard stop. */
const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Day painting: tap to toggle, press-and-hold then drag to paint.     */
/* Feedback shows on pointer-down; a tap commits on release (§10).     */
/* ------------------------------------------------------------------ */

function attachPainter(root, st, onChange) {
  let painting = false;
  let action = null;
  let timer = null;
  let start = null;
  let last = null;

  const setCell = (cell) => {
    const d = cell.dataset.date;
    st.yes.delete(d);
    st.maybe.delete(d);
    cell.classList.remove("yes", "maybe");
    if (action === "yes" || action === "maybe") {
      st[action].add(d);
      cell.classList.add(action);
    }
    onChange();
  };
  // Like the meeting times grid: dragging marks every day inside the rectangle between the day you
  // pressed and the day under your finger (diagonals fill the days in between). Days that leave the
  // rectangle while you're still dragging go back to how they were.
  let snap = null;
  let origin = null;
  let cells = [];
  const begin = (cell) => {
    const d = cell.dataset.date;
    action = st.mode !== "erase" && st[st.mode].has(d) ? "erase" : st.mode; // tapping a marked day toggles it off
    last = cell;
    origin = cell;
    snap = { yes: new Set(st.yes), maybe: new Set(st.maybe) };
    cells = $$(".day[data-date]:not([disabled])", root);
    setCell(cell);
  };
  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const paintRect = (to) => {
    if (!origin || !snap) return setCell(to);
    const a = centre(origin);
    const b = centre(to);
    const x0 = Math.min(a.x, b.x) - 2;
    const x1 = Math.max(a.x, b.x) + 2;
    const y0 = Math.min(a.y, b.y) - 2;
    const y1 = Math.max(a.y, b.y) + 2;
    for (const el of cells) {
      const c = centre(el);
      const d = el.dataset.date;
      const inside = c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1;
      const want = inside ? (action === "erase" ? null : action) : snap.yes.has(d) ? "yes" : snap.maybe.has(d) ? "maybe" : null;
      st.yes.delete(d);
      st.maybe.delete(d);
      el.classList.remove("yes", "maybe");
      if (want) {
        st[want].add(d);
        el.classList.add(want);
      }
    }
    onChange();
  };
  const cellAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const c = el && el.closest(".day[data-date]");
    return c && !c.disabled && root.contains(c) ? c : null;
  };
  const unpress = () => start?.cell.classList.remove("pressing");

  root.addEventListener("contextmenu", (e) => e.preventDefault());
  root.addEventListener("pointerdown", (e) => {
    const cell = e.target.closest(".day[data-date]");
    if (!cell || cell.disabled) return;
    start = { x: e.clientX, y: e.clientY, cell };
    cell.classList.add("pressing"); // instant response on touch-down
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      painting = true;
      begin(cell);
    } else {
      timer = setTimeout(() => {
        timer = null;
        painting = true;
        begin(cell);
        navigator.vibrate?.(8);
      }, 260);
    }
  });
  root.addEventListener("pointermove", (e) => {
    if (!start) return;
    if (!painting) {
      if (timer && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) {
        clearTimeout(timer); // moved before the hold: it’s a scroll
        timer = null;
        unpress();
        start = null;
      }
      return;
    }
    const c = cellAt(e.clientX, e.clientY);
    if (c && c !== last) {
      last = c;
      paintRect(c);
    }
  });
  const end = (e) => {
    if (start && timer && e.type === "pointerup") begin(start.cell); // a quick tap commits on release
    clearTimeout(timer);
    timer = null;
    unpress();
    painting = false;
    start = null;
    origin = null;
    snap = null;
  };
  root.addEventListener("pointerup", end);
  root.addEventListener("pointercancel", (e) => {
    if (!painting) end(e);
  });
  root.addEventListener("lostpointercapture", () => painting && end({ type: "cancel" }));
  root.addEventListener(
    "touchmove",
    (e) => {
      if (!painting) return;
      e.preventDefault(); // painting, not scrolling
      const t = e.touches[0];
      const c = t && cellAt(t.clientX, t.clientY);
      if (c && c !== last) {
        last = c;
        paintRect(c);
      }
    },
    { passive: false },
  );
  root.addEventListener("touchend", () => {
    if (painting) end({ type: "touchend" });
  });
  root.addEventListener("click", (e) => {
    const fill = e.target.closest("[data-fill]");
    const clear = e.target.closest("[data-clear]");
    if (!fill && !clear) return;
    const m = (fill || clear).closest("[data-month]");
    action = clear || st.mode === "erase" ? "erase" : st.mode;
    $$(".day[data-date]:not([disabled])", m).forEach(setCell);
  });
  root.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".day[data-date]")) {
      e.preventDefault();
      begin(e.target);
    }
  });
  return { get painting() { return painting; } };
}

/* ------------------------------------------------------------------ */
/* Day picker sheet: one continuous, scrollable calendar.              */
/* Phone/tablet: bottom sheet with 1:1 drag, momentum dismiss and      */
/* rubber-banding. Desktop: dialog that grows from the button that     */
/* opened it. Reduced motion: cross-fade.                              */
/* ------------------------------------------------------------------ */

function sheetMonthsHtml(range, st) {
  const today = todayStr();
  const first = parseDate(range.start);
  const lastD = parseDate(range.end);
  let out = "";
  for (let y = first.getFullYear(), m = first.getMonth(); y < lastD.getFullYear() || (y === lastD.getFullYear() && m <= lastD.getMonth()); m === 11 ? (y++, (m = 0)) : m++) {
    const days = new Date(y, m + 1, 0).getDate();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const key = `${y}-${pad(m + 1)}`;
    let cells = "";
    for (let i = 0; i < offset; i++) cells += '<span class="day blank"></span>';
    for (let d = 1; d <= days; d++) {
      const date = ymd(y, m, d);
      if (date < range.start || date > range.end) {
        cells += `<span class="day out" aria-hidden="true">${d}</span>`;
        continue;
      }
      const past = date < today;
      const cls = st.yes.has(date) ? " yes" : st.maybe.has(date) ? " maybe" : "";
      cells += `<button type="button" class="day${past ? " past" : ""}${date === today ? " today" : ""}${cls}" data-date="${date}" ${past ? "disabled" : ""} aria-label="${esc(fmtLong(date))}">${d}</button>`;
    }
    out += `<section class="dp-month" data-month="${key}">
      <h3 class="dp-mtitle"><span>${MONTHS[m]} <em>${y}</em></span><span class="month-quick"><button type="button" data-fill="${key}">Fill</button><button type="button" data-clear="${key}">Clear</button></span></h3>
      <div class="days">${cells}</div>
    </section>`;
  }
  return out;
}

function openDayPicker({ range, st, origin, focusDate, onChange, onClose }) {
  const isDialog = window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;
  const calm = reducedMotion();
  const parent = $(".flow");
  const prevFocus = document.activeElement;

  const wrap = document.createElement("div");
  wrap.className = `dp-wrap ${isDialog ? "is-dialog" : "is-sheet"}${calm ? " calm" : ""}`;
  wrap.innerHTML = `
    <div class="dp-scrim"></div>
    <div class="dp" role="dialog" aria-modal="true" aria-labelledby="dpTitle">
      <div class="dp-head">
        <div class="grabber" aria-hidden="true"></div>
        <div class="dp-titlebar">
          <div><h2 id="dpTitle">Choose your days</h2><p class="dp-sub" id="dpSub"></p></div>
          <button type="button" class="btn btn-primary dp-done">Done</button>
        </div>
        <div class="segmented" data-seg="dpmode" role="group" aria-label="Marking mode">
          <span class="thumb"></span>
          <button type="button" data-value="yes" aria-pressed="${st.mode === "yes"}"><span class="swatch yes"></span>Definitely</button>
          <button type="button" data-value="maybe" aria-pressed="${st.mode === "maybe"}"><span class="swatch maybe"></span>Maybe</button>
          <button type="button" data-value="erase" aria-pressed="${st.mode === "erase"}"><span class="swatch erase"></span>Erase</button>
        </div>
        <div class="dp-weekdays" aria-hidden="true">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
      </div>
      <div class="dp-scroll picker" tabindex="-1">${sheetMonthsHtml(range, st)}</div>
      <div class="dp-foot"><button type="button" class="btn btn-plain dp-clear">Clear all</button><span>Tap a day · press and drag to mark a whole block</span></div>
    </div>`;
  document.body.appendChild(wrap);

  const dp = $(".dp", wrap);
  const scrim = $(".dp-scrim", wrap);
  const scroller = $(".dp-scroll", wrap);
  const sub = $("#dpSub", wrap);
  const updateSub = () => {
    sub.textContent = st.yes.size + st.maybe.size ? `${st.yes.size} definitely · ${st.maybe.size} maybe` : "Nothing marked yet";
  };
  updateSub();
  setupSegmented($('[data-seg="dpmode"]', wrap), (v) => (st.mode = v));
  const painter = attachPainter(scroller, st, () => {
    updateSub();
    onChange();
  });

  // start where it matters: the tapped summary date, the first marked day, or the first open month
  const target = focusDate || [...st.yes, ...st.maybe].sort()[0] || (todayStr() > range.start ? todayStr() : range.start);
  const month = $(`[data-month="${target.slice(0, 7)}"]`, scroller);
  if (month) scroller.scrollTop = month.offsetTop - scroller.offsetTop;

  // ----- presentation: one value drives everything, so motion is always interruptible -----
  let H = 0;
  let y = 0; // sheet: px from open position; dialog: unused
  let p = 0; // dialog: 0 closed .. 1 open
  let anim = null;
  let closing = false;
  const render = () => {
    if (isDialog) {
      dp.style.transform = `translate(-50%, -50%) scale(${0.94 + 0.06 * p})`;
      dp.style.opacity = String(Math.max(0, Math.min(1, p)));
      scrim.style.opacity = String(Math.max(0, Math.min(1, p)));
      return;
    }
    const t = H ? Math.max(0, Math.min(1, 1 - y / H)) : 1;
    dp.style.transform = `translate3d(0, ${y}px, 0)`;
    scrim.style.opacity = String(t);
    if (parent && !perf.lite) parent.style.transform = `scale(${1 - 0.04 * t})`; // push the parent layer back
    if (parent) parent.classList.toggle("pushed", t > 0.01); // its glass footer goes solid while it’s behind the sheet
  };

  const finish = () => {
    wrap.remove();
    if (parent) parent.style.transform = "";
    document.removeEventListener("keydown", onKey, true);
    prevFocus?.focus?.({ preventScroll: true });
    onClose?.();
  };
  const open = () => {
    if (calm) {
      wrap.classList.add("calm-in");
      return;
    }
    if (isDialog) {
      const r = origin?.getBoundingClientRect();
      const box = dp.getBoundingClientRect();
      if (r) dp.style.transformOrigin = `${r.left + r.width / 2 - box.left}px ${r.top + r.height / 2 - box.top}px`; // grow from the trigger
      anim = spring({ from: 0, to: 1, damping: 1, response: 0.32, epsilon: 0.002, onUpdate: (v) => ((p = v), render()) });
    } else {
      H = dp.offsetHeight;
      y = H;
      render();
      anim = spring({ from: H, to: 0, damping: 1, response: 0.38, onUpdate: (v) => ((y = v), render()) });
    }
  };
  const close = (velocity = 0) => {
    if (closing) return;
    closing = true;
    anim?.stop();
    if (calm) {
      wrap.classList.remove("calm-in");
      setTimeout(() => closing && finish(), 200);
      return;
    }
    if (isDialog) anim = spring({ from: p, to: 0, damping: 1, response: 0.25, epsilon: 0.004, onUpdate: (v) => ((p = v), render()), onDone: finish });
    else anim = spring({ from: y, to: H, velocity, damping: 1, response: 0.32, onUpdate: (v) => ((y = v), render()), onDone: finish });
  };

  // ----- 1:1 drag to dismiss (sheet only) -----
  if (!isDialog) {
    let drag = null;
    const startDrag = (clientY) => {
      anim?.stop(); // grab it mid-flight: continue from the live value
      H = dp.offsetHeight;
      drag = { startY: clientY, from: y, hist: [{ y: clientY, t: performance.now() }] };
    };
    const moveDrag = (clientY) => {
      const raw = drag.from + (clientY - drag.startY);
      y = raw < 0 ? -rubberband(-raw, H) : raw;
      drag.hist.push({ y: clientY, t: performance.now() });
      if (drag.hist.length > 6) drag.hist.shift();
      render();
    };
    const endDrag = () => {
      const h = drag.hist;
      const a = h[0];
      const b = h[h.length - 1];
      const v = b.t > a.t ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0; // px/s at release
      drag = null;
      const projected = y + project(v);
      if (projected > Math.min(H * 0.5, 320)) close(v); // decide from where the gesture is going, not where it stopped
      else anim = spring({ from: y, to: 0, velocity: v, damping: 1, response: 0.3, onUpdate: (val) => ((y = val), render()) });
    };
    const head = $(".dp-head", wrap);
    head.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      head.setPointerCapture(e.pointerId);
      startDrag(e.clientY);
    });
    head.addEventListener("pointermove", (e) => drag && moveDrag(e.clientY));
    head.addEventListener("pointerup", () => drag && endDrag());
    head.addEventListener("pointercancel", () => drag && endDrag());

    // pulling down when the calendar is already at the top hands the gesture to the sheet
    let touch = null;
    scroller.addEventListener("touchstart", (e) => {
      touch = { y: e.touches[0].clientY, x: e.touches[0].clientX, atTop: scroller.scrollTop <= 0 };
    }, { passive: true });
    scroller.addEventListener("touchmove", (e) => {
      if (!touch || painter.painting) return;
      const t = e.touches[0];
      if (!drag) {
        const dy = t.clientY - touch.y;
        if (touch.atTop && scroller.scrollTop <= 0 && dy > 10 && Math.abs(dy) > Math.abs(t.clientX - touch.x)) startDrag(t.clientY);
        else return;
      }
      e.preventDefault();
      moveDrag(t.clientY);
    }, { passive: false });
    const touchEnd = () => {
      touch = null;
      if (drag) endDrag();
    };
    scroller.addEventListener("touchend", touchEnd);
    scroller.addEventListener("touchcancel", touchEnd);
  }

  scrim.addEventListener("click", () => close());
  $(".dp-done", wrap).addEventListener("click", () => close());
  $(".dp-clear", wrap).addEventListener("click", () => {
    st.yes.clear();
    st.maybe.clear();
    $$(".day.yes, .day.maybe", scroller).forEach((c) => c.classList.remove("yes", "maybe"));
    updateSub();
    onChange();
  });
  const onKey = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };
  document.addEventListener("keydown", onKey, true);

  /** Interrupt a close in flight and bring it back from where it is now. */
  const reopen = () => {
    if (!closing) return;
    closing = false;
    anim?.stop();
    if (calm) wrap.classList.add("calm-in");
    else if (isDialog) anim = spring({ from: p, to: 1, damping: 1, response: 0.32, epsilon: 0.002, onUpdate: (v) => ((p = v), render()) });
    else anim = spring({ from: y, to: 0, velocity: anim?.velocity || 0, damping: 1, response: 0.35, onUpdate: (v) => ((y = v), render()) });
  };

  requestAnimationFrame(() => {
    open();
    $(".dp-done", wrap).focus({ preventScroll: true });
  });
  return { close, reopen };
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState({}, "", path);
  else history.pushState({}, "", path);
  route();
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (a && a.origin === location.origin && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    navigate(a.pathname);
  }
});
window.addEventListener("popstate", () => route()); // looked up at call time: route is wrapped for update checks

let route = function route() {
  closeSheet(true);
  closeMenu();
  $(".flow")?.remove();
  $(".dp-wrap")?.remove();
  document.body.classList.remove("selecting");
  document.body.style.overflow = "";
  navActions.innerHTML = "";
  window.scrollTo(0, 0);
  const p = location.pathname;
  // trip pages have their own bottom action bar on phones
  document.body.classList.toggle("trip-page", /^\/(e|created)\//.test(p));
  setNav(/^\/dashboard\/?$/.test(p) ? "dashboard" : /^\/join\/?$/.test(p) ? "join" : null);
  const m = p.match(/^\/e\/([A-Za-z0-9]{6,16})\/?$/);
  if (m) return renderEvent(m[1]);
  const c = p.match(/^\/created\/([A-Za-z0-9]{6,16})\/?$/);
  if (c) return renderCreated(c[1]);
  const mt = p.match(/^\/m\/([A-Za-z0-9]{6,16})\/?$/);
  if (mt) return meetModule().then((x) => x.renderMeeting(mt[1]));
  if (/^\/meet\/?$/.test(p)) return meetModule().then((x) => x.renderMeetCreate());
  if (/^\/plan\/?$/.test(p)) return renderHome();
  if (/^\/dashboard\/?$/.test(p)) return renderDashboard();
  if (/^\/join\/?$/.test(p)) return renderJoin();
  renderLanding();
  if (/^\/new\/?$/.test(p)) openNewEvent();
};

/* ---- header bar (like Blitz): the page you're on gets the faded pill ---- */
function setNav(name) {
  $$("#navbar [data-tab]").forEach((a) => {
    a.classList.toggle("on", a.dataset.tab === name);
    if (a.dataset.tab === name) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

/** "+ New event": choose a trip (days) or a meeting (hours). */
function openNewEvent() {
  closeMenu();
  openSheet(`
    <div class="sheet-head"><div><h2>New event</h2><div class="sheet-sub">What are you planning?</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
    <div class="choose">
      <a class="choose-opt" href="/plan" data-link>
        <span class="choose-ico">${icon("calendar")}</span>
        <span class="choose-text"><b>Trip days</b><span>Find the days that work over the coming months, then vote on places and activities.</span></span>
        <span class="choose-go" aria-hidden="true">›</span>
      </a>
      <a class="choose-opt" href="/meet" data-link>
        <span class="choose-ico">${icon("clock")}</span>
        <span class="choose-text"><b>Meeting times</b><span>Find the hour that works on a few dates, in everyone’s own time zone.</span></span>
        <span class="choose-go" aria-hidden="true">›</span>
      </a>
    </div>`);
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-new]")) {
    e.preventDefault();
    openNewEvent();
  }
});

/* ---- phone menu: the header's links fold into ☰ ---- */
let menuEl = null;
function closeMenu() {
  if (!menuEl) return;
  menuEl.remove();
  menuEl = null;
  $("#navbar .menu-btn")?.setAttribute("aria-expanded", "false");
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#navbar .menu-btn");
  if (btn) {
    if (menuEl) return closeMenu();
    menuEl = document.createElement("nav");
    menuEl.className = "menu-pop";
    menuEl.setAttribute("aria-label", "Menu");
    const here = location.pathname;
    menuEl.innerHTML = `
      <a class="menu-item ${here === "/dashboard" ? "on" : ""}" href="/dashboard" data-link><b>Dashboard</b><small>Your plans and what you viewed</small></a>
      <a class="menu-item ${here === "/join" ? "on" : ""}" href="/join" data-link><b>Join with PIN</b><small>Open a plan from its 6-digit PIN</small></a>
      <button type="button" class="btn btn-primary btn-block" data-new>${icon("plus")} New event</button>`;
    document.body.append(menuEl);
    btn.setAttribute("aria-expanded", "true");
    return;
  }
  if (menuEl && !menuEl.contains(e.target)) closeMenu();
});

/** 482913 → "482 913" */
const pinText = (id) => (/^\d{6}$/.test(id) ? `${id.slice(0, 3)} ${id.slice(3)}` : id);

/** Remember what was opened, for the dashboard's "Recently viewed". */
function markViewed(kind, id, title) {
  const list = store.get("wingman:viewed", []).filter((x) => !(x.kind === kind && x.id === id));
  list.unshift({ kind, id, title, at: Date.now() });
  store.set("wingman:viewed", list.slice(0, 12));
}

/** Everything this device has created or opened. */
function myItems() {
  return [
    ...store.get("convene:events", []).map((e) => ({ kind: "trip", id: e.id, title: e.title, href: `/e/${e.id}`, sub: e.start ? fmtRange(e.start, e.end) : e.year || "", mine: !!e.mine })),
    ...store.get("wingman:meets", []).map((m) => ({ kind: "meet", id: m.id, title: m.title, href: `/m/${m.id}`, sub: "", mine: !!m.mine })),
  ];
}

/* Meeting times live in their own module, loaded the first time they're needed. */
let meetPromise = null;
function meetModule() {
  app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  meetPromise ||= import("/meet.js?v=" + ((document.querySelector('script[src*="app.js"]')?.getAttribute("src").match(/v=(\d+)/) || [])[1] || "1")).then((m) => {
    m.init({ app, $, $$, esc, icon, api, toast, store, navActions, shareLink, setupSegmented, attachPainter, avatar, buzz, todayStr, parseDate, ymd, MONTHS, navigate, reducedMotion, pinText, markViewed, openSheet, closeSheet, downloadIcs, googleCalUrl, openAddToCalendar, actorName, changeLogHtml, ago });
    return m;
  });
  return meetPromise.catch((err) => {
    meetPromise = null;
    app.innerHTML = `<div class="empty card" style="margin-top:2.5rem"><h3>Couldn’t load this page</h3><p>Check your connection and try again.</p></div>`;
    throw err;
  });
}

/** Join by PIN: look the number up and open the trip or meeting. */
async function joinPin(raw) {
  const pin = String(raw || "").replace(/\D/g, "");
  if (pin.length !== 6) return toast("A PIN has 6 digits", { error: true });
  try {
    const r = await api(`/pin/${pin}`);
    navigate(r.kind === "trip" ? `/e/${r.id}` : `/m/${r.id}`);
  } catch (err) {
    toast(err.message, { error: true });
  }
}
const pinForm = (id, big = false) => `
  <form class="pinform${big ? " big" : ""}" id="${id}" autocomplete="off">
    <input name="pin" inputmode="numeric" pattern="[0-9 ]*" maxlength="7" placeholder="Event PIN" aria-label="Event PIN" />
    <button class="btn">Join</button>
  </form>`;
function bindPinForm(id) {
  const f = document.getElementById(id);
  if (!f) return;
  const input = f.pin;
  input.addEventListener("input", () => {
    const d = input.value.replace(/\D/g, "").slice(0, 6);
    input.value = d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d;
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    joinPin(input.value);
  });
}

/* ------------------------------------------------------------------ */
/* Home: Wingman (like Blitz's home)                                    */
/* ------------------------------------------------------------------ */

function renderLanding() {
  document.title = "Wingman — plan it together";
  // "See it in action": small live pieces of the real screens
  const heat = Array.from({ length: 35 }, (_, i) => {
    const a = i < 31 ? [0, 0.15, 0.3, 0.55, 0.8, 1][Math.floor(Math.abs(Math.sin(i * 1.7 + 0.4)) * 6)] : 0;
    return i < 31 ? `<span class="${a ? "h" : ""}" style="--t:${a}">${i + 1}</span>` : "<span class=\"none\"></span>";
  }).join("");
  const rows = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30"];
  const times = rows
    .map(
      (t, r) =>
        `<span class="tm">${t}</span>${[0, 1, 2, 3, 4]
          .map((c) => {
            const v = Math.max(0, Math.min(1, Math.sin((r + 1) * 0.6) * Math.cos((c - 2) * 0.7) * 1.2));
            return `<span class="${v > 0.08 ? "h" : ""}" style="--t:${v.toFixed(2)}"></span>`;
          })
          .join("")}`,
    )
    .join("");
  const places = [
    ["Lisbon", 7],
    ["Athens", 5],
    ["Copenhagen", 3],
  ];
  app.innerHTML = `
    <section class="land-hero">
      <p class="eyebrow">Group planning · no accounts</p>
      <h1 class="mega">Make your<br/><span class="shine">timeline.</span></h1>
      <p class="lede">Find the days for a trip or the hour for a meeting. Share one link or a 6-digit PIN, and watch everyone’s free time line up.</p>
      <div class="cta">
        <button type="button" class="btn btn-primary btn-lg" data-new>Create an event <span aria-hidden="true">→</span></button>
        ${pinForm("landPin")}
      </div>
    </section>

    <section class="showcase">
      <p class="eyebrow">See it in action</p>
      <h2 class="display">Everyone marks their time. The overlap lights up.</h2>
      <div class="shots">
        <figure class="shot card">
          <div class="shot-head"><span class="shot-tag">Trip days</span><span class="shot-sub">8 people</span></div>
          <div class="mini-month" aria-hidden="true"><b>July</b><div class="mm-grid">${heat}</div></div>
          <figcaption>The darker the day, the more people can come. Tap one to see who.</figcaption>
        </figure>
        <figure class="shot card">
          <div class="shot-head"><span class="shot-tag">Meeting times</span><span class="shot-sub">Your time zone</span></div>
          <div class="mini-times" aria-hidden="true"><span></span>${["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => `<span class="dh">${d}</span>`).join("")}${times}</div>
          <figcaption>Drag across the half hours you’re free. Everyone sees them in their own time zone.</figcaption>
        </figure>
        <figure class="shot card">
          <div class="shot-head"><span class="shot-tag">Places</span><span class="shot-sub">Vote with one tap</span></div>
          <ol class="mini-board" aria-hidden="true">${places
            .map(([n, v], i) => `<li><span class="mb-rank">${i + 1}</span><span class="mb-name">${n}</span><span class="mb-bar"><i style="width:${(v / 7) * 100}%"></i></span><b>${v}</b></li>`)
            .join("")}</ol>
          <figcaption>Suggest places and activities, like the ones you love, and see what the group picks.</figcaption>
        </figure>
      </div>
    </section>

    <section class="steps">
      <article><span>01</span><h3>Create</h3><p>Pick trip days or meeting times, then choose the dates to ask about.</p></article>
      <article><span>02</span><h3>Share</h3><p>Send the link, or the 6-digit PIN. People join with just their name.</p></article>
      <article><span>03</span><h3>Decide</h3><p>See the best day or hour at a glance, and who can make it.</p></article>
    </section>`;
  bindPinForm("landPin");
}

/* ------------------------------------------------------------------ */
/* Join with PIN                                                        */
/* ------------------------------------------------------------------ */

function renderJoin() {
  document.title = "Join with PIN — Wingman";
  app.innerHTML = `
    <section class="join-page">
      <p class="eyebrow">Join an event</p>
      <h1 class="display">Enter the PIN.</h1>
      <p class="lede">Every trip and meeting has a 6-digit PIN. Type it to open it, no account needed.</p>
      ${pinForm("joinPin", true)}
    </section>`;
  bindPinForm("joinPin");
  const pin = new URLSearchParams(location.search).get("pin");
  if (pin) joinPin(pin);
  else setTimeout(() => $("#joinPin input")?.focus(), 50);
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const ago = (t) => {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

async function renderDashboard() {
  document.title = "Dashboard — Wingman";
  const items = myItems();
  const trips = items.filter((x) => x.kind === "trip");
  const meets = items.filter((x) => x.kind === "meet");
  const viewed = store.get("wingman:viewed", []).slice(0, 4);
  const first = (store.get("convene:name", "") || "").split(" ")[0];
  const row = (it) => `
    <a class="plan-row" href="${esc(it.href)}" data-link data-id="${esc(it.id)}" data-kind="${it.kind}">
      <span class="plan-ico ${it.kind}">${icon(it.kind === "trip" ? "calendar" : "clock")}</span>
      <span class="plan-main"><b>${esc(it.title)}</b><small data-sub>${esc(it.sub || "Loading…")}</small></span>
      ${/^\d{6}$/.test(it.id) ? `<span class="plan-pin">PIN ${esc(pinText(it.id))}</span>` : ""}
      <span class="plan-count" data-count>–</span>
    </a>`;
  const section = (title, list, empty) => `
    <section class="dash-sec">
      <div class="sec-head"><h2>${title}</h2><span class="sec-n">${list.length || ""}</span></div>
      ${list.length ? `<div class="card plan-list">${list.map(row).join("")}</div>` : `<div class="card dash-empty"><p>${empty}</p></div>`}
    </section>`;
  app.innerHTML = `
    <div class="dash">
      <div class="dash-main">
        <p class="eyebrow">Dashboard</p>
        <h1 class="display">Welcome back${first ? `, ${esc(first)}` : ""}.</h1>
        <p class="lede">${items.length ? `You have ${items.length} ${items.length === 1 ? "plan" : "plans"} on this device.` : "Plans you create or open on this device show up here."}</p>
        ${
          viewed.length
            ? `<section class="dash-sec">
          <div class="sec-head"><h2>Recently viewed</h2></div>
          <div class="recent-grid">${viewed
            .map(
              (v) => `<a class="card recent" href="${v.kind === "trip" ? "/e/" : "/m/"}${esc(v.id)}" data-link>
                <span class="plan-ico ${v.kind}">${icon(v.kind === "trip" ? "calendar" : "clock")}</span>
                <b>${esc(v.title)}</b><small>${v.kind === "trip" ? "Trip days" : "Meeting times"} · ${esc(ago(v.at))}</small></a>`,
            )
            .join("")}</div>
        </section>`
            : ""
        }
        ${section("Your meetings", meets, "No meetings yet. Create one to find the hour that works.")}
        ${section("Your trips", trips, "No trips yet. Create one to find the days that work.")}
      </div>
      <aside class="dash-aside">
        <div class="card aside-card">
          <h2>Create a new event</h2>
          <p>What are you planning?</p>
          <a class="btn btn-primary btn-block" href="/plan" data-link>${icon("calendar")} Trip days</a>
          <a class="btn btn-block" href="/meet" data-link>${icon("clock")} Meeting times</a>
        </div>
        <div class="card aside-card">
          <h2>Join with PIN</h2>
          <p>Got a 6-digit PIN from someone?</p>
          ${pinForm("dashPin")}
        </div>
      </aside>
    </div>`;
  bindPinForm("dashPin");

  await Promise.all(
    items.map(async (it) => {
      const el = () => app.querySelector(`.plan-row[data-kind="${it.kind}"][data-id="${CSS.escape(it.id)}"]`);
      try {
        const d = await api(it.kind === "trip" ? `/events/${it.id}` : `/meetings/${it.id}`);
        const n = (it.kind === "trip" ? d.responses : d.people).length;
        const r = el();
        if (!r) return;
        r.querySelector("[data-count]").textContent = `${n} ${n === 1 ? "person" : "people"}`;
        r.querySelector("[data-sub]").textContent = it.kind === "trip" ? tripLine(d, n) : meetLine(d, n);
      } catch (err) {
        const gone = /exist|removed|not found/i.test(err.message);
        const r = el();
        if (r) {
          r.classList.add("gone");
          r.querySelector("[data-sub]").textContent = gone ? "No longer available" : "Couldn’t refresh";
        }
        if (gone) {
          const key = it.kind === "trip" ? "convene:events" : "wingman:meets";
          store.set(key, store.get(key, []).filter((x) => x.id !== it.id));
        }
      }
    }),
  );
}

function tripLine(d, n) {
  if (!n) return "Waiting for the first answer";
  const score = new Map();
  for (const r of d.responses) {
    for (const x of r.yes || []) score.set(x, (score.get(x) || 0) + 1);
    for (const x of r.maybe || []) score.set(x, (score.get(x) || 0) + 0.5);
  }
  let best = null;
  for (const [day, v] of score) if (!best || v > best[1] || (v === best[1] && day < best[0])) best = [day, v];
  return best ? `Best so far: ${fmtDate(best[0], { weekday: "short", day: "numeric", month: "short" })}` : "No days marked yet";
}

function meetLine(d, n) {
  if (!n) return "Waiting for the first answer";
  const count = new Map();
  for (const p of d.people) for (const s of p.slots) count.set(s, (count.get(s) || 0) + 1);
  const max = Math.max(0, ...count.values());
  return max ? `Up to ${max} of ${n} free at the same time` : "No times marked yet";
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

function renderHome() {
  document.title = "Wingman — find the days that work";
  const today = todayStr();
  const nextYear = new Date().getFullYear() + 1;
  const recent = store.get("convene:events", []);
  const heat = Array.from({ length: 42 }, (_, i) => {
    const a = [0.08, 0.15, 0.3, 0.55, 0.85, 1][Math.floor(Math.abs(Math.sin(i * 1.7 + 0.4)) * 6)];
    return `<span style="--a:${a};--d:${(i % 7) * 0.18}s"></span>`;
  }).join("");

  app.innerHTML = `
    <div class="hero">
      <div>
        <h1 class="large-title fade-in">Find the days<br/>that <span class="shine">work for everyone.</span></h1>
        <p class="subtitle fade-in d1">Create an event, share one link, and watch the calendar light up as people mark when they’re free. Then vote on where to go and what to do.</p>
        <ul class="feature-list fade-in d2">
          <li><span class="feature-icon">${icon("calendar")}</span><div><b>Any window you like</b>The next few months, a whole year, or exact dates. Darker days mean more people can make it.</div></li>
          <li><span class="feature-icon">${icon("pin")}</span><div><b>Places leaderboard</b>Everyone suggests places; the favourites rise to the top.</div></li>
          <li><span class="feature-icon">${icon("lock")}</span><div><b>No accounts, no logins</b>Just a name and a few taps.</div></li>
        </ul>
      </div>

      <form class="fade-in d2" id="createForm" autocomplete="off">
        <div class="card pad faceplate">
          <i class="screw tl" aria-hidden="true"></i><i class="screw tr" aria-hidden="true"></i><i class="screw bl" aria-hidden="true"></i><i class="screw br" aria-hidden="true"></i>
          <div class="mini-heat" aria-hidden="true">${heat}</div>
          <div class="section-header" style="margin-top:1.375rem">New event</div>
          <div class="group well">
            <div class="row"><label for="title">Name</label><input id="title" name="title" maxlength="80" placeholder="Summer trip 2027" required /></div>
            <div class="row"><label for="desc">Notes</label><textarea id="desc" name="description" maxlength="400" placeholder="Optional — what’s the plan?"></textarea></div>
          </div>
          <div class="section-header">Dates to choose from</div>
          <div class="segmented year-pick" role="group" aria-label="Date range" data-seg="range">
            <span class="thumb"></span>
            <button type="button" data-value="3" aria-pressed="false">3 months</button>
            <button type="button" data-value="6" aria-pressed="true">6 months</button>
            <button type="button" data-value="12" aria-pressed="false">1 year</button>
            <button type="button" data-value="custom" aria-pressed="false">Custom</button>
          </div>
          <div class="rp-fields" role="group" aria-label="Start and end">
            <button type="button" class="rp-field" data-edit="start" aria-pressed="false"><span>Starts</span><b id="rpStart"></b></button>
            <button type="button" class="rp-field" data-edit="end" aria-pressed="false"><span>Ends</span><b id="rpEnd"></b></button>
          </div>
          <div class="rangepick" id="rangePick">
            <div class="rp-head">
              <h3 id="rpMonth" aria-live="polite"></h3>
              <div class="rp-nav">
                <button type="button" class="rp-arrow" data-step="-1" aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>
                <button type="button" class="rp-arrow" data-step="1" aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>
              </div>
            </div>
            <div class="rp-week" aria-hidden="true">${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span>${d}</span>`).join("")}</div>
            <div class="rp-grid" id="rpGrid" role="grid" aria-label="Choose the first and last day"></div>
            <p class="rp-hint" id="rpHint"></p>
          </div>
          <div class="chips rp-quick">
            <button type="button" class="btn btn-tinted" data-whole="${nextYear - 1}">Rest of ${nextYear - 1}</button>
            <button type="button" class="btn btn-tinted" data-whole="${nextYear}">All of ${nextYear}</button>
          </div>
          <p class="range-summary" id="rangeSummary"></p>
          <div class="section-header">How long is the trip?</div>
          <div class="segmented trip-len" role="group" aria-label="Trip length" data-seg="len">
            <span class="thumb"></span>
            <button type="button" data-value="1" aria-pressed="true">1 day</button>
            <button type="button" data-value="2" aria-pressed="false">2 days</button>
            <button type="button" data-value="3" aria-pressed="false">3 days</button>
            <button type="button" data-value="7" aria-pressed="false">1 week</button>
          </div>
          <p class="len-hint">Wingman then looks for the best days in a row, not just the best single day. You can change it later.</p>
          <div class="section-header">Also ask about</div>
          <div class="group well toggles">
            <label class="row toggle-row"><span><b>Places</b><small>Everyone suggests places and votes</small></span><input type="checkbox" name="secPlaces" role="switch" checked /></label>
            <label class="row toggle-row"><span><b>Activities</b><small>Ideas with links, which people can like</small></span><input type="checkbox" name="secActivities" role="switch" checked /></label>
          </div>
          <div style="margin-top:1.375rem"><button class="btn btn-primary btn-block" type="submit" id="createBtn">${icon("sparkles")} Create event</button></div>
          <p class="fineprint">${icon("lock")}<span>You’re the host: from this browser you can remove entries and turn Places or Activities on or off later. The dates can’t change once it’s created.</span></p>
        </div>
      </form>
    </div>

    ${
      recent.length
        ? `<div class="section-header">Your recent events</div>
           <div class="card group">${recent
             .slice(0, 8)
             .map(
               (e) =>
                 `<a class="row" href="/e/${esc(e.id)}" data-link style="text-decoration:none;color:inherit"><span class="feature-icon" style="width:30px;height:30px">${icon(
                   "calendar",
                 )}</span><span style="flex:1;font-weight:600">${esc(e.title)}</span><span style="color:var(--label-3);font-size:0.8125rem">${esc(e.start ? fmtRange(e.start, e.end) : e.year || "")}</span></a>`,
             )
             .join("")}</div>`
        : ""
    }
  `;

  const form = $("#createForm");
  const summary = $("#rangeSummary");
  let tripDays = 1;
  setupSegmented($('[data-seg="len"]'), (v) => (tripDays = Number(v)));
  // An Apple-style range calendar (like Calendar / Booking pickers): one month at a time; tap the first
  // day, then the last. The range is one continuous band between two filled circles. The presets
  // (3 / 6 months, 1 year) fill it in; any tap on the calendar makes it Custom.
  const rp = { start: today, end: addMonths(today, 6), picking: "start", month: today.slice(0, 7) };
  const seg = $('[data-seg="range"]');
  const MAX_DAYS = 731;
  const lastAllowed = () => (rp.picking === "end" && rp.start ? addDays(rp.start, MAX_DAYS - 1) : addDays(today, MAX_DAYS * 2));
  const currentRange = () => ({ start: rp.start, end: rp.end });
  // mark a preset as chosen without triggering it (the slider moves to it)
  const pressPreset = (v) => {
    const buttons = [...seg.querySelectorAll("button")];
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === v)));
    const on = buttons.find((b) => b.dataset.value === v);
    const thumb = seg.querySelector(".thumb");
    if (on && thumb) {
      thumb.style.width = `${on.offsetWidth}px`;
      thumb.style.transform = `translateX(${on.offsetLeft - 2}px)`;
    }
  };
  const fmtField = (d) => (d ? parseDate(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Choose");
  const drawRange = () => {
    const [y, m] = rp.month.split("-").map(Number);
    $("#rpMonth").textContent = `${MONTHS[m - 1]} ${y}`;
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const n = new Date(y, m, 0).getDate();
    const max = lastAllowed();
    let html = "";
    for (let i = 0; i < offset; i++) html += '<span class="rp-day blank"></span>';
    for (let d = 1; d <= n; d++) {
      const date = ymd(y, m - 1, d);
      const col = (offset + d - 1) % 7;
      const off = date < today || date > max;
      const isStart = date === rp.start;
      const isEnd = date === rp.end;
      const inside = rp.start && rp.end && date > rp.start && date < rp.end;
      const band = rp.start && rp.end && rp.end > rp.start && (inside || isStart || isEnd);
      const cls = [
        "rp-day",
        off ? "off" : "",
        date === today ? "today" : "",
        isStart ? "start" : "",
        isEnd ? "end" : "",
        inside ? "in" : "",
        band ? "band" : "",
        band && (col === 0 || d === 1) ? "edge-l" : "",
        band && (col === 6 || d === n) ? "edge-r" : "",
      ]
        .filter(Boolean)
        .join(" ");
      html += `<button type="button" class="${cls}" data-date="${date}" ${off ? "disabled" : ""} aria-pressed="${isStart || isEnd}" aria-label="${esc(
        parseDate(date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      )}${isStart ? ", first day" : isEnd ? ", last day" : inside ? ", in range" : ""}"><span>${d}</span></button>`;
    }
    $("#rpGrid").innerHTML = html;
    $('[data-step="-1"]').disabled = rp.month <= today.slice(0, 7);
    $("#rpStart").textContent = fmtField(rp.start);
    $("#rpEnd").textContent = fmtField(rp.end);
    $$(".rp-field").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.edit === rp.picking)));
    $("#rpHint").textContent = rp.picking === "start" ? "Tap the first day people can choose." : "Now tap the last day.";
    updateSummary();
  };
  const updateSummary = () => {
    const r = currentRange();
    const ok = r.start && r.end && r.end >= r.start;
    summary.classList.toggle("error", !ok);
    summary.innerHTML = ok
      ? `${icon("calendar")}<span><b>${esc(fmtRange(r.start, r.end))}</b> · ${daysInRange(r.start, r.end)} days</span>`
      : `${icon("calendar")}<span>${r.start ? "Pick the last day to finish the range." : "Pick the first day."}</span>`;
  };
  const showMonth = (date) => {
    rp.month = (date || today).slice(0, 7);
  };
  setupSegmented(seg, (v) => {
    if (v === "custom") {
      rp.picking = "start";
      rp.end = null;
      showMonth(rp.start);
    } else {
      rp.start = today;
      rp.end = addMonths(today, Number(v));
      rp.picking = "start";
      showMonth(today);
    }
    drawRange();
  });
  $("#rpGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".rp-day[data-date]");
    if (!b || b.disabled) return;
    const d = b.dataset.date;
    if (rp.picking === "start" || !rp.start || d < rp.start) {
      rp.start = d; // a new first day; the last day comes next
      rp.end = null;
      rp.picking = "end";
    } else {
      rp.end = d;
      rp.picking = "start";
      buzz(8);
    }
    pressPreset("custom");
    drawRange();
  });
  $$(".rp-arrow").forEach((b) =>
    b.addEventListener("click", () => {
      const [y, m] = rp.month.split("-").map(Number);
      const d = new Date(y, m - 1 + Number(b.dataset.step), 1);
      rp.month = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      drawRange();
    }),
  );
  $$(".rp-field").forEach((b) =>
    b.addEventListener("click", () => {
      rp.picking = b.dataset.edit;
      showMonth(rp.picking === "end" ? rp.end || rp.start : rp.start);
      drawRange();
    }),
  );
  // swipe left / right on the month to change it
  let swipe = null;
  $("#rangePick").addEventListener("pointerdown", (e) => (swipe = { x: e.clientX, y: e.clientY }));
  $("#rangePick").addEventListener("pointerup", (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) $(`.rp-arrow[data-step="${dx < 0 ? 1 : -1}"]`)?.click();
  });
  $(".rp-quick").addEventListener("click", (e) => {
    const b = e.target.closest("[data-whole]");
    if (!b) return;
    const y = b.dataset.whole;
    rp.start = `${y}-01-01` < today ? today : `${y}-01-01`;
    rp.end = `${y}-12-31`;
    rp.picking = "start";
    pressPreset("custom");
    showMonth(rp.start);
    drawRange();
  });
  drawRange();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#createBtn");
    const title = form.title.value.trim();
    if (!title) {
      form.title.focus();
      return toast("Give your event a name", { error: true });
    }
    const range = currentRange();
    if (!range.start || !range.end || range.end < range.start) return toast("Pick the first and the last day on the calendar.", { error: true });
    if (daysInRange(range.start, range.end) > 731) return toast("Pick a range of up to two years", { error: true });
    btn.disabled = true;
    try {
      const { id, admin } = await api("/events", {
        method: "POST",
        body: {
          title,
          description: form.description.value.trim(),
          start_date: range.start,
          end_date: range.end,
          sections: { places: form.secPlaces.checked, activities: form.secActivities.checked },
          trip_days: tripDays,
        },
      });
      if (admin) store.set(`wingman:admin:${id}`, admin);
      const list = store.get("convene:events", []).filter((x) => x.id !== id);
      list.unshift({ id, title, start: range.start, end: range.end, mine: true });
      store.set("convene:events", list.slice(0, 20));
      navigate(`/created/${id}`);
    } catch (err) {
      toast(err.message, { error: true });
      btn.disabled = false;
    }
  });
}

function setupSegmented(root, onChange) {
  const thumb = $(".thumb", root);
  const buttons = $$("button", root);
  const place = () => {
    const active = buttons.find((b) => b.getAttribute("aria-pressed") === "true") || buttons[0];
    thumb.style.width = `${active.offsetWidth}px`;
    thumb.style.transform = `translateX(${active.offsetLeft - 2}px)`;
  };
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      place();
      onChange?.(b.dataset.value);
    }),
  );
  requestAnimationFrame(place);
  new ResizeObserver(place).observe(root);
  return { value: () => (buttons.find((b) => b.getAttribute("aria-pressed") === "true") || buttons[0]).dataset.value };
}

/* ------------------------------------------------------------------ */
/* Created                                                             */
/* ------------------------------------------------------------------ */

function renderCreated(id) {
  const meta = store.get("convene:events", []).find((e) => e.id === id) || { title: "Your event" };
  const url = `${location.origin}/e/${id}`;
  document.title = `${meta.title} — Wingman`;
  app.innerHTML = `
    <div class="created">
      <div class="check-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h1 class="large-title fade-in" style="font-size:clamp(2.125rem,6vw,2.75rem)">${esc(meta.title)}<br/><span class="shine">is live.</span></h1>
      <p class="subtitle fade-in d1" style="margin:0 auto">Share this link with your group. Anyone who opens it can add their name and mark their days — no account needed.</p>
      <div class="link-field fade-in d2"><code>${esc(url)}</code><button class="btn btn-tinted" id="copyBtn">${icon("link")} Copy</button></div>
      <div class="stack two fade-in d3">
        <button class="btn btn-secondary" id="shareBtn">${icon("share")} Share link</button>
        <a class="btn btn-primary" href="/e/${esc(id)}" data-link>Open event</a>
      </div>
    </div>`;
  $("#copyBtn").onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      prompt("Copy this link", url);
    }
  };
  $("#shareBtn").onclick = () => shareLink(url, meta.title);
}

/* ------------------------------------------------------------------ */
/* Event                                                               */
/* ------------------------------------------------------------------ */

let current = null; // { event, responses, agg, tab, selectMode, selected:Set, filter: response id or null }

const CACHE_LIMIT = 6;
function cacheEvent(id, data) {
  const keys = store.get("convene:cache-keys", []).filter((k) => k !== id);
  keys.unshift(id);
  for (const old of keys.splice(CACHE_LIMIT)) {
    try {
      localStorage.removeItem(`convene:cache:${old}`);
    } catch {
      /* ignore */
    }
  }
  store.set("convene:cache-keys", keys);
  store.set(`convene:cache:${id}`, data);
}

/**
 * Shows the last saved copy of an event immediately (if any), then refreshes from the network and
 * repaints only when something changed. On a slow connection the page is usable at once.
 */
async function renderEvent(id, { keepTab = false, quiet = false } = {}) {
  const prevTab = keepTab && current ? current.tab : "calendar";
  const cached = keepTab ? null : store.get(`convene:cache:${id}`);
  if (cached) paintEvent(cached, prevTab);
  else if (!keepTab) app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  let data;
  try {
    data = await api(`/events/${id}`);
  } catch (err) {
    if (cached) return toast("Can’t reach the server — showing your saved copy", { error: true });
    app.innerHTML = `<div class="empty card" style="margin-top:2.5rem"><div class="glyph">${icon("calendar")}</div><h3>Event not found</h3><p>${esc(
      err.message,
    )}</p><a class="btn btn-primary" href="/plan" data-link style="margin-top:0.75rem">Create a new event</a></div>`;
    return;
  }
  cacheEvent(id, data);
  if (location.pathname.replace(/\/$/, "") !== `/e/${id}`) return; // user navigated away meanwhile
  if (cached && JSON.stringify(cached) === JSON.stringify(data)) return;
  if (cached && ($(".flow") || $(".sheet-wrap"))) {
    // don’t yank the page from under an open sheet/flow; keep the fresh data for the next paint
    Object.assign(current, data, { agg: aggregate(data.responses) });
    return;
  }
  paintEvent(data, current && cached ? current.tab : prevTab, { quiet });
}

function paintEvent(data, prevTab, { quiet = false } = {}) {
  const keepFilter = current?.event?.id === data.event.id ? current.filter : null;
  const keepMore = current?.event?.id === data.event.id ? current.moreBest : false; // the expanded "more dates" stays open
  const keepFolds = current?.event?.id === data.event.id ? { peopleOpen: current.peopleOpen, hostOpen: current.hostOpen } : {};
  current = { ...data, agg: aggregate(data.responses), tab: prevTab, selectMode: false, selected: new Set(), filter: keepFilter, moreBest: keepMore, ...keepFolds };
  app.classList.toggle("quiet", quiet); // in-place update (a vote, a like): no entrance animations
  const { event, responses } = data;
  document.title = `${event.title} — Wingman`;

  const recent = store.get("convene:events", []);
  if (!recent.some((e) => e.id === event.id)) {
    recent.unshift({ id: event.id, title: event.title, start: event.start_date, end: event.end_date });
    store.set("convene:events", recent.slice(0, 20));
  }
  if (!quiet) markViewed("trip", event.id, event.title);

  const mine = store.get(`convene:resp:${event.id}`);
  const myResponse = mine && responses.find((r) => r.id === mine.id);
  const url = `${location.origin}/e/${event.id}`;

  navActions.innerHTML = `<button class="btn btn-tinted nav-share" id="navShare" aria-label="Share event">${icon("share")}<span>Share</span></button>`;
  $("#navShare").onclick = () => shareLink(url, event.title);

  const sec = event.sections || { places: true, activities: true };
  const tabs = [
    ["calendar", "calendar", "Calendar"],
    ...(sec.places ? [["destinations", "trophy", "Places"]] : []),
    ...(sec.activities ? [["activities", "sparkles", "Activities"]] : []),
  ];
  if (!tabs.some(([v]) => v === prevTab)) prevTab = current.tab = "calendar";
  const host = !!data.host;
  current.host = host;
  const perms = event.perms || { final: true, remove: true };
  const canRemove = host || perms.remove;
  current.canSave = host || perms.final;
  const ctaHtml = myResponse
    ? `<button class="btn btn-secondary btn-block" data-act="edit">${icon("pencil")} Edit my response</button>`
    : `<button class="btn btn-primary btn-block" data-act="add">${icon("plus")} Add your availability</button>`;
  app.innerHTML = `
    ${finalTripHtml(event, host)}
    <div class="event-layout">
      <aside class="event-aside">
        <div class="event-head pass-card fade-in">
          <p class="eyebrow">Trip days${/^\d{6}$/.test(event.id) ? ` · PIN ${esc(pinText(event.id))}` : ""}</p>
          <h1 class="large-title">${esc(event.title)}</h1>
          ${event.description ? `<p class="subtitle">${esc(event.description)}</p>` : ""}
          <div class="route">
            <div><small>Earliest</small><b>${esc(fmtDate(eventRange(event).start, { day: "numeric", month: "short" }))}</b><span>${eventRange(event).start.slice(0, 4)}</span></div>
            <span class="route-line" aria-hidden="true">${icon("plane")}</span>
            <div class="r"><small>Latest</small><b>${esc(fmtDate(eventRange(event).end, { day: "numeric", month: "short" }))}</b><span>${eventRange(event).end.slice(0, 4)}</span></div>
          </div>
          <div class="event-meta">
            <span class="pill">${icon("people")} ${responses.length} ${responses.length === 1 ? "response" : "responses"}</span>
            ${sec.places ? `<span class="pill">${icon("pin")} ${current.agg.destinations.length} ${current.agg.destinations.length === 1 ? "place" : "places"}</span>` : ""}
            ${host ? `<span class="pill host-pill">${icon("lock")} You’re the host</span>` : ""}
          </div>
          ${expiryNotice(event)}
        </div>
        <div class="event-cta fade-in d1">${ctaHtml}</div>
        ${
          responses.length
            ? `<details class="card fold people-fold"${current.peopleOpen ?? responses.length <= 6 ? " open" : ""}>
          <summary><span>Who responded</span><span class="fold-faces" aria-hidden="true">${responses
            .slice(0, 3)
            .map((r) => avatar(r.name, "sm"))
            .join("")}</span><small>${responses.length}</small></summary>
          <p class="fold-note">Tap a name to see their days.</p>
          <div class="people-chips">${responses
            .map(
              (r) =>
                `<div class="person-row"><button type="button" class="person" data-filter="${esc(r.id)}" aria-pressed="false">${avatar(r.name, "sm")}<span>${esc(r.name)}</span></button>${
                  canRemove ? `<button type="button" class="person-remove" data-remove-resp="${esc(r.id)}" aria-label="Remove ${esc(r.name)}’s entry">${icon("x")}</button>` : ""
                }</div>`,
            )
            .join("")}</div>
        </details>`
            : ""
        }
        ${changeLogHtml(event.log || [])}
        ${
          host
            ? `<details class="card fold host-card"${current.hostOpen ? " open" : ""}>
          <summary><span>Host settings</span><small>Only you see this</small></summary>
          <p>Choose how long the trip is, what people are asked about, and what everyone may do.</p>
          <label class="host-len"><span><b>How long is the trip?</b><small>The best-dates search looks for this many days in a row</small></span>
            <select data-trip-days>${TRIP_LENGTHS.map(([v, l]) => `<option value="${v}" ${v === (event.trip_days || 1) ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          <label class="toggle-row"><span><b>Places</b><small>Suggest and vote on places</small></span><input type="checkbox" role="switch" data-section="places" ${sec.places ? "checked" : ""} /></label>
          <label class="toggle-row"><span><b>Activities</b><small>Ideas with links and likes</small></span><input type="checkbox" role="switch" data-section="activities" ${sec.activities ? "checked" : ""} /></label>
          <div class="host-sub">Everyone can…</div>
          <label class="toggle-row"><span><b>Save the date</b><small>Off: only you can save or unsave it</small></span><input type="checkbox" role="switch" data-perm="final" ${perms.final ? "checked" : ""} /></label>
          <label class="toggle-row"><span><b>Remove entries</b><small>Off: only you can remove someone</small></span><input type="checkbox" role="switch" data-perm="remove" ${perms.remove ? "checked" : ""} /></label>
        </details>`
            : ""
        }
      </aside>
      <section class="event-main">
        ${
          tabs.length > 1
            ? `<div class="segmented tabs fade-in d2" role="tablist" data-seg="tabs">
          <span class="thumb"></span>
          ${tabs.map(([v, ic, label]) => `<button type="button" data-value="${v}" aria-pressed="${prevTab === v}">${icon(ic).replace("<svg", '<svg width="16" height="16"')} ${label}</button>`).join("")}
        </div>`
            : ""
        }
        <div id="tabBody" class="fade-in d3"></div>
      </section>
    </div>
    <div class="action-bar" id="actionBar">${ctaHtml}</div>
    <div class="select-bar" id="selectBar"><span id="selCount">0 days</span><button class="btn btn-plain" id="selClear">Clear</button>${current.canSave ? '<button class="btn btn-tinted" id="selFinal">Save dates</button>' : ""}<button class="btn btn-primary" id="selShow">Who’s free?</button></div>
  `;

  $$('[data-act="add"]').forEach((b) => b.addEventListener("click", () => openFlow()));
  $$('[data-act="edit"]').forEach((b) => b.addEventListener("click", () => openFlow({ edit: { ...mine, response: myResponse } })));
  if ($('[data-seg="tabs"]'))
    setupSegmented($('[data-seg="tabs"]'), (v) => {
      current.tab = v;
      exitSelectMode();
      renderTab();
    });
  // anyone can remove an entry; it goes in the change log
  $$("[data-remove-resp]").forEach((b) =>
    b.addEventListener("click", async () => {
      const r = current.responses.find((x) => x.id === b.dataset.removeResp);
      if (!r || !confirm(`Remove ${r.name}’s entry? This can’t be undone, and it shows in the change log.`)) return;
      const by = await actorName();
      if (!by) return;
      try {
        await api(`/events/${event.id}/responses/${r.id}?by=${encodeURIComponent(by)}`, { method: "DELETE" });
        if (current.filter === r.id) current.filter = null;
        toast(`${r.name}’s entry was removed`);
        await renderEvent(event.id, { keepTab: true, quiet: true });
      } catch (err) {
        toast(err.message, { error: true });
      }
    }),
  );
  $(".people-fold")?.addEventListener("toggle", (e) => (current.peopleOpen = e.target.open));
  $(".host-card")?.addEventListener("toggle", (e) => (current.hostOpen = e.target.open));
  // host: what everyone may do
  $$("[data-perm]").forEach((box) =>
    box.addEventListener("change", async () => {
      const next = { ...perms, [box.dataset.perm]: box.checked };
      try {
        await api(`/events/${event.id}`, { method: "PATCH", body: { perms: next } });
        toast(box.checked ? "Everyone can do that now" : "Only you can do that now");
        await renderEvent(event.id, { keepTab: true, quiet: true });
      } catch (err) {
        box.checked = !box.checked;
        toast(err.message, { error: true });
      }
    }),
  );
  // host: how long the trip is
  $("[data-trip-days]")?.addEventListener("change", async (e) => {
    try {
      await api(`/events/${event.id}`, { method: "PATCH", body: { trip_days: Number(e.target.value) } });
      toast(`Now looking for the best ${e.target.selectedOptions[0].textContent.replace(/^1 /, "")}`);
      current.moreBest = false;
      await renderEvent(event.id, { keepTab: true, quiet: true });
    } catch (err) {
      toast(err.message, { error: true });
    }
  });
  // host: turn Places / Activities on or off
  $$("[data-section]").forEach((box) =>
    box.addEventListener("change", async () => {
      const next = { ...sec, [box.dataset.section]: box.checked };
      try {
        await api(`/events/${event.id}`, { method: "PATCH", body: { sections: next } });
        toast(`${box.dataset.section === "places" ? "Places" : "Activities"} ${box.checked ? "turned on" : "turned off"}`);
        await renderEvent(event.id, { keepTab: true, quiet: true });
      } catch (err) {
        box.checked = !box.checked;
        toast(err.message, { error: true });
      }
    }),
  );
  bindCalendar();
  bindQuickActions();
  // tap a name: the calendar shows only that person's days (tap again for everyone)
  $$("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      current.filter = current.filter === b.dataset.filter ? null : b.dataset.filter;
      $$("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.filter === current.filter)));
      if (current.tab !== "calendar") {
        current.tab = "calendar";
        $$('[data-seg="tabs"] button').forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.value === "calendar")));
        window.dispatchEvent(new Event("resize"));
      }
      exitSelectMode();
      renderTab();
      if (current.filter && innerWidth < 900) $("#tabBody")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    }),
  );
  $("#selClear").onclick = exitSelectMode;
  $("#selShow").onclick = () => current.selected.size && (tripLen() > 1 ? openCompareSheet() : openDaySheet([...current.selected].sort()));
  if ($("#selFinal")) $("#selFinal").onclick = () => current.selected.size && setFinalDates([...current.selected].sort());
  bindFinalTrip(event);
  renderTab();
}

function renderTab() {
  const body = $("#tabBody");
  if (!body) return;
  if (current.tab === "destinations") body.innerHTML = destinationsHtml();
  else if (current.tab === "activities") body.innerHTML = activitiesHtml();
  else {
    body.innerHTML = calendarHtml();
  }
}

function calendarHtml() {
  const { agg, event } = current;
  const { n, days } = agg;
  const today = todayStr();
  let maxScore = 0;
  for (const s of days.values()) maxScore = Math.max(maxScore, scoreOf(s, n));

  const L = tripLen();
  const best = bestWindows(L, 6);

  // LettuceMeet-style scale: one clearly different shade per number of people, pale -> deep
  const steps = n <= 6 ? n : 5;
  const legend = Array.from({ length: steps + 1 }, (_, k) => {
    const t = k / steps;
    const people = Math.round(t * n);
    return `<i style="--t:${t.toFixed(3)}" title="${people} of ${n}"></i>`;
  }).join("");

  const who = current.filter && current.responses.find((r) => r.id === current.filter);
  if (who) {
    const yes = new Set(who.yes || []);
    const maybe = new Set(who.maybe || []);
    return `
    <div class="filter-head card">
      ${avatar(who.name)}
      <div><b>${esc(who.name)}’s days</b><span>${yes.size} definitely · ${maybe.size} maybe</span></div>
      <button type="button" class="btn btn-tinted" id="showAll">Show everyone</button>
    </div>
    <div class="cal-toolbar"><div class="legend"><span class="swatch yes"></span>Definitely <span class="swatch maybe"></span>Maybe</div></div>
    ${monthsHtml(eventRange(event), (date) => (yes.has(date) ? { cls: "pyes", label: "definitely" } : maybe.has(date) ? { cls: "pmaybe", label: "maybe" } : {}))}`;
  }

  if (!n) {
    return `<div class="card empty"><div class="glyph">${icon("calendar")}</div><h3>No one has responded yet</h3><p>Be the first — add your availability, then share the link with the group.</p></div>
      <div class="section-title">${esc(fmtRange(eventRange(event).start, eventRange(event).end))}</div>
      ${monthsHtml(eventRange(event), () => ({}))}`;
  }

  const top = best[0];
  const lenWord = L === 1 ? "date" : L === 7 ? "week" : `${L} days`;
  const when = (w) => (L === 1 ? fmtDate(w.start, { weekday: "long", day: "numeric", month: "long" }) : fmtRunLong({ start: w.start, end: w.end }));
  return `
    ${
      top
        ? `<div class="card verdict${current.moreBest ? " open" : ""}">
        <div class="verdict-label">${icon("plane")} Best ${lenWord} so far</div>
        <button type="button" class="verdict-toggle" id="moreBest" aria-expanded="${!!current.moreBest}" aria-controls="bestList" ${best.length > 1 ? "" : "disabled"}>
          <span class="verdict-date">${esc(when(top))}</span>
          ${best.length > 1 ? `<span class="verdict-chev" aria-hidden="true">${CHEVRON}</span>` : ""}
        </button>
        <div class="verdict-sub"><b>${top.yes + top.maybe} of ${n}</b> can make ${L === 1 ? "it" : `all ${L} days`} · ${top.yes} definitely</div>
        <div class="verdict-actions">
          <button class="btn btn-tinted" data-best="${top.dates.join(",")}">See who’s in</button>
          ${best.length > 1 ? `<button type="button" class="btn btn-plain" data-more-best>${current.moreBest ? "Fewer options" : `More options (${best.length - 1})`}</button>` : ""}
        </div>
        ${
          best.length > 1
            ? `<ol class="best-list" id="bestList" ${current.moreBest ? "" : "hidden"}>${best
                .slice(1)
                .map((w, i) => {
                  const can = w.yes + w.maybe;
                  return `<li><button type="button" class="best-row" data-best="${w.dates.join(",")}">
                    <span class="best-rank">${i + 2}</span>
                    <span class="best-main"><b>${esc(when(w))}</b><span>${can} of ${n} can make ${L === 1 ? "it" : "all of it"} · ${w.yes} definitely</span></span>
                    <span class="best-bar" aria-hidden="true"><i style="width:${Math.round((can / n) * 100)}%"></i></span>
                  </button></li>`;
                })
                .join("")}</ol>`
            : ""
        }
      </div>`
        : `<div class="card verdict none">
        <div class="verdict-label">${icon("plane")} Best ${lenWord} so far</div>
        <p class="verdict-sub">Nobody can make ${L === 7 ? "a whole week" : `${L} days in a row`} yet. Ask people to add more days${current.host ? ", or pick a shorter trip in Host settings" : ""}. You can still tap any day to see who’s free.</p>
      </div>`
    }
    <div class="cal-toolbar">
      <div class="legend"><span>0/${n}</span><span class="legend-scale">${legend}</span><span>${n}/${n} available</span></div>
      <button class="btn btn-tinted" id="selectToggle">${icon("grid").replace("<svg", '<svg width="16" height="16"')} ${L === 1 ? "Compare dates" : `Compare ${lenWord}`}</button>
    </div>
    ${monthsHtml(eventRange(event), (date) => {
      const s = days.get(date);
      const fin = event.final?.dates?.includes(date) ? " final" : "";
      if (!s) return fin ? { cls: fin.trim(), label: "final date" } : {};
      const score = scoreOf(s, n); // yes = 1, maybe = 0.5, divided by everyone who responded
      return {
        cls: `heat${score > 0.55 ? " strong" : ""}${score === maxScore && score > 0 ? " max" : ""}${fin}`,
        style: `--t:${score.toFixed(3)}`,
        label: `${s.yes.length} yes, ${s.maybe.length} maybe of ${n}`,
      };
    })}
  `;
}

function bindCalendar() {
  const body = $("#tabBody");
  body.addEventListener("click", (e) => {
    const best = e.target.closest("[data-best]");
    if (best) return openDaySheet(best.dataset.best.split(","));
    if (e.target.closest("[data-goto-places]")) {
      $('[data-seg="tabs"] [data-value="destinations"]')?.click();
      setTimeout(() => $('[data-form="place"] input')?.focus(), 50);
      return;
    }
    if (e.target.closest("#moreBest, [data-more-best]")) {
      current.moreBest = !current.moreBest;
      $(".verdict")?.classList.toggle("open", current.moreBest);
      $("#bestList")?.toggleAttribute("hidden", !current.moreBest);
      $("#moreBest")?.setAttribute("aria-expanded", String(current.moreBest));
      const more = $("[data-more-best]");
      if (more) more.textContent = current.moreBest ? "Fewer dates" : `More dates (${$$("#bestList li").length})`;
      return;
    }
    if (e.target.closest("#showAll")) {
      current.filter = null;
      $$("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", "false"));
      return renderTab();
    }
    if (e.target.closest("#selectToggle")) {
      current.selectMode ? exitSelectMode() : enterSelectMode();
      return;
    }
    const cell = e.target.closest(".day[data-date]");
    if (!cell) return;
    const date = cell.dataset.date;
    const L = tripLen();
    if (current.selectMode) {
      // with a trip length, a tap picks the whole stretch that starts on that day
      current.selected.has(date) ? current.selected.delete(date) : current.selected.add(date);
      paintSelection();
      updateSelectBar();
    } else {
      openDaySheet([date], { stretchFrom: L > 1 ? date : null });
    }
  });
}

/* ---- Trip length: the best-dates search looks for this many days in a row ---- */
const tripLen = () => Math.max(1, Math.min(14, Number(current?.event?.trip_days) || 1));
/** The L days starting at date, cut at the end of the event's range. */
function windowFrom(date, L) {
  const end = eventRange(current.event).end;
  const out = [];
  for (let i = 0, d = date; i < L && d <= end; i++, d = addDays(d, 1)) out.push(d);
  return out;
}
/** Who can make every day of these dates: definitely (all yes), maybe (yes or maybe on all), can't. */
function whoCanMake(dates) {
  let yes = 0;
  let maybe = 0;
  for (const r of current.responses) {
    const ys = new Set(r.yes);
    const ms = new Set(r.maybe);
    if (dates.every((d) => ys.has(d))) yes += 1;
    else if (dates.every((d) => ys.has(d) || ms.has(d))) maybe += 1;
  }
  return { yes, maybe };
}
/** The best stretches of L days in a row (not overlapping), best first. */
function bestWindows(L, limit = 6) {
  const { event, agg } = current;
  const n = agg.n;
  if (!n) return [];
  const range = eventRange(event);
  const today = todayStr();
  const out = [];
  for (let d = range.start > today ? range.start : today; addDays(d, L - 1) <= range.end; d = addDays(d, 1)) {
    const dates = windowFrom(d, L);
    const c = whoCanMake(dates);
    if (!c.yes && !c.maybe) continue;
    out.push({ start: d, end: dates[dates.length - 1], dates, ...c, score: c.yes + c.maybe * 0.5 });
  }
  out.sort((a, b) => b.score - a.score || b.yes - a.yes || a.start.localeCompare(b.start));
  const picked = [];
  for (const w of out) {
    if (picked.some((p) => !(w.end < p.start || w.start > p.end))) continue; // no overlapping options
    picked.push(w);
    if (picked.length >= limit) break;
  }
  return picked;
}
/** Compare mode: highlight what's picked (whole stretches when the trip is longer than a day). */
function paintSelection() {
  const L = tripLen();
  const on = new Set();
  for (const d of current.selected) for (const x of windowFrom(d, L)) on.add(x);
  $$("#tabBody .day[data-date]").forEach((el) => el.classList.toggle("selected", on.has(el.dataset.date)));
}
/** Compare several stretches side by side. */
function openCompareSheet() {
  const L = tripLen();
  const n = current.responses.length;
  const rows = [...current.selected]
    .sort()
    .map((d) => {
      const dates = windowFrom(d, L);
      return { dates, ...whoCanMake(dates) };
    })
    .sort((a, b) => b.yes + b.maybe * 0.5 - (a.yes + a.maybe * 0.5));
  openSheet(`
    <div class="sheet-head"><div><h2>Compare ${L === 7 ? "weeks" : `${L}-day options`}</h2><div class="sheet-sub">Who can make every day of each option</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
    <div class="cmp-list">${rows
      .map(
        (r, i) => `<div class="cmp-row${i === 0 ? " top" : ""}">
          <div class="cmp-main"><b>${esc(fmtRunLong({ start: r.dates[0], end: r.dates[r.dates.length - 1] }))}</b>
          <span><b>${r.yes + r.maybe} of ${n}</b> can make it · ${r.yes} definitely · ${r.maybe} maybe</span>
          <span class="best-bar" aria-hidden="true"><i style="width:${n ? Math.round(((r.yes + r.maybe) / n) * 100) : 0}%"></i></span></div>
          <div class="cmp-actions"><button type="button" class="btn btn-tinted" data-cmp-who="${r.dates.join(",")}">Who</button><button type="button" class="btn btn-primary" data-cmp-final="${r.dates.join(",")}">Save these dates</button></div>
        </div>`,
      )
      .join("")}</div>`);
  $$("[data-cmp-who]").forEach((b) => b.addEventListener("click", () => openDaySheet(b.dataset.cmpWho.split(","))));
  $$("[data-cmp-final]").forEach((b) =>
    b.addEventListener("click", () => {
      closeSheet();
      setFinalDates(b.dataset.cmpFinal.split(","));
    }),
  );
}

function enterSelectMode() {
  current.selectMode = true;
  const t = $("#selectToggle");
  if (t) t.innerHTML = `${icon("x").replace("<svg", '<svg width="16" height="16"')} Done`;
  toast(tripLen() > 1 ? `Tap the first day of each ${tripLen() === 7 ? "week" : `${tripLen()}-day option`} to compare` : "Tap the days you want to compare");
  updateSelectBar();
}
function exitSelectMode() {
  if (!current) return;
  current.selectMode = false;
  current.selected.clear();
  $$(".day.selected").forEach((d) => d.classList.remove("selected"));
  const t = $("#selectToggle");
  if (t) t.innerHTML = `${icon("grid").replace("<svg", '<svg width="16" height="16"')} Compare dates`;
  updateSelectBar();
}
function updateSelectBar() {
  const bar = $("#selectBar");
  if (!bar) return;
  const n = current.selected.size;
  const L = tripLen();
  $("#selCount").textContent = L > 1 ? `${n} ${n === 1 ? "option" : "options"}` : `${n} ${n === 1 ? "day" : "days"}`;
  if ($("#selShow")) $("#selShow").textContent = L > 1 ? "Compare" : "Who’s free?";
  if ($("#selFinal")) $("#selFinal").hidden = L > 1;
  bar.classList.toggle("show", current.selectMode && n > 0);
  document.body.classList.toggle("selecting", current.selectMode);
}

function openDaySheet(dates, { stretchFrom = null, showStretch = false } = {}) {
  const L = tripLen();
  // tapping a day shows that day's people; with a trip length you can switch to the stretch that starts there
  if (stretchFrom && showStretch) dates = windowFrom(stretchFrom, L);
  const { responses } = current;
  const yes = [];
  const maybe = [];
  const no = [];
  for (const r of responses) {
    const ys = new Set(r.yes);
    const ms = new Set(r.maybe);
    if (dates.every((d) => ys.has(d))) yes.push(r.name);
    else if (dates.every((d) => ys.has(d) || ms.has(d))) maybe.push(r.name);
    else no.push(r.name);
  }
  const contiguous = dates.length > 1 && dateRuns(dates).length === 1;
  const title =
    dates.length === 1
      ? fmtDate(dates[0], { weekday: "long", month: "long", day: "numeric" })
      : contiguous
        ? fmtRunLong({ start: dates[0], end: dates[dates.length - 1] })
        : `${dates.length} days selected`;
  const sub =
    dates.length === 1
      ? dates[0].slice(0, 4)
      : contiguous
        ? `${dates.length} days in a row · counts people free on all of them`
        : `${fmtDate(dates[0], { month: "short", day: "numeric" })} – ${fmtDate(dates[dates.length - 1], { month: "short", day: "numeric" })} · counts people free on all of them`;

  const section = (label, names, sw) =>
    names.length
      ? `<h4><span class="swatch ${sw}"></span>${label} · ${names.length}</h4>${names.map((n) => `<div class="name-chip">${avatar(n, "sm")} ${esc(n)}</div>`).join("")}`
      : "";

  openSheet(`
    <div class="sheet-head"><div><h2>${esc(title)}</h2><div class="sheet-sub">${esc(sub)}</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
    ${
      stretchFrom
        ? `<div class="segmented sheet-seg" role="group" aria-label="Show" data-seg="span">
        <span class="thumb"></span>
        <button type="button" data-value="day" aria-pressed="${!showStretch}">${esc(fmtDate(stretchFrom, { weekday: "short", day: "numeric", month: "short" }))}</button>
        <button type="button" data-value="stretch" aria-pressed="${showStretch}">${L === 7 ? "The week" : `${L} days`} from here</button>
      </div>`
        : ""
    }
    <div class="tally">
      <div class="t-yes"><b>${yes.length}</b><span>Definitely</span></div>
      <div class="t-maybe"><b>${maybe.length}</b><span>Maybe</span></div>
      <div class="t-no"><b>${no.length}</b><span>Can’t</span></div>
    </div>
    <div class="name-list">
      ${section("Definitely", yes, "yes")}
      ${section("Maybe", maybe, "maybe")}
      ${section("Can’t make it", no, "erase")}
      ${responses.length ? "" : '<p class="sheet-sub">No responses yet.</p>'}
    </div>
    ${
      current.canSave
        ? `<div class="sheet-final"><button type="button" class="btn btn-tinted btn-block" id="sheetFinal">${icon("check")} ${
            dates.length === 1 ? "Save this date" : `Save ${contiguous ? `these ${dates.length} days` : "these dates"}`
          }</button><p class="sheet-sub">Saving shows it to everyone, ready to add to their calendar. It goes in the change log.</p></div>`
        : ""
    }
  `);
  $("#sheetFinal")?.addEventListener("click", () => {
    closeSheet();
    setFinalDates(dates);
  });
  const seg = $('[data-seg="span"]');
  if (seg)
    setupSegmented(seg, (v) => {
      // swap the sheet's content in place
      const wantStretch = v === "stretch";
      closeSheet(true);
      openDaySheet([stretchFrom], { stretchFrom, showStretch: wantStretch });
    });
}

const TRIP_LENGTHS = [
  [1, "1 day"],
  [2, "2 days"],
  [3, "3 days"],
  [4, "4 days"],
  [5, "5 days"],
  [7, "1 week"],
  [10, "10 days"],
  [14, "2 weeks"],
];

/** The change log: who removed whose entry, who saved or unsaved the dates. */
function changeLogHtml(log, fmtWhat = (e) => (e.dates?.length ? dateRuns(e.dates).map(fmtRunLong).join(", ") : "")) {
  if (!log.length) return "";
  const line = (e) => {
    const who = `<b>${esc(e.by)}</b>`;
    if (e.action === "delete") return `${who} removed <b>${esc(e.who)}</b>’s entry`;
    if (e.action === "final") return `${who} saved ${esc(fmtWhat(e))}`;
    if (e.action === "unfinal") return `${who} unsaved ${esc(fmtWhat(e) || "the date")}`;
    return who;
  };
  const items = log.slice(0, 20);
  return `<details class="card changelog"${items.length <= 3 ? " open" : ""}>
    <summary><span>Change log</span><small>${log.length} ${log.length === 1 ? "change" : "changes"}</small></summary>
    <ul>${items.map((e) => `<li><span>${line(e)}</span><time datetime="${new Date(e.at).toISOString()}">${esc(ago(e.at))}</time></li>`).join("")}</ul>
  </details>`;
}

/* ---- The decided date(s) ---- */
function finalTripHtml(event, host) {
  const f = event.final;
  if (!f?.dates?.length) return "";
  const runs = dateRuns(f.dates);
  const n = f.dates.length;
  // how many people said yes / maybe to every final day
  let all = 0;
  let some = 0;
  for (const r of current.responses) {
    const ys = new Set(r.yes);
    const ms = new Set(r.maybe);
    if (f.dates.every((d) => ys.has(d))) all += 1;
    else if (f.dates.every((d) => ys.has(d) || ms.has(d))) some += 1;
  }
  return `<div class="card final-card" id="finalCard">
    <div class="final-label">${icon("check")} It’s decided</div>
    <div class="final-when">${runs.map((r) => `<span>${esc(fmtRunLong(r))}</span>`).join("")}</div>
    <div class="final-sub">${n} ${n === 1 ? "day" : "days"} · ${all} definitely${some ? ` · ${some} maybe` : ""}</div>
    <div class="final-actions">
      <button type="button" class="btn btn-primary" data-final-ics>${icon("calendar")} Add to calendar</button>
      ${current.canSave ? '<button type="button" class="btn btn-plain" data-final-clear>Unsave these dates</button>' : ""}
    </div>
  </div>`;
}
function tripCalItems(event) {
  const url = `${location.origin}/e/${event.id}`;
  return dateRuns(event.final.dates).map((r) => ({ title: event.title, details: event.description || "Planned with Wingman", url, allDay: r }));
}
function bindFinalTrip(event) {
  const card = $("#finalCard");
  if (!card) return;
  const items = tripCalItems(event);
  card.querySelector("[data-final-ics]").addEventListener("click", () => openAddToCalendar(event.title, items));
  card.querySelector("[data-final-clear]")?.addEventListener("click", async () => {
    if (!confirm("Unsave these dates? Everyone will see the group’s calendar again. This goes in the change log.")) return;
    const by = await actorName();
    if (!by) return;
    try {
      await api(`/events/${event.id}`, { method: "PATCH", body: { final: null, by } });
      toast("The dates were unsaved");
      await renderEvent(event.id, { keepTab: true, quiet: true });
    } catch (err) {
      toast(err.message, { error: true });
    }
  });
}
async function setFinalDates(dates) {
  const event = current.event;
  const by = await actorName();
  if (!by) return;
  try {
    await api(`/events/${event.id}`, { method: "PATCH", body: { final: { dates }, by } });
    exitSelectMode();
    toast(dates.length === 1 ? "Date saved — everyone can see it" : "Dates saved — everyone can see them");
    buzz([15, 60, 15]);
    await renderEvent(event.id, { keepTab: true, quiet: true });
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  } catch (err) {
    toast(err.message, { error: true });
  }
}

/** The response saved from this device for the current event, if any. */
function myCurrentResponse() {
  const mine = store.get(`convene:resp:${current.event.id}`);
  const r = mine && current.responses.find((x) => x.id === mine.id);
  return r ? { mine, r } : null;
}

function destinationsHtml() {
  const { destinations, n } = current.agg;
  const me = myCurrentResponse();
  const myPlaces = new Set((me?.r.destinations || []).map((d) => d.toLowerCase()));
  const addForm = `<form class="add-row quick-add" data-form="place"><input name="place" maxlength="60" placeholder="Suggest a place…" enterkeyhint="send" aria-label="Suggest a place" /><button class="btn btn-secondary" type="submit">${icon("plus")} Add</button></form>`;
  if (!destinations.length)
    return `${addForm}<div class="card empty"><div class="glyph">${icon("pin")}</div><h3>No places yet</h3><p>Suggest the first one above.</p></div>`;
  const top = destinations[0].voters.length;
  return `${addForm}<div class="card place-list">${destinations
    .map((d, i) => {
      const acts = current.agg.activities.filter((a) => a.destination && a.destination.toLowerCase() === d.name.toLowerCase()).length;
      const voted = myPlaces.has(d.name.toLowerCase());
      return `<div class="place-row">
        <span class="place-rank${i === 0 ? " first" : ""}">${i + 1}</span>
        <div class="place-main">
          <b>${esc(d.name)}</b>
          <span>${esc(d.voters.join(", "))}${acts ? ` · ${acts} ${acts === 1 ? "activity" : "activities"}` : ""}</span>
          <span class="place-bar"><i style="width:${Math.max(4, (d.voters.length / Math.max(top, n || 1)) * 100)}%"></i></span>
        </div>
        <button type="button" class="like-btn vote-btn" data-vote="${esc(d.name)}" aria-pressed="${voted}" aria-label="${voted ? "Remove your vote for" : "Vote for"} ${esc(d.name)}">${icon(voted ? "check" : "thumb")} ${d.voters.length}</button>
      </div>`;
    })
    .join("")}</div>`;
}

function activityRow(a, { likeable = false, liked = false } = {}) {
  return `<div class="activity">
    ${avatar(a.by, "sm")}
    <div class="body">
      <div class="title">${esc(a.title)}</div>
      <div class="meta"><span>by ${esc(a.by)}</span>${
        a.link
          ? `<a class="linkchip" href="${esc(a.link)}" target="_blank" rel="noopener noreferrer nofollow">${icon("arrow")}${esc(domainOf(a.link))}</a>`
          : ""
      }${a.likes.length ? `<span>· liked by ${esc(a.likes.join(", "))}</span>` : ""}</div>
    </div>
    ${
      likeable
        ? `<button type="button" class="like-btn" data-like="${esc(a.id)}" aria-pressed="${liked}">${icon("thumb")} ${a.likes.length + (liked ? 1 : 0) || ""}</button>`
        : a.likes.length
          ? `<span class="like-count">${icon("thumb")} ${a.likes.length}</span>`
          : ""
    }
  </div>`;
}

/** Activity row on the event page: like other people’s ideas, remove your own. */
function eventActivityRow(a, me) {
  const own = me && a.byId === me.r.id;
  const liked = !!me && (me.r.likes || []).includes(a.id);
  const control = own
    ? `<button type="button" class="remove" data-remove-act="${esc(a.id)}" aria-label="Remove ${esc(a.title)}">${icon("x")}</button>`
    : `<button type="button" class="like-btn" data-like-act="${esc(a.id)}" aria-pressed="${liked}">${icon("thumb")} ${a.likes.length || ""}</button>`;
  return `<div class="activity">
    ${avatar(a.by, "sm")}
    <div class="body">
      <div class="title">${esc(a.title)}</div>
      <div class="meta"><span>by ${esc(a.by)}</span>${
        a.link ? `<a class="linkchip" href="${esc(a.link)}" target="_blank" rel="noopener noreferrer nofollow">${icon("arrow")}${esc(domainOf(a.link))}</a>` : ""
      }${a.likes.length ? `<span>· liked by ${esc(a.likes.join(", "))}</span>` : ""}</div>
    </div>
    ${control}
  </div>`;
}

function groupActivities(activities, destinationOrder) {
  const groups = new Map();
  for (const a of activities) {
    const key = a.destination ? a.destination.toLowerCase() : "";
    if (!groups.has(key)) groups.set(key, { name: a.destination || "General", items: [] });
    groups.get(key).items.push(a);
  }
  const order = destinationOrder.map((d) => d.toLowerCase());
  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === "") return 1;
      if (b === "") return -1;
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    })
    .map(([, g]) => g);
}

function activitiesHtml() {
  const { activities, destinations } = current.agg;
  const me = myCurrentResponse();
  const form = `<form class="card pad quick-act" data-form="activity">
      <div class="form-grid">
        <input class="field full" name="title" maxlength="100" placeholder="Add an activity — e.g. Sunset kayak tour" aria-label="Activity" />
        <input class="field" name="link" maxlength="500" inputmode="url" placeholder="Paste a link (optional)" aria-label="Link" />
        <select class="field" name="destination" aria-label="Destination">
          <option value="">General — anywhere</option>
          ${destinations.map((d) => `<option value="${esc(d.name)}">${esc(d.name)}</option>`).join("")}
        </select>
        <button class="btn btn-primary full" type="submit">${icon("plus")} Add activity</button>
      </div>
      <p class="form-hint">The places in this list are the ones suggested under Places. Missing one? <button type="button" class="btn-link" data-goto-places>Suggest a place</button></p>
    </form>`;
  if (!activities.length)
    return `${form}<div class="card empty"><div class="glyph">${icon("sparkles")}</div><h3>No activities yet</h3><p>Add the first idea above — links welcome.</p></div>`;
  return (
    form +
    groupActivities(
      activities,
      destinations.map((d) => d.name),
    )
      .map(
        (g) => `<div class="activity-group"><h3>${icon(g.name === "General" ? "sparkles" : "pin").replace("<svg", '<svg width="16" height="16"')} ${esc(g.name)}</h3>
      <div class="card group">${g.items.map((a) => eventActivityRow(a, me)).join("")}</div></div>`,
      )
      .join("")
  );
}

/** Asks for a name in a small sheet (first quick vote from this device). Resolves null if dismissed. */
/** Your name for the change log: the one this device remembers, or asked once. */
async function actorName() {
  const known = store.get("convene:name", "");
  if (known) return known;
  const name = await askName();
  if (name) store.set("convene:name", name);
  return name;
}

function askName() {
  return new Promise((resolve) => {
    openSheet(
      `<div class="sheet-head"><div><h2>What’s your name?</h2><div class="sheet-sub">So the group knows who voted. No account needed.</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
       <form class="stack" data-form="name"><input class="big-input" name="name" maxlength="40" placeholder="Your name" autocomplete="given-name" value="${esc(store.get("convene:name", ""))}" />
       <button class="btn btn-primary btn-block" type="submit">Continue</button></form>`,
      { onClose: () => resolve(null) },
    );
    const wrap = $(".sheet-wrap");
    const input = $('input[name="name"]', wrap);
    setTimeout(() => input.focus(), 300);
    $('[data-form="name"]', wrap).addEventListener("submit", (e) => {
      e.preventDefault();
      const name = input.value.trim().replace(/\s+/g, " ");
      if (!name) return input.focus();
      wrap.__onClose = null;
      closeSheet();
      resolve(name);
    });
  });
}

/**
 * Changes your saved response in place (vote, like, add) without going through the whole flow.
 * Uses your existing response from this device, or creates one with just a name.
 */
let quickBusy = false;
async function quickSave(mutate, { after } = {}) {
  if (quickBusy) return;
  quickBusy = true;
  try {
    const { event } = current;
    const me = myCurrentResponse();
    let draft = me
      ? { name: me.r.name, yes: [...me.r.yes], maybe: [...me.r.maybe], destinations: [...me.r.destinations], activities: me.r.activities.map((a) => ({ ...a })), likes: [...(me.r.likes || [])] }
      : null;
    if (!draft) {
      const name = await askName();
      if (!name) return;
      draft = { name, yes: [], maybe: [], destinations: [], activities: [], likes: [] };
    }
    if (mutate(draft) === false) return;
    const y = window.scrollY;
    if (me) await api(`/events/${event.id}/responses/${me.mine.id}`, { method: "PUT", body: { ...draft, token: me.mine.token } });
    else {
      const res = await api(`/events/${event.id}/responses`, { method: "POST", body: draft });
      store.set(`convene:resp:${event.id}`, res);
      store.set("convene:name", draft.name);
    }
    await renderEvent(event.id, { keepTab: true, quiet: true });
    window.scrollTo(0, y);
    buzz(12);
    after?.();
  } catch (err) {
    toast(err.message, { error: true });
  } finally {
    quickBusy = false;
  }
}

const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");

function bindQuickActions() {
  const body = $("#tabBody");
  body.addEventListener("click", (e) => {
    const vote = e.target.closest("[data-vote]");
    if (vote) {
      const name = vote.dataset.vote;
      vote.setAttribute("aria-pressed", String(vote.getAttribute("aria-pressed") !== "true")); // instant feedback
      const wasTop = current.agg.destinations[0]?.name.toLowerCase() === name.toLowerCase();
      let added = false;
      return quickSave(
        (d) => {
          const i = d.destinations.findIndex((x) => x.toLowerCase() === name.toLowerCase());
          if (i >= 0) d.destinations.splice(i, 1);
          else if (d.destinations.length >= 10) return void toast("You can pick up to 10 places", { error: true }) ?? false;
          else (d.destinations.push(name), (added = true));
        },
        {
          after: () => {
            const btn = $$("[data-vote]").find((b) => b.dataset.vote.toLowerCase() === name.toLowerCase());
            btn?.closest(".board-item")?.querySelector(".votes")?.classList.add("bump");
            const nowTop = current.agg.destinations[0]?.name.toLowerCase() === name.toLowerCase();
            if (added && nowTop && !wasTop) {
              toast(`${name} just took the lead`);
              buzz([15, 60, 15]);
            }
          },
        },
      );
    }
    const like = e.target.closest("[data-like-act]");
    if (like) {
      const id = like.dataset.likeAct;
      like.setAttribute("aria-pressed", String(like.getAttribute("aria-pressed") !== "true"));
      return quickSave((d) => {
        d.likes = d.likes.includes(id) ? d.likes.filter((x) => x !== id) : [...d.likes, id];
      });
    }
    const rm = e.target.closest("[data-remove-act]");
    if (rm) {
      const id = rm.dataset.removeAct;
      return quickSave((d) => {
        d.activities = d.activities.filter((a) => a.id !== id);
      });
    }
  });
  body.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-form]");
    if (!form) return;
    e.preventDefault();
    if (form.dataset.form === "place") {
      const v = form.place.value.trim().replace(/\s+/g, " ").slice(0, 60);
      if (!v) return form.place.focus();
      const existing = current.agg.destinations.find((d) => d.name.toLowerCase() === v.toLowerCase());
      return quickSave((d) => {
        if (d.destinations.some((x) => x.toLowerCase() === v.toLowerCase())) return void toast("You already voted for that place") ?? false;
        if (d.destinations.length >= 10) return void toast("You can pick up to 10 places", { error: true }) ?? false;
        d.destinations.push(existing ? existing.name : v);
      });
    }
    if (form.dataset.form === "activity") {
      const title = form.title.value.trim();
      if (!title) return form.title.focus();
      let link = form.link.value.trim();
      if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
      if (link) {
        try {
          new URL(link);
        } catch {
          return toast("That link doesn’t look right", { error: true });
        }
      }
      const destination = form.destination.value;
      return quickSave((d) => {
        if (d.activities.length >= 15) return void toast("You can add up to 15 activities", { error: true }) ?? false;
        d.activities.push({ id: newId(), title, link, destination });
      });
    }
  });
}

/** Shown in the event’s last 7 days. */
function expiryNotice(event) {
  if (!event.delete_at) return "";
  const days = Math.ceil((event.delete_at - Date.now()) / 86_400_000);
  if (days > 7) return "";
  const when = new Date(event.delete_at).toLocaleDateString(undefined, { month: "long", day: "numeric" });
  return `<p class="expiry-note">${icon("lock")}<span>This event will be deleted on <b>${esc(when)}</b>${days <= 1 ? " (tomorrow)" : ""}, one month after its last date.</span></p>`;
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

function openSheet(html, { onClose } = {}) {
  closeSheet(true);
  const wrap = document.createElement("div");
  wrap.className = "sheet-wrap";
  wrap.__onClose = onClose || null;
  wrap.innerHTML = `<div class="sheet-scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`;
  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add("open")));
  wrap.addEventListener("click", (e) => e.target.closest("[data-close]") && closeSheet());

  // swipe down to dismiss
  const sheet = $(".sheet", wrap);
  let startY = null;
  sheet.addEventListener("touchstart", (e) => {
    if (sheet.scrollTop <= 0) startY = e.touches[0].clientY;
  }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    if (startY == null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      sheet.style.transition = "none";
      sheet.style.transform = `translateY(${dy}px)`;
    }
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    if (startY == null) return;
    const dy = e.changedTouches[0].clientY - startY;
    sheet.style.transition = "";
    sheet.style.transform = "";
    startY = null;
    if (dy > 110) closeSheet();
  });
}

function closeSheet(immediate = false) {
  const wrap = $(".sheet-wrap");
  if (!wrap) return;
  const cb = wrap.__onClose;
  wrap.__onClose = null;
  cb?.();
  if (!$(".flow")) document.body.style.overflow = "";
  if (immediate) return wrap.remove();
  wrap.classList.remove("open");
  setTimeout(() => wrap.remove(), 350);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSheet();
});

/* ------------------------------------------------------------------ */
/* Guided flow: add / edit availability                                */
/* ------------------------------------------------------------------ */

/** The answer flow's steps: Places and Activities only when the host turned them on. The last step submits. */
const flowSteps = (event) => {
  const sec = event.sections || { places: true, activities: true };
  return ["name", "dates", ...(sec.places ? ["destinations"] : []), ...(sec.activities ? ["activities"] : [])];
};

let flowProbed = false;
function openFlow({ edit = null } = {}) {
  if (!flowProbed) {
    flowProbed = true;
    setTimeout(probeFlow, 120); // the flow is the most animated screen
  }
  const { event, responses } = current;
  const STEPS = flowSteps(event);
  const stepLabel = (step) => `Step ${STEPS.indexOf(step) + 1} of ${STEPS.length}`;
  const others = aggregate(responses, { excludeId: edit?.id });
  const r = edit?.response;
  const st = {
    step: 0,
    name: r?.name || store.get("convene:name", ""),
    yes: new Set(r?.yes || []),
    maybe: new Set(r?.maybe || []),
    destinations: [...(r?.destinations || [])],
    activities: (r?.activities || []).map((a) => ({ ...a })),
    likes: new Set(r?.likes || []),
    mode: "yes",
    submitting: false,
  };

  const flow = document.createElement("div");
  flow.className = "flow";
  flow.setAttribute("role", "dialog");
  flow.setAttribute("aria-modal", "true");
  flow.innerHTML = `
    <div class="flow-top">
      <button class="btn btn-plain" data-act="cancel">Cancel</button>
      <div class="progress">${STEPS.map(() => "<i></i>").join("")}</div>
      <span></span>
    </div>
    <div class="flow-body"><div class="flow-step"></div></div>
    <div class="flow-bottom"><div class="inner"><button class="btn flow-back" data-act="back">‹ Back</button><span class="status"></span><button class="btn btn-primary" data-act="next">Continue</button></div></div>`;
  document.body.appendChild(flow);
  document.body.style.overflow = "hidden";

  const body = $(".flow-body", flow);
  const statusEl = $(".status", flow);
  const nextBtn = $('[data-act="next"]', flow);
  const backBtn = $('[data-act="back"]', flow);
  const cancelBtn = $('[data-act="cancel"]', flow);

  const close = () => {
    flow.classList.add("closing");
    setTimeout(() => {
      flow.remove();
      document.body.style.overflow = "";
    }, perf.lite ? 180 : 330);
  };

  const allDestNames = () => {
    const seen = new Map();
    for (const d of others.destinations) seen.set(d.name.toLowerCase(), d.name);
    for (const d of st.destinations) if (!seen.has(d.toLowerCase())) seen.set(d.toLowerCase(), d);
    return [...seen.values()];
  };

  function updateChrome() {
    $$(".progress i", flow).forEach((el, i) => el.classList.toggle("done", i <= st.step));
    backBtn.hidden = st.step === 0;
    const step = STEPS[st.step];
    const last = st.step === STEPS.length - 1;
    nextBtn.disabled = false;
    if (step === "name") {
      nextBtn.textContent = "Continue";
      nextBtn.disabled = !st.name.trim();
      statusEl.textContent = "";
    } else if (step === "dates") {
      nextBtn.textContent = "Continue";
      statusEl.innerHTML = `<b style="color:var(--yes)">${st.yes.size}</b> definitely · <b style="color:var(--accent)">${st.maybe.size}</b> maybe`;
    } else if (step === "destinations") {
      nextBtn.textContent = st.destinations.length ? "Continue" : "Skip";
      statusEl.textContent = st.destinations.length ? `${st.destinations.length} picked` : "";
    } else if (step === "activities") {
      statusEl.textContent = st.activities.length ? `${st.activities.length} added` : "";
    }
    if (last) {
      // the last step sends it: no separate "looking good" screen
      nextBtn.textContent = st.submitting ? "Sending…" : edit ? "Save changes" : "Submit";
      nextBtn.disabled = st.submitting || (step === "name" && !st.name.trim());
    }
  }

  function show(direction = 1) {
    const old = $(".flow-step", body);
    const render = () => {
      const step = STEPS[st.step];
      const el = document.createElement("div");
      el.className = `flow-step enter${direction < 0 ? " back" : ""}`;
      el.innerHTML = stepHtml(step);
      body.innerHTML = "";
      body.appendChild(el);
      body.scrollTop = 0;
      bindStep(step, el);
      updateChrome();
    };
    if (old && old.innerHTML) {
      old.classList.remove("enter");
      old.classList.add("leave");
      setTimeout(render, perf.lite ? 110 : 240);
    } else render();
  }

  function stepHtml(step) {
    if (step === "name")
      return `
        <div class="eyebrow">${esc(event.title)}</div>
        <h2 class="flow-title">${animatedTitle(edit ? "Welcome *back.*" : "Hi there! What’s your *name?*")}</h2>
        <p class="flow-lead">This is how the group will see you. No account, no password.</p>
        <input class="big-input" id="nameInput" maxlength="40" placeholder="Your name" autocomplete="given-name" enterkeyhint="next" value="${esc(st.name)}" />
      `;
    if (step === "dates")
      return `
        <div class="eyebrow">${stepLabel("dates")}</div>
        <h2 class="flow-title">${animatedTitle(`When are you *free,* ${st.name.split(" ")[0]}?`)}</h2>
        <p class="flow-lead">Open the calendar and tap the days that work. Dark blue means you’re definitely in, light blue means maybe.</p>
        <button type="button" class="card date-launcher" id="openDays">
          <span class="feature-icon">${icon("calendar")}</span>
          <span class="dl-text"><b>Choose your days</b><span>${esc(fmtRange(eventRange(event).start, eventRange(event).end))}</span></span>
          <span class="dl-chev" aria-hidden="true">›</span>
        </button>
        <div class="day-summary" id="daySummary"></div>
      `;
    if (step === "destinations") {
      const names = allDestNames();
      const chosen = new Set(st.destinations.map((d) => d.toLowerCase()));
      return `
        <div class="eyebrow">${stepLabel("destinations")}</div>
        <h2 class="flow-title">${animatedTitle("Where should we *go?*")}</h2>
        <p class="flow-lead">${others.destinations.length ? "Here’s what the group has suggested so far. Tap the ones you’d love — or add your own." : "You’re the first to suggest a place. Add as many as you like."}</p>
        <div class="add-row"><input id="destInput" maxlength="60" placeholder="City, country, place…" enterkeyhint="done" /><button class="btn btn-secondary" id="destAdd" type="button">${icon("plus")} Add</button></div>
        ${names.length ? `<div class="preview-label">${icon("trophy").replace("<svg", '<svg width="16" height="16"')} Suggested places</div>` : ""}
        <div class="chips" id="destChips">${names
          .map((n, i) => {
            const o = others.destinations.find((d) => d.name.toLowerCase() === n.toLowerCase());
            const on = chosen.has(n.toLowerCase());
            const count = (o ? o.voters.length : 0) + (on ? 1 : 0);
            return `<button type="button" class="chip" style="--i:${i}" data-dest="${esc(n)}" aria-pressed="${on}">${icon(on ? "check" : "pin")}${esc(n)}<span class="count">${count}</span></button>`;
          })
          .join("")}</div>
      `;
    }
    if (step === "activities") {
      const dests = allDestNames();
      const othersActs = others.activities;
      return `
        <div class="eyebrow">${stepLabel("activities")}</div>
        <h2 class="flow-title">${animatedTitle("What should we *do* there?")}</h2>
        <p class="flow-lead">Suggest activities and paste links — a hike, a museum, a restaurant, a festival.</p>
        <div class="card pad">
          <div class="form-grid">
            <input class="field full" id="actTitle" maxlength="100" placeholder="Activity — e.g. Sunset kayak tour" />
            <input class="field" id="actLink" maxlength="500" inputmode="url" placeholder="Paste a link (optional)" />
            <select class="field" id="actDest" aria-label="Destination">
              <option value="">General — anywhere</option>
              ${dests.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join("")}
            </select>
            <button class="btn btn-primary full" id="actAdd" type="button">${icon("plus")} Add activity</button>
          </div>
        </div>
        <div class="mine-list" id="myActs"></div>
        ${
          othersActs.length
            ? `<div class="preview-label">${icon("sparkles").replace("<svg", '<svg width="16" height="16"')} Ideas from the group</div>
          <div class="card group" id="otherActs">${othersActs.map((a) => activityRow(a, { likeable: true, liked: st.likes.has(a.id) })).join("")}</div>`
            : ""
        }
      `;
    }
    return "";
  }

  function bindStep(step, el) {
    if (step === "name") {
      const input = $("#nameInput", el);
      setTimeout(() => input.focus({ preventScroll: true }), 450);
      input.addEventListener("input", () => {
        st.name = input.value;
        updateChrome();
      });
      input.addEventListener("keydown", (e) => e.key === "Enter" && st.name.trim() && next());
    }
    if (step === "dates") {
      const launcher = $("#openDays", el);
      const summary = $("#daySummary", el);
      const renderSummary = () => {
        // your days marked on the calendar itself; tap any day to open the picker right there
        summary.innerHTML = st.yes.size + st.maybe.size
          ? `<div class="preview-label">Your days <span class="legend-inline"><span class="swatch yes"></span>Definitely <span class="swatch maybe"></span>Maybe</span></div>
             <div class="your-cal">${monthsHtml(eventRange(event), (date) =>
               st.yes.has(date) ? { cls: "pyes", label: "definitely" } : st.maybe.has(date) ? { cls: "pmaybe", label: "maybe" } : {},
             )}</div>`
          : `<p class="empty-note">No days marked yet.</p>`;
        updateChrome();
      };
      let picker = null;
      const openPicker = (focusDate) => {
        if (picker) return picker.reopen(); // tapped while it was closing: reverse it
        picker = openDayPicker({
          range: eventRange(event),
          st,
          origin: launcher,
          focusDate,
          onChange: renderSummary,
          onClose: () => {
            picker = null;
            renderSummary();
          },
        });
      };
      launcher.addEventListener("click", () => openPicker());
      summary.addEventListener("click", (e) => {
        const day = e.target.closest("[data-date]");
        if (day) openPicker(day.dataset.date);
      });
      renderSummary();
      if (!st.yes.size && !st.maybe.size && !st.pickerShown) {
        st.pickerShown = true;
        setTimeout(() => el.isConnected && openPicker(), perf.lite ? 150 : 650); // after the title has landed
      }
    }
    if (step === "destinations") {
      const input = $("#destInput", el);
      const add = () => {
        const v = input.value.trim().replace(/\s+/g, " ").slice(0, 60);
        if (!v) return;
        if (!st.destinations.some((d) => d.toLowerCase() === v.toLowerCase())) {
          if (st.destinations.length >= 10) return toast("You can pick up to 10 places", { error: true });
          const existing = allDestNames().find((d) => d.toLowerCase() === v.toLowerCase());
          st.destinations.push(existing || v);
        }
        input.value = "";
        rerenderChips();
      };
      $("#destAdd", el).onclick = add;
      input.addEventListener("keydown", (e) => e.key === "Enter" && (e.preventDefault(), add()));
      el.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-dest]");
        if (!chip) return;
        const name = chip.dataset.dest;
        const idx = st.destinations.findIndex((d) => d.toLowerCase() === name.toLowerCase());
        if (idx >= 0) st.destinations.splice(idx, 1);
        else {
          if (st.destinations.length >= 10) return toast("You can pick up to 10 places", { error: true });
          st.destinations.push(name);
        }
        rerenderChips();
      });
      const rerenderChips = () => {
        const tmp = document.createElement("div");
        tmp.innerHTML = stepHtml("destinations");
        const fresh = $("#destChips", tmp);
        $$(".chip", fresh).forEach((c) => c.style.setProperty("animation", "none"));
        const label = $(".preview-label", el);
        if (!label && $(".preview-label", tmp)) $("#destChips", el).before($(".preview-label", tmp));
        $("#destChips", el).replaceWith(fresh);
        // animate only the newest chip
        const last = st.destinations[st.destinations.length - 1];
        const target = last && $$(".chip", fresh).find((c) => c.dataset.dest.toLowerCase() === last.toLowerCase());
        if (target && !others.destinations.some((d) => d.name.toLowerCase() === last.toLowerCase())) target.style.removeProperty("animation");
        updateChrome();
      };
    }
    if (step === "activities") {
      const renderMine = () => {
        $("#myActs", el).innerHTML = st.activities
          .map(
            (a, i) => `<div class="card mine"><span class="feature-icon" style="width:32px;height:32px">${icon(a.destination ? "pin" : "sparkles")}</span>
            <div class="body"><div class="title">${esc(a.title)}</div><div class="meta">${esc(a.destination || "General")}${a.link ? " · " + esc(domainOf(a.link)) : ""}</div></div>
            <button type="button" class="remove" data-remove="${i}" aria-label="Remove ${esc(a.title)}">${icon("x")}</button></div>`,
          )
          .join("");
        updateChrome();
      };
      renderMine();
      const titleIn = $("#actTitle", el);
      const linkIn = $("#actLink", el);
      $("#actAdd", el).onclick = () => {
        const title = titleIn.value.trim();
        if (!title) {
          titleIn.focus();
          return toast("Give the activity a name first", { error: true });
        }
        if (st.activities.length >= 15) return toast("You can add up to 15 activities", { error: true });
        let link = linkIn.value.trim();
        if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
        if (link) {
          try {
            new URL(link);
          } catch {
            return toast("That link doesn’t look right", { error: true });
          }
        }
        st.activities.push({ id: Math.random().toString(36).slice(2, 12).padEnd(10, "x").replace(/[^a-z0-9]/gi, "x"), title, link, destination: $("#actDest", el).value });
        titleIn.value = "";
        linkIn.value = "";
        renderMine();
      };
      titleIn.addEventListener("keydown", (e) => e.key === "Enter" && (e.preventDefault(), $("#actAdd", el).click()));
      el.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-remove]");
        if (rm) {
          st.activities.splice(Number(rm.dataset.remove), 1);
          renderMine();
          return;
        }
        const like = e.target.closest("[data-like]");
        if (like) {
          const id = like.dataset.like;
          st.likes.has(id) ? st.likes.delete(id) : st.likes.add(id);
          const a = others.activities.find((x) => x.id === id);
          const on = st.likes.has(id);
          like.setAttribute("aria-pressed", String(on));
          like.innerHTML = `${icon("thumb")} ${a.likes.length + (on ? 1 : 0) || ""}`;
          updateChrome();
        }
      });
    }
  }

  async function submit() {
    st.submitting = true;
    updateChrome();
    const payload = {
      name: st.name.trim(),
      yes: [...st.yes],
      maybe: [...st.maybe],
      destinations: st.destinations,
      activities: st.activities,
      likes: [...st.likes],
    };
    try {
      if (edit) {
        await api(`/events/${event.id}/responses/${edit.id}`, { method: "PUT", body: { ...payload, token: edit.token } });
      } else {
        const res = await api(`/events/${event.id}/responses`, { method: "POST", body: payload });
        store.set(`convene:resp:${event.id}`, res);
      }
      store.set("convene:name", payload.name);
      close();
      await renderEvent(event.id, { keepTab: true });
      showBoardingPass({ edited: !!edit });
    } catch (err) {
      st.submitting = false;
      updateChrome();
      toast(err.message, { error: true });
    }
  }

  function next() {
    const step = STEPS[st.step];
    if (step === "name" && !st.name.trim()) return;
    if (step === "dates" && st.yes.size + st.maybe.size === 0) {
      if (!confirm("You haven’t marked any days. Continue anyway?")) return;
    }
    if (st.step === STEPS.length - 1) return submit();
    st.step++;
    show(1);
  }

  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", () => {
    if (st.step === 0) return close();
    st.step--;
    show(-1);
  });
  cancelBtn.addEventListener("click", close);

  show(1);
}

/* ------------------------------------------------------------------ */
/* Rewards (after Blitz): falling confetti, count-ups, a haptic buzz,  */
/* all skipped with Reduce Motion / smooth mode.                       */
/* ------------------------------------------------------------------ */
const calm = () => reducedMotion() || perf.lite;
const buzz = (pattern) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
};

function confettiFall(n = 70) {
  if (calm()) return;
  const colors = ["var(--electric)", "#1d8bff", "#0a46c9", "#9fd4ff", "#dfe8f2", "#ffffff"]; // the app palette: blues, ice, silver
  const wrap = document.createElement("div");
  wrap.className = "confetti";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = Array.from({ length: n }, (_, i) => {
    const r = (k) => Math.abs((Math.sin((i + 1) * 9301 + k * 49297) * 233280) % 1);
    return `<i class="${i % 3 ? "" : "round"}" style="--x:${(r(1) * 100).toFixed(1)}vw;--dx:${((r(2) - 0.5) * 30).toFixed(1)}vw;--d:${(r(3) * 0.8).toFixed(2)}s;--t:${(2.4 + r(4) * 1.4).toFixed(2)}s;--s:${(0.6 + r(5) * 0.6).toFixed(2)};--r:${Math.round((r(6) - 0.5) * 1440)}deg;--c:${colors[i % colors.length]}"></i>`;
  }).join("");
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 4600);
}

function countUp(el, to, ms = 1100) {
  if (!el) return;
  if (calm() || !to) return void (el.textContent = String(to));
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** "You’re on board": shown after submitting or saving availability. */
function showBoardingPass({ edited }) {
  const me = myCurrentResponse();
  if (!me) return;
  const { event, responses, agg } = current;
  const n = agg.n;
  const today = todayStr();
  const best = [...agg.days.entries()]
    .filter(([d]) => d >= today)
    .map(([d, s]) => ({ d, s, score: scoreOf(s, n) }))
    .sort((a, b) => b.score - a.score || b.s.yes.length - a.s.yes.length || a.d.localeCompare(b.d))
    .slice(0, 3);
  const mine = new Set([...me.r.yes, ...me.r.maybe]);
  const matches = best.filter((b) => mine.has(b.d)).length;
  const position = responses.findIndex((r) => r.id === me.r.id) + 1;
  const first = me.r.name.split(" ")[0];
  const top = best[0];
  const headline =
    top && me.r.yes.includes(top.d)
      ? `You’re free on the group’s best date so far, <b>${esc(fmtDate(top.d, { weekday: "long", day: "numeric", month: "long" }))}</b>.`
      : matches
        ? `You match <b>${matches} of the 3</b> best dates so far.`
        : mine.size
          ? "Your days are in. Let’s see who joins you."
          : "No days yet — you can add them any time.";
  const url = `${location.origin}/e/${event.id}`;
  openSheet(`
    <div class="boarding">
      <div class="pass-row"><span class="pass-airline">${icon("plane")} Wingman</span><span class="pass-code">Flight WM-${esc(event.id.slice(0, 4).toUpperCase())}</span></div>
      <h2 class="boarding-title">${edited ? "Changes saved" : "You’re on board"}, ${esc(first)}!</h2>
      <p class="boarding-sub">${headline}</p>
      <div class="boarding-stats">
        <div><b data-count="${mine.size}">0</b><span>days marked</span></div>
        <div><b data-count="${matches}">0</b><span>of top 3 dates</span></div>
        <div><b>#<i data-count="${position}">0</i></b><span>to respond</span></div>
      </div>
      <div class="pass-perf" aria-hidden="true"></div>
      <div class="boarding-stub"><span>Passenger</span><b>${esc(me.r.name)}</b><span>Group</span><b>${n} on board</b></div>
    </div>
    <div class="stack two boarding-actions">
      <button class="btn btn-secondary" data-share>${icon("share")} Invite the group</button>
      <button class="btn btn-primary" data-close>Done</button>
    </div>`);
  const wrap = $(".sheet-wrap");
  $$("[data-count]", wrap).forEach((el, i) => setTimeout(() => countUp(el, Number(el.dataset.count)), 250 + i * 120));
  $("[data-share]", wrap).addEventListener("click", () => shareLink(url, event.title));
  if (!edited) confettiFall(top && me.r.yes.includes(top.d) ? 90 : 60);
  buzz(edited ? 15 : [20, 80, 20]);
}

function burst() {
  if (perf.lite) return;
  const wrap = document.createElement("div");
  wrap.className = "burst";
  const colors = ["#0a4fd8", "#1d9bff", "#8fcbff", "#00d2ff", "#ffffff", "#c9dcf0"];
  wrap.innerHTML = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * Math.PI * 2;
    const dist = 140 + Math.random() * 260;
    return `<i style="--c:${colors[i % colors.length]};--x:${Math.cos(angle) * dist}px;--y:${Math.sin(angle) * dist + 120}px;--r:${Math.random() * 720 - 360}deg;animation-delay:${Math.random() * 0.12}s"></i>`;
  }).join("");
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 1600);
}

route();
requestAnimationFrame(measureDevice);

/* ------------------------------------------------------------------ */
/* Always the newest version (same approach as Blitz):                 */
/* - a service worker serves the app network-first (instant fallback   */
/*   to the saved copy if slow/offline);                               */
/* - a tab left open checks every 30 min (and when you come back to    */
/*   it) whether a newer version is live, then reloads at the next     */
/*   page change, or right away when you return to the tab and nothing */
/*   is half-filled in.                                                */
/* ------------------------------------------------------------------ */
const loadedAt = Date.now();
const myVersion = (document.querySelector('script[src*="app.js"]')?.getAttribute("src").match(/v=(\d+)/) || [])[1];
let updateReady = false;
let lastCheck = 0;
const busy = () => !!($(".flow") || $(".sheet-wrap") || $(".dp-wrap") || quickBusy);

async function checkForUpdate() {
  if (updateReady || Date.now() - lastCheck < 5 * 60 * 1000) return;
  lastCheck = Date.now();
  try {
    const html = await (await fetch("/", { cache: "no-cache" })).text();
    const live = (html.match(/app\.js\?v=(\d+)/) || [])[1];
    if (live && myVersion && live !== myVersion) updateReady = true;
  } catch {
    /* offline: try again later */
  }
}
const _route = route;
route = function () {
  if (updateReady && !busy()) return location.reload(); // new version: load it on the next page change
  return _route();
};
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState !== "visible") return;
  await checkForUpdate();
  if (updateReady && !busy()) location.reload();
});
setInterval(() => document.visibilityState === "visible" && checkForUpdate(), 30 * 60 * 1000);

if ("serviceWorker" in navigator && !/[?&]nosw\b/.test(location.search)) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // a new version took over right as the page opened: show it (once)
    if (hadController && Date.now() - loadedAt < 4000 && !sessionStorage.getItem("wm-sw-reloaded")) {
      sessionStorage.setItem("wm-sw-reloaded", "1");
      location.reload();
    }
  });
}
