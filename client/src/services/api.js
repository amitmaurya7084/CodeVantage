import axios from "axios";

// In dev, Vite proxies /api to the Express server (see vite.config.js).
// In production, set VITE_API_URL to the deployed backend URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // sends the httpOnly auth cookie once auth is wired in (Step 4)
});

export default api;
