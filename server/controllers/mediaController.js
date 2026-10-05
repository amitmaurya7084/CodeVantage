const { z } = require("zod");
const cloudinary = require("../config/cloudinary");
const { Media } = require("../models");
const { ALLOWED_VIDEO_TYPES } = require("../config/multerCloudinary");

/** POST /api/admin/media/upload — expects multipart/form-data, field name "file" */
async function uploadMedia(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error("No file was uploaded.");
      error.statusCode = 400;
      throw error;
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(req.file.mimetype);

    const media = await Media.create({
      url: req.file.path, // CloudinaryStorage puts the secure_url here
      publicId: req.file.filename, // CloudinaryStorage puts the public_id here
      type: isVideo ? "video" : "image",
      format: req.file.format,
      bytes: req.file.size,
      width: req.file.width,
      height: req.file.height,
      altText: req.body.altText || "",
      uploadedBy: req.admin._id,
    });

    res.status(201).json({ success: true, message: "Upload successful.", media });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/media — list uploads, newest first, optional ?type= filter */
async function getMedia(req, res, next) {
  try {
    const { type, page = 1, limit = 24 } = req.query;
    const query = type ? { type } : {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 24);

    const [media, total] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Media.countDocuments(query),
    ]);

    res.json({
      success: true,
      media,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

const updateAltTextSchema = z.object({ altText: z.string().max(200) });

/** PATCH /api/admin/media/:id — currently only alt-text is editable */
async function updateMedia(req, res, next) {
  try {
    const parsed = updateAltTextSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("Invalid input.");
      error.statusCode = 400;
      throw error;
    }

    const media = await Media.findByIdAndUpdate(req.params.id, { altText: parsed.data.altText }, { new: true });
    if (!media) {
      const error = new Error("Media not found.");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, media });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/media/:id — removes from Cloudinary AND the database */
async function deleteMedia(req, res, next) {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      const error = new Error("Media not found.");
      error.statusCode = 404;
      throw error;
    }

    await cloudinary.uploader.destroy(media.publicId, { resource_type: media.type === "video" ? "video" : "image" });
    await media.deleteOne();

    res.json({ success: true, message: "Media deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadMedia, getMedia, updateMedia, deleteMedia };
