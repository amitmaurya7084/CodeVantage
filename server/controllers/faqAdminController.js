const { z } = require("zod");
const { Faq } = require("../models");
const { sanitizeContentData } = require("../utils/sanitizeContent");

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/faqs — every FAQ, including inactive */
async function listFaqsAdmin(req, res, next) {
  try {
    const faqs = await Faq.find().sort({ order: 1 });
    res.json({ success: true, faqs });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/faqs */
async function createFaq(req, res, next) {
  try {
    const parsed = faqSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    if (parsed.data.order === undefined) {
      const count = await Faq.countDocuments();
      parsed.data.order = count;
    }

    const faq = await Faq.create({ ...parsed.data, answer: sanitizeContentData(parsed.data.answer) });
    res.status(201).json({ success: true, message: "FAQ created.", faq });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/faqs/:id */
async function updateFaq(req, res, next) {
  try {
    const parsed = faqSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { ...parsed.data, ...(parsed.data.answer ? { answer: sanitizeContentData(parsed.data.answer) } : {}) },
      { new: true, runValidators: true }
    );
    if (!faq) {
      const error = new Error("FAQ not found.");
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, message: "FAQ updated.", faq });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/faqs/:id */
async function deleteFaq(req, res, next) {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      const error = new Error("FAQ not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: "FAQ deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listFaqsAdmin, createFaq, updateFaq, deleteFaq };
