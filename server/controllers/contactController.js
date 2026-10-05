const { z } = require("zod");
const { ContactMessage } = require("../models");

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please provide a valid email"),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

async function submitContactMessage(req, res, next) {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid input");
      error.statusCode = 400;
      throw error;
    }

    const savedMessage = await ContactMessage.create(parsed.data);

    res.status(201).json({
      success: true,
      message: "Your message has been received. We'll get back to you soon.",
      id: savedMessage._id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContactMessage };
