const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    order: {
      type: Number, // 1, 2, 3 — determines task sequence for a program
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    objectives: [{ type: String }],
    requirements: [{ type: String }],
    technologies: [{ type: String, trim: true }],
    expectedOutput: {
      type: String,
      default: "",
    },
    submissionInstructions: {
      type: String,
      default: "Submit your GitHub repository URL and live project URL.",
    },
    deadline: {
      type: Date,
      default: null, // optional — internship is self-paced within 1 month
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ program: 1, order: 1 }, { unique: true }); // no duplicate task order per program

module.exports = mongoose.model("Task", taskSchema);
