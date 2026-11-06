// Convene — Cloudflare Worker API.
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

async function getEvent(env, id) {
  const row = await env.DB.prepare(
    "SELECT id, title, description, year, start_date, end_date, created_at FROM events WHERE id = ?",
  )
    .bind(id)
    .first();
  return withRange(row);
}

async function handleApi(request, env, url) {
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const method = request.method;

  // POST /api/events
  if (parts.length === 1 && parts[0] === "events" && method === "POST") {
    const body = await readBody(request);
    if (!body) return fail("Invalid request.");
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

    const id = randomId(10);
    await env.DB.prepare(
      "INSERT INTO events (id, title, description, year, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, title, description, Number(start.slice(0, 4)), start, end, Date.now())
      .run();
    return json({ id }, 201);
  }

  if (parts[0] !== "events" || !parts[1] || !/^[A-Za-z0-9]{6,16}$/.test(parts[1])) {
    return fail("Not found.", 404);
  }
  const eventId = parts[1];

  // GET /api/events/:id
  if (parts.length === 2 && method === "GET") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn't exist.", 404);
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
    return json({ event, responses });
  }

  // POST /api/events/:id/responses
  if (parts.length === 3 && parts[2] === "responses" && method === "POST") {
    const event = await getEvent(env, eventId);
    if (!event) return fail("This event doesn't exist.", 404);
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM responses WHERE event_id = ?").bind(eventId).first("n");
    if (count >= LIMITS.responsesPerEvent) return fail("This event is full.", 409);

    const body = await readBody(request);
    if (!body) return fail("Invalid request.");
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
    if (!event) return fail("This event doesn't exist.", 404);
    const body = await readBody(request);
    if (!body || typeof body.token !== "string") return fail("Invalid request.");
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
      "CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', year INTEGER NOT NULL, start_date TEXT, end_date TEXT, created_at INTEGER NOT NULL)",
    ),
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id), name TEXT NOT NULL, token TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    ),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_responses_event ON responses(event_id, created_at)"),
  ])
    .then(async () => {
      // databases created before date ranges existed: add the columns (fails harmlessly if present)
      for (const col of ["start_date", "end_date"]) {
        await env.DB.prepare(`ALTER TABLE events ADD COLUMN ${col} TEXT`).run().catch(() => {});
      }
    })
    .catch((err) => {
    schemaReady = null; // retry on the next request
    throw err;
  });
  return schemaReady;
}

export default {
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
