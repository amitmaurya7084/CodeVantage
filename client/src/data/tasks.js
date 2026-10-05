// Placeholder data shaped like the future GET /api/tasks?program=web-development
// response. Replaced by a real API call once Step 7 (Admin > Tasks) exists.

export const webDevTasks = [
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
    expectedOutput:
      "A single-page, fully responsive website deployed and viewable via a live URL.",
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
    description:
      "Build a functional calculator web app that performs basic arithmetic operations.",
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
];
