const { Student, Submission, Payment, Certificate } = require("../models");

/** GET /api/admin/dashboard — top-level platform stats */
async function getDashboardStats(req, res, next) {
  try {
    const [totalStudents, activeInternships, pendingReviews, approvedSubmissions, totalPayments, totalCertificates] =
      await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ internshipStatus: "active" }),
        Submission.countDocuments({ status: { $in: ["Pending Review", "Under Review"] } }),
        Submission.countDocuments({ status: "Approved" }),
        Payment.countDocuments({ status: "paid" }),
        Certificate.countDocuments(),
      ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeInternships,
        pendingReviews,
        approvedSubmissions,
        totalPayments,
        totalCertificates,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/students — search + filter + list */
async function getStudents(req, res, next) {
  try {
    const { search, program, certificateStatus, internshipStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (program) query.program = program;
    if (certificateStatus) query.certificateStatus = certificateStatus;
    if (internshipStatus) query.internshipStatus = internshipStatus;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("program", "name slug")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      students,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/students/:id — full detail for one student, including submissions */
async function getStudentById(req, res, next) {
  try {
    const student = await Student.findById(req.params.id).populate("program");
    if (!student) {
      const error = new Error("Student not found.");
      error.statusCode = 404;
      throw error;
    }

    // NOTE: `task` is an ObjectId reference, not an embedded subdocument, so
    // `.sort({ "task.order": 1 })` can't work — Mongo would run the sort
    // against the raw Submission documents *before* `.populate()` fills in
    // the task, and no `task.order` field exists on them (the sort silently
    // no-ops, leaving results in arbitrary order). Sort by the populated
    // task's `order` in JS instead, after population.
    const submissions = await Submission.find({ student: student._id }).populate("task", "title order");

    submissions.sort((a, b) => (a.task?.order ?? 0) - (b.task?.order ?? 0));

    res.json({ success: true, student, submissions });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, getStudents, getStudentById };
