/**
 * Quick local test — generates sample certificate PDFs WITHOUT needing
 * MongoDB, a real student, or the full app running.
 *
 *   node scripts/testCertificate.js
 *
 * Output PDFs land in server/uploads/certificates/:
 *   TEST-0001.pdf — uses all default template content
 *   TEST-0002.pdf — same template, with a few content fields overridden,
 *                   to prove the template is reusable with different text
 */
const { generateVerificationQrCode } = require("../utils/qrCodeGenerator");
const { generateCertificatePdf } = require("../utils/pdfGenerator");

async function run() {
  const qr1 = await generateVerificationQrCode("TEST-0001");
  const path1 = await generateCertificatePdf({
    certificateId: "TEST-0001",
    studentName: "Amit Kumar",
    programName: "Web Development",
    durationLabel: "1 Month",
    completionDate: new Date(),
    qrCodeDataUrl: qr1.qrCodeDataUrl,
  });
  console.log("Default content:", path1);

  const qr2 = await generateVerificationQrCode("TEST-0002");
  const path2 = await generateCertificatePdf({
    certificateId: "TEST-0002",
    studentName: "Priya Sharma",
    programName: "Python & Django",
    durationLabel: "2 Month",
    completionDate: new Date(),
    qrCodeDataUrl: qr2.qrCodeDataUrl,
    content: {
      completionDescription:
        "During this internship, the candidate built and deployed a full-stack Python/Django application, working through real product requirements from start to finish.",
      footerTagline: "REAL PROJECTS  |  REAL MENTORSHIP  |  REAL GROWTH",
      signatureFullName: "Riya Sharma",
      signatureTitle: "Head of Programs, CodeVantage",
      signatureScriptText: "Riya",
      techStack: [
        { label: "Python", color: "#3776AB" },
        { label: "Django", color: "#0C4B33" },
        { label: "PostgreSQL", color: "#336791" },
        { label: "Docker", color: "#2496ED" },
      ],
    },
  });
  console.log("Overridden content:", path2);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
