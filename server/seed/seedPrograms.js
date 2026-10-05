// Run with: npm run seed (from /server)
// Upserts the internship programs so student registration can assign a real
// Program document by slug. Safe to re-run — uses upsert, never duplicates.

require("dotenv").config();
const mongoose = require("mongoose");
const { Program } = require("../models");

const programs = [
  {
    slug: "web-development",
    name: "Web Development",
    shortDescription: "Build modern and responsive web applications with real-world projects.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    technologies: ["HTML", "CSS", "JavaScript"],
    icon: "monitor",
    isPopular: true,
    displayOrder: 1,
  },
  {
    slug: "javascript",
    name: "JavaScript",
    shortDescription: "Build interactive web applications with JavaScript and modern tools.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    technologies: ["JavaScript", "DOM APIs"],
    icon: "braces",
    isPopular: false,
    displayOrder: 2,
  },
  {
    slug: "php-mysql",
    name: "PHP & MySQL",
    shortDescription: "Learn backend development with PHP and MySQL through hands-on projects.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    technologies: ["PHP", "MySQL"],
    icon: "database",
    isPopular: false,
    displayOrder: 3,
  },
  {
    slug: "python",
    name: "Python",
    shortDescription: "Work on automation, data handling and real-world Python projects.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    technologies: ["Python"],
    icon: "terminal",
    isPopular: false,
    displayOrder: 4,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    for (const program of programs) {
      await Program.findOneAndUpdate({ slug: program.slug }, program, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      console.log(`Upserted program: ${program.name}`);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
