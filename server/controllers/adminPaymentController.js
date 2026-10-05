const { z } = require("zod");
const { Payment, Student } = require("../models");
const { generateCertificateForStudent } = require("./certificateController");
const { sendEmail } = require("../utils/mailer");
const { paymentSuccessfulEmail, paymentRejectedEmail } = require("../utils/emailTemplates");

/**
 * POST /api/admin/payments/:id/approve — admin confirms a student's UPI
 * screenshot is a genuine payment. This is the ONLY place a "pending_verification"
 * payment becomes "paid" — mirrors what the old Razorpay signature-verify step
 * used to do, just with a human doing the verifying instead of a cryptographic check.
 */
async function approvePayment(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      const error = new Error("Payment record not found.");
      error.statusCode = 404;
      throw error;
    }

    if (payment.status === "paid") {
      const error = new Error("This payment has already been approved.");
      error.statusCode = 409;
      throw error;
    }
    if (payment.status !== "pending_verification") {
      const error = new Error(`Cannot approve a payment with status "${payment.status}".`);
      error.statusCode = 409;
      throw error;
    }

    payment.status = "paid";
    payment.verifiedBy = req.admin._id;
    payment.verifiedAt = new Date();
    payment.paidAt = new Date();
    await payment.save();

    // Same "don't fail the request if certificate generation hiccups" pattern
    // the old Razorpay verify flow used — the payment itself is confirmed either way.
    await Student.findByIdAndUpdate(payment.student, { certificateStatus: "payment_pending" });

    const student = await Student.findById(payment.student);
    const { subject, html } = paymentSuccessfulEmail(student, payment.amount);
    sendEmail({ to: student.email, subject, html });

    let certificateGenerated = false;
    try {
      await generateCertificateForStudent(payment.student);
      certificateGenerated = true;
    } catch (genError) {
      console.error(`Certificate auto-generation failed for student ${payment.student}:`, genError.message);
    }

    res.json({
      success: true,
      message: certificateGenerated
        ? "Payment approved and certificate generated."
        : "Payment approved. Certificate generation will be retried shortly.",
      payment,
    });
  } catch (err) {
    next(err);
  }
}

const rejectSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

/**
 * POST /api/admin/payments/:id/reject — admin marks a screenshot as
 * unverifiable (blurry, wrong amount, doesn't match records, etc). The
 * student sees the reason on their dashboard and can resubmit — rejection is
 * never a dead end.
 */
async function rejectPayment(req, res, next) {
  try {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("Invalid input.");
      error.statusCode = 400;
      throw error;
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      const error = new Error("Payment record not found.");
      error.statusCode = 404;
      throw error;
    }

    if (payment.status === "paid") {
      const error = new Error("This payment has already been approved and cannot be rejected.");
      error.statusCode = 409;
      throw error;
    }
    if (payment.status !== "pending_verification") {
      const error = new Error(`Cannot reject a payment with status "${payment.status}".`);
      error.statusCode = 409;
      throw error;
    }

    payment.status = "rejected";
    payment.verifiedBy = req.admin._id;
    payment.verifiedAt = new Date();
    payment.rejectionReason = parsed.data.reason || null;
    await payment.save();

    // Send the student back to "eligible" (not "payment_pending") so the
    // payment page shows the QR/upload form again for a resubmission.
    await Student.findByIdAndUpdate(payment.student, { certificateStatus: "eligible" });

    const student = await Student.findById(payment.student);
    const { subject, html } = paymentRejectedEmail(student, payment.rejectionReason);
    sendEmail({ to: student.email, subject, html });

    res.json({ success: true, message: "Payment rejected.", payment });
  } catch (err) {
    next(err);
  }
}

module.exports = { approvePayment, rejectPayment };
