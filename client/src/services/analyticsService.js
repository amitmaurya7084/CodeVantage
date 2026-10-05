import api from "./api";

/**
 * Records one page view. Fire-and-forget by design: analytics must never
 * block rendering or surface an error to the visitor if the backend is
 * briefly unreachable, so failures are swallowed silently.
 */
export function trackVisit(path) {
  api.post("/analytics/track", { path }).catch(() => {});
}
