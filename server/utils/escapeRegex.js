/**
 * Escapes user input so it can be safely placed inside a MongoDB $regex.
 * Without this, searching for "C++" or "(" throws "Invalid regular expression"
 * (a 500 error), and crafted patterns can cause catastrophic backtracking (ReDoS).
 */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { escapeRegex };
