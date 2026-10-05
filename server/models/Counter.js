const mongoose = require("mongoose");

// Used with findOneAndUpdate({ $inc: { seq: 1 } }, { upsert: true, new: true })
// to atomically generate sequential certificate numbers like CV-WD-2026-000001,
// even if two certificates are being generated at the exact same moment.
const counterSchema = new mongoose.Schema({
  _id: {
    type: String, // e.g. "certificate-WD-2026"
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Counter", counterSchema);
