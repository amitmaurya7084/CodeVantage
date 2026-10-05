const express = require("express");
const { trackVisit } = require("../controllers/analyticsController");

const router = express.Router();

router.post("/track", trackVisit);

module.exports = router;
