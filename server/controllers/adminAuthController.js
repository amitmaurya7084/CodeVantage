const { z } = require("zod");
const { Admin } = require("../models");
const { signAndSetCookie, getCookieOptions } = require("../utils/generateToken");

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

function sanitizeAdmin(admin) {
  const obj = admin.toObject();
  delete obj.password;
  return obj;
}

async function loginAdmin(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }
    const { email, password } = parsed.data;

    const admin = await Admin.findOne({ email }).select("+password");
    const passwordMatches = admin ? await admin.matchPassword(password) : false;

    if (!admin || !passwordMatches) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    if (!admin.isActive) {
      const error = new Error("This admin account has been deactivated.");
      error.statusCode = 403;
      throw error;
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    signAndSetCookie(res, {
      id: admin._id,
      cookieName: "admin_token",
      secret: process.env.ADMIN_JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({ success: true, message: "Login successful.", admin: sanitizeAdmin(admin) });
  } catch (err) {
    next(err);
  }
}

function logoutAdmin(req, res) {
  res.clearCookie("admin_token", getCookieOptions());
  res.json({ success: true, message: "Logged out." });
}

async function getMeAdmin(req, res, next) {
  try {
    res.json({ success: true, admin: sanitizeAdmin(req.admin) });
  } catch (err) {
    next(err);
  }
}

module.exports = { loginAdmin, logoutAdmin, getMeAdmin };
