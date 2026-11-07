// The site moved from euroavia-pm.euroavia.workers.dev to wingman.euroavia.workers.dev.
// This keeps every old link working by forwarding it, path and query included.
// 302 (temporary) so browsers don't cache it forever, in case the old address is reused.
const TARGET = "https://wingman.euroavia.workers.dev";

export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(TARGET + url.pathname + url.search, 302);
  },
};
