const express = require("express");
const { protectStudent } = require("../middleware/auth");
const { getDashboard } = require("../controllers/studentController");

const router = express.Router();

router.get("/dashboard", protectStudent, getDashboard);

module.exports = router;
