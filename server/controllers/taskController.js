const { Task, Submission } = require("../models");

/** GET /api/tasks/my — all tasks for the logged-in student's assigned program, with status */
async function getMyTasks(req, res, next) {
  try {
    const student = req.student;
    if (!student.program) {
      return res.json({ success: true, tasks: [] });
    }

    const tasks = await Task.find({ program: student.program, isActive: true }).sort({ order: 1 });
    const submissions = await Submission.find({ student: student._id, task: { $in: tasks.map((t) => t._id) } });

    const submissionByTask = new Map(submissions.map((s) => [String(s.task), s]));

    const tasksWithStatus = tasks.map((task) => {
      const submission = submissionByTask.get(String(task._id));
      return {
        _id: task._id,
        order: task.order,
        title: task.title,
        description: task.description,
        technologies: task.technologies,
        status: submission ? submission.status : "Not Started",
        hasSubmission: !!submission,
      };
    });

    res.json({ success: true, tasks: tasksWithStatus });
  } catch (err) {
    next(err);
  }
}

/** GET /api/tasks/:id — full detail for one task, plus the student's own submission if any */
async function getTaskById(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      const error = new Error("Task not found.");
      error.statusCode = 404;
      throw error;
    }

    // Students may only view tasks belonging to their own assigned program
    if (String(task.program) !== String(req.student.program)) {
      const error = new Error("You do not have access to this task.");
      error.statusCode = 403;
      throw error;
    }

    const submission = await Submission.findOne({ student: req.student._id, task: task._id });

    res.json({
      success: true,
      task,
      submission: submission || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyTasks, getTaskById };
