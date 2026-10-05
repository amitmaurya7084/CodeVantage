const crypto = require("crypto");
const { z } = require("zod");
const { Student, Program } = require("../models");
const { signAndSetCookie, getCookieOptions } = require("../utils/generateToken");
const { sendEmail } = require("../utils/mailer");
const { studentRegisteredEmail, forgotPasswordEmail } = require("../utils/emailTemplates");

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(100),
    email: z.string().trim().email("Please provide a valid email"),
    phone: z.string().trim().min(7, "Please provide a valid phone number"),
    college: z.string().trim().min(1, "College / School is required"),
    course: z.string().trim().min(1, "Course / Class is required"),
    githubUrl: z.string().trim().url("GitHub URL must be valid").optional().or(z.literal("")),
    linkedinUrl: z.string().trim().url("LinkedIn URL must be valid").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    programSlug: z.string().trim().min(1, "Please select a program"),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the Terms & Conditions and Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Only fields a student is allowed to self-edit from the Profile page. Deliberately
// excludes email (login identity), password (has its own flow), and anything
// admin-controlled (program, certificateStatus, internshipStatus, isActive, role).
const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100).optional(),
  phone: z.string().trim().min(7, "Please provide a valid phone number").optional(),
  college: z.string().trim().min(1, "College / School is required").optional(),
  course: z.string().trim().min(1, "Course / Class is required").optional(),
  githubUrl: z.string().trim().url("GitHub URL must be valid").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("LinkedIn URL must be valid").optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Please provide a valid date")
    .optional()
    .or(z.literal("")),
  year: z.enum(["First Year", "Second Year", "Third Year", "Final Year", "Graduated", ""]).optional(),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer").optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1).max(30)).max(20, "You can list at most 20 skills").optional(),
});

function sanitizeStudent(student) {
  const obj = student.toObject();
  delete obj.password;
  return obj;
}

async function registerStudent(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }
    const { confirmPassword, programSlug, ...studentData } = parsed.data;

    const existing = await Student.findOne({ email: studentData.email });
    if (existing) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    const program = await Program.findOne({ slug: programSlug, isActive: true });
    if (!program) {
      const error = new Error("Selected program is not available.");
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.create({
      ...studentData,
      program: program._id,
    });

    signAndSetCookie(res, {
      id: student._id,
      cookieName: "student_token",
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const { subject, html } = studentRegisteredEmail(student, program.name);
    sendEmail({ to: student.email, subject, html }); // fire-and-forget, never blocks the response

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      student: sanitizeStudent(student),
    });
  } catch (err) {
    next(err);
  }
}

async function loginStudent(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }
    const { email, password } = parsed.data;

    const student = await Student.findOne({ email }).select("+password");
    const passwordMatches = student ? await student.matchPassword(password) : false;

    // Same generic error whether email or password is wrong — avoids leaking
    // which registered emails exist (user enumeration protection).
    if (!student || !passwordMatches) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    if (!student.isActive) {
      const error = new Error("This account has been deactivated. Contact support.");
      error.statusCode = 403;
      throw error;
    }

    student.lastLoginAt = new Date();
    await student.save();

    signAndSetCookie(res, {
      id: student._id,
      cookieName: "student_token",
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({ success: true, message: "Login successful.", student: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

function logoutStudent(req, res) {
  res.clearCookie("student_token", getCookieOptions());
  res.json({ success: true, message: "Logged out." });
}

async function getMe(req, res, next) {
  try {
    const student = await Student.findById(req.student._id).populate(
      "program",
      "name slug durationLabel"
    );
    res.json({ success: true, student: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

const forgotPasswordSchema = z.object({ email: z.string().trim().email() });

/** PUT /api/auth/profile — student self-edits their own profile fields (see updateProfileSchema) */
async function updateProfile(req, res, next) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    // Empty-string clears an optional field; `undefined` (field not sent) leaves it untouched.
    // dateOfBirth is cast to `null` specifically — Mongoose's Date type doesn't reliably
    // accept "" the way String fields do.
    const updates = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;
      updates[key] = key === "dateOfBirth" && value === "" ? null : value;
    }

    const student = await Student.findByIdAndUpdate(req.student._id, updates, {
      new: true,
      runValidators: true,
    }).populate("program", "name slug durationLabel");

    res.json({ success: true, message: "Profile updated.", student: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/profile/picture — multipart/form-data, field name "picture" */
async function uploadProfilePicture(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error("Please choose an image to upload.");
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findByIdAndUpdate(
      req.student._id,
      { profilePictureUrl: req.file.path }, // CloudinaryStorage puts the secure_url here
      { new: true }
    ).populate("program", "name slug durationLabel");

    res.json({ success: true, message: "Profile picture updated.", student: sanitizeStudent(student) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/forgot-password — always responds the same way, whether or not the email exists */
async function forgotPassword(req, res, next) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("Please provide a valid email.");
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findOne({ email: parsed.data.email });

    if (student) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      student.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      student.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await student.save();

      const resetUrl = `${process.env.PUBLIC_SITE_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
      const { subject, html } = forgotPasswordEmail(student, resetUrl);
      sendEmail({ to: student.email, subject, html });
    }

    // Same response either way — never reveals whether an account exists for this email.
    res.json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

const resetPasswordSchema = z.object({ password: z.string().min(8, "Password must be at least 8 characters") });

/** POST /api/auth/reset-password/:token */
async function resetPassword(req, res, next) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const student = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!student) {
      const error = new Error("This reset link is invalid or has expired.");
      error.statusCode = 400;
      throw error;
    }

    student.password = parsed.data.password; // pre-save hook re-hashes
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerStudent,
  loginStudent,
  logoutStudent,
  getMe,
  updateProfile,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
};
