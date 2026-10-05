const express = require("express");
const { protectStudent } = require("../middleware/auth");
const { submitOrUpdateSubmission, getMySubmissions } = require("../controllers/submissionController");

const router = express.Router();

router.get("/my", protectStudent, getMySubmissions);
router.post("/:taskId", protectStudent, submitOrUpdateSubmission);

module.exports = router;
