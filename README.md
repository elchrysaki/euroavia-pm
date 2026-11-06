# Wingman

A EUROAVIA no-login group planner for phone, tablet and desktop. It works like When2meet or Lettucemeet, and adds destination voting and activity ideas.

1. **Create an event.** Give it a name, optional notes and the dates people can pick from: the next **3 months**, **6 months** or **1 year**, or a **custom** start and end date (up to two years, with shortcuts for the rest of this year or all of next year). You get a personal link to share. An event can't be edited or deleted once it's created.
2. **Share the link.** Each person goes through a short animated flow:
   - enters their name
   - marks days on the event's calendar: **dark blue** for *definitely*, **light blue** for *maybe* (tap a day, or press and hold then drag to mark many days)
   - picks or suggests **destinations** (they see what others suggested)
   - adds **activities** with pasted links, for a destination or in general, and can like other people's ideas
   - submits
3. **See the result.**
   - **Calendar heatmap:** the darker a day, the more people can come. Tap a day to see who said yes, maybe and no.
   - **Select dates:** pick several days to see who is free on *all* of them.
   - **Best dates:** the top days are shown at the top of the calendar.
   - **Places leaderboard:** destinations ranked by votes.
   - **Activities:** ideas grouped by destination, with links and likes.

People can edit their own response later from the same device. The device keeps a private token for this. There are no accounts.

## Performance: full effects and smooth mode

The site picks one of two visual modes **before the first paint** (a small inline script in `index.html`):

- **Full effects:** frosted glass on the bars and sheets, animated background, word-by-word headings, shimmer and glint.
- **Smooth mode:** same layout and colours, with no backdrop blur, no infinite or filter-based animations, and shorter transitions.

Smooth mode is used when any of these are true (first match wins):

1. `?perf=lite` / `?perf=full` in the URL, or the person tapped the footer toggle. This choice is remembered (`?perf=auto` clears it).
2. A frame-rate check in the last 7 days found this device dropping frames. The check samples ~1s of frames at startup and when the guided flow first opens.
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

## API

| Method | Path | Body |
| --- | --- | --- |
| `POST` | `/api/events` | `{ title, description?, start_date, end_date }` → `{ id }` |
| `GET` | `/api/events/:id` | → `{ event, responses[] }` |
| `POST` | `/api/events/:id/responses` | `{ name, yes[], maybe[], destinations[], activities[], likes[] }` → `{ id, token }` |
| `PUT` | `/api/events/:id/responses/:rid` | same as above + `token` |

Dates are `YYYY-MM-DD` strings. All input is sanitised on the server: lengths are capped, dates must fall inside the event's range, and links must be http(s). The worker creates and upgrades its own tables on first use, so a new D1 database needs no setup.
