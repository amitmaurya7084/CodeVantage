const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Broad set of browser-displayable raster/vector image formats — everything
// here can render inside a plain <img> tag (Logo, QR code, payment
// screenshots are all shown that way). PDF/DOC etc. are deliberately left
// out: they'd upload fine but show as a broken image wherever we preview them.
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
];
const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "heic", "heif", "avif", "tiff"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    return {
      folder: "codevantage",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo ? ["mp4", "webm", "mov"] : ALLOWED_IMAGE_FORMATS,
    };
  },
});

function fileFilter(req, file, cb) {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Unsupported file type. Only image files (JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, AVIF, TIFF) and MP4, WEBM, MOV videos are allowed."
    );
    error.statusCode = 400;
    cb(error);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB — generous enough for short clips, blocks abuse
});

// Separate multer instance for UPI payment-proof screenshots (students, not admins).
// Kept as its own Cloudinary folder ("codevantage/payment-proofs") so proof images
// don't mix in with site media, and images-only since a screenshot is never a video.
const paymentScreenshotStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "codevantage/payment-proofs",
    resource_type: "image",
    allowed_formats: ALLOWED_IMAGE_FORMATS,
  }),
});

function paymentScreenshotFileFilter(req, file, cb) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Unsupported file type. Please upload an image (JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, AVIF, or TIFF)."
    );
    error.statusCode = 400;
    cb(error);
  }
}

const uploadPaymentScreenshot = multer({
  storage: paymentScreenshotStorage,
  fileFilter: paymentScreenshotFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — plenty for a screenshot, keeps uploads fast
});

// Separate multer instance for student profile pictures. Own Cloudinary folder
// ("codevantage/profile-pictures") so avatars don't mix in with site media or
// payment proofs, and images-only for the same reason as payment screenshots.
const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "codevantage/profile-pictures",
    resource_type: "image",
    allowed_formats: ALLOWED_IMAGE_FORMATS,
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  }),
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: paymentScreenshotFileFilter, // same images-only rule
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = {
  upload,
  uploadPaymentScreenshot,
  uploadProfilePicture,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_VIDEO_TYPES,
};
