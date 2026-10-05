const { Counter } = require("../models");

const PROGRAM_CODES = {
  "web-development": "WD",
  javascript: "JS",
  "php-mysql": "PM",
  python: "PY",
};

function codeForProgram(slug) {
  return PROGRAM_CODES[slug] || slug.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase() || "GN";
}

/**
 * Generates the next certificate ID for a program/year, e.g. CV-WD-2026-000001.
 * Uses findOneAndUpdate with $inc as an atomic operation, so two certificates
 * generated at the same instant can never collide on the same number.
 */
async function generateCertificateId(programSlug) {
  const year = new Date().getFullYear();
  const code = codeForProgram(programSlug);
  const counterId = `certificate-${code}-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const sequence = String(counter.seq).padStart(6, "0");
  return `CV-${code}-${year}-${sequence}`;
}

module.exports = { generateCertificateId };
