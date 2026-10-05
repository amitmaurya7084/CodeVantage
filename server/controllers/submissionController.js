const { z } = require("zod");
const { Task, Submission, Student } = require("../models");
const { sendEmail } = require("../utils/mailer");
const { submissionReceivedEmail } = require("../utils/emailTemplates");

const submissionSchema = z.object({
  githubUrl: z.string().trim().url("GitHub URL must be a valid URL"),
  liveUrl: z.string().trim().url("Live URL must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("LinkedIn URL must be a valid URL").optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** POST /api/submissions/:taskId — create a new submission or update/resubmit an existing one */
async function submitOrUpdateSubmission(req, res, next) {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      const error = new Error("Task not found.");
      error.statusCode = 404;
      throw error;
    }

    if (String(task.program) !== String(req.student.program)) {
      const error = new Error("You do not have access to this task.");
      error.statusCode = 403;
      throw error;
    }

    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    let submission = await Submission.findOne({ student: req.student._id, task: task._id });

    if (submission && submission.status === "Approved") {
      const error = new Error("This task is already approved and can no longer be edited.");
      error.statusCode = 409;
      throw error;
    }

    if (submission) {
      // Resubmission: bump the count, reset to Pending Review for a fresh admin look,
      // and clear the previous review assignment (a new review cycle starts).
      submission.githubUrl = parsed.data.githubUrl;
      submission.liveUrl = parsed.data.liveUrl || undefined;
      submission.linkedinUrl = parsed.data.linkedinUrl || undefined;
      submission.description = parsed.data.description || "";
      submission.status = "Pending Review";
      submission.submissionCount += 1;
      submission.reviewedBy = null;
      submission.reviewedAt = null;
      await submission.save();
    } else {
      submission = await Submission.create({
        student: req.student._id,
        task: task._id,
        program: task.program,
        githubUrl: parsed.data.githubUrl,
        liveUrl: parsed.data.liveUrl || undefined,
        linkedinUrl: parsed.data.linkedinUrl || undefined,
        description: parsed.data.description || "",
      });
    }

    res.status(200).json({
      success: true,
      message: "Your project has been submitted for review.",
      submission,
    });

    const student = await Student.findById(req.student._id);
    const { subject, html } = submissionReceivedEmail(student, task.title);
    sendEmail({ to: student.email, subject, html });
  } catch (err) {
    next(err);
  }
}

/** GET /api/submissions/my — all of the logged-in student's submissions, with task titles */
async function getMySubmissions(req, res, next) {
  try {
    // NOTE: `task` is stored as an ObjectId reference, not an embedded
    // subdocument, so `.sort({ "task.order": 1 })` cannot work here — Mongo
    // runs the sort against the raw Submission documents *before*
    // `.populate()` fills in the task, and no such field exists on them
    // (it would silently no-op, leaving results in arbitrary order).
    // Sorting by the populated task's `order` has to happen in JS, after
    // population.
    const submissions = await Submission.find({ student: req.student._id }).populate("task", "title order");

    submissions.sort((a, b) => (a.task?.order ?? 0) - (b.task?.order ?? 0));

    res.json({ success: true, submissions });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitOrUpdateSubmission, getMySubmissions };
