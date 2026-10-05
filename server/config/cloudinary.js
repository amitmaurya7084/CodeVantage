const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Cloudinary accounts created since mid-2023 default to SHA-256 request
  // signing, but this SDK still signs with SHA-1 unless told otherwise —
  // that mismatch is what causes "Invalid Signature" errors on every
  // upload even when cloud_name/api_key/api_secret are all correct.
  signature_algorithm: "sha256",
});

module.exports = cloudinary;
