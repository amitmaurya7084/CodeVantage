const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true, // format: CV-WD-2026-000001
      uppercase: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    studentNameSnapshot: {
      type: String, // captured at issue time so later profile edits don't alter the cert
      required: true,
    },
    programNameSnapshot: {
      type: String,
      required: true,
    },
    durationLabel: {
      type: String,
      required: true,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    qrCodeDataUrl: {
      type: String, // base64 PNG data URL embedded into the PDF
      required: true,
    },
    verificationUrl: {
      type: String, // e.g. https://codevantage.in/verify/CV-WD-2026-000001
      required: true,
    },
    pdfPath: {
      type: String, // storage path/URL of the generated PDF
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
  },
  { timestamps: true }
);

// One certificate per student per program — also closes the generate-twice race condition
certificateSchema.index({ student: 1, program: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
