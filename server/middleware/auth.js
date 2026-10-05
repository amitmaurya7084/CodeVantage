const jwt = require("jsonwebtoken");
const { Student, Admin } = require("../models");

function unauthorized(next, message = "Not authorized. Please log in.") {
  const error = new Error(message);
  error.statusCode = 401;
  next(error);
}

/**
 * Protects student-only routes. Reads the "student_token" cookie, verifies it
 * against JWT_SECRET, and attaches the student document (without password) to
 * req.student. Completely separate from admin auth by design (different
 * cookie name and secret) so a student token can never authenticate as admin.
 */
async function protectStudent(req, res, next) {
  try {
    const token = req.cookies?.student_token;
    if (!token) return unauthorized(next);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id);

    if (!student || !student.isActive) return unauthorized(next, "Account not found or inactive.");

    req.student = student;
    next();
  } catch {
    unauthorized(next, "Session expired. Please log in again.");
  }
}

/**
 * Protects admin-only routes. Reads the "admin_token" cookie, verifies it
 * against ADMIN_JWT_SECRET (a different secret from student auth).
 */
async function protectAdmin(req, res, next) {
  try {
    const token = req.cookies?.admin_token;
    if (!token) return unauthorized(next);

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) return unauthorized(next, "Admin account not found or inactive.");

    req.admin = admin;
    next();
  } catch {
    unauthorized(next, "Session expired. Please log in again.");
  }
}

/** Restricts a route to specific admin roles, e.g. requireAdminRole("superadmin") */
function requireAdminRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      const error = new Error("You do not have permission to perform this action.");
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
}

module.exports = { protectStudent, protectAdmin, requireAdminRole };
