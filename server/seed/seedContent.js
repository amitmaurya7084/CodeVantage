// Run with: npm run seed:content (from /server)
// Seeds default SiteContent blocks and FAQ entries so the CMS starts with the
// same copy that's currently hardcoded in the React pages — nothing goes blank
// once pages are switched over to fetching from the API in a later step.

require("dotenv").config();
const mongoose = require("mongoose");
const { SiteContent, Faq } = require("../models");
const { contentBlocks } = require("./defaultContent");

const faqs = [
  {
    question: "What is CodeVantage?",
    answer:
      "CodeVantage is a project-based virtual internship platform. You work through real project tasks, get them reviewed by our team, and receive a Certificate of Internship Completion once you pass.",
  },
  {
    question: "Who can apply?",
    answer: "Students and beginners looking to build practical, portfolio-ready web development skills. No prior professional experience is required.",
  },
  { question: "How long is the internship?", answer: "The Web Development internship runs for 1 month and is fully virtual and self-paced." },
  { question: "How many projects are required?", answer: "You'll complete 3 practical projects during the internship." },
  {
    question: "How are projects reviewed?",
    answer: "Once you submit a project's GitHub and live URL, our team reviews it and marks it Approved, Rejected, or Changes Requested with comments.",
  },
  {
    question: "What happens if my project needs changes?",
    answer: "You'll see reviewer comments on your dashboard and can update and resubmit your project until it's approved.",
  },
  { question: "When am I eligible for the certificate?", answer: "You become certificate-eligible only after all 3 tasks are marked Approved." },
  {
    question: "What is the ₹149 fee?",
    answer:
      "A one-time certificate processing fee covering certificate generation, a unique certificate ID, and QR-based verification. It is charged only after you're certificate-eligible — never before.",
  },
  {
    question: "How can I verify my certificate?",
    answer: "Anyone can verify a CodeVantage certificate by scanning its QR code or entering the certificate ID on our /verify page.",
  },
  { question: "Can I update my project submission?", answer: "Yes, you can update and resubmit a task's submission any time before it's approved." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for content seeding...");

    for (const block of contentBlocks) {
      await SiteContent.findOneAndUpdate({ key: block.key }, block, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log(`Upserted ${contentBlocks.length} content blocks.`);

    for (const [index, faq] of faqs.entries()) {
      await Faq.findOneAndUpdate(
        { question: faq.question },
        { ...faq, order: index },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Upserted ${faqs.length} FAQ entries.`);

    console.log("Content seeding complete.");
  } catch (err) {
    console.error("Content seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
