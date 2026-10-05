const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // used in URLs, e.g. /internships/web-development
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 200,
    },
    overview: {
      type: String, // long-form description for the program detail page
      default: "",
    },
    durationLabel: {
      type: String, // e.g. "1 Month"
      required: true,
    },
    projectsCount: {
      type: Number,
      required: true,
      default: 3,
    },
    level: {
      type: String,
      enum: ["Beginner Friendly", "Intermediate", "Advanced"],
      default: "Beginner Friendly",
    },
    format: {
      type: String,
      default: "Virtual / Project-Based",
    },
    technologies: [{ type: String, trim: true }],
    icon: {
      type: String, // icon identifier used by the frontend (e.g. lucide icon name)
      default: "code",
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true, // lets admin retire a program without deleting historical data
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

programSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model("Program", programSchema);
