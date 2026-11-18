import { handleMeetings, sweepMeetings, ensureMeetSchema, freePin } from "./meet.js";
// Wingman — Cloudflare Worker API.
// Static files in /public are served by the assets binding; this worker only handles /api/*.

const LIMITS = {
  title: 80,
  description: 400,
  name: 40,
  destinations: 10,
  destination: 60,
  activities: 15,
  activityTitle: 100,
  link: 500,
  likes: 100,
  responsesPerEvent: 300,
};

const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomId(len) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

const fail = (message, status = 400) => json({ error: message }, status);

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanLink(value) {
  const raw = cleanText(value, LIMITS.link);
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

const MAX_RANGE_DAYS = 731; // up to two years

function isValidDate(d) {
  if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const date = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === d;
}

const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/** Older events only stored a year; treat those as the whole calendar year. */
function withRange(event) {
  if (!event) return event;
  return {
    ...event,
    start_date: event.start_date || `${event.year}-01-01`,
    end_date: event.end_date || `${event.year}-12-31`,
  };
}

function validDatesInRange(list, event) {
  if (!Array.isArray(list)) return [];
  const out = new Set();
  for (const d of list) {
    if (!isValidDate(d) || d < event.start_date || d > event.end_date) continue;
    out.add(d);
    if (out.size >= MAX_RANGE_DAYS) break;
  }
  return [...out].sort();
}

function sanitizeResponse(body, event) {
  const name = cleanText(body.name, LIMITS.name);
  if (!name) return { error: "Please enter your name." };

  const yes = validDatesInRange(body.yes, event);
  const yesSet = new Set(yes);
  const maybe = validDatesInRange(body.maybe, event).filter((d) => !yesSet.has(d));

  const destSeen = new Set();
  const destinations = [];
  for (const d of Array.isArray(body.destinations) ? body.destinations : []) {
    const v = cleanText(d, LIMITS.destination);
    const key = v.toLowerCase();
    if (!v || destSeen.has(key)) continue;
    destSeen.add(key);
    destinations.push(v);
    if (destinations.length >= LIMITS.destinations) break;
  }

  const activities = [];
  for (const a of Array.isArray(body.activities) ? body.activities : []) {
    if (!a || typeof a !== "object") continue;
    const title = cleanText(a.title, LIMITS.activityTitle);
    if (!title) continue;
    activities.push({
      id: /^[A-Za-z0-9]{6,16}$/.test(a.id || "") ? a.id : randomId(10),
      title,
      link: cleanLink(a.link),
      destination: cleanText(a.destination, LIMITS.destination),
    });
    if (activities.length >= LIMITS.activities) break;
  }

  const likes = [
    ...new Set(
      (Array.isArray(body.likes) ? body.likes : []).filter(
        (x) => typeof x === "string" && /^[A-Za-z0-9]{6,16}$/.test(x),
      ),
    ),
  ].slice(0, LIMITS.likes);

  return { name, data: { yes, maybe, destinations, activities, likes } };
}

async function readBody(request) {
  try {
    const text = await request.text();
    if (text.length > 64_000) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* Retention: an event is deleted one month after its last selectable date, or after two months
   in which nobody opened it (every visit resets that clock). A daily cron also sweeps. */
const DAY = 86_400_000;
const AFTER_END_MS = 30 * DAY;
const IDLE_MS = 60 * DAY;
const TOUCH_EVERY_MS = 60 * 60 * 1000; // write last_seen at most hourly per event

function deleteAt(event) {
  const endOfLastDay = Date.parse(`${event.end_date}T23:59:59Z`);
  const lastSeen = event.last_seen || event.created_at;
  return Math.min(endOfLastDay + AFTER_END_MS, lastSeen + IDLE_MS);
}

async function deleteEvent(env, id) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM responses WHERE event_id = ?").bind(id),
    env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id),
  ]);
}

/** Which optional sections the host turned on (both, unless they chose otherwise). */
function parseSections(v) {
  let o = {};
  try {
    o = typeof v === "string" ? JSON.parse(v) : v || {};
  } catch {
    o = {};
  }
  return { places: o.places !== false, activities: o.activities !== false };
}
const cleanSections = (v) => ({ places: v?.places !== false, activities: v?.activities !== false });
/** What everyone (not only the host) may do: save / unsave the date, remove entries. Both on unless the host says no. */
function parsePerms(v) {
  let o = {};
  try {
    o = typeof v === "string" ? JSON.parse(v) : v || {};
  } catch {
    o = {};
  }
  return { final: o.final !== false, remove: o.remove !== false };
}
/**
 * What the calendar entry says (the host can change it any time; empty = the event's own title and
 * description): { title, description, places[], activities[], mode: "period" | "days" }.
 */
function cleanCal(v) {
  let o = {};
  try {
    o = typeof v === "string" ? JSON.parse(v) : v || {};
  } catch {
    o = {};
  }
  const list = (a, max, len) => [...new Set((Array.isArray(a) ? a : []).map((x) => cleanText(x, len)).filter(Boolean))].slice(0, max);
  return {
    title: cleanText(o.title, 120),
    description: typeof o.description === "string" ? o.description.replace(/\r/g, "").trim().slice(0, 1000) : "",
    places: list(o.places, 10, 80),
    activities: list(o.activities, 15, 120),
    mode: o.mode === "days" ? "days" : "period",
  };
}
/** How long the trip is, in days (the best-dates search looks for this many days in a row). */
const cleanTripDays = (v) => Math.min(14, Math.max(1, Math.round(Number(v) || 1)));
/** Adds one line to an event's change log (kept short: the latest 40). */
async function addLog(env, event, entry) {
  const log = [{ at: Date.now(), by: cleanText(entry.by, LIMITS.name) || "Someone", ...entry, by: cleanText(entry.by, LIMITS.name) || "Someone" }, ...(event.log || [])].slice(0, 40);
  await env.DB.prepare("UPDATE events SET log = ? WHERE id = ?").bind(JSON.stringify(log), event.id).run();
  return log;
}
/** The host is whoever created the event: their browser keeps the admin token. */
const isHost = (request, event) => {
  const t = request.headers.get("x-wingman-admin") || "";
  return !!event.admin_token && t.length > 10 && t === event.admin_token;
};

/** Loads an event; deletes it if it has expired; records this visit (keeps it alive). */
async function getEvent(env, id, { touch = true } = {}) {
  const row = await env.DB.prepare(
    "SELECT id, title, description, year, start_date, end_date, created_at, last_seen, admin_token, sections, final, trip_days, log, perms, cal FROM events WHERE id = ?",
  )
    .bind(id)
    .first();
  const event = withRange(row);
  if (!event) return null;
  const now = Date.now();
  if (now >= deleteAt(event)) {
    await deleteEvent(env, id);
    return null;
  }
  if (touch && now - (event.last_seen || 0) > TOUCH_EVERY_MS) {
    await env.DB.prepare("UPDATE events SET last_seen = ? WHERE id = ?").bind(now, id).run();
    event.last_seen = now;
  }
  event.delete_at = deleteAt(event);
  event.sections = parseSections(event.sections);
  // the decided date(s): { dates: ["YYYY-MM-DD", …] } or null
  try {
    event.final = event.final ? JSON.parse(event.final) : null;
  } catch {
    event.final = null;
  }
  event.trip_days = cleanTripDays(event.trip_days);
  event.perms = parsePerms(event.perms);
  event.cal = cleanCal(event.cal);
  // a small change log: who removed whom, who saved or unsaved the date
  try {
    event.log = event.log ? JSON.parse(event.log) : [];
  } catch {
    event.log = [];
  }
  Object.defineProperty(event, "admin_token", { value: event.admin_token, enumerable: false }); // never sent to the page
  delete event.last_seen;
  return event;
}

/** Daily sweep for events nobody opens any more. */
async function sweepExpired(env) {
  const now = Date.now();
  const lastDayCutoff = new Date(now - AFTER_END_MS).toISOString().slice(0, 10); // end_date before this = past +30d
  const idleCutoff = now - IDLE_MS;
  const expired = "SELECT id FROM events WHERE COALESCE(end_date, year || '-12-31') < ?1 OR COALESCE(last_seen, created_at) < ?2";
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM responses WHERE event_id IN (${expired})`).bind(lastDayCutoff, idleCutoff),
    env.DB.prepare(`DELETE FROM events WHERE id IN (${expired})`).bind(lastDayCutoff, idleCutoff),
  ]);
}

async function handleApi(request, env, url) {
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const meet = await handleMeetings(request, env, parts); // /api/meetings/* (meeting times tool)
  if (meet) return meet;
  const method = request.method;

  // GET /api/pin/:pin → { kind: "trip" | "meet", id }   (join by PIN)
  if (parts.length === 2 && parts[0] === "pin" && method === "GET") {
    const pin = parts[1].replace(/\D/g, "");
    if (!/^\d{6}$/.test(pin)) return fail("A PIN has 6 digits.");
    await ensureMeetSchema(env);
    const [ev, mt] = await Promise.all([
      env.DB.prepare("SELECT id FROM events WHERE id = ?").bind(pin).first(),
      env.DB.prepare("SELECT id FROM meetings WHERE id = ?").bind(pin).first(),
    ]);
    if (ev) return json({ kind: "trip", id: pin });
    if (mt) return json({ kind: "meet", id: pin });
    return fail("No plan has that PIN. Check the number and try again.", 404);
  }

  // POST /api/events
  if (parts.length === 1 && parts[0] === "events" && method === "POST") {
    const body = await readBody(request);
    if (!body) return fail("That didn’t come through. Please try again.");
    const title = cleanText(body.title, LIMITS.title);
    const description = cleanText(body.description, LIMITS.description);
    if (!title) return fail("Please give your event a name.");
    const start = body.start_date;
    const end = body.end_date;
    if (!isValidDate(start) || !isValidDate(end)) return fail("Pick a start and an end date.");
    if (end < start) return fail("The end date must be after the start date.");
    // allow one day of slack for time zones ahead of UTC
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    if (end < yesterday) return fail("Pick dates in the future.");
    if (daysBetween(start, end) + 1 > MAX_RANGE_DAYS) return fail("Pick a range of up to two years.");

    await ensureMeetSchema(env); // PINs are unique across trips and meetings
    const id = await freePin(env);
    const admin = randomId(24);
    await env.DB.prepare(
      "INSERT INTO events (id, title, description, year, start_date, end_date, created_at, last_seen, admin_token, sections, trip_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, title, description, Number(start.slice(0, 4)), start, end, Date.now(), Date.now(), admin, JSON.stringify(cleanSections(body.sections)), cleanTripDays(body.trip_days))
      .run();
    return json({ id, admin }, 201);
  }

  if (parts[0] !== "events" || !parts[1] || !/^[A-Za-z0-9]{6,16}$/.test(parts[1])) {
    return fail("Not found.", 404);
  }
  const eventId = parts[1];

  // GET /api/events/:id
  if (parts.length === 2 && method === "GET") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn’t exist or has been removed.", 404);
    const { results } = await env.DB.prepare(
      "SELECT id, name, data, created_at, updated_at FROM responses WHERE event_id = ? ORDER BY created_at ASC",
    )
      .bind(eventId)
      .all();
    const responses = results.map((r) => ({
      id: r.id,
      name: r.name,
      created_at: r.created_at,
      updated_at: r.updated_at,
      ...JSON.parse(r.data),
    }));
    return json({ event, responses, host: isHost(request, event), hasHost: !!event.admin_token });
  }

  // PATCH /api/events/:id
  //   { sections?, trip_days? } — host only: Places / Activities on or off, how long the trip is
  //   { final, by }             — anyone: save the decided date(s) ({ dates: [...] }) or unsave (null); logged
  if (parts.length === 2 && method === "PATCH") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn’t exist or has been removed.", 404);
    const body = await readBody(request);
    const out = {};
    if (body && ("sections" in body || "trip_days" in body || "perms" in body) && !isHost(request, event))
      return fail("Only the person who created this event can change its settings.", 403);
    if (body && "final" in body && !event.perms.final && !isHost(request, event))
      return fail("Only the host can save the date for this event.", 403);
    // the calendar entry: the host's to change (anyone, for events made before hosts existed)
    if (body && "cal" in body) {
      if (event.admin_token && !isHost(request, event)) return fail("Only the person who created this event can change the calendar entry.", 403);
      out.cal = cleanCal(body.cal);
      await env.DB.prepare("UPDATE events SET cal = ? WHERE id = ?").bind(JSON.stringify(out.cal), eventId).run();
    }
    if (body && "perms" in body) {
      out.perms = parsePerms(body.perms);
      await env.DB.prepare("UPDATE events SET perms = ? WHERE id = ?").bind(JSON.stringify(out.perms), eventId).run();
    }
    if (body && "trip_days" in body) {
      out.trip_days = cleanTripDays(body.trip_days);
      await env.DB.prepare("UPDATE events SET trip_days = ? WHERE id = ?").bind(out.trip_days, eventId).run();
    }
    if (body && "sections" in body) {
      out.sections = cleanSections(body.sections);
      await env.DB.prepare("UPDATE events SET sections = ? WHERE id = ?").bind(JSON.stringify(out.sections), eventId).run();
    }
    if (body && "final" in body) {
      const dates = body.final ? validDatesInRange(body.final.dates, event).slice(0, 60) : [];
      if (body.final && !dates.length) return fail("Pick at least one date inside the event’s range.");
      out.final = dates.length ? { dates } : null;
      await env.DB.prepare("UPDATE events SET final = ? WHERE id = ?").bind(out.final ? JSON.stringify(out.final) : null, eventId).run();
      out.log = await addLog(env, event, out.final ? { action: "final", by: body.by, dates } : { action: "unfinal", by: body.by, dates: event.final?.dates || [] });
    }
    return json(out);
  }

  // DELETE /api/events/:id/responses/:rid?by=Name — anyone can remove an entry; it goes in the change log
  if (parts.length === 4 && parts[2] === "responses" && method === "DELETE") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn’t exist or has been removed.", 404);
    if (!event.perms.remove && !isHost(request, event)) return fail("Only the host can remove entries from this event.", 403);
    const row = await env.DB.prepare("SELECT name FROM responses WHERE id = ? AND event_id = ?").bind(parts[3], eventId).first();
    if (!row) return fail("That response was already removed.", 404);
    await env.DB.prepare("DELETE FROM responses WHERE id = ? AND event_id = ?").bind(parts[3], eventId).run();
    const log = await addLog(env, event, { action: "delete", by: url.searchParams.get("by"), who: row.name });
    return json({ ok: true, log });
  }

  // POST /api/events/:id/responses
  if (parts.length === 3 && parts[2] === "responses" && method === "POST") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn’t exist or has been removed.", 404);
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM responses WHERE event_id = ?").bind(eventId).first("n");
    if (count >= LIMITS.responsesPerEvent) return fail("This event is full.", 409);

    const body = await readBody(request);
    if (!body) return fail("That didn’t come through. Please try again.");
    const clean = sanitizeResponse(body, event);
    if (clean.error) return fail(clean.error);

    const id = randomId(10);
    const token = randomId(24);
    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO responses (id, event_id, name, token, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, eventId, clean.name, token, JSON.stringify(clean.data), now, now)
      .run();
    return json({ id, token }, 201);
  }

  // PUT /api/events/:id/responses/:rid  — edit your own response (token kept on your device)
  if (parts.length === 4 && parts[2] === "responses" && method === "PUT") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn’t exist or has been removed.", 404);
    const body = await readBody(request);
    if (!body || typeof body.token !== "string") return fail("That didn’t come through. Please try again.");
    const existing = await env.DB.prepare("SELECT token FROM responses WHERE id = ? AND event_id = ?")
      .bind(parts[3], eventId)
      .first();
    if (!existing || existing.token !== body.token) return fail("You can only edit your own response.", 403);

    const clean = sanitizeResponse(body, event);
    if (clean.error) return fail(clean.error);
    await env.DB.prepare("UPDATE responses SET name = ?, data = ?, updated_at = ? WHERE id = ?")
      .bind(clean.name, JSON.stringify(clean.data), Date.now(), parts[3])
      .run();
    return json({ id: parts[3] });
  }

  return fail("Not found.", 404);
}

// Create tables on first use so a fresh database works without a separate migration step
// (mirrors migrations/0001_init.sql; every statement is idempotent).
let schemaReady = null;
function ensureSchema(env) {
  schemaReady ??= env.DB.batch([
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', year INTEGER NOT NULL, start_date TEXT, end_date TEXT, created_at INTEGER NOT NULL, last_seen INTEGER)",
    ),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id), name TEXT NOT NULL, token TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    ),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_responses_event ON responses(event_id, created_at)"),
  ])
    .then(async () => {
      // databases created by older versions: add the newer columns (fails harmlessly if present)
      for (const [col, type] of [["start_date", "TEXT"], ["end_date", "TEXT"], ["last_seen", "INTEGER"], ["admin_token", "TEXT"], ["sections", "TEXT"], ["final", "TEXT"], ["trip_days", "INTEGER"], ["log", "TEXT"], ["perms", "TEXT"], ["cal", "TEXT"]]) {
        await env.DB.prepare(`ALTER TABLE events ADD COLUMN ${col} ${type}`).run().catch(() => {});
      }
    })
    .catch((err) => {
    schemaReady = null; // retry on the next request
    throw err;
  });
  return schemaReady;
}

export default {
  async scheduled(controller, env, ctx) {
    await ensureSchema(env);
    await ensureMeetSchema(env);
    ctx.waitUntil(Promise.all([sweepExpired(env), sweepMeetings(env)]));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        await ensureSchema(env);
        return await handleApi(request, env, url);
      } catch (err) {
        console.error(err);
        return fail("Something went wrong. Please try again.", 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
