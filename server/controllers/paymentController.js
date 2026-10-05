const { Payment, Student } = require("../models");

const CERTIFICATE_FEE_INR = Number(process.env.CERTIFICATE_FEE_INR || 149);

/**
 * POST /api/payments/upi/submit — student uploads a screenshot of their UPI
 * payment (multipart/form-data, field name "screenshot") plus an optional
 * UTR/transaction-ref number. This does NOT mark the payment as paid — it
 * just records the claim as "pending_verification"; an admin reviews the
 * screenshot and approves/rejects it (see adminPaymentController.js). Only
 * after admin approval does the certificate-generation flow run.
 */
async function submitUpiPayment(req, res, next) {
  try {
    const student = req.student;

    if (student.certificateStatus === "not_eligible") {
      const error = new Error("You must have all tasks approved before paying the certificate fee.");
      error.statusCode = 403;
      throw error;
    }

    if (!req.file) {
      const error = new Error("Please upload a screenshot of your payment.");
      error.statusCode = 400;
      throw error;
    }

    // Duplicate-payment guard: already paid for this program.
    const existingPaid = await Payment.findOne({ student: student._id, program: student.program, status: "paid" });
    if (existingPaid) {
      const error = new Error("The certificate fee has already been paid for this program.");
      error.statusCode = 409;
      throw error;
    }

    // Don't let a student stack up multiple submissions while one is still
    // awaiting review — but a PREVIOUSLY REJECTED one doesn't block a fresh
    // resubmission, since that's the whole point of rejection + retry.
    const existingPending = await Payment.findOne({
      student: student._id,
      program: student.program,
      status: "pending_verification",
    });
    if (existingPending) {
      const error = new Error("You already have a payment submission awaiting verification.");
      error.statusCode = 409;
      throw error;
    }

    const utrNumber = req.body.utrNumber ? String(req.body.utrNumber).trim().slice(0, 100) : null;

    const payment = await Payment.create({
      student: student._id,
      program: student.program,
      paymentMethod: "upi_manual",
      amount: CERTIFICATE_FEE_INR,
      currency: "INR",
      status: "pending_verification",
      screenshotUrl: req.file.path, // CloudinaryStorage puts the secure_url here
      screenshotPublicId: req.file.filename, // CloudinaryStorage puts the public_id here
      utrNumber,
    });

    await Student.findByIdAndUpdate(student._id, { certificateStatus: "payment_pending" });

    res.status(201).json({
      success: true,
      message: "Payment proof submitted. Our team will verify it shortly.",
      payment,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/payments/my — the logged-in student's own payment history */
async function getMyPayments(req, res, next) {
  try {
    const payments = await Payment.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/payments — every payment, for the admin Payments screen (supports ?status=pending_verification) */
async function getAllPayments(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("student", "fullName email")
        .populate("program", "name")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Payment.countDocuments(query),
    ]);

    res.json({
      success: true,
      payments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitUpiPayment, getMyPayments, getAllPayments };
