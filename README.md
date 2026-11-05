# Convene

A no-login group planner for phone, tablet and desktop. It works like When2meet or Lettucemeet, and adds destination voting and activity ideas.

1. **Create an event.** Give it a name, optional notes and a calendar year. You get a personal link to share. An event can't be edited or deleted once it's created.
2. **Share the link.** Each person goes through a short animated flow:
   - enters their name
   - marks days on the year calendar: **dark blue** for *definitely*, **light blue** for *maybe* (tap a day, or press and hold then drag to mark many days)
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
| `POST` | `/api/events` | `{ title, description?, year }` → `{ id }` |
| `GET` | `/api/events/:id` | → `{ event, responses[] }` |
| `POST` | `/api/events/:id/responses` | `{ name, yes[], maybe[], destinations[], activities[], likes[] }` → `{ id, token }` |
| `PUT` | `/api/events/:id/responses/:rid` | same as above + `token` |

Dates are `YYYY-MM-DD` strings. All input is sanitised on the server: lengths are capped, dates are checked against the event year, and links must be http(s).
