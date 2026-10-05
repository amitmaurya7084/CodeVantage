const { Student, Payment, Certificate, CertificateVerificationLog } = require("../models");
const { generateCertificateId } = require("../utils/certificateIdGenerator");
const { generateVerificationQrCode } = require("../utils/qrCodeGenerator");
const { generateCertificatePdf } = require("../utils/pdfGenerator");
const { loadCertificateTemplateContent } = require("../utils/loadCertificateTemplateContent");
const fs = require("fs");
const { sendEmail } = require("../utils/mailer");
const { certificateGeneratedEmail } = require("../utils/emailTemplates");

/**
 * Core generation logic, shared by the auto-trigger (right after payment
 * verification) and the manual retry endpoint. Only ever runs when a verified
 * "paid" payment exists — this is the one and only gate for issuing a certificate.
 */
async function generateCertificateForStudent(studentId) {
  const student = await Student.findById(studentId).populate("program");
  if (!student || !student.program) {
    const error = new Error("Student or program not found.");
    error.statusCode = 404;
    throw error;
  }

  const existing = await Certificate.findOne({ student: student._id, program: student.program._id });
  if (existing) return existing; // idempotent — never issues a second certificate for the same program

  const payment = await Payment.findOne({ student: student._id, program: student.program._id, status: "paid" });
  if (!payment) {
    const error = new Error("No verified payment found for this student.");
    error.statusCode = 400;
    throw error;
  }

  const certificateId = await generateCertificateId(student.program.slug);
  const { verificationUrl, qrCodeDataUrl } = await generateVerificationQrCode(certificateId);
  const completionDate = student.endDate || new Date();
  const content = await loadCertificateTemplateContent();

  const pdfPath = await generateCertificatePdf({
    certificateId,
    studentName: student.fullName,
    programName: student.program.name,
    durationLabel: student.program.durationLabel,
    completionDate,
    qrCodeDataUrl,
    content,
  });

  let certificate;
  try {
    certificate = await Certificate.create({
      certificateId,
      student: student._id,
      program: student.program._id,
      payment: payment._id,
      studentNameSnapshot: student.fullName,
      programNameSnapshot: student.program.name,
      durationLabel: student.program.durationLabel,
      completionDate,
      qrCodeDataUrl,
      verificationUrl,
      pdfPath,
    });
  } catch (err) {
    // Two requests (auto-generation after payment approval + the student's manual
    // "generate" click) can race past the idempotency check above. The unique
    // (student, program) index makes the loser fail here — return the winner's certificate.
    if (err.code === 11000) {
      const winner = await Certificate.findOne({ student: student._id, program: student.program._id });
      if (winner) return winner;
    }
    throw err;
  }

  student.certificateStatus = "generated";
  await student.save();

  const { subject, html } = certificateGeneratedEmail(student, certificate.certificateId, certificate.verificationUrl);
  sendEmail({ to: student.email, subject, html });

  return certificate;
}

/** POST /api/certificates/generate — manual trigger/retry if auto-generation didn't run yet */
async function generateMyCertificate(req, res, next) {
  try {
    if (req.student.certificateStatus === "not_eligible" || req.student.certificateStatus === "eligible") {
      const error = new Error("Payment must be completed before generating your certificate.");
      error.statusCode = 403;
      throw error;
    }

    const certificate = await generateCertificateForStudent(req.student._id);
    res.json({ success: true, message: "Certificate generated.", certificate });
  } catch (err) {
    next(err);
  }
}

/** GET /api/certificates/my — the logged-in student's own certificate, if issued */
async function getMyCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ student: req.student._id });
    res.json({ success: true, certificate: certificate || null });
  } catch (err) {
    next(err);
  }
}

/** GET /api/certificates/my/download — streams the PDF, only to its owning student */
async function downloadMyCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ student: req.student._id });
    if (!certificate) {
      const error = new Error("No certificate found for your account.");
      error.statusCode = 404;
      throw error;
    }

    // Hosts like Render have an ephemeral disk: PDFs written at generation time vanish
    // on redeploy/restart. Everything needed to rebuild the PDF is stored on the
    // certificate record, so regenerate it on demand if the file is missing.
    if (!certificate.pdfPath || !fs.existsSync(certificate.pdfPath)) {
      const content = await loadCertificateTemplateContent();
      const pdfPath = await generateCertificatePdf({
        certificateId: certificate.certificateId,
        studentName: certificate.studentNameSnapshot,
        programName: certificate.programNameSnapshot,
        durationLabel: certificate.durationLabel,
        completionDate: certificate.completionDate,
        qrCodeDataUrl: certificate.qrCodeDataUrl,
        content,
      });
      certificate.pdfPath = pdfPath;
      await certificate.save();
    }

    res.download(certificate.pdfPath, `${certificate.certificateId}.pdf`);
  } catch (err) {
    next(err);
  }
}

/** GET /api/certificates/verify/:certificateId — PUBLIC, no auth, exposes only safe fields */
async function verifyCertificatePublic(req, res, next) {
  try {
    const certificateId = req.params.certificateId.trim().toUpperCase();
    const certificate = await Certificate.findOne({ certificateId, status: "active" });

    await CertificateVerificationLog.create({
      certificateIdQueried: certificateId,
      found: !!certificate,
    });

    if (!certificate) {
      return res.json({ success: false, message: "Certificate not found." });
    }

    res.json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        studentNameSnapshot: certificate.studentNameSnapshot,
        programNameSnapshot: certificate.programNameSnapshot,
        durationLabel: certificate.durationLabel,
        completionDate: certificate.completionDate,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/certificates — every issued certificate, for the admin screen */
async function getAllCertificates(req, res, next) {
  try {
    const certificates = await Certificate.find()
      .populate("student", "fullName email")
      .populate("program", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, certificates });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateCertificateForStudent,
  generateMyCertificate,
  getMyCertificate,
  downloadMyCertificate,
  verifyCertificatePublic,
  getAllCertificates,
};
