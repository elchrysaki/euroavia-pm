// Meeting times (When2meet-style) — API for /api/meetings/*
//
// A meeting is a fixed set of 15-minute slots chosen at creation:
//  - "dates" mode: specific dates; each slot is an absolute instant, stored as "t<UTC epoch minutes>",
//    so every viewer can see the grid in their own time zone.
//  - "week" mode: days of the week; slots are "w<day 0-6>:<minute of day>", not tied to a time zone.
// People sign in with a name (+ optional password) per meeting, like When2meet: a new name creates a
// person; a returning name must give the same password if one was set. The sign-in returns a token
// kept on the device; saving availability needs that token.

const DAY = 86_400_000;
const AFTER_END_MS = 30 * DAY; // dates mode: deleted one month after the last date
const IDLE_MS = 60 * DAY; // any mode: deleted after two months without visits
const TOUCH_EVERY_MS = 60 * 60 * 1000;
const MAX_DATES = 100; // up to ~3 months ahead, like the create calendar
const MAX_AHEAD_DAYS = 95;
const MAX_PEOPLE = 200;
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomId = (len) => Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => ALPHABET[b % ALPHABET.length]).join("");
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const fail = (message, status = 400) => json({ error: message }, status);
const clean = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");
const isDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const validTz = (tz) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/** Offset (ms) of a time zone from UTC at a given instant. */
function tzOffset(ms, tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
  return asUtc - (ms - (ms % 1000));
}

/** UTC instant (ms) of a wall-clock date + minute-of-day in a time zone. */
function zonedToUtc(date, minute, tz) {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, Math.floor(minute / 60), minute % 60);
  let utc = guess - tzOffset(guess, tz);
  utc = guess - tzOffset(utc, tz); // second pass settles DST edges
  return utc;
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 5000 }, key, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

let schemaReady = null;
export function ensureMeetSchema(env) {
  schemaReady ??= env.DB.batch([
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY, title TEXT NOT NULL, kind TEXT NOT NULL, tz TEXT NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL, days TEXT NOT NULL, slots TEXT NOT NULL, last_date TEXT, created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL)",
    ),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS meet_people (id TEXT PRIMARY KEY, meeting_id TEXT NOT NULL, name TEXT NOT NULL, name_key TEXT NOT NULL, pass_hash TEXT, salt TEXT, token TEXT NOT NULL, slots TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    ),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_meet_people_name ON meet_people(meeting_id, name_key)"),
  ])
    // added later: "what's it about" (ignore the error once the column exists)
    .then(() => env.DB.prepare("ALTER TABLE meetings ADD COLUMN description TEXT").run().catch(() => {}))
    .catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

function deleteAt(m) {
  const idle = (m.last_seen || m.created_at) + IDLE_MS;
  if (m.kind !== "dates" || !m.last_date) return idle;
  return Math.min(Date.parse(`${m.last_date}T23:59:59Z`) + AFTER_END_MS, idle);
}

async function loadMeeting(env, id, { touch = true } = {}) {
  const m = await env.DB.prepare("SELECT * FROM meetings WHERE id = ?").bind(id).first();
  if (!m) return null;
  const now = Date.now();
  if (now >= deleteAt(m)) {
    await env.DB.batch([env.DB.prepare("DELETE FROM meet_people WHERE meeting_id = ?").bind(id), env.DB.prepare("DELETE FROM meetings WHERE id = ?").bind(id)]);
    return null;
  }
  if (touch && now - m.last_seen > TOUCH_EVERY_MS) {
    await env.DB.prepare("UPDATE meetings SET last_seen = ? WHERE id = ?").bind(now, id).run();
    m.last_seen = now;
  }
  return m;
}

const publicMeeting = (m) => ({
  id: m.id,
  title: m.title,
  description: m.description || "",
  kind: m.kind,
  tz: m.tz,
  start_min: m.start_min,
  end_min: m.end_min,
  days: JSON.parse(m.days),
  slots: JSON.parse(m.slots),
  created_at: m.created_at,
  delete_at: deleteAt(m),
});

export async function sweepMeetings(env) {
  const now = Date.now();
  const lastDayCutoff = new Date(now - AFTER_END_MS).toISOString().slice(0, 10);
  const expired = "SELECT id FROM meetings WHERE (kind = 'dates' AND last_date < ?1) OR last_seen < ?2";
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM meet_people WHERE meeting_id IN (${expired})`).bind(lastDayCutoff, now - IDLE_MS),
    env.DB.prepare(`DELETE FROM meetings WHERE id IN (${expired})`).bind(lastDayCutoff, now - IDLE_MS),
  ]);
}

async function readJson(request) {
  try {
    const t = await request.text();
    return t.length > 200_000 ? null : JSON.parse(t);
  } catch {
    return null;
  }
}

/** Handles /api/meetings/*; returns null if the path isn't a meetings route. */
export async function handleMeetings(request, env, parts) {
  if (parts[0] !== "meetings") return null;
  await ensureMeetSchema(env);
  const method = request.method;

  // POST /api/meetings — create
  if (parts.length === 1 && method === "POST") {
    const b = await readJson(request);
    if (!b) return fail("That didn’t come through. Please try again.");
    const title = clean(b.title, 80);
    if (!title) return fail("Please give your meeting a name.");
    const description = clean(b.description, 400);
    const kind = b.kind === "week" ? "week" : "dates";
    const startMin = Number(b.start_min);
    const endMin = Number(b.end_min);
    if (!Number.isInteger(startMin) || !Number.isInteger(endMin) || startMin < 0 || endMin > 1440 || startMin % 15 || endMin % 15 || endMin <= startMin)
      return fail("“No later than” must be after “No earlier than”.");
    const tz = typeof b.tz === "string" && validTz(b.tz) ? b.tz : "UTC";
    let days;
    let slots;
    let lastDate = null;
    if (kind === "dates") {
      days = [...new Set((Array.isArray(b.dates) ? b.dates : []).filter(isDate))].sort();
      if (!days.length) return fail("Pick at least one date.");
      if (days.length > MAX_DATES) return fail(`Pick up to ${MAX_DATES} dates.`);
      const yesterday = new Date(Date.now() - DAY).toISOString().slice(0, 10);
      if (days[days.length - 1] < yesterday) return fail("Pick dates in the future.");
      const latest = new Date(Date.now() + MAX_AHEAD_DAYS * DAY).toISOString().slice(0, 10);
      if (days[days.length - 1] > latest) return fail("Pick dates within the next 3 months.");
      lastDate = days[days.length - 1];
      slots = [];
      for (const d of days) for (let mm = startMin; mm < endMin; mm += 15) slots.push(`t${Math.round(zonedToUtc(d, mm, tz) / 60000)}`);
    } else {
      days = [...new Set((Array.isArray(b.days) ? b.days : []).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
      if (!days.length) return fail("Pick at least one day.");
      slots = [];
      for (const d of days) for (let mm = startMin; mm < endMin; mm += 15) slots.push(`w${d}:${mm}`);
    }
    const id = randomId(10);
    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO meetings (id, title, description, kind, tz, start_min, end_min, days, slots, last_date, created_at, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, title, description, kind, tz, startMin, endMin, JSON.stringify(days), JSON.stringify(slots), lastDate, now, now)
      .run();
    return json({ id }, 201);
  }

  const mid = parts[1];
  if (!mid || !/^[A-Za-z0-9]{6,16}$/.test(mid)) return fail("Not found.", 404);

  // GET /api/meetings/:id
  if (parts.length === 2 && method === "GET") {
    const m = await loadMeeting(env, mid);
    if (!m) return fail("This meeting doesn’t exist or has been removed.", 404);
    const { results } = await env.DB.prepare("SELECT id, name, slots, (pass_hash IS NOT NULL) AS has_password FROM meet_people WHERE meeting_id = ? ORDER BY created_at")
      .bind(mid)
      .all();
    return json({ meeting: publicMeeting(m), people: results.map((r) => ({ id: r.id, name: r.name, slots: JSON.parse(r.slots), protected: !!r.has_password })) });
  }

  // POST /api/meetings/:id/signin  { name, password? } → { id, token, name, slots }
  if (parts.length === 3 && parts[2] === "signin" && method === "POST") {
    const m = await loadMeeting(env, mid);
    if (!m) return fail("This meeting doesn’t exist or has been removed.", 404);
    const b = await readJson(request);
    const name = clean(b?.name, 40);
    const password = typeof b?.password === "string" ? b.password.slice(0, 100) : "";
    if (!name) return fail("Please enter your name.");
    const key = name.toLowerCase();
    const existing = await env.DB.prepare("SELECT * FROM meet_people WHERE meeting_id = ? AND name_key = ?").bind(mid, key).first();
    if (existing) {
      if (existing.pass_hash && (await hashPassword(password, existing.salt)) !== existing.pass_hash)
        return fail("That name is taken and the password doesn’t match. Use the same password as before, or a different name.", 403);
      return json({ id: existing.id, token: existing.token, name: existing.name, slots: JSON.parse(existing.slots) });
    }
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM meet_people WHERE meeting_id = ?").bind(mid).first("n");
    if (count >= MAX_PEOPLE) return fail("This meeting is full.", 409);
    const id = randomId(10);
    const token = randomId(24);
    const salt = password ? randomId(16) : null;
    const hash = password ? await hashPassword(password, salt) : null;
    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO meet_people (id, meeting_id, name, name_key, pass_hash, salt, token, slots, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)",
    )
      .bind(id, mid, name, key, hash, salt, token, now, now)
      .run();
    return json({ id, token, name, slots: [] }, 201);
  }

  // PUT /api/meetings/:id/people/:pid  { token, slots[] } — saved immediately after each change
  if (parts.length === 4 && parts[2] === "people" && method === "PUT") {
    const m = await loadMeeting(env, mid);
    if (!m) return fail("This meeting doesn’t exist or has been removed.", 404);
    const b = await readJson(request);
    const person = await env.DB.prepare("SELECT token FROM meet_people WHERE id = ? AND meeting_id = ?").bind(parts[3], mid).first();
    if (!person || !b || person.token !== b.token) return fail("Please sign in again to change your availability.", 403);
    const allowed = new Set(JSON.parse(m.slots));
    const slots = [...new Set((Array.isArray(b.slots) ? b.slots : []).filter((s) => typeof s === "string" && allowed.has(s)))];
    await env.DB.prepare("UPDATE meet_people SET slots = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(slots), Date.now(), parts[3]).run();
    return json({ ok: true, count: slots.length });
  }

  return fail("Not found.", 404);
}
