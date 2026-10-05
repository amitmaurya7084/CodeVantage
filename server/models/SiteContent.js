const mongoose = require("mongoose");

/**
 * A single flexible content block, addressed by a unique dotted key
 * (e.g. "home.hero", "about.mission", "contact.info", "settings.branding").
 * `data` shape varies per key — the admin CMS UI and public page components
 * agree on the shape for each key by convention, not by a rigid schema, so
 * new sections can be added without a migration.
 */
const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String, // human-readable name shown in the admin CMS UI
      required: true,
    },
    group: {
      type: String, // groups related keys in the admin UI, e.g. "Homepage", "About", "Settings"
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

siteContentSchema.index({ group: 1 });

module.exports = mongoose.model("SiteContent", siteContentSchema);
