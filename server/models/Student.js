const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // prevents duplicate registration at the DB level
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never returned by default in queries
    },
    college: {
      type: String,
      required: [true, "College / School is required"],
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course / Class is required"],
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "GitHub URL must be a valid URL",
      },
    },
    linkedinUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "LinkedIn URL must be a valid URL",
      },
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    year: {
      type: String,
      enum: ["First Year", "Second Year", "Third Year", "Final Year", "Graduated", ""],
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    skills: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "You can list at most 20 skills",
      },
    },
    profilePictureUrl: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      default: "student",
      immutable: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      default: null, // assigned automatically on registration
    },
    internshipStatus: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    certificateStatus: {
      type: String,
      enum: ["not_eligible", "eligible", "payment_pending", "generated"],
      default: "not_eligible",
    },
    agreedToTerms: {
      type: Boolean,
      required: [true, "You must agree to the Terms & Conditions"],
    },
    isActive: {
      type: Boolean,
      default: true, // lets admin soft-disable an account without deleting data
    },
    lastLoginAt: { type: Date, default: null },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

studentSchema.index({ program: 1 });
studentSchema.index({ certificateStatus: 1 });

// Hash password before saving, only when it's new/changed
studentSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
