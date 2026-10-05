const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0, // controls display order; admin can reorder
    },
    isActive: {
      type: Boolean,
      default: true, // lets admin hide a question without deleting it
    },
  },
  { timestamps: true }
);

faqSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("Faq", faqSchema);
