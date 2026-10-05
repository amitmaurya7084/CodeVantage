// Run with: npm run seed:tasks (from /server) — run AFTER seedPrograms.js

require("dotenv").config();
const mongoose = require("mongoose");
const { Program, Task } = require("../models");

const taskSets = {
  "web-development": [
    {
      order: 1,
      title: "Responsive Landing Page",
      description:
        "Design and build a fully responsive landing page for a fictional product or service of your choice.",
      objectives: [
        "Practice semantic HTML structure",
        "Apply responsive layout techniques with CSS",
        "Build a clean visual hierarchy",
      ],
      requirements: [
        "Must work on mobile, tablet, and desktop screen sizes",
        "Must include a navigation bar, hero section, features section, and footer",
        "Must be pushed to a public GitHub repository",
      ],
      technologies: ["HTML", "CSS", "JavaScript (optional)"],
      expectedOutput: "A single-page, fully responsive website deployed and viewable via a live URL.",
    },
    {
      order: 2,
      title: "Personal Portfolio Website",
      description:
        "Create a personal portfolio website to showcase your skills, projects, and contact information.",
      objectives: [
        "Structure a multi-section personal website",
        "Practice component-style thinking even in plain HTML/CSS",
        "Present information clearly for a recruiter or visitor",
      ],
      requirements: [
        "Must include About, Skills, Projects, and Contact sections",
        "Must be responsive across devices",
        "Must be pushed to a public GitHub repository",
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      expectedOutput: "A deployed personal portfolio site with a shareable live URL.",
    },
    {
      order: 3,
      title: "JavaScript Calculator",
      description: "Build a functional calculator web app that performs basic arithmetic operations.",
      objectives: [
        "Practice DOM manipulation with vanilla JavaScript",
        "Handle user input and events correctly",
        "Manage application state without a framework",
      ],
      requirements: [
        "Must support addition, subtraction, multiplication, and division",
        "Must handle invalid input gracefully (e.g. divide by zero)",
        "Must be pushed to a public GitHub repository",
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      expectedOutput: "A working calculator deployed with a shareable live URL.",
    },
  ],
  javascript: [
    {
      order: 1,
      title: "Interactive To-Do List",
      description: "Build a to-do list app with add, complete, and delete functionality.",
      objectives: ["Practice array state management", "Handle DOM events", "Persist data in the browser"],
      requirements: ["Add/edit/delete tasks", "Mark tasks complete", "Store tasks in localStorage"],
      technologies: ["JavaScript", "HTML", "CSS"],
      expectedOutput: "A deployed to-do list app with a shareable live URL.",
    },
    {
      order: 2,
      title: "Weather Lookup App",
      description: "Build an app that fetches and displays weather data from a public API.",
      objectives: ["Practice fetch/async-await", "Handle API errors gracefully", "Render dynamic data"],
      requirements: ["Search by city name", "Show temperature and conditions", "Handle invalid city names"],
      technologies: ["JavaScript", "Fetch API"],
      expectedOutput: "A deployed weather app with a shareable live URL.",
    },
    {
      order: 3,
      title: "Quiz Application",
      description: "Build a multiple-choice quiz app that scores the user at the end.",
      objectives: ["Manage multi-step application state", "Track score", "Provide user feedback"],
      requirements: ["At least 5 questions", "Show final score", "Allow retaking the quiz"],
      technologies: ["JavaScript", "HTML", "CSS"],
      expectedOutput: "A deployed quiz app with a shareable live URL.",
    },
  ],
  "php-mysql": [
    {
      order: 1,
      title: "Student Record CRUD App",
      description: "Build a basic app to Create, Read, Update, and Delete student records.",
      objectives: ["Connect PHP to MySQL", "Handle form submissions", "Write basic SQL queries"],
      requirements: ["Add/edit/delete records", "Validate form input", "Store data in MySQL"],
      technologies: ["PHP", "MySQL"],
      expectedOutput: "A working CRUD app with source pushed to GitHub.",
    },
    {
      order: 2,
      title: "Simple Login System",
      description: "Build a login/registration system with session handling.",
      objectives: ["Hash passwords", "Manage PHP sessions", "Validate user input"],
      requirements: ["Registration and login forms", "Passwords stored hashed", "Session-based auth"],
      technologies: ["PHP", "MySQL"],
      expectedOutput: "A working auth system with source pushed to GitHub.",
    },
    {
      order: 3,
      title: "Feedback Form with Admin View",
      description: "Build a public feedback form that saves entries viewable on an admin page.",
      objectives: ["Handle form POST data", "Query and display stored records", "Basic input sanitization"],
      requirements: ["Public submission form", "Admin page listing all entries", "Store entries in MySQL"],
      technologies: ["PHP", "MySQL"],
      expectedOutput: "A deployed or locally demoed app with source pushed to GitHub.",
    },
  ],
  python: [
    {
      order: 1,
      title: "Command-Line Expense Tracker",
      description: "Build a CLI tool to log and summarize personal expenses.",
      objectives: ["File I/O in Python", "Basic data aggregation", "Clean CLI UX"],
      requirements: ["Add/view/delete expenses", "Show category totals", "Persist data to a file"],
      technologies: ["Python"],
      expectedOutput: "A working CLI tool with source pushed to GitHub.",
    },
    {
      order: 2,
      title: "Web Scraper",
      description: "Build a script that scrapes and summarizes data from a public webpage.",
      objectives: ["Use requests/BeautifulSoup", "Parse HTML", "Handle errors gracefully"],
      requirements: ["Scrape at least one real data point", "Save results to a CSV file", "Handle request failures"],
      technologies: ["Python", "BeautifulSoup"],
      expectedOutput: "A working scraper script with source pushed to GitHub.",
    },
    {
      order: 3,
      title: "Data Analysis Mini-Project",
      description: "Analyze a sample dataset and produce basic visualizations.",
      objectives: ["Use pandas for data manipulation", "Use matplotlib for charts", "Draw basic conclusions"],
      requirements: ["Load a CSV dataset", "Produce at least 2 charts", "Write a short summary of findings"],
      technologies: ["Python", "pandas", "matplotlib"],
      expectedOutput: "A notebook or script with charts, pushed to GitHub.",
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for task seeding...");

    for (const [slug, tasks] of Object.entries(taskSets)) {
      const program = await Program.findOne({ slug });
      if (!program) {
        console.warn(`Skipping "${slug}" — program not found. Run seedPrograms.js first.`);
        continue;
      }

      for (const task of tasks) {
        await Task.findOneAndUpdate(
          { program: program._id, order: task.order },
          { ...task, program: program._id },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      console.log(`Upserted ${tasks.length} tasks for ${program.name}`);
    }

    console.log("Task seeding complete.");
  } catch (err) {
    console.error("Task seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
