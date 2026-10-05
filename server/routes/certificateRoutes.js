const express = require("express");
const { protectStudent } = require("../middleware/auth");
const {
  generateMyCertificate,
  getMyCertificate,
  downloadMyCertificate,
  verifyCertificatePublic,
} = require("../controllers/certificateController");
const { getPublicCertificateTemplateContent } = require("../controllers/certificateTemplateController");

const router = express.Router();

// Public — no auth. Must come before any student-protected routes with similar paths.
router.get("/verify/:certificateId", verifyCertificatePublic);
router.get("/template/public", getPublicCertificateTemplateContent);

router.post("/generate", protectStudent, generateMyCertificate);
router.get("/my", protectStudent, getMyCertificate);
router.get("/my/download", protectStudent, downloadMyCertificate);

module.exports = router;
