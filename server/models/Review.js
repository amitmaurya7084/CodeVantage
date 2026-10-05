const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    decision: {
      type: String,
      enum: ["Approved", "Rejected", "Changes Requested"],
      required: true,
    },
    comments: {
      type: String,
      required: [true, "Review comments are required"],
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Every review is kept (append-only history), even across multiple resubmissions
reviewSchema.index({ submission: 1, createdAt: -1 });
reviewSchema.index({ student: 1 });

module.exports = mongoose.model("Review", reviewSchema);
