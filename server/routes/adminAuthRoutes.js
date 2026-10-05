const express = require("express");
const rateLimit = require("express-rate-limit");
const { loginAdmin, logoutAdmin, getMeAdmin } = require("../controllers/adminAuthController");
const { protectAdmin } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter than student login — admin accounts are higher-value targets
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

router.post("/login", loginLimiter, loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", protectAdmin, getMeAdmin);

module.exports = router;
