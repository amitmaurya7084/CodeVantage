const express = require("express");
const { getPrograms, getProgramBySlug, getProgramTasks } = require("../controllers/programController");

const router = express.Router();

router.get("/", getPrograms);
router.get("/:slug", getProgramBySlug);
router.get("/:slug/tasks", getProgramTasks);

module.exports = router;
