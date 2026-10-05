const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["upi_manual", "razorpay"], // "razorpay" kept only so old records stay readable
      default: "upi_manual",
    },
    // --- UPI manual-verification fields ---
    screenshotUrl: {
      type: String, // Cloudinary secure_url of the payment-proof screenshot
      default: null,
    },
    screenshotPublicId: {
      type: String, // Cloudinary public_id — needed to delete the asset later
      default: null,
    },
    utrNumber: {
      type: String, // UPI transaction ref / UTR number, student-entered, optional
      trim: true,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    // --- Legacy Razorpay fields — kept so old paid records remain intact; no longer
    // written to by new code (see controllers/paymentController.js) ---
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
      select: false,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
    },
    // --- Shared fields ---
    amount: {
      type: Number,
      required: true, // stored in INR (whole rupees), e.g. 149
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending_verification", "paid", "rejected", "refunded"],
      default: "pending_verification",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// sparse: only enforces uniqueness among documents that actually have this field —
// legacy Razorpay orders keep their guarantee, while UPI records (which never set
// this field) don't collide with each other.
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ student: 1, status: 1 });
// Prevents a student from having two "paid" records for the same program (duplicate payment)
paymentSchema.index(
  { student: 1, program: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
);

module.exports = mongoose.model("Payment", paymentSchema);
