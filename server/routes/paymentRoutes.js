const express = require("express");
const { protectStudent } = require("../middleware/auth");
const { uploadPaymentScreenshot } = require("../config/multerCloudinary");
const { submitUpiPayment, getMyPayments } = require("../controllers/paymentController");

const router = express.Router();

router.post("/upi/submit", protectStudent, uploadPaymentScreenshot.single("screenshot"), submitUpiPayment);
router.get("/my", protectStudent, getMyPayments);

module.exports = router;
