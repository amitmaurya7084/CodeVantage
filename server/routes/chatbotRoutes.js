const express = require("express");
const { chatWithProject } = require("../controllers/chatbotController");

const router = express.Router();

// Public endpoint: no login or signup required.
// Rate limiting is applied in server.js (chatLimiter on /api/chat),
// so it is not repeated here.
router.post("/", chatWithProject);

module.exports = router;
