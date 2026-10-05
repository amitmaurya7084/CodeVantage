// NOTE: This is placeholder data shaped exactly like the future GET /api/programs
// response (see server/models/Program.js). Once the Admin > Programs screen exists
// (Step 7), this file is replaced by a real API call in services/programService.js.

export const programs = [
  {
    slug: "web-development",
    name: "Web Development",
    shortDescription: "Build modern and responsive web applications with real-world projects.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    icon: "monitor",
    isPopular: true,
  },
  {
    slug: "javascript",
    name: "JavaScript",
    shortDescription: "Build interactive web applications with JavaScript and modern tools.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    icon: "braces",
    isPopular: false,
  },
  {
    slug: "php-mysql",
    name: "PHP & MySQL",
    shortDescription: "Learn backend development with PHP and MySQL through hands-on projects.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    icon: "database",
    isPopular: false,
  },
  {
    slug: "python",
    name: "Python",
    shortDescription: "Work on automation, data handling and real-world Python projects.",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    icon: "terminal",
    isPopular: false,
  },
];

export const getProgramBySlug = (slug) => programs.find((p) => p.slug === slug);
