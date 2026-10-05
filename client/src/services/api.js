import axios from "axios";

// In dev, Vite proxies /api to the Express server (see vite.config.js).
// In production, set VITE_API_URL to the deployed backend URL.
// Deploy-friendly: VITE_API_URL may be given as the bare backend origin
// (https://my-api.onrender.com), with a trailing slash, or already ending in /api.
// Forgetting "/api" makes every call hit e.g. /auth/me, which the server answers
// with "Route not found" — so the suffix is added automatically when missing.
function resolveApiBaseUrl(raw) {
  if (!raw) return "/api";
  const trimmed = raw.trim().replace(/\/+$/, "");
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_URL),
  withCredentials: true, // sends the httpOnly auth cookie once auth is wired in (Step 4)
});

export default api;
