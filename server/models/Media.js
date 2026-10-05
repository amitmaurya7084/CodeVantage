const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String, // Cloudinary secure_url — what gets used in <img>/<video> src
      required: true,
    },
    publicId: {
      type: String, // Cloudinary public_id — required to delete the asset later
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    format: {
      type: String, // e.g. "png", "mp4"
    },
    bytes: {
      type: Number,
    },
    width: Number,
    height: Number,
    altText: {
      type: String,
      default: "",
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

mediaSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Media", mediaSchema);
