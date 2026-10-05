const mongoose = require("mongoose");
const validator = require("validator");

const submissionSchema = new mongoose.Schema(
  {
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
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    githubUrl: {
      type: String,
      required: [true, "GitHub repository URL is required"],
      validate: [validator.isURL, "GitHub URL must be a valid URL"],
    },
    liveUrl: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Live project URL must be a valid URL",
      },
    },
    linkedinUrl: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "LinkedIn post URL must be a valid URL",
      },
    },
    description: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending Review", "Under Review", "Approved", "Rejected", "Changes Requested"],
      default: "Pending Review",
    },
    submissionCount: {
      type: Number, // increments each time a student re-submits after changes requested
      default: 1,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// A student has exactly one submission record per task (updated on re-submit)
submissionSchema.index({ student: 1, task: 1 }, { unique: true });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
