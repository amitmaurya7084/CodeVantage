const express = require("express");
const { submitContactMessage } = require("../controllers/contactController");

const router = express.Router();

// POST /api/contact
router.post("/", submitContactMessage);

module.exports = router;
