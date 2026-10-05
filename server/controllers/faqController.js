const { Faq } = require("../models");

/** GET /api/faqs — public, no auth */
async function getFaqs(req, res, next) {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ order: 1 }).select("question answer order");
    res.json({ success: true, faqs });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFaqs };
