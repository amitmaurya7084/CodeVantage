const { Student, Task, Submission } = require("../models");

/**
 * Builds "Recent Activity" entries from real submission timestamps — no
 * fabricated events. Each submission can contribute up to two entries: one
 * for when it was (re)submitted, one for when it was reviewed (if it has
 * been). Sorted newest first.
 */
function buildRecentActivity(submissions, taskById) {
  const events = [];
  for (const sub of submissions) {
    const taskTitle = taskById.get(String(sub.task))?.title || "a task";
    events.push({
      type: "submission",
      message: sub.submissionCount > 1 ? `Re-submitted "${taskTitle}"` : `Submitted "${taskTitle}"`,
      at: sub.createdAt,
    });
    if (sub.reviewedAt) {
      events.push({
        type: "review",
        message: `"${taskTitle}" ${sub.status.toLowerCase()}`,
        at: sub.reviewedAt,
      });
    }
  }
  return events.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
}

/** GET /api/students/dashboard — everything the dashboard needs in one call */
async function getDashboard(req, res, next) {
  try {
    const student = await Student.findById(req.student._id).populate("program");

    if (!student.program) {
      return res.json({
        success: true,
        student,
        tasks: [],
        progressPercent: 0,
        approvedCount: 0,
        totalTasks: 0,
        upcomingTasks: [],
        recentActivity: [],
      });
    }

    const tasks = await Task.find({ program: student.program._id, isActive: true }).sort({ order: 1 });
    const taskById = new Map(tasks.map((t) => [String(t._id), t]));
    const submissions = await Submission.find({
      student: student._id,
      task: { $in: tasks.map((t) => t._id) },
    }).sort({ updatedAt: -1 });
    const submissionByTask = new Map(submissions.map((s) => [String(s.task), s]));

    const tasksWithStatus = tasks.map((task) => ({
      _id: task._id,
      order: task.order,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      status: submissionByTask.get(String(task._id))?.status || "Not Started",
    }));

    const approvedCount = tasksWithStatus.filter((t) => t.status === "Approved").length;
    const progressPercent = tasks.length ? Math.round((approvedCount / tasks.length) * 100) : 0;

    // Tasks with a deadline that aren't approved yet, soonest first.
    const upcomingTasks = tasksWithStatus
      .filter((t) => t.deadline && t.status !== "Approved")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    const recentActivity = buildRecentActivity(submissions, taskById);

    res.json({
      success: true,
      student,
      tasks: tasksWithStatus,
      progressPercent,
      approvedCount,
      totalTasks: tasks.length,
      upcomingTasks,
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
