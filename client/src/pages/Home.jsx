import { useEffect, useState } from "react";

import {
  ArrowRight, PlayCircle, Wallet, ClipboardCheck, TrendingUp, GraduationCap, Users, Handshake, Code2, Award,
  Sparkles, Monitor, ShieldCheck, ChevronLeft, ChevronRight, Star, UserPlus, ListChecks, ClipboardList, Code,
  UploadCloud, Search, BadgeCheck, CheckCircle2, GitBranch, Link2, Send, LayoutGrid, BookOpen, FolderOpen,
  BarChart3, Rocket, FileBadge,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import SectionHeading from "../components/ui/SectionHeading";
import Accordion from "../components/ui/Accordion";
import ProgramCard from "../components/ProgramCard";
import Seo from "../components/Seo";
import { FadeIn, Reveal, motion, staggerContainer, staggerItem } from "../components/ui/Motion";
import { programs as staticPrograms } from "../data/programs";
import { faqs as staticFaqs } from "../data/faqs";
import { fetchContent } from "../services/contentService";
import { fetchPrograms } from "../services/programService";
import { fetchFaqs } from "../services/faqService";

// NOTE: tailwind.config.js mein `xs: "480px"` hona zaroori hai:
// theme: { extend: { screens: { xs: "480px" } } }

// Fallback copy — used if the CMS content hasn't been set yet or the request
// fails, so the homepage never shows blank sections.

const HERO_IMAGE = "/images/hero-student.png";
const DEFAULT_HERO = {
  badge: "Project-Based Learning for a Better Tomorrow",
  headingLine1: "Build Skills.",
  headingLine2: "Create Projects.",
  headingLine3: "Get Certified.",
  description:
    "Join CodeVantage's industry-oriented internship programs and turn your learning into real-world projects.",
  ctaPrimaryText: "Apply for Internship",
  ctaSecondaryText: "Watch Video",
};
const DEFAULT_TECH_TOOLS = { items: ["HTML", "CSS", "JavaScript", "GitHub", "VS Code", "PHP", "MySQL", "Python"] };
const DEFAULT_FINAL_CTA = {
  heading: "Start Your Learning Journey Today",
  description: "Join CodeVantage and turn your learning into real-world projects.",
};

// Tech icons — component ke bahar, taaki har render par naya object na bane
const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const TECH_ICONS = {
  HTML: `${DEVICON}/html5/html5-original.svg`,
  HTML5: `${DEVICON}/html5/html5-original.svg`,
  CSS: `${DEVICON}/css3/css3-original.svg`,
  CSS3: `${DEVICON}/css3/css3-original.svg`,
  JavaScript: `${DEVICON}/javascript/javascript-original.svg`,
  JS: `${DEVICON}/javascript/javascript-original.svg`,
  React: `${DEVICON}/react/react-original.svg`,
  "Node.js": `${DEVICON}/nodejs/nodejs-original.svg`,
  Node: `${DEVICON}/nodejs/nodejs-original.svg`,
  MongoDB: `${DEVICON}/mongodb/mongodb-original.svg`,
  Python: `${DEVICON}/python/python-original.svg`,
  GitHub: `${DEVICON}/github/github-original.svg`,
  "VS Code": `${DEVICON}/vscode/vscode-original.svg`,
  PHP: `${DEVICON}/php/php-original.svg`,
  MySQL: `${DEVICON}/mysql/mysql-original.svg`,
};

const heroStats = [
  { icon: GraduationCap, value: "3", label: "Real-World Projects" },
  { icon: Users, value: "5,000+", label: "Students Joined" },
  { icon: Wallet, value: "₹149", label: "Certificate Fee, after completion" },
];

const heroHighlights = [
  { icon: Code2, label: "Practical Projects" },
  { icon: Award, label: "Expert Review" },
  { icon: ClipboardCheck, label: "Recognized Certificate" },
  { icon: TrendingUp, label: "Career Growth" },
];

const howItWorksSteps = [
  { title: "Register", description: "Create your free account in minutes." },
  { title: "Choose Program", description: "Pick the internship track that fits your goals." },
  { title: "Receive Tasks", description: "Get 3 project tasks with clear instructions." },
  { title: "Build Projects", description: "Complete and deploy your projects." },
  { title: "Submit Projects", description: "Share your GitHub, live, and LinkedIn links." },
  { title: "Get Reviewed", description: "Our team reviews your work and gives feedback." },
];

const features = [
  { icon: GraduationCap, title: "Real-World Projects", description: "Work on industry-relevant projects." },
  { icon: Users, title: "Expert Mentorship", description: "Get guidance from experienced mentors." },
  { icon: Monitor, title: "Flexible & Online", description: "Learn and build from anywhere." },
  { icon: ShieldCheck, title: "Affordable Certification", description: "Just ₹149 after completion." },
];

// Initials ab name se auto-generate hote hain
const getInitials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// Placeholder testimonials — swap these for real student quotes once collected.
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Web Development Intern",
    quote:
      "CodeVantage helped me build real projects and boosted my confidence. The certificate process was smooth and transparent.",
    rating: 5,
  },
  {
    name: "Sandeep Verma",
    role: "Python Intern",
    quote:
      "The task reviews actually taught me something every time. I finished the internship with three projects I'm proud to show.",
    rating: 5,
  },
  {
    name: "Mayank Agrawal",
    role: "JavaScript Intern",
    quote:
      "Flexible enough to fit around my college schedule, but structured enough that I always knew what to build next.",
    rating: 4,
  },
];

const finalCtaFeatures = [
  { icon: BookOpen, tone: "bg-blue-100 text-brand", title: "Learn Practical Skills", sub: "Industry-relevant content and hands-on learning." },
  { icon: FolderOpen, tone: "bg-emerald-100 text-emerald-600", title: "Work on Real Projects", sub: "Build a strong portfolio with guided projects." },
  { icon: Award, tone: "bg-purple-100 text-purple-600", title: "Get Certified", sub: "Earn verifiable certificates to showcase your skills." },
  { icon: BarChart3, tone: "bg-orange-100 text-orange-500", title: "Boost Your Career", sub: "Gain experience and stand out in the job market." },
];

const finalCtaCards = [
  { icon: BarChart3, color: "text-brand", label: ["Learn", "New Skills"], pos: "left-0 top-[4%]" },
  { icon: Code2, color: "text-brand", label: ["Work on", "Real Projects"], pos: "left-0 top-[34%]" },
  { icon: FileBadge, color: "text-amber-500", label: ["Get", "Certified"], pos: "right-0 top-[14%]" },
  { icon: Rocket, color: "text-brand", label: ["Boost", "Your Career"], pos: "right-0 top-[44%]" },
];

/* ---------------------------------------------------------------------
   How It Works preview — design helpers (presentational only)
   --------------------------------------------------------------------- */
// Icon per step (index order) + card art tint. Works even if howItWorksSteps has no icons.
const STEP_ICONS = [UserPlus, ListChecks, ClipboardList, Code, UploadCloud, Search, BadgeCheck, Award];
const STEP_TINTS = [
  "bg-orange-50",
  "bg-blue-50",
  "bg-amber-50",
  "bg-blue-50",
  "bg-sky-50",
  "bg-purple-50",
  "bg-green-50",
  "bg-blue-50",
];

/** Small decorative mock-up at the top of each step card. */
function StepArt({ index, Icon }) {
  const bar = "h-1.5 rounded-full bg-slate-200";
  switch (index % 8) {
    case 0: // Register
      return (
        <div className="flex h-full items-center justify-center gap-3 px-3">
          <span className="inline-flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
          </span>
          <div className="w-28 rounded-lg bg-white p-2.5 shadow-md">
            <p className="mb-1.5 text-center text-[9px] font-bold text-navy">Create Account</p>
            <div className="mb-1 h-3 rounded bg-slate-100" />
            <div className="mb-1.5 h-3 rounded bg-slate-100" />
            <div className="rounded bg-brand py-1 text-center text-[8px] font-semibold text-white">Sign Up</div>
          </div>
        </div>
      );
    case 1: // Choose program
      return (
        <div className="flex h-full items-center justify-center px-3">
          <div className="w-full max-w-[11rem] rounded-lg bg-gradient-to-b from-[#1E3A8A] to-[#1D4ED8] p-2.5 shadow-md">
            <p className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold text-white">
              <Icon className="h-3 w-3" aria-hidden="true" /> Choose Your Internship
            </p>
            {["Web Development", "Data Science", "App Development"].map((t, i) => (
              <div key={t} className="mb-1 flex items-center gap-1.5 rounded bg-white px-1.5 py-1 text-[8px] font-medium text-navy">
                <span className={`h-2.5 w-2.5 rounded-sm ${["bg-blue-500", "bg-purple-500", "bg-rose-500"][i]}`} />
                {t}
              </div>
            ))}
          </div>
        </div>
      );
    case 2: // Tasks
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative w-28 -rotate-6 rounded-lg bg-white p-2.5 pt-4 shadow-md">
            <span className="absolute -top-3 left-1/2 inline-flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-md bg-blue-600 text-white">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <p className="mb-1.5 text-[10px] font-bold text-navy">Your Tasks</p>
            {[0, 1].map((r) => (
              <div key={r} className="mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                <div className={`${bar} flex-1`} />
              </div>
            ))}
          </div>
        </div>
      );
    case 3: // Build
      return (
        <div className="flex h-full items-center justify-center gap-3">
          <div className="w-28 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 shadow-md">
            <div className="mb-1.5 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            </div>
            {[80, 55, 70, 40].map((w, i) => (
              <div key={i} className="mb-1 h-1.5 rounded-full bg-white/40" style={{ width: `${w}%` }} />
            ))}
          </div>
          <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
        </div>
      );
    case 4: // Submit
      return (
        <div className="flex h-full items-center justify-center px-3">
          <div className="relative w-full max-w-[11rem] rounded-lg bg-white px-3 pb-2.5 pt-5 shadow-md">
            <span className="absolute -top-3 left-1/2 inline-flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-white">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mb-2 text-center text-[10px] font-bold text-navy">Submit Project</p>
            <div className="flex items-center justify-between">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white">
                <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-1 text-[8px] font-semibold text-navy">
                <Link2 className="h-3 w-3 text-brand" aria-hidden="true" /> Live URL
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#0A66C2] text-[10px] font-bold text-white">
                in
              </span>
            </div>
          </div>
        </div>
      );
    case 5: // Review
      return (
        <div className="flex h-full items-center justify-center gap-2.5 px-3">
          <span className="inline-flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full bg-purple-200 text-purple-700 shadow">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
          </span>
          <div className="w-32 rounded-lg bg-white p-2.5 shadow-md">
            <p className="text-[9px] font-bold text-navy">Review &amp; Feedback</p>
            <div className="my-1 flex gap-0.5 text-amber-400">
              {[0, 1, 2, 3].map((s) => (
                <Star key={s} className="h-3 w-3 fill-current" aria-hidden="true" />
              ))}
            </div>
            <div className={`${bar} mb-1 w-full`} />
            <div className={`${bar} w-2/3`} />
          </div>
        </div>
      );
    case 6: // Approved
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative w-36 rounded-lg bg-white p-2.5 shadow-md">
            {[0, 1, 2].map((r) => (
              <div key={r} className="mb-1.5 flex items-center gap-1.5 last:mb-0">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded bg-green-500 text-white">
                  <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
                <div className={`${bar} flex-1`} />
              </div>
            ))}
            <span className="absolute -right-3 -top-2 rotate-12 rounded-md bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              Approved
            </span>
          </div>
        </div>
      );
    default: // Certificate
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative w-40 -rotate-3 rounded-md border-2 border-blue-600 bg-white px-3 py-2.5 text-center shadow-md">
            <p className="text-[9px] font-bold text-navy">
              Code<span className="text-brand">Vantage</span>
            </p>
            <p className="text-[8px] font-bold tracking-wide text-navy">CERTIFICATE</p>
            <div className={`${bar} mx-auto mt-1.5 w-2/3`} />
            <div className={`${bar} mx-auto mt-1 w-1/2`} />
            <span className="absolute -bottom-3 -right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white shadow">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      );
  }
}

function Home() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [techTools, setTechTools] = useState(DEFAULT_TECH_TOOLS);
  const [finalCta, setFinalCta] = useState(DEFAULT_FINAL_CTA);
  const [programs, setPrograms] = useState(staticPrograms);
  const [faqs, setFaqs] = useState(staticFaqs);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    fetchContent(["home.hero", "home.techTools", "home.finalCta"])
      .then((content) => {
        if (content["home.hero"]) setHero(content["home.hero"]);
        if (content["home.techTools"]) setTechTools(content["home.techTools"]);
        if (content["home.finalCta"]) setFinalCta(content["home.finalCta"]);
      })
      .catch(() => {
        // Silently keep defaults.
      });

    fetchPrograms()
      .then((data) => {
        if (data && data.length > 0) setPrograms(data);
      })
      .catch(() => {
        // Keep static fallback.
      });

    fetchFaqs()
      .then((data) => {
        if (data && data.length > 0) setFaqs(data);
      })
      .catch(() => {
        // Keep static fallback.
      });
  }, []);

  // Highlight the last word of the third heading line.
  const line3Words = hero.headingLine3.trim().split(" ");
  const line3Last = line3Words.pop() || "";
  const line3Rest = line3Words.join(" ");

  const activeTestimonial = testimonials[testimonialIndex];
  const showPrevTestimonial = () =>
    setTestimonialIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const showNextTestimonial = () =>
    setTestimonialIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <div className="overflow-x-hidden">
      <Seo path="/" />

      {/* ============================ Hero ============================ */}
      <section className="relative overflow-hidden bg-[#FFFDF3]">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-amber-100/60 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/3 right-[35%] h-40 w-40 sm:h-72 sm:w-72 rounded-full bg-blue-50/80 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="lg:min-h-[650px] py-10 sm:py-14 lg:py-20 grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-8 xl:gap-12 items-center">
            {/* LEFT CONTENT */}
            <div className="relative z-20 text-center lg:text-left">
              <FadeIn direction="up" delay={0}>
                <Badge className="mb-4 sm:mb-6 inline-flex max-w-full text-center bg-blue-50 text-blue-700 border border-blue-100 shadow-sm text-[11px] sm:text-xs">
                  {hero.badge}
                </Badge>
              </FadeIn>

              <FadeIn direction="up" delay={0.1}>
                <h1 className="text-[1.9rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[2.6rem] xl:text-5xl font-bold text-navy leading-[1.1] tracking-tight break-words">
                  <span>{hero.headingLine1}</span>
                  <br />
                  <span>{hero.headingLine2}</span>
                  <br />
                  <span className="relative inline-block text-blue-600">
                    {line3Rest ? `${line3Rest} ` : ""}
                    {line3Last}
                    {/* Yellow underline */}
                    <span
                      className="absolute left-0 right-0 -bottom-1 sm:-bottom-2 h-1 sm:h-1.5 rounded-full bg-amber-400"
                      aria-hidden="true"
                    />
                  </span>
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={0.2}>
                <p className="mt-5 sm:mt-6 mx-auto lg:mx-0 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-700">
                  {hero.description}
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={0.3}>
                <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row xs:justify-center lg:justify-start gap-3 sm:gap-4 max-w-md xs:max-w-none mx-auto lg:mx-0">
                  <Button
                    to="/register"
                    size="lg"
                    className="w-full xs:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  >
                    {hero.ctaPrimaryText} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    to="/how-it-works"
                    variant="outline"
                    size="lg"
                    className="w-full xs:w-auto justify-center bg-white border-slate-200 text-navy hover:border-blue-500 hover:text-blue-600"
                  >
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    {hero.ctaSecondaryText}
                  </Button>
                </div>
              </FadeIn>

              {/* Highlights */}
              <motion.div
                className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 sm:gap-6 max-w-md sm:max-w-2xl mx-auto lg:mx-0 text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {heroHighlights.map((h) => (
                  <motion.div key={h.label} variants={staggerItem} className="flex items-center gap-2 sm:gap-2.5">
                    <span className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <h.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{h.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mobile / tablet stats */}
              <motion.div
                className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:hidden text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {heroStats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={staggerItem}
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <stat.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-navy font-bold leading-none">{stat.value}</p>
                      <p className="text-slate-500 text-xs mt-1 leading-snug">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT VISUAL */}
            <FadeIn direction="left" delay={0.2} className="relative">
              <div className="relative mx-auto w-full max-w-sm xs:max-w-md sm:max-w-xl lg:max-w-none h-[360px] xs:h-[400px] sm:h-[480px] lg:h-[560px]">
                {/* Background blobs */}
                <div className="absolute top-[8%] right-[4%] w-[45%] aspect-square rounded-full bg-blue-100 blur-2xl" aria-hidden="true" />
                <div className="absolute top-[18%] right-[10%] w-[34%] aspect-square rounded-full bg-amber-300/70 blur-xl" aria-hidden="true" />
                <div className="absolute bottom-2 right-2 sm:right-8 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-blue-500/10 blur-2xl" aria-hidden="true" />

                {/* Code editor — mobile par hidden */}
                <div className="hidden sm:block absolute left-0 top-10 lg:top-16 w-[52%] lg:w-[48%] z-10 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 border-b border-white/5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="ml-3 text-[11px] text-slate-400 truncate">project-task-03.jsx</span>
                  </div>
                  <div className="p-4 lg:p-5 space-y-2.5">
                    {["w-2/5", "w-3/5", "w-1/2", "w-4/5", "w-2/5"].map((w, i) => (
                      <div key={i} className={`h-2.5 rounded bg-cyan-400/40 ${w}`} />
                    ))}
                  </div>
                </div>

                {/* Student image */}
                <div className="absolute inset-x-0 bottom-0 top-6 sm:top-0 z-20 flex items-end justify-center lg:justify-end">
                  <img
                    src={HERO_IMAGE}
                    alt="Student working on real-world projects"
                    fetchpriority="high"
                    decoding="async"
                    className="max-h-full w-auto max-w-[92%] sm:max-w-[85%] object-contain object-bottom drop-shadow-2xl"
                  />
                </div>

                {/* Floating stats — sirf lg+ */}
                <motion.div
                  className="absolute top-0 right-0 xl:-right-6 z-30 hidden lg:flex flex-col gap-3 w-48 xl:w-52"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {heroStats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={staggerItem}
                      className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-slate-100 shadow-lg"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <stat.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-navy font-bold leading-none text-base">{stat.value}</p>
                        <p className="text-slate-600 text-xs mt-1 leading-snug">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Floating project card */}
                <FadeIn direction="up" delay={0.6} className="absolute bottom-2 sm:bottom-6 left-0 sm:left-2 xl:-left-6 z-40">
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white rounded-xl p-2.5 sm:p-4 shadow-xl border border-slate-100 w-44 sm:w-56">
                    <span className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Handshake className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-navy text-xs sm:text-sm font-semibold leading-snug">
                      Turn Your Ideas Into Real Projects
                    </p>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ====================== Technologies & Tools ====================== */}
      <section className="pt-14 pb-8 sm:pt-16 sm:pb-10 bg-white border-b border-slate-100">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] px-4 sm:px-7 lg:px-8 py-5 sm:py-7">
            <div className="text-center mb-5 sm:mb-7">
              <p className="text-base sm:text-xl font-bold text-navy">Technologies I'll Work With</p>
            </div>

            <div className="w-full h-px bg-slate-200 mb-5 sm:mb-7" />

            <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap md:items-center md:justify-center gap-x-3 sm:gap-x-6 lg:gap-x-12 gap-y-5 sm:gap-y-6">
              {techTools.items.map((tool) => (
                <div key={tool} className="flex flex-col items-center justify-center gap-2 md:min-w-[70px]">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 flex items-center justify-center">
                    {TECH_ICONS[tool] ? (
                      <img
                        src={TECH_ICONS[tool]}
                        alt={`${tool} logo`}
                        loading="lazy"
                        width="56"
                        height="56"
                        className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-navy">
                        {tool.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-navy text-center whitespace-nowrap">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================ Programs ============================ */}
      <section className="py-12 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <Reveal className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <SectionHeading
              eyebrow="Popular Programs"
              title="Our Internship Programs"
              description="Choose a program, work on real projects, and get certified."
              highlightLast={1}
            />
            <Button to="/internships" variant="outline" className="w-full sm:w-auto justify-center flex-shrink-0">
              View All Programs <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {programs.map((program) => (
              <motion.div key={program.slug} variants={staggerItem} className="h-full min-w-0">
                <ProgramCard program={program} />
              </motion.div>
            ))}

            {/* Quiz banner: poori row le leta hai */}
            <motion.div variants={staggerItem} className="sm:col-span-2 lg:col-span-4 min-w-0">
              <div className="relative overflow-hidden rounded-card bg-navy p-5 sm:p-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <Sparkles className="absolute top-4 right-4 h-6 w-6 text-amber-300/70" aria-hidden="true" />
                <div className="min-w-0 lg:max-w-xl pr-8">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-snug">
                    Not Sure Which Program is Right for You?
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Take a short quiz and get a personalized program recommendation.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["HTML", "JS", "PHP", "Python"].map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold bg-white/10 text-slate-200 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Button to="/contact" size="md" className="w-full lg:w-auto justify-center flex-shrink-0">
                  Find My Path <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======================= How It Works preview ======================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white py-12 sm:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="mx-auto mb-8 sm:mb-10 max-w-3xl text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs sm:text-sm font-semibold text-brand">
                Simple Process
              </span>
              <h2 className="mt-4 sm:mt-5 text-2xl xs:text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
                How <span className="text-brand">CodeVantage</span> Works
              </h2>
              <p className="mt-3 sm:mt-4 text-sm text-muted sm:text-base lg:text-lg">
                From registration to a verified certificate — follow these simple steps and build real-world
                skills with hands-on projects.
              </p>
            </div>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 gap-x-10 gap-y-5 sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {howItWorksSteps.map((step, i) => (
              <motion.div key={step.title} variants={staggerItem} className="relative">
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                  <div className={`relative h-32 overflow-hidden rounded-xl ${STEP_TINTS[i % STEP_TINTS.length]}`}>
                    <span className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                    <StepArt index={i} Icon={STEP_ICONS[i % STEP_ICONS.length]} />
                  </div>
                  <p className="mt-3 text-base sm:text-lg font-bold text-navy">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>

                {/* Arrow: sirf lg par, har row ke last card ke baad nahi */}
                {i % 3 !== 2 && i !== howItWorksSteps.length - 1 && (
                  <span
                    className="absolute -right-9 top-[30%] z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-brand ring-4 ring-white lg:inline-flex"
                    aria-hidden="true"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>

          <Reveal className="text-center mt-8 sm:mt-10">
            <Button to="/how-it-works" variant="outline" className="w-full xs:w-auto justify-center">
              See the Full Process <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ============ Why Choose CodeVantage + Student Testimonials ============ */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <Reveal className="rounded-2xl border border-amber-200 bg-[#FFF9E8] p-4 sm:p-6 lg:p-10 grid lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Left: Why Choose */}
            <div className="min-w-0">
              <Badge tone="sky" className="mb-4">
                Our Advantages
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy leading-tight">
                Why Choose <span className="text-brand">CodeVantage?</span>
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted">More than just an internship.</p>

              <motion.div
                className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                {features.map((f) => (
                  <motion.div key={f.title} variants={staggerItem} className="h-full">
                    <Card hoverable className="p-4 sm:p-5 h-full">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white mb-3">
                        <f.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="font-semibold text-navy">{f.title}</p>
                      <p className="text-sm text-muted mt-1">{f.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: Testimonials */}
            <div className="min-w-0 border-t lg:border-t-0 lg:border-l border-amber-200 pt-8 lg:pt-0 lg:pl-10">
              <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <Badge tone="sky" className="mb-4">
                    Their Stories
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy leading-tight">
                    Student <span className="text-brand">Testimonials</span>
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-muted">Hear from our learners.</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={showPrevTestimonial}
                    aria-label="Previous testimonial"
                    className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-blue-100 text-brand hover:bg-blue-200 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextTestimonial}
                    aria-label="Next testimonial"
                    className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-blue-100 text-brand hover:bg-blue-200 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 sm:mt-8 bg-white rounded-xl border border-slate-100 shadow-card p-4 sm:p-5 flex flex-col xs:flex-row gap-3 sm:gap-4 lg:min-h-[220px]"
              >
                <span
                  className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white text-sm sm:text-base font-semibold"
                  aria-hidden="true"
                >
                  {getInitials(activeTestimonial.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-navy/90 leading-relaxed">&ldquo;{activeTestimonial.quote}&rdquo;</p>
                  <p className="font-semibold text-navy mt-3">{activeTestimonial.name}</p>
                  <p className="text-sm text-muted">{activeTestimonial.role}</p>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < activeTestimonial.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================== About + FAQ preview ======================== */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Reveal direction="left" className="min-w-0">
            <Badge className="mb-4">Our Story</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
              Empowering the Next Generation of <span className="text-brand">Developers</span>
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
              At CodeVantage, we believe in learning by doing. Our goal is to bridge the gap
              between academic learning and real-world skills through structured, project-based
              internships with genuine review and feedback.
            </p>
            <Button to="/about" variant="outline" className="w-full xs:w-auto justify-center">
              Learn More About Us <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
          <Reveal direction="right" delay={0.1} className="min-w-0">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
              <Badge>FAQs</Badge>
              <Button to="/faq" variant="ghost" className="!px-0">
                View All FAQs <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <Accordion items={faqs.slice(0, 5)} />
          </Reveal>
        </div>
      </section>

      {/* ============================ Final CTA ============================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E8] to-[#FFF3D1] py-12 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[8%] top-10 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center">
            {/* Left */}
            <div className="min-w-0 text-center lg:text-left">
              <Reveal>
                <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-amber-100/80 px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-medium text-amber-600">
                  <GraduationCap className="h-4 w-4" />
                  Practical Learning <span>•</span> Real Projects <span>•</span> Career Ready
                </span>

                <h2 className="mt-5 text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-[1.1] text-navy tracking-tight break-words">
                  {String(finalCta.heading)
                    .split(/(Learning)/)
                    .map((part, i) =>
                      part === "Learning" ? (
                        <span key={i} className="text-brand">{part}</span>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                </h2>

                <p className="mt-4 sm:mt-5 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
                  {finalCta.description}
                </p>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto lg:mx-0">
                  <Button to="/register" size="lg" className="w-full sm:w-auto justify-center">
                    <Send className="h-4 w-4" /> Apply for Internship <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    to="/internships"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto justify-center bg-white border-brand text-brand hover:bg-blue-50"
                  >
                    <LayoutGrid className="h-4 w-4" /> Explore Programs
                  </Button>
                </div>
              </Reveal>

              {/* Feature columns */}
              <motion.div
                className="mt-8 sm:mt-10 grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-6 text-left"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {finalCtaFeatures.map(({ icon: Icon, tone, title, sub }, i) => (
                  <motion.div
                    key={title}
                    variants={staggerItem}
                    className={`flex flex-col gap-2 min-w-0 xl:px-4 xl:first:pl-0 ${i > 0 ? "xl:border-l xl:border-slate-200/80" : ""}`}
                  >
                    <span className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center ${tone}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <p className="font-semibold text-navy">{title}</p>
                    <p className="text-sm text-slate-500 leading-snug">{sub}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: image + floating cards */}
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none h-[300px] sm:h-[380px] lg:h-[420px]">
              <div className="absolute inset-x-[6%] inset-y-[4%] rounded-[45%] bg-amber-100/70" aria-hidden="true" />
              <img
                src={HERO_IMAGE}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain object-bottom"
              />

              {finalCtaCards.map(({ icon: Icon, color, label, pos }) => (
                <div
                  key={label.join(" ")}
                  className={`hidden min-[480px]:flex absolute ${pos} flex-col gap-1 rounded-2xl bg-white px-3 py-2 sm:px-4 sm:py-3 shadow-lg shadow-slate-200/70`}
                >
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${color}`} />
                  <p className="text-xs sm:text-sm font-medium text-navy leading-tight">
                    {label[0]}
                    <br />
                    {label[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
