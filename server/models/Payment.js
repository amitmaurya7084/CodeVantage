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
    // NO `default: null` here on purpose. A default makes Mongoose write
    // `razorpayOrderId: null` into EVERY new payment, and a unique index treats
    // null as a real value — so the 2nd UPI payment collides with the 1st
    // (E11000 duplicate key { razorpayOrderId: null }). Leaving the field absent
    // for UPI payments avoids that.
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
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

// Partial index instead of `sparse`: a sparse index still indexes documents where
// the field is explicitly null (so existing records saved with null would still
// collide). With $type: "string", only real Razorpay order ids are made unique;
// null / missing values are never indexed, so UPI payments can't collide.
paymentSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, partialFilterExpression: { razorpayOrderId: { $type: "string" } } }
);
paymentSchema.index({ student: 1, status: 1 });
// Prevents a student from having two "paid" records for the same program (duplicate payment)
paymentSchema.index(
  { student: 1, program: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
);

module.exports = mongoose.model("Payment", paymentSchema);
