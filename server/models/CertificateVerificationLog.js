const mongoose = require("mongoose");

const certificateVerificationLogSchema = new mongoose.Schema(
  {
    certificateIdQueried: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    found: {
      type: Boolean,
      required: true,
    },
    // No IP or personal data stored beyond what's needed for basic abuse monitoring
  },
  { timestamps: true }
);

certificateVerificationLogSchema.index({ certificateIdQueried: 1 });
certificateVerificationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CertificateVerificationLog", certificateVerificationLogSchema);
