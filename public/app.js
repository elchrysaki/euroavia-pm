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
 * Records ~frames of rendering. Judges smoothness against the screen's own pace (its fastest
 * steady frames), so a phone capped at 30fps by Low Power Mode isn't mistaken for a struggling one.
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
      const pace = sorted[Math.floor(sorted.length * 0.1)]; // the display's natural frame interval
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
  const res = await fetch(`/api${path}`, {
    method: options.method || "GET",
    headers: options.body ? { "content-type": "application/json" } : undefined,
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

/** Apple's momentum projection: where a flick would come to rest. */
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
  const begin = (cell) => {
    const d = cell.dataset.date;
    action = st.mode !== "erase" && st[st.mode].has(d) ? "erase" : st.mode; // tapping a marked day toggles it off
    last = cell;
    setCell(cell);
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
        clearTimeout(timer); // moved before the hold: it's a scroll
        timer = null;
        unpress();
        start = null;
      }
      return;
    }
    const c = cellAt(e.clientX, e.clientY);
    if (c && c !== last) {
      last = c;
      setCell(c);
    }
  });
  const end = (e) => {
    if (start && timer && e.type === "pointerup") begin(start.cell); // a quick tap commits on release
    clearTimeout(timer);
    timer = null;
    unpress();
    painting = false;
    start = null;
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
        setCell(c);
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

/** Groups consecutive days with the same state into runs, e.g. Nov 20–22. */
function dayRuns(st) {
  const all = [...st.yes].map((d) => [d, "yes"]).concat([...st.maybe].map((d) => [d, "maybe"]));
  all.sort((a, b) => a[0].localeCompare(b[0]));
  const runs = [];
  for (const [d, kind] of all) {
    const prev = runs[runs.length - 1];
    if (prev && prev.kind === kind && daysInRange(prev.end, d) === 2) prev.end = d;
    else runs.push({ start: d, end: d, kind });
  }
  return runs;
}
const fmtRun = (r) => {
  const a = fmtDate(r.start, { month: "short", day: "numeric" });
  if (r.start === r.end) return a;
  const sameMonth = r.start.slice(0, 7) === r.end.slice(0, 7);
  return `${a} – ${sameMonth ? Number(r.end.slice(8)) : fmtDate(r.end, { month: "short", day: "numeric" })}`;
};

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
      <div class="dp-foot"><button type="button" class="btn btn-plain dp-clear">Clear all</button><span>Tap a day · hold &amp; drag to mark several</span></div>
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
    if (parent) parent.classList.toggle("pushed", t > 0.01); // its glass footer goes solid while it's behind the sheet
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
      else anim = spring({ from: y, to: 0, velocity: v, damping: v < -300 ? 0.8 : 1, response: 0.3, onUpdate: (val) => ((y = val), render()) });
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
window.addEventListener("popstate", route);

function route() {
  closeSheet(true);
  $(".flow")?.remove();
  $(".dp-wrap")?.remove();
  document.body.classList.remove("selecting");
  document.body.style.overflow = "";
  navActions.innerHTML = "";
  window.scrollTo(0, 0);
  const m = location.pathname.match(/^\/e\/([A-Za-z0-9]{6,16})\/?$/);
  if (m) return renderEvent(m[1]);
  const c = location.pathname.match(/^\/created\/([A-Za-z0-9]{6,16})\/?$/);
  if (c) return renderCreated(c[1]);
  return renderHome();
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
        <p class="subtitle fade-in d1">Create an event, share one link, and watch the calendar light up as people mark when they're free. Then vote on where to go and what to do.</p>
        <ul class="feature-list fade-in d2">
          <li><span class="feature-icon">${icon("calendar")}</span><div><b>Any window you like</b>The next few months, a whole year, or exact dates. Darker days mean more people can make it.</div></li>
          <li><span class="feature-icon">${icon("pin")}</span><div><b>Destination leaderboard</b>Everyone suggests places; the favourites rise to the top.</div></li>
          <li><span class="feature-icon">${icon("lock")}</span><div><b>No accounts, no logins</b>Just a name and a few taps.</div></li>
        </ul>
      </div>

      <form class="fade-in d2" id="createForm" autocomplete="off">
        <div class="card pad faceplate">
          <i class="screw tl" aria-hidden="true"></i><i class="screw tr" aria-hidden="true"></i><i class="screw bl" aria-hidden="true"></i><i class="screw br" aria-hidden="true"></i>
          <div class="mini-heat" aria-hidden="true">${heat}</div>
          <div class="section-header" style="margin-top:22px">New event</div>
          <div class="group well">
            <div class="row"><label for="title">Name</label><input id="title" name="title" maxlength="80" placeholder="Summer trip 2027" required /></div>
            <div class="row"><label for="desc">Notes</label><textarea id="desc" name="description" maxlength="400" placeholder="Optional — what's the plan?"></textarea></div>
          </div>
          <div class="section-header">Dates to choose from</div>
          <div class="segmented year-pick" role="group" aria-label="Date range" data-seg="range">
            <span class="thumb"></span>
            <button type="button" data-value="3" aria-pressed="false">3 months</button>
            <button type="button" data-value="6" aria-pressed="true">6 months</button>
            <button type="button" data-value="12" aria-pressed="false">1 year</button>
            <button type="button" data-value="custom" aria-pressed="false">Custom</button>
          </div>
          <div class="range-custom" id="rangeCustom" hidden>
            <div class="group well" style="margin-top:10px">
              <div class="row"><label for="startDate">Starts</label><input type="date" id="startDate" min="${today}" value="${today}" /></div>
              <div class="row"><label for="endDate">Ends</label><input type="date" id="endDate" min="${today}" value="${addMonths(today, 6)}" /></div>
            </div>
            <div class="chips" style="margin-top:10px">
              <button type="button" class="btn btn-tinted" data-whole="${nextYear - 1}">Rest of ${nextYear - 1}</button>
              <button type="button" class="btn btn-tinted" data-whole="${nextYear}">All of ${nextYear}</button>
            </div>
          </div>
          <p class="range-summary" id="rangeSummary"></p>
          <div style="margin-top:22px"><button class="btn btn-primary btn-block" type="submit" id="createBtn">${icon("sparkles")} Create event</button></div>
          <p class="fineprint">${icon("lock")}<span>Once created, an event can't be edited or deleted — so everyone can trust the link they were sent.</span></p>
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
                 )}</span><span style="flex:1;font-weight:600">${esc(e.title)}</span><span style="color:var(--label-3);font-size:14px">${esc(e.start ? fmtRange(e.start, e.end) : e.year || "")}</span></a>`,
             )
             .join("")}</div>`
        : ""
    }
  `;

  const form = $("#createForm");
  const startIn = $("#startDate");
  const endIn = $("#endDate");
  const custom = $("#rangeCustom");
  const summary = $("#rangeSummary");
  let preset = "6";
  const currentRange = () =>
    preset === "custom" ? { start: startIn.value, end: endIn.value } : { start: today, end: addMonths(today, Number(preset)) };
  const updateSummary = () => {
    const r = currentRange();
    const ok = r.start && r.end && r.end >= r.start;
    summary.classList.toggle("error", !ok);
    summary.innerHTML = ok
      ? `${icon("calendar")}<span><b>${esc(fmtRange(r.start, r.end))}</b> · ${daysInRange(r.start, r.end)} days</span>`
      : `${icon("calendar")}<span>The end date must be after the start date.</span>`;
  };
  setupSegmented($('[data-seg="range"]'), (v) => {
    preset = v;
    custom.hidden = v !== "custom";
    updateSummary();
  });
  startIn.addEventListener("input", () => {
    endIn.min = startIn.value || today;
    if (endIn.value && endIn.value < startIn.value) endIn.value = addMonths(startIn.value, 1);
    updateSummary();
  });
  endIn.addEventListener("input", updateSummary);
  custom.addEventListener("click", (e) => {
    const b = e.target.closest("[data-whole]");
    if (!b) return;
    const y = b.dataset.whole;
    startIn.value = `${y}-01-01` < today ? today : `${y}-01-01`;
    endIn.value = `${y}-12-31`;
    endIn.min = startIn.value;
    updateSummary();
  });
  updateSummary();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#createBtn");
    const title = form.title.value.trim();
    if (!title) {
      form.title.focus();
      return toast("Give your event a name", { error: true });
    }
    const range = currentRange();
    if (!range.start || !range.end || range.end < range.start) return toast("Check the dates", { error: true });
    if (daysInRange(range.start, range.end) > 731) return toast("Pick a range of up to two years", { error: true });
    btn.disabled = true;
    try {
      const { id } = await api("/events", {
        method: "POST",
        body: { title, description: form.description.value.trim(), start_date: range.start, end_date: range.end },
      });
      const list = store.get("convene:events", []).filter((x) => x.id !== id);
      list.unshift({ id, title, start: range.start, end: range.end });
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
      <h1 class="large-title fade-in" style="font-size:clamp(30px,6vw,44px)">${esc(meta.title)}<br/><span class="shine">is live.</span></h1>
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

let current = null; // { event, responses, agg, tab, selectMode, selected:Set }

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
async function renderEvent(id, { keepTab = false } = {}) {
  const prevTab = keepTab && current ? current.tab : "calendar";
  const cached = keepTab ? null : store.get(`convene:cache:${id}`);
  if (cached) paintEvent(cached, prevTab);
  else if (!keepTab) app.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  let data;
  try {
    data = await api(`/events/${id}`);
  } catch (err) {
    if (cached) return toast("Can't reach the server — showing your saved copy", { error: true });
    app.innerHTML = `<div class="empty card" style="margin-top:40px"><div class="glyph">${icon("calendar")}</div><h3>Event not found</h3><p>${esc(
      err.message,
    )}</p><a class="btn btn-primary" href="/" data-link style="margin-top:12px">Create a new event</a></div>`;
    return;
  }
  cacheEvent(id, data);
  if (location.pathname.replace(/\/$/, "") !== `/e/${id}`) return; // user navigated away meanwhile
  if (cached && JSON.stringify(cached) === JSON.stringify(data)) return;
  if (cached && ($(".flow") || $(".sheet-wrap"))) {
    // don't yank the page from under an open sheet/flow; keep the fresh data for the next paint
    Object.assign(current, data, { agg: aggregate(data.responses) });
    return;
  }
  paintEvent(data, current && cached ? current.tab : prevTab);
}

function paintEvent(data, prevTab) {
  current = { ...data, agg: aggregate(data.responses), tab: prevTab, selectMode: false, selected: new Set() };
  const { event, responses } = data;
  document.title = `${event.title} — Wingman`;

  const recent = store.get("convene:events", []);
  if (!recent.some((e) => e.id === event.id)) {
    recent.unshift({ id: event.id, title: event.title, start: event.start_date, end: event.end_date });
    store.set("convene:events", recent.slice(0, 20));
  }

  const mine = store.get(`convene:resp:${event.id}`);
  const myResponse = mine && responses.find((r) => r.id === mine.id);
  const url = `${location.origin}/e/${event.id}`;

  navActions.innerHTML = `<button class="btn btn-tinted nav-share" id="navShare" aria-label="Share event">${icon("share")}<span>Share</span></button>`;
  $("#navShare").onclick = () => shareLink(url, event.title);

  const ctaHtml = myResponse
    ? `<button class="btn btn-secondary btn-block" data-act="edit">${icon("pencil")} Edit my response</button>`
    : `<button class="btn btn-primary btn-block" data-act="add">${icon("plus")} Add your availability</button>`;
  app.innerHTML = `
    <div class="event-layout">
      <aside class="event-aside">
        <div class="event-head fade-in">
          <div class="eyebrow">${icon("calendar").replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"')}${esc(fmtRange(eventRange(event).start, eventRange(event).end))}</div>
          <h1 class="large-title">${esc(event.title)}</h1>
          ${event.description ? `<p class="subtitle">${esc(event.description)}</p>` : ""}
          <div class="event-meta">
            <span class="pill">${icon("people")} ${responses.length} ${responses.length === 1 ? "response" : "responses"}</span>
            <span class="pill">${icon("pin")} ${current.agg.destinations.length} ${current.agg.destinations.length === 1 ? "place" : "places"}</span>
            <span class="pill">${icon("lock")} Locked</span>
          </div>
          ${responses.length ? `<div class="people-row">${responses.map((r) => avatar(r.name)).join("")}</div>` : ""}
        </div>
        <div class="event-cta fade-in d1">${ctaHtml}</div>
      </aside>
      <section class="event-main">
        <div class="segmented tabs fade-in d2" role="tablist" data-seg="tabs">
          <span class="thumb"></span>
          <button type="button" data-value="calendar" aria-pressed="${prevTab === "calendar"}">${icon("calendar").replace("<svg", '<svg width="16" height="16"')} Calendar</button>
          <button type="button" data-value="destinations" aria-pressed="${prevTab === "destinations"}">${icon("trophy").replace("<svg", '<svg width="16" height="16"')} Places</button>
          <button type="button" data-value="activities" aria-pressed="${prevTab === "activities"}">${icon("sparkles").replace("<svg", '<svg width="16" height="16"')} Activities</button>
        </div>
        <div id="tabBody" class="fade-in d3"></div>
      </section>
    </div>
    <div class="action-bar" id="actionBar">${ctaHtml}</div>
    <div class="select-bar" id="selectBar"><span id="selCount">0 days</span><button class="btn btn-plain" id="selClear">Clear</button><button class="btn btn-primary" id="selShow">Who's free?</button></div>
  `;

  $$('[data-act="add"]').forEach((b) => b.addEventListener("click", () => openFlow()));
  $$('[data-act="edit"]').forEach((b) => b.addEventListener("click", () => openFlow({ edit: { ...mine, response: myResponse } })));
  setupSegmented($('[data-seg="tabs"]'), (v) => {
    current.tab = v;
    exitSelectMode();
    renderTab();
  });
  bindCalendar();
  $("#selClear").onclick = exitSelectMode;
  $("#selShow").onclick = () => current.selected.size && openDaySheet([...current.selected].sort());
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

  const best = [...days.entries()]
    .filter(([d]) => d >= today)
    .map(([d, s]) => ({ d, s, score: scoreOf(s, n) }))
    .sort((a, b) => b.score - a.score || b.s.yes.length - a.s.yes.length || a.d.localeCompare(b.d))
    .slice(0, 6);

  const legend = [0.12, 0.3, 0.5, 0.72, 1].map((a) => `<i style="--a:${a}"></i>`).join("");

  if (!n) {
    return `<div class="card empty"><div class="glyph">${icon("calendar")}</div><h3>No one has responded yet</h3><p>Be the first — add your availability, then share the link with the group.</p></div>
      <div class="section-title">${esc(fmtRange(eventRange(event).start, eventRange(event).end))}</div>
      ${monthsHtml(eventRange(event), () => ({}))}`;
  }

  return `
    ${
      best.length
        ? `<div class="section-header" style="margin-top:4px">Best dates</div>
      <div class="best">${best
        .map(
          (b, i) => `<button class="best-card" data-best="${b.d}"><div class="rank">#${i + 1}</div><div class="date">${esc(fmtDate(b.d))}</div><div class="counts">${b.s.yes.length} yes · ${b.s.maybe.length} maybe</div></button>`,
        )
        .join("")}</div>`
        : ""
    }
    <div class="cal-toolbar">
      <div class="legend"><span>Fewer</span><span class="legend-scale">${legend}</span><span>More people</span></div>
      <button class="btn btn-tinted" id="selectToggle">${icon("grid").replace("<svg", '<svg width="16" height="16"')} Select dates</button>
    </div>
    ${monthsHtml(eventRange(event), (date) => {
      const s = days.get(date);
      if (!s) return {};
      const score = scoreOf(s, n);
      const a = (0.12 + 0.88 * score).toFixed(3);
      return {
        cls: `heat${a > 0.55 ? " strong" : ""}${score === maxScore && score > 0 ? " max" : ""}`,
        style: `--a:${a}`,
        label: `${s.yes.length} yes, ${s.maybe.length} maybe`,
      };
    })}
  `;
}

function bindCalendar() {
  const body = $("#tabBody");
  body.addEventListener("click", (e) => {
    const best = e.target.closest("[data-best]");
    if (best) return openDaySheet([best.dataset.best]);
    if (e.target.closest("#selectToggle")) {
      current.selectMode ? exitSelectMode() : enterSelectMode();
      return;
    }
    const cell = e.target.closest(".day[data-date]");
    if (!cell) return;
    const date = cell.dataset.date;
    if (current.selectMode) {
      current.selected.has(date) ? current.selected.delete(date) : current.selected.add(date);
      cell.classList.toggle("selected", current.selected.has(date));
      updateSelectBar();
    } else {
      openDaySheet([date]);
    }
  });
}

function enterSelectMode() {
  current.selectMode = true;
  const t = $("#selectToggle");
  if (t) t.innerHTML = `${icon("x").replace("<svg", '<svg width="16" height="16"')} Done`;
  toast("Tap the days you want to compare");
  updateSelectBar();
}
function exitSelectMode() {
  if (!current) return;
  current.selectMode = false;
  current.selected.clear();
  $$(".day.selected").forEach((d) => d.classList.remove("selected"));
  const t = $("#selectToggle");
  if (t) t.innerHTML = `${icon("grid").replace("<svg", '<svg width="16" height="16"')} Select dates`;
  updateSelectBar();
}
function updateSelectBar() {
  const bar = $("#selectBar");
  if (!bar) return;
  const n = current.selected.size;
  $("#selCount").textContent = `${n} ${n === 1 ? "day" : "days"}`;
  bar.classList.toggle("show", current.selectMode && n > 0);
  document.body.classList.toggle("selecting", current.selectMode);
}

function openDaySheet(dates) {
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
  const title =
    dates.length === 1
      ? fmtDate(dates[0], { weekday: "long", month: "long", day: "numeric" })
      : `${dates.length} days selected`;
  const sub =
    dates.length === 1
      ? dates[0].slice(0, 4)
      : `${fmtDate(dates[0], { month: "short", day: "numeric" })} – ${fmtDate(dates[dates.length - 1], { month: "short", day: "numeric" })} · counts people free on all of them`;

  const section = (label, names, sw) =>
    names.length
      ? `<h4><span class="swatch ${sw}"></span>${label} · ${names.length}</h4>${names.map((n) => `<div class="name-chip">${avatar(n, "sm")} ${esc(n)}</div>`).join("")}`
      : "";

  openSheet(`
    <div class="sheet-head"><div><h2>${esc(title)}</h2><div class="sheet-sub">${esc(sub)}</div></div><button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
    <div class="tally">
      <div class="t-yes"><b>${yes.length}</b><span>Yes</span></div>
      <div class="t-maybe"><b>${maybe.length}</b><span>Maybe</span></div>
      <div class="t-no"><b>${no.length}</b><span>No</span></div>
    </div>
    <div class="name-list">
      ${section("Definitely", yes, "yes")}
      ${section("Maybe", maybe, "maybe")}
      ${section("Can't make it", no, "erase")}
      ${responses.length ? "" : '<p class="sheet-sub">No responses yet.</p>'}
    </div>
  `);
}

function destinationsHtml() {
  const { destinations, n } = current.agg;
  if (!destinations.length)
    return `<div class="card empty"><div class="glyph">${icon("pin")}</div><h3>No destinations yet</h3><p>Suggest a place when you add your availability.</p></div>`;
  const top = destinations[0].voters.length;
  return `<div class="board">${destinations
    .map((d, i) => {
      const acts = current.agg.activities.filter((a) => a.destination && a.destination.toLowerCase() === d.name.toLowerCase()).length;
      return `<div class="card board-item" style="animation:rise .6s var(--ease) both;animation-delay:${i * 60}ms">
        <div class="medal">${i + 1}</div>
        <div><h4>${esc(d.name)}</h4><div class="sub">${esc(d.voters.join(", "))}${acts ? ` · ${acts} ${acts === 1 ? "activity" : "activities"}` : ""}</div></div>
        <div class="votes">${d.voters.length}<small>${d.voters.length === 1 ? "vote" : "votes"}</small></div>
        <div class="bar"><i style="width:${Math.max(6, (d.voters.length / Math.max(top, n || 1)) * 100)}%;animation-delay:${i * 60 + 150}ms"></i></div>
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
  if (!activities.length)
    return `<div class="card empty"><div class="glyph">${icon("sparkles")}</div><h3>No activities yet</h3><p>Add ideas — with links — when you add your availability.</p></div>`;
  return groupActivities(
    activities,
    destinations.map((d) => d.name),
  )
    .map(
      (g) => `<div class="activity-group"><h3>${icon(g.name === "General" ? "sparkles" : "pin").replace("<svg", '<svg width="16" height="16"')} ${esc(g.name)}</h3>
      <div class="card group">${g.items.map((a) => activityRow(a)).join("")}</div></div>`,
    )
    .join("");
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

function openSheet(html) {
  closeSheet(true);
  const wrap = document.createElement("div");
  wrap.className = "sheet-wrap";
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

const STEPS = ["name", "dates", "destinations", "activities", "review"];

let flowProbed = false;
function openFlow({ edit = null } = {}) {
  if (!flowProbed) {
    flowProbed = true;
    setTimeout(probeFlow, 120); // the flow is the most animated screen
  }
  const { event, responses } = current;
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
      <button class="btn btn-plain" data-act="back">Cancel</button>
      <div class="progress">${STEPS.map(() => "<i></i>").join("")}</div>
      <span></span>
    </div>
    <div class="flow-body"><div class="flow-step"></div></div>
    <div class="flow-bottom"><div class="inner"><span class="status"></span><button class="btn btn-primary" data-act="next">Continue</button></div></div>`;
  document.body.appendChild(flow);
  document.body.style.overflow = "hidden";

  const body = $(".flow-body", flow);
  const statusEl = $(".status", flow);
  const nextBtn = $('[data-act="next"]', flow);
  const backBtn = $('[data-act="back"]', flow);

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
    backBtn.textContent = st.step === 0 ? "Cancel" : "Back";
    const step = STEPS[st.step];
    nextBtn.disabled = false;
    if (step === "name") {
      nextBtn.textContent = "Continue";
      nextBtn.disabled = !st.name.trim();
      statusEl.textContent = "";
    } else if (step === "dates") {
      nextBtn.textContent = "Continue";
      statusEl.innerHTML = `<b style="color:var(--yes)">${st.yes.size}</b> yes · <b style="color:var(--accent)">${st.maybe.size}</b> maybe`;
    } else if (step === "destinations") {
      nextBtn.textContent = st.destinations.length ? "Continue" : "Skip";
      statusEl.textContent = st.destinations.length ? `${st.destinations.length} picked` : "";
    } else if (step === "activities") {
      nextBtn.textContent = st.activities.length || st.likes.size ? "Continue" : "Skip";
      statusEl.textContent = st.activities.length ? `${st.activities.length} added` : "";
    } else {
      nextBtn.textContent = st.submitting ? "Sending…" : edit ? "Save changes" : "Submit";
      nextBtn.disabled = st.submitting;
      statusEl.textContent = "";
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
        <h2 class="flow-title">${animatedTitle(edit ? "Welcome *back.*" : "Hi there! What's your *name?*")}</h2>
        <p class="flow-lead">This is how the group will see you. No account, no password.</p>
        <input class="big-input" id="nameInput" maxlength="40" placeholder="Your name" autocomplete="given-name" enterkeyhint="next" value="${esc(st.name)}" />
      `;
    if (step === "dates")
      return `
        <div class="eyebrow">Step 2 of 5</div>
        <h2 class="flow-title">${animatedTitle(`When are you *free,* ${st.name.split(" ")[0]}?`)}</h2>
        <p class="flow-lead">Open the calendar and tap the days that work. Dark blue means you're definitely in, light blue means maybe.</p>
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
        <div class="eyebrow">Step 3 of 5</div>
        <h2 class="flow-title">${animatedTitle("Where should we *go?*")}</h2>
        <p class="flow-lead">${others.destinations.length ? "Here's what the group has suggested so far. Tap the ones you'd love — or add your own." : "You're the first to suggest a place. Add as many as you like."}</p>
        <div class="add-row"><input id="destInput" maxlength="60" placeholder="City, country, place…" enterkeyhint="done" /><button class="btn btn-secondary" id="destAdd" type="button">${icon("plus")} Add</button></div>
        ${names.length ? `<div class="preview-label">${icon("trophy").replace("<svg", '<svg width="16" height="16"')} Suggested destinations</div>` : ""}
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
        <div class="eyebrow">Step 4 of 5</div>
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
    // review
    const firstYes = [...st.yes].sort()[0];
    return `
      <div class="eyebrow">Step 5 of 5</div>
      <h2 class="flow-title">${animatedTitle("Looking *good.* Ready?")}</h2>
      <p class="flow-lead">Here's what you'll add to <b>${esc(event.title)}</b>.</p>
      <div class="summary">
        <div class="card"><h4>You</h4><div style="display:flex;align-items:center;gap:12px;margin-top:6px">${avatar(st.name)}<span class="big" style="font-size:24px">${esc(st.name)}</span></div></div>
        <div class="card"><h4>Days</h4><div class="big">${st.yes.size}<span style="font-size:17px;color:var(--label-2);font-weight:600"> definitely</span></div><p>${st.maybe.size} maybe${firstYes ? ` · first: ${esc(fmtDate(firstYes))}` : ""}</p></div>
        <div class="card"><h4>Destinations</h4><p>${st.destinations.length ? esc(st.destinations.join(", ")) : "None — that's fine."}</p></div>
        <div class="card"><h4>Activities</h4><p>${st.activities.length ? esc(st.activities.map((a) => a.title).join(", ")) : "None added."}${st.likes.size ? ` · ${st.likes.size} liked` : ""}</p></div>
      </div>
    `;
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
        const runs = dayRuns(st);
        summary.innerHTML = runs.length
          ? `<div class="preview-label">Your days</div><div class="chips">${runs
              .slice(0, 14)
              .map((r) => `<button type="button" class="chip run ${r.kind}" data-focus="${r.start}"><span class="swatch ${r.kind}"></span>${esc(fmtRun(r))}</button>`)
              .join("")}${runs.length > 14 ? `<span class="chip more">+${runs.length - 14} more</span>` : ""}</div>`
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
        const chip = e.target.closest("[data-focus]");
        if (chip) openPicker(chip.dataset.focus);
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
          if (st.destinations.length >= 10) return toast("Up to 10 destinations", { error: true });
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
          if (st.destinations.length >= 10) return toast("Up to 10 destinations", { error: true });
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
          return toast("Describe the activity first", { error: true });
        }
        if (st.activities.length >= 15) return toast("Up to 15 activities", { error: true });
        let link = linkIn.value.trim();
        if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
        if (link) {
          try {
            new URL(link);
          } catch {
            return toast("That link doesn't look right", { error: true });
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
      burst();
      close();
      toast(edit ? "Your response was updated" : "You're in! Thanks for responding");
      renderEvent(event.id, { keepTab: true });
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
      if (!confirm("You haven't marked any days. Continue anyway?")) return;
    }
    if (step === "review") return submit();
    st.step++;
    show(1);
  }

  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", () => {
    if (st.step === 0) return close();
    st.step--;
    show(-1);
  });

  show(1);
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
