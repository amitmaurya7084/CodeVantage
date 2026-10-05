const jwt = require("jsonwebtoken");

/**
 * Signs a JWT and attaches it to the response as an httpOnly cookie.
 * Using httpOnly cookies (rather than localStorage) protects the token from
 * being read by malicious client-side JavaScript (XSS mitigation).
 */

// sameSite: "lax" works when frontend and backend share a site (e.g. app.example.com
// + api.example.com, or localhost). If they are on different sites (e.g. two separate
// *.onrender.com URLs) the browser drops "lax" cookies on API calls, so login appears
// to work but every following request is unauthenticated. In that case set
// COOKIE_SAMESITE=none (requires HTTPS, which Render provides).
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  return {
    httpOnly: true,
    secure: isProduction || sameSite === "none", // "none" cookies must be Secure
    sameSite,
  };
}

function signAndSetCookie(res, { id, cookieName, secret, expiresIn }) {
  const token = jwt.sign({ id }, secret, { expiresIn });

  res.cookie(cookieName, token, {
    ...getCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
}

module.exports = { signAndSetCookie, getCookieOptions };
