const express = require("express");
const { protectStudent } = require("../middleware/auth");
const { getMyTasks, getTaskById } = require("../controllers/taskController");

const router = express.Router();

router.get("/my", protectStudent, getMyTasks);
router.get("/:id", protectStudent, getTaskById);

module.exports = router;
