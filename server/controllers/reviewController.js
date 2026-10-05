const { z } = require("zod");
const { Submission, Review, Task, Student } = require("../models");
const { sendEmail } = require("../utils/mailer");
const { reviewDecisionEmail, allTasksApprovedEmail } = require("../utils/emailTemplates");

const reviewSchema = z.object({
  decision: z.enum(["Approved", "Rejected", "Changes Requested"]),
  comments: z.string().trim().min(1, "Review comments are required").max(1000),
});

/** GET /api/admin/reviews — submissions needing attention (or any status via ?status=) */
async function getSubmissionsQueue(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = status ? { status } : { status: { $in: ["Pending Review", "Under Review"] } };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate("student", "fullName email")
        .populate("task", "title order")
        .sort({ createdAt: 1 }) // oldest first — first in, first reviewed
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Submission.countDocuments(query),
    ]);

    res.json({
      success: true,
      submissions,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/reviews/:id — full submission detail plus its review history */
async function getSubmissionDetail(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("student", "fullName email college course")
      .populate("task")
      .populate("program", "name");

    if (!submission) {
      const error = new Error("Submission not found.");
      error.statusCode = 404;
      throw error;
    }

    const reviews = await Review.find({ submission: submission._id })
      .populate("admin", "fullName")
      .sort({ createdAt: -1 });

    res.json({ success: true, submission, reviews });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/reviews/:id/decision — Approve / Reject / Request Changes */
async function decideSubmission(req, res, next) {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }
    const { decision, comments } = parsed.data;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      const error = new Error("Submission not found.");
      error.statusCode = 404;
      throw error;
    }

    submission.status = decision;
    submission.reviewedBy = req.admin._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await Review.create({
      submission: submission._id,
      student: submission.student,
      task: submission.task,
      admin: req.admin._id,
      decision,
      comments,
    });

    // Certificate eligibility is calculated from actual task approval status —
    // never set manually. Only re-checked when a task is newly Approved.
    let justBecameEligible = false;
    if (decision === "Approved") {
      justBecameEligible = await recalculateCertificateEligibility(submission.student);
    }

    res.json({ success: true, message: `Submission marked as ${decision}.` });

    const student = await Student.findById(submission.student);
    const task = await Task.findById(submission.task);
    const { subject, html } = reviewDecisionEmail(student, task.title, decision, comments);
    sendEmail({ to: student.email, subject, html });

    if (justBecameEligible) {
      const eligibleEmail = allTasksApprovedEmail(student);
      sendEmail({ to: student.email, subject: eligibleEmail.subject, html: eligibleEmail.html });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Checks whether every task in the student's program is now Approved.
 * If so, and the student isn't already past this stage, marks them
 * certificate-eligible and completes their internship status.
 */
async function recalculateCertificateEligibility(studentId) {
  const student = await Student.findById(studentId);
  if (!student || !student.program) return false;

  // Never downgrade a student who has already paid or been issued a certificate
  if (student.certificateStatus === "payment_pending" || student.certificateStatus === "generated") {
    return false;
  }

  const tasks = await Task.find({ program: student.program, isActive: true });
  const submissions = await Submission.find({ student: student._id, task: { $in: tasks.map((t) => t._id) } });

  const allApproved =
    tasks.length > 0 && tasks.every((task) => submissions.some((s) => String(s.task) === String(task._id) && s.status === "Approved"));

  if (allApproved && student.certificateStatus === "not_eligible") {
    student.certificateStatus = "eligible";
    student.internshipStatus = "completed";
    student.endDate = new Date();
    await student.save();
    return true;
  }

  return false;
}

module.exports = { getSubmissionsQueue, getSubmissionDetail, decideSubmission };
