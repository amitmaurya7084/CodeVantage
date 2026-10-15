import { useEffect, useState } from "react";

import {
  ArrowRight, PlayCircle, Boxes, Wallet, FolderGit2, ClipboardCheck, TrendingUp, GraduationCap, Users, Handshake, Code2, Award,
  Sparkles, Monitor, ShieldCheck, ChevronLeft, ChevronRight, Star, UserPlus, ListChecks, ClipboardList, Code, UploadCloud, Search, BadgeCheck,
  CheckCircle2, GitBranch, Link2, Eye, FileText, Send, LayoutGrid, BookOpen, FolderOpen, Plus, Rocket, BarChart3, FileBadge,
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

// Placeholder testimonials — swap these for real student quotes (and, if
// available, real photos in place of the initials avatar) once you have
// them collected.
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Web Development Intern",
    quote:
      "CodeVantage helped me build real projects and boosted my confidence. The certificate process was smooth and transparent.",
    rating: 5,
    initials: "PS",
  },
  {
    name: "Sandeep Verma",
    role: "Python Intern",
    quote:
      "The task reviews actually taught me something every time. I finished the internship with three projects I'm proud to show.",
    rating: 5,
    initials: "SV",
  },
  {
    name: "Mayank Agrawal",
    role: "JavaScript Intern",
    quote:
      "Flexible enough to fit around my college schedule, but structured enough that I always knew what to build next.",
    rating: 4,
    initials: "MA",
  },
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

/** Floating label chip for the How It Works top-right decoration. */
function Chip({ icon: Icon, iconClass, children, className = "" }) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-md ring-1 ring-slate-100 ${className}`}
    >
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded ${iconClass}`}>
        <Icon className="h-3 w-3" aria-hidden="true" />
      </span>
      {children}
    </div>
  );
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
        // Silently keep defaults — a homepage that fails to fetch CMS copy
        // should never look broken to a visitor.
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

  // Highlight the last word of the third heading line in amber (e.g. "Get
  // Certified." -> "Get" in white, "Certified." in amber) — matches the
  // approved design reference while staying CMS-content-driven.
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/70 to-white">
        {/* Decorative Background Shapes */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-blue-100/70 blur-3xl"
          aria-hidden="true"/>
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-blue-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[35%] h-40 w-40 sm:h-72 sm:w-72 rounded-full bg-blue-50/80 blur-3xl"
          aria-hidden="true"
        />
        {/* Main Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="lg:min-h-[620px] py-10 sm:py-14 lg:pt-16 lg:pb-8 grid lg:grid-cols-[1fr_1.05fr] gap-8 sm:gap-10 lg:gap-6 xl:gap-8 items-center lg:items-start">
            {/* ============================================================
          LEFT CONTENT
      ============================================================ */}
            <div className="relative z-20 text-center lg:text-left lg:pt-10">
              {/* Badge */}
              <FadeIn direction="up" delay={0}>
                <Badge
                  className="mb-4 sm:mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1.5 text-[11px] sm:text-sm font-medium"
                >
                  <GraduationCap className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {hero.badge}
                </Badge>
              </FadeIn>
              {/* Heading */}
              <FadeIn direction="up" delay={0.1}>
                <h1
                  className="text-[2.1rem] leading-[1.08] xs:text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-[3.6rem] font-extrabold text-navy tracking-tight break-words">
                  <span>{hero.headingLine1}</span>
                  <br />
                  <span>
                    {hero.headingLine2}
                  </span>
                  <br />
                  <span className="relative inline-block text-blue-600">
                    {line3Rest ? `${line3Rest} ` : ""}
                    {line3Last}
                    {/* Blue hand-drawn underline */}
                    <svg
                      className="absolute left-0 -bottom-3 sm:-bottom-4 w-[70%] h-3 sm:h-4 text-blue-600"
                      viewBox="0 0 260 16"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M3 11 C60 4 150 2 257 5 C170 7 90 10 40 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </h1>
              </FadeIn>
              {/* Description */}
              <FadeIn direction="up" delay={0.2}>
                <p className="mt-6 sm:mt-8 mx-auto lg:mx-0 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-600">
                  {hero.description}</p>
              </FadeIn>
              {/* CTA Buttons */}
              <FadeIn direction="up" delay={0.3}>
                <div
                  className="mt-6 sm:mt-8 flex flex-col xs:flex-row xs:justify-center lg:justify-start gap-3 sm:gap-4 max-w-md xs:max-w-none mx-auto lg:mx-0">
                  {/* Primary */}
                  <Button
                    to="/register"
                    size="lg" className="w-full xs:w-auto justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                  >
                    {hero.ctaPrimaryText}  <ArrowRight className="h-4 w-4" />
                  </Button>
                  {/* Secondary */}
                  <Button
                    to="/how-it-works"
                    variant="outline"
                    size="lg"
                    className="w-full xs:w-auto justify-center rounded-lg bg-white/80 border-slate-300 text-navy hover:border-blue-500 hover:text-blue-600"
                  >
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    {hero.ctaSecondaryText}
                  </Button>
                </div>
              </FadeIn>
              {/* =========================================================
            HIGHLIGHTS
        ========================================================= */}
              <motion.div
                className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 sm:gap-4 max-w-md sm:max-w-2xl mx-auto lg:mx-0 text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {heroHighlights.map((h) => (
                  <motion.div key={h.label} variants={staggerItem} className="flex items-center gap-2.5">
                    <span
                      className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <h.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true"/></span>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                      {h.label}</p>
                  </motion.div>
                ))}
              </motion.div>
              {/* =========================================================
            MOBILE / TABLET STATS
        ========================================================= */}
              <motion.div
                className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:hidden text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {heroStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    variants={staggerItem}
                    className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 sm:p-4 shadow-md">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white ${["bg-blue-600", "bg-emerald-500", "bg-amber-500"][i % 3]}`}
                    >
                      <stat.icon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-navy font-bold leading-none">
                        {stat.value}
                      </p>
                      <p className="text-slate-500 text-xs mt-1 leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            {/* ============================================================
          RIGHT VISUAL
      ============================================================ */}
            <FadeIn
              direction="left"
              delay={0.2}
              className="relative"
            >
              <div
                className="relative mx-auto w-full max-w-md sm:max-w-xl lg:max-w-none min-h-[470px] xs:min-h-[490px] sm:min-h-[620px] lg:min-h-[580px]"
              >
                {/* ========================================================
              SOFT BACKGROUND SHAPES
          ======================================================== */}
                <div
                  className="absolute top-8 right-2 sm:top-10 sm:right-10 w-44 h-44 sm:w-72 sm:h-72 rounded-full bg-blue-100/80 blur-2xl"
                  aria-hidden="true"
                />
                {/* ========================================================
              HANDWRITTEN NOTE — "Learn by Doing"
          ======================================================== */}
                <div
                  className="pointer-events-none absolute -left-16 -top-2 z-30 hidden xl:block -rotate-12 text-navy"
                  style={{ fontFamily: "CertSignature, 'Caveat', cursive", fontSize: "1.5rem", lineHeight: 1.05 }}
                  aria-hidden="true"
                >
                  Learn by
                  <br />
                  <span className="ml-4 inline-block">Doing</span>
                  <svg className="ml-8 mt-1 h-9 w-9 text-blue-600" viewBox="0 0 40 40" fill="none">
                    <path d="M6 6 C4 22 14 32 26 28 C34 24 28 14 22 20 C20 22 24 26 34 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                {/* ========================================================
              CODE EDITOR
          ======================================================== */}
                <div
                  className="absolute top-4 sm:top-8 lg:top-12 left-0 sm:left-4 lg:left-6 w-[72%] sm:w-[58%] lg:w-[52%] xl:w-[46%] z-10 -rotate-3 rounded-xl sm:rounded-2xl bg-[#0f1b33] border border-slate-700 shadow-2xl"
                >
                  {/* JS badge */}
                  <span className="absolute -top-3 right-3 z-10 rounded-lg bg-amber-400 px-2 py-1 text-[10px] sm:text-xs font-extrabold text-navy shadow-md">
                    JS
                  </span>
                  {/* Browser Bar */}
                  <div
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/5 rounded-t-xl sm:rounded-t-2xl"
                  >
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-400" />
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-400" />
                    <span className="ml-2 sm:ml-3 text-[9px] sm:text-[11px] text-slate-300 truncate">
                      project-task-03.jsx
                    </span>
                  </div>
                  {/* Code Lines (decorative) */}
                  <div className="p-2 sm:p-4 font-mono text-[6px] sm:text-[9px] lg:text-[8.2px] xl:text-[10px] leading-[1.8] text-slate-200 overflow-hidden" aria-hidden="true">
                    {[
                      <><span className="text-pink-400">import</span> React, {"{"} <span className="text-cyan-300">useState</span> {"}"} <span className="text-pink-400">from</span> <span className="text-amber-300">'react'</span>;</>,
                      <><span className="text-pink-400">function</span> <span className="text-cyan-300">Project</span>() {"{"}</>,
                      <>&nbsp;&nbsp;<span className="text-pink-400">const</span> [task, setTask] = <span className="text-cyan-300">useState</span>(<span className="text-amber-300">''</span>);</>,
                      <>&nbsp;&nbsp;<span className="text-pink-400">return</span> (</>,
                      <>&nbsp;&nbsp;&nbsp;&nbsp;{"<"}<span className="text-cyan-300">div</span> <span className="text-amber-300">className</span>=<span className="text-green-300">"p-4"</span>{">"}</>,
                      <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"<"}<span className="text-cyan-300">h2</span>{">"}Build Something Amazing{"</"}<span className="text-cyan-300">h2</span>{">"}</>,
                      <>&nbsp;&nbsp;&nbsp;&nbsp;{"</"}<span className="text-cyan-300">div</span>{">"}</>,
                      <>&nbsp;&nbsp;);</>,
                      <>{"}"}</>,
                      <><span className="text-pink-400">export default</span> Project;</>,
                    ].map((line, i) => (
                      <div key={i} className="flex gap-3 whitespace-nowrap">
                        <span className="w-3 flex-shrink-0 text-right text-slate-500">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ========================================================
              STUDENT / LAPTOP IMAGE  (IMAGE SLOT)
          ======================================================== */}
                <div
                  className="absolute bottom-0 right-0 lg:right-[9%] w-[96%] sm:w-[96%] lg:w-[92%] z-20 mix-blend-multiply" >
                  <img
                    src={HERO_IMAGE}
                    alt="Student working on real-world projects"
                    decoding="async"
                    className="block w-full h-auto max-h-[340px] sm:max-h-none object-contain object-bottom"
                    style={{
                      /* feathers the photo's left / right / top edges so no white box shows */
                      WebkitMaskImage: "linear-gradient(to right, transparent, #000 12%, #000 90%, transparent), linear-gradient(to bottom, transparent, #000 12%)",
                      maskImage: "linear-gradient(to right, transparent, #000 12%, #000 90%, transparent), linear-gradient(to bottom, transparent, #000 12%)",
                      WebkitMaskComposite: "source-in",
                      maskComposite: "intersect",
                    }}
                  />
                </div>
                {/* ========================================================
              HANDWRITTEN NOTE — "Turn Ideas into Real Projects"
          ======================================================== */}
                <div
                  className="pointer-events-none absolute -left-5 top-[57%] z-30 hidden lg:block -rotate-[14deg] text-navy"
                  style={{ fontFamily: "CertSignature, 'Caveat', cursive", fontSize: "1.45rem", lineHeight: 1.05 }}
                  aria-hidden="true"
                >
                  Turn Ideas
                  <br />
                  <span className="ml-3 inline-block">into Real</span>
                  <br />
                  <span className="ml-6 inline-block">Projects</span>
                  <svg className="-ml-1 mt-1 h-10 w-14 text-blue-600" viewBox="0 0 56 40" fill="none">
                    <path d="M4 4 C0 24 14 36 40 32 M33 27 L42 32 L35 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {/* ========================================================
              FLOATING STATS (laptop/desktop only — tablet & mobile use the stat cards on the left)
          ======================================================== */}
                <motion.div
                  className="absolute top-0 right-0 lg:-right-2 xl:-right-6 z-30 hidden lg:flex flex-col gap-2.5 w-48 xl:w-52"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {heroStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      variants={staggerItem}
                      className="flex items-center gap-2.5 bg-white rounded-xl p-2.5 border border-slate-100 shadow-lg"
                    >
                      <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white ${["bg-blue-600", "bg-emerald-500", "bg-amber-500"][i % 3]}`}
                      >
                        <stat.icon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-navy font-bold leading-none text-lg">
                          {stat.value}
                        </p>
                        <p className="text-slate-600 text-xs mt-1 leading-snug">
                          {stat.label}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                {/* ========================================================
              FLOATING MENTORS CARD
          ======================================================== */}
                <FadeIn
                  direction="up"
                  delay={0.6}
                  className="absolute lg:top-[56%] right-0 lg:-right-4 xl:-right-10 z-40 hidden lg:block"
                >
                  <div
                    className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-100 w-48 sm:w-52"
                  >
                    {/* IMAGE SLOTS — mentor avatars */}
                    <div className="flex items-center">
                      {["from-amber-200 to-amber-400", "from-rose-200 to-rose-400", "from-sky-200 to-sky-400"].map((g, i) => (
                        <span
                          key={i}
                          className={`-ml-2 first:ml-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white bg-gradient-to-br ${g}`}
                        />
                      ))}
                      <span className="-ml-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-white bg-blue-50 text-blue-600">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-navy text-xs sm:text-sm font-semibold leading-snug">
                          Learn with Expert Mentors
                        </p>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 leading-snug">
                          Get guidance, feedback and career support.
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-blue-600" aria-hidden="true" />
                    </div>
                  </div>
                </FadeIn>
                {/* ========================================================
              DECORATIVE BLUE CIRCLE
          ======================================================== */}
                <div
                  className="absolute bottom-2 right-2 sm:right-8 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-blue-500/10 blur-2xl z-0"
                  aria-hidden="true"
                />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* ============================================================
          BOTTOM FEATURE STRIP
      ============================================================ */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 lg:divide-x divide-slate-200 rounded-2xl bg-white border border-slate-100 shadow-lg px-5 sm:px-6 py-5">
            {[
              { icon: Rocket, title: "Hands-On Learning", text: "Work on real projects, not just theory.", tone: "bg-orange-50 text-orange-500" },
              { icon: Users, title: "Industry Guidance", text: "Learn from experienced mentors.", tone: "bg-blue-50 text-blue-600" },
              { icon: BadgeCheck, title: "Verified Certificates", text: "Showcase your skills with confidence.", tone: "bg-emerald-50 text-emerald-500" },
              { icon: BarChart3, title: "Better Career Opportunities", text: "Build a strong portfolio and get noticed.", tone: "bg-purple-50 text-purple-600" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3.5 lg:px-5 first:lg:pl-0 last:lg:pr-0">
                <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${f.tone}`}>
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-navy text-sm sm:text-base leading-snug">{f.title}</p>
                  <p className="text-xs sm:text-sm text-slate-500 leading-snug">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies & Tools */}

      <section className="pt-14 pb-8 sm:pt-16 sm:pb-10 bg-white border-b border-slate-100">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] px-4 sm:px-7 lg:px-8 py-5 sm:py-7">

            {/* Heading - Top */}
            <div className="text-center mb-5 sm:mb-7">
              <p className="text-base sm:text-xl font-bold text-navy px-2">
                Technologies I&apos;ll Work With
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-200 mb-5 sm:mb-7" />

            {/* Technologies */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap md:items-center md:justify-center gap-x-3 sm:gap-x-6 lg:gap-x-12 gap-y-5 sm:gap-y-6">

              {techTools.items.map((tool) => {
                const iconMap = {
                  HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
                  HTML5: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",

                  CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
                  CSS3: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",

                  JavaScript:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",

                  JS:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",

                  React:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",

                  "Node.js":
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",

                  Node:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",

                  MongoDB:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",

                  Python:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",

                  GitHub:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",

                  "VS Code":
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",

                  PHP:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",

                  MySQL:
                    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
                };

                return (
                  <div
                    key={tool}
                    className="flex min-w-0 flex-col items-center justify-center gap-2 md:min-w-[70px]"
                  >
                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 flex items-center justify-center">
                      {iconMap[tool] ? (
                        <img
                          src={iconMap[tool]}
                          alt={`${tool} logo`}
                          loading="lazy"
                          className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-navy">
                          {tool.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <span className="text-xs sm:text-sm font-medium text-navy text-center leading-tight break-words sm:whitespace-nowrap">
                      {tool}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>
        </Reveal>
      </section>

      {/* Programs */}
      <section className="py-12 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
            <SectionHeading
              eyebrow="Popular Programs"
              title="Our Internship Programs"
              description="Choose a program, work on real projects, and get certified."
              highlightLast={1}
            />
            <Button to="/internships" variant="outline" className="w-full xs:w-auto justify-center">
              View All Programs <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {programs.map((program) => (
              <motion.div key={program.slug} variants={staggerItem} className="h-full">
                <ProgramCard program={program} />
              </motion.div>
            ))}
            {/* Not sure which program? — quiz teaser card */}
            <motion.div variants={staggerItem} className="h-full">
              <div className="h-full rounded-card bg-navy p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                <Sparkles className="absolute top-5 right-4 sm:top-6 sm:right-5 h-6 w-6 text-amber-300/70" aria-hidden="true" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug pr-8">
                    Not Sure Which Program is Right for You?
                  </h3>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    Take a short quiz and get a personalized program recommendation.
                  </p>
                </div>
                <Button to="/contact" size="md" className="mt-6 w-full">
                  Find My Path <ArrowRight className="h-4 w-4" />
                </Button>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["HTML", "JS", "PHP", "Python"].map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-white/10 text-slate-200 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* How It Works preview */}
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
            className="grid grid-cols-1 gap-x-8 gap-y-5 sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {howItWorksSteps.map((step, i) => (
              <motion.div key={step.title} variants={staggerItem} className="relative">
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                  <div className={`relative h-32 sm:h-36 overflow-hidden rounded-xl ${STEP_TINTS[i % STEP_TINTS.length]}`}>
                    <span className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                    <StepArt index={i} Icon={STEP_ICONS[i % STEP_ICONS.length]} />
                  </div>
                  <p className="mt-3 text-base sm:text-lg font-bold text-navy break-words">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
                {/* Arrow between cards — 3 per row at lg, 4 per row at xl */}
                {i % 3 !== 2 && i !== howItWorksSteps.length - 1 && (
                  <span
                    className="absolute -right-[1.4rem] top-[30%] z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-brand ring-4 ring-white lg:inline-flex xl:hidden"
                    aria-hidden="true"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
                {i % 4 !== 3 && i !== howItWorksSteps.length - 1 && (
                  <span
                    className="absolute -right-[1.4rem] top-[30%] z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-brand ring-4 ring-white xl:inline-flex"
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

      {/* Why Choose CodeVantage + Student Testimonials */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 ">
          <Reveal className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-6 lg:p-10 grid lg:grid-cols-2 gap-8 lg:gap-10  bg-[#FFF9E8]">
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
              <div className="flex items-start justify-between gap-3 sm:gap-4">
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
                className="mt-6 sm:mt-8 bg-white rounded-xl border border-slate-100 shadow-card p-4 sm:p-5 flex gap-3 sm:gap-4"
              >
                <span
                  className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white text-sm sm:text-base font-semibold"
                  aria-hidden="true"
                >
                  {activeTestimonial.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-navy/90 leading-relaxed break-words">&ldquo;{activeTestimonial.quote}&rdquo;</p>
                  <p className="font-semibold text-navy mt-3">{activeTestimonial.name}</p>
                  <p className="text-sm text-muted">{activeTestimonial.role}</p>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < activeTestimonial.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About + FAQ preview */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
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
            <div className="flex items-center justify-between mb-6 gap-3">
              <Badge>FAQs</Badge>
              <Button to="/faq" variant="ghost" className="!px-0">
                View All FAQs <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <Accordion items={faqs.slice(0, 5)} />
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E8] to-[#FFF3D1] py-10 sm:py-14 lg:py-10">
        {/* soft background blobs */}
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-10 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center">
            {/* ── Left: copy, buttons, features ── */}
            <div className="min-w-0 text-center lg:text-left">
              <Reveal>
                <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl sm:rounded-full bg-amber-100/80 px-4 py-2 text-center text-xs sm:text-sm font-medium text-amber-600">
                  <GraduationCap className="h-4 w-4" />
                  Practical Learning <span>•</span> Real Projects <span>•</span> Career Ready
                </span>
                <h2 className="mt-5 text-[1.75rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[46px] font-extrabold leading-[1.1] text-navy tracking-tight break-words">
                  {String(finalCta.heading)
                    .split(/(Learning)/)
                    .map((part, i) =>
                      part === "Learning" ? (
                        <span key={i} className="text-brand">
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                </h2>
        <p className="mt-4 sm:mt-5 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
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
                    className="w-full sm:w-auto justify-center bg-white border-brand text-brand hover:bg-blue-50">
                    <LayoutGrid className="h-4 w-4" /> Explore Programs
                  </Button>
                </div>
              </Reveal>

              {/* Feature columns */}
              <motion.div
                className="mt-8 sm:mt-10 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-x-0 gap-y-6 text-left"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {[
                  { icon: BookOpen, tone: "bg-blue-100 text-brand", title: "Learn Practical Skills", sub: "Industry-relevant content and hands-on learning." },
                  { icon: FolderOpen, tone: "bg-emerald-100 text-emerald-600", title: "Work on Real Projects", sub: "Build a strong portfolio with guided projects." },
                  { icon: Award, tone: "bg-purple-100 text-purple-600", title: "Get Certified", sub: "Earn verifiable certificates to showcase your skills." },
                  { icon: BarChart3, tone: "bg-orange-100 text-orange-500", title: "Boost Your Career", sub: "Gain experience and stand out in the job market." },
                ].map(({ icon: Icon, tone, title, sub }, i) => (
                  <motion.div
                    key={title}
                    variants={staggerItem}
                    className={`flex flex-col gap-2 min-w-0 px-0 min-[480px]:px-4 md:first:pl-0 ${i > 0 ? "md:border-l md:border-slate-200/80" : ""
                      }`}
                  >
                    <span className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center ${tone}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <p className="font-semibold text-navy break-words">{title}</p>
                    <p className="text-sm text-slate-500 leading-snug">{sub}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            {/* ── Right: student image + floating cards ── */}
            <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none aspect-[4/3.6] sm:aspect-[4/3.3] lg:aspect-[3/2.5]">
              {/* soft yellow blob behind the photo */}
              <div className="absolute inset-[8%] rounded-[45%] bg-amber-100/70" />
              <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-contain object-bottom" />
          
              {/* Floating cards (hidden on very small screens) */}
              {[
                { icon: BarChart3, color: "text-brand", label: ["Learn", "New Skills"], pos: "left-[2%] top-[4%]" },
                { icon: Code2, color: "text-brand", label: ["Work on", "Real Projects"], pos: "-left-[2%] sm:left-[-6%] top-[30%]" },
                { icon: FileBadge, color: "text-amber-500", label: ["Get", "Certified"], pos: "right-[0%] top-[20%]" },
                { icon: Rocket, color: "text-brand", label: ["Boost", "Your Career"], pos: "right-[-2%] top-[46%]" },
              ].map(({ icon: Icon, color, label, pos }) => (
                <div
                  key={label.join(" ")}
                  className={`hidden min-[480px]:flex absolute ${pos} flex-col gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-white px-2.5 py-2 sm:px-4 sm:py-3 shadow-lg shadow-slate-200/70`}
                >
                  <Icon className={`h-5 w-5 sm:h-8 sm:w-8 ${color}`} />
                  <p className="text-[11px] sm:text-sm font-medium text-navy leading-tight">
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
