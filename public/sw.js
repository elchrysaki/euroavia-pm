// Wingman service worker (same approach as Blitz): makes repeat visits open instantly while
// always serving the newest version.
// - App shell (page, script, styles): network first — usually a quick "not changed" check — and
//   the saved copy if the network is slow (over 2.5 s) or offline.
// - Everything under /api (events, responses, votes): always straight to the network, never cached.
const SHELL = "wingman-shell-v24";
const SHELL_FILES = ["/", "/app.js", "/styles.css", "/meet.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

async function fromShell(req, key) {
  const cache = await caches.open(SHELL);
  const fresh = fetch(req, { cache: "no-cache" }).then((res) => {
    if (res.ok) cache.put(key, res.clone());
    return res;
  });
  const slow = new Promise((resolve) => setTimeout(resolve, 2500));
  try {
    const res = await Promise.race([fresh, slow.then(() => null)]);
    if (res) return res;
  } catch {
    /* offline: use the saved copy */
  }
  fresh.catch(() => {});
  return (await cache.match(key)) || fresh;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // live data: never cached
  if (req.mode === "navigate") return e.respondWith(fromShell(req, "/")); // every app route is index.html
  if (url.pathname === "/app.js" || url.pathname === "/styles.css" || url.pathname === "/meet.js") return e.respondWith(fromShell(req, url.pathname));
});
