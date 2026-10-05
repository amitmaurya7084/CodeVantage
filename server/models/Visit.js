const mongoose = require("mongoose");

/**
 * One row per page view. `visitorId` is a random UUID stored in an anonymous,
 * non-authenticated cookie (see utils/visitorId.js) — it identifies a browser
 * across visits well enough to count "unique visitors" without tying a visit
 * to a real identity. No IP address or user agent is stored, in line with the
 * privacy-minimal approach used elsewhere in this app (see
 * CertificateVerificationLog).
 */
const visitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Powers the admin analytics dashboard: counting visits/unique visitors in a
// date range is always filtered by createdAt first.
visitSchema.index({ createdAt: -1 });
visitSchema.index({ visitorId: 1, createdAt: -1 });

module.exports = mongoose.model("Visit", visitSchema);
