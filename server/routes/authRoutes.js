const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  registerStudent,
  loginStudent,
  logoutStudent,
  getMe,
  updateProfile,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protectStudent } = require("../middleware/auth");
const { uploadProfilePicture: profilePictureUpload } = require("../config/multerCloudinary");

const router = express.Router();

// Stricter limit on login specifically, to slow down brute-force / credential-stuffing attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // prevents using this endpoint to spam an inbox
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

router.post("/register", registerStudent);
router.post("/login", loginLimiter, loginStudent);
router.post("/logout", logoutStudent);
router.get("/me", protectStudent, getMe);
router.put("/profile", protectStudent, updateProfile);
router.post("/profile/picture", protectStudent, profilePictureUpload.single("picture"), uploadProfilePicture);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
