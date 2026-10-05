const express = require("express");
const { protectAdmin } = require("../middleware/auth");
const { getDashboardStats, getStudents, getStudentById } = require("../controllers/adminController");
const { getSubmissionsQueue, getSubmissionDetail, decideSubmission } = require("../controllers/reviewController");
const { getAllPayments } = require("../controllers/paymentController");
const { approvePayment, rejectPayment } = require("../controllers/adminPaymentController");
const { getAllCertificates } = require("../controllers/certificateController");
const { getAllContentAdmin, updateContent } = require("../controllers/contentController");
const { getAnalyticsStats } = require("../controllers/analyticsController");
const {
  getCertificateTemplateContent,
  updateCertificateTemplateField,
  resetCertificateTemplateField,
  previewCertificateTemplate,
} = require("../controllers/certificateTemplateController");
const {
  listProgramsAdmin,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programAdminController");
const {
  listTasksForProgramAdmin,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskAdminController");
const { listFaqsAdmin, createFaq, updateFaq, deleteFaq } = require("../controllers/faqAdminController");

const router = express.Router();

router.use(protectAdmin); // every route below requires a valid admin session

router.get("/dashboard", getDashboardStats);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);

router.get("/reviews", getSubmissionsQueue);
router.get("/reviews/:id", getSubmissionDetail);
router.post("/reviews/:id/decision", decideSubmission);

router.get("/payments", getAllPayments);
router.post("/payments/:id/approve", approvePayment);
router.post("/payments/:id/reject", rejectPayment);

router.get("/certificates", getAllCertificates);

router.get("/content", getAllContentAdmin);
router.put("/content/:key", updateContent);

router.get("/analytics", getAnalyticsStats);

router.get("/certificate-template", getCertificateTemplateContent);
router.put("/certificate-template/:fieldName", updateCertificateTemplateField);
router.delete("/certificate-template/:fieldName", resetCertificateTemplateField);
router.post("/certificate-template/preview", previewCertificateTemplate);

router.get("/programs", listProgramsAdmin);
router.post("/programs", createProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

router.get("/programs/:programId/tasks", listTasksForProgramAdmin);
router.post("/programs/:programId/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

router.get("/faqs", listFaqsAdmin);
router.post("/faqs", createFaq);
router.put("/faqs/:id", updateFaq);
router.delete("/faqs/:id", deleteFaq);

module.exports = router;
