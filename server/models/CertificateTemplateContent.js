const mongoose = require("mongoose");

/**
 * One row per editable text field on the certificate template. The fixed
 * parts of the certificate (border, logo, seal, mountains, colors, layout —
 * see server/utils/pdfGenerator.js) are never stored here and have no way to
 * be edited through the admin API; only what's in this collection is.
 *
 * `templateId` exists so a second certificate template could be added later
 * without a schema change — for now every row uses "default".
 */
const certificateTemplateContentSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
      default: "default",
      trim: true,
    },
    fieldName: {
      type: String,
      required: true,
      trim: true,
    },
    fieldValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    fieldType: {
      type: String,
      enum: ["text", "textarea", "list"],
      required: true,
      default: "text",
    },
    // Enforced server-side (see certificateTemplateController) — a row with
    // isEditable:false is rejected by the update/delete endpoints even if a
    // request for it reaches the API. Every default field ships editable;
    // this exists as a lock any field can be switched into later.
    isEditable: {
      type: Boolean,
      default: true,
    },
    label: {
      // Human-readable name shown in the admin UI (e.g. "Footer Tagline"),
      // as distinct from the machine key in `fieldName` (e.g. "footerTagline").
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

certificateTemplateContentSchema.index({ templateId: 1, fieldName: 1 }, { unique: true });

module.exports = mongoose.model("CertificateTemplateContent", certificateTemplateContentSchema);
