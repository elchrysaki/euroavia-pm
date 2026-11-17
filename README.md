# Wingman

A EUROAVIA no-login group planner for phone, tablet and desktop, laid out like Blitz.

- **Logo:** the word "Wingman" set in Michroma (a wide aerospace-style face, SIL Open Font License, `public/fonts/`) with a brushed-metal finish: blue steel in light mode, chrome in dark mode. The tab and home-screen icon (`public/icon.svg`, rendered to the PNGs) is a blue-steel tile with a silver W and three speed lines.
- **Header bar** on every page: the Wingman wordmark (home), **Dashboard**, **Join with PIN** and **+ New event**. Hovering a link shows a faded pill, and the page you're on keeps it. On phones the links fold into a ☰ menu.
- **Home** (`/`): what Wingman does, **Create an event** (choose **Trip days** or **Meeting times**), a **PIN** box to join one, "See it in action" and three steps.
- **Dashboard** (`/dashboard`): "Welcome back", what you recently viewed, your meetings and your trips with live counts, and on the right **Create a new event** and **Join with PIN**. Plans the server has deleted drop off the list.
- **Join with PIN** (`/join`, or `/join?pin=123456`): every new trip and meeting gets a 6-digit PIN as its id (unique across both). Typing it opens the plan. Older plans keep their long links.
- **Background:** a colour-graded brushed-blue-metal photo (icy for light mode, deep electric for dark mode). It's one fixed layer sized to the tallest the screen can get, so scrolling, the phone toolbar collapsing or an edge bounce never move it, and it's the same on every page, the answer flow included.
- **Look:** flat (2D) surfaces with soft shadows, solid buttons, one readable type scale (17 px body text, nothing under 13 px) and wider pages on big screens.

## Trip days

1. **Create an event.** Give it a name, optional notes and the dates people can pick from: the next **3 months**, **6 months** or **1 year**, or a **custom** start and end date (up to two years, with shortcuts for the rest of this year or all of next year). You get a personal link to share. An event can't be edited or deleted once it's created.
2. **Share the link.** Each person goes through a short flow (Back sits next to Continue; the last step submits, no separate review screen):
   - enters their name
   - marks days on the event's calendar: **dark blue** for *definitely*, **light blue** for *maybe*. Tap a day, or press and drag to mark the whole rectangle between two days, like the meeting times grid (on touch, hold a day first). Their days then show on a calendar.
   - picks or suggests **destinations** (they see what others suggested), if the host turned Places on
   - adds **activities** with pasted links, for a destination or in general, and can like other people's ideas, if the host turned Activities on
3. **See the result.**
   - **Calendar heatmap:** the darker a day, the more people can come. Tap a day to see who said yes, maybe and no.
   - **Who responded:** tap a name to see only that person's days (definitely and maybe); tap again or **Show everyone** to go back.
   - **Select dates:** pick several days to see who is free on *all* of them.
   - **Best date:** the day most people can make, at the top of the calendar. Tap it (or **More dates**) to expand the next five best dates; tap one to see who can make it.
   - **Places leaderboard:** destinations ranked by votes.
   - **Activities:** ideas grouped by destination, with links and likes.

People can edit their own response later from the same device. The device keeps a private token for this. There are no accounts.

**The host** is whoever created the event, from that browser (it keeps a private admin key; the server checks it). The host can turn **Places** and **Activities** on or off (also when creating), and remove anyone's entry with the × next to their name. Meetings work the same way: their creator can remove entries. Events created before this have no host.

## Meeting times

Works like When2meet:

1. **Create** (`/meet`), in two steps:
   - **Dates.** The calendar opens on the next 4 weeks and scrolls up to 3 months ahead. Tap a day, or press and drag to select every date between where you start and where you let go (on a touch screen, hold a day first). The **›** next to a week selects that week, **Select month** selects a month, and quick picks cover the next 7 days, 2 weeks or 4 weeks, weekdays only, or clear. Then press **Let’s meet**.
   - **Details.** The name, what it’s about, who created it (optional, shown as "Created by"), **No earlier than** / **No later than** (half-hour steps), and the time zone those hours are in.
2. **Add availability** on the meeting page (`/m/:id`): just a name, no password. This device remembers you for that meeting. Typing the same name on another device picks your answers back up.
3. **Mark your times.** Choose **Available**, **Maybe** or **Unavailable**, then press on a half-hour slot and drag a rectangle; every slot in it gets that mark (pressing a slot that already has it clears instead). Changes save as you go; **Done** goes back to the group view.
4. **Group's availability.**
   - Each half hour is shaded by how many people are free (maybe counts half). Every meeting shows half-hour rows; older 15-minute meetings show two slots per row.
   - Hover over (or tap) a time to see who's available, who said maybe, and who can't.
   - Tap a name under **Responses** to see only that person's times.
   - "Best time so far" shows the longest stretch with the most people.
   - Every viewer sees the times converted to their own time zone, and can switch to any other.

On a desktop the two grids sit side by side. On a phone you switch between **Your availability** and **Group** and page through the days.

Meetings follow the same retention as events. A date meeting is deleted a month after its last date. Any meeting is deleted after two months with no visits.

## Performance: full effects and smooth mode

The site picks one of two visual modes **before the first paint** (a small inline script in `index.html`):

- **Full effects:** frosted glass on the bars and sheets, animated background, word-by-word headings, shimmer and glint.
- **Smooth mode:** same layout and colours, with no backdrop blur, no infinite or filter-based animations, and shorter transitions.

The choice is fully automatic and never shown to visitors. Smooth mode is used when any of these are true (first match wins):

1. `?perf=lite` / `?perf=full` is in the URL. This is a developer override for testing and isn't remembered.
2. This device was measured as too slow in the last 7 days. On startup, and again when the guided flow first opens, the site measures:
   - **dropped frames** against the screen's own refresh rate, so a phone capped at 30 fps by Low Power Mode isn't penalised
   - **start-up work time**: how long the browser took to parse and run the page after downloading it
   - **main-thread blocking**: long tasks that make taps feel late

   If full effects are too heavy, the site switches quietly. The result is kept for 7 days, then measured again.
3. Reduce Motion or Reduce Transparency is on, Data Saver is on, or the connection is 2G/3G. The mode also switches mid-visit if the connection drops.
4. The device is low-end (≤ 2 GB RAM, ≤ 2 cores, or < 4 GB with ≤ 4 cores), or the browser has no `backdrop-filter`.

Some optimisations apply in both modes:

- Cards are solid surfaces instead of blurred glass. Blur over the plain gradient was invisible, and every blurred layer is re-drawn on scroll.
- Off-screen months skip rendering (`content-visibility`).
- The pulse animation uses `opacity` instead of `filter`.
- Event pages show the last saved copy instantly, then refresh. This also works offline.
- Static files are cached by the browser (`public/_headers`).

**Bump `?v=N` on `/app.js` and `/styles.css` in `index.html` with every release** so visitors get the new files immediately.

Measured on an emulated Pixel 7 in Chrome with the CPU slowed 4× (median frame time / share of frames over 50 ms):

| | Before | Full effects | Smooth mode |
|---|---|---|---|
| Scroll a 13-month calendar | 50 ms / 27% | 33 ms / 2% | 16.7 ms / 0% |
| Guided-flow step change | 67 ms / 65–94% | 33 ms / 8% | 16.7 ms / 1% |
| Backdrop-blur layers on screen | 37 | 4 | 0 |

## Metal look

The UI is styled with the [skeuomorphic-forge](https://github.com/mmmprod/skeuomorphic-forge) Claude skill (MIT), installed as a project skill in `.claude/skills/skeuomorphic-forge/`. Future Claude Code sessions in this repo can use it for new components.

The look is cool steel adapted to the light theme:

- **Surfaces:** brushed-aluminium cards, a faceplate with Torx screws on the create form, recessed wells for inputs, a keypad well for the segmented controls.
- **Keys:** blue-anodized primary keys, aluminium secondary keys, calendar days as small keys (marked days are pressed, lit keys).
- **Details:** chrome-coin medals, slider-channel bars, chrome title text and engraved labels.

All shadow stacks are CSS variables at the end of `public/styles.css`. Smooth mode swaps in lighter stacks.

## How long events are kept

- An event is deleted **one month after its last selectable date**.
- An event **nobody opens for two months** is also deleted, even if its dates haven't ended. Every visit restarts that clock.
- In the last 7 days before deletion, the event page shows when it will be deleted.
- Deletion happens when someone opens an expired event, and in a daily sweep (Cron Trigger, 03:17 UTC). Responses are deleted with their event.

## Always up to date (same approach as Blitz)

- **Service worker** (`public/sw.js`): the page, script and styles come from the network first, so every visit gets the newest version. The saved copy is used if the network takes over 2.5 s or is offline. Event data (`/api`) is never cached.
- **Open tabs** check every 30 minutes, and whenever you return to the tab, whether a newer version is live. If so, they reload at the next page change, or straight away on return, unless a form or sheet is open.

## Stack

- **Cloudflare Worker** (`src/worker.js`): a small JSON API under `/api/*`
- **Cloudflare D1** (SQLite): stores events and responses (`migrations/`)
- **Static frontend** (`public/`): vanilla HTML/CSS/JS with no build step. It follows Apple's design style: the SF system font, frosted glass, segmented controls, bottom sheets and safe-area insets. It supports light and dark mode and respects reduced motion.

## Run locally

```bash
npm install
npm run dev        # applies local D1 migrations and starts http://localhost:8787
```

## Deploy to Cloudflare

```bash
npx wrangler login
npx wrangler d1 create convene-db
```

Copy the `database_id` that the create command prints into `wrangler.jsonc`, then:

```bash
npm run deploy     # applies remote migrations, then deploys the worker + assets
```

You can also connect the GitHub repo in **Cloudflare dashboard → Workers & Pages → Create → Import a repository**. Use build command `npx wrangler d1 migrations apply convene-db --remote` (optional) and deploy command `npx wrangler deploy`.

### Deploying from a proxied environment (e.g. Claude Code on the web)

If `npx wrangler deploy` fails at the asset upload with `401 Unauthorized` on `/workers/assets/upload`, the network proxy is replacing wrangler's one-time upload key with your API token. Deploy with the site's files embedded in the Worker instead (same Worker, same database):

```bash
node scripts/build-inline.mjs && npx wrangler deploy -c wrangler.inline.jsonc
```

The API token needs **Workers Scripts: Edit** (plus **D1: Edit** for database fixes and **Workers CI: Read** for build logs).

### Address

The site lives at **https://wingman.euroavia.workers.dev** (Worker name `wingman`).

## API

| Method | Path | Body |
| --- | --- | --- |
| `POST` | `/api/events` | `{ title, description?, start_date, end_date }` → `{ id }` |
| `GET` | `/api/events/:id` | → `{ event, responses[] }` |
| `POST` | `/api/events/:id/responses` | `{ name, yes[], maybe[], destinations[], activities[], likes[] }` → `{ id, token }` |
| `PUT` | `/api/events/:id/responses/:rid` | same as above + `token` |

| `POST` | `/api/meetings` | `{ title, description?, creator?, kind: "dates"\|"week", dates[]\|days[], start_min, end_min, tz }` → `{ id }` |
| `GET` | `/api/meetings/:id` | → `{ meeting, people[] }` |
| `POST` | `/api/meetings/:id/signin` | `{ name }` → `{ id, token, name, slots[], maybe[] }` |
| `PUT` | `/api/meetings/:id/people/:pid` | `{ token, slots[], maybe[] }` |
| `GET` | `/api/pin/:pin` | → `{ kind: "trip" \| "meet", id }` |

New meetings use 30-minute slots (older ones keep 15). A date meeting stores each slot as an absolute instant (`t` + UTC epoch minutes), so every viewer can convert it to their own time zone. A weekday meeting stores `w<day>:<minute>`. There are no passwords: a name gets that person back.

Dates are `YYYY-MM-DD` strings. All input is sanitised on the server: lengths are capped, dates must fall inside the event's range, and links must be http(s). The worker creates and upgrades its own tables on first use, so a new D1 database needs no setup.
