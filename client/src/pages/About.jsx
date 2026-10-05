import { useEffect, useState } from "react";
import {
  Target,
  Eye,
  Heart,
  Layers,
  Gem,
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  Users,
  Zap,
  Laptop,
  UserCheck,
  Award,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";
import RichText from "../components/RichText";
import { fetchContent } from "../services/contentService";

const DEFAULTS = {
  "about.mission": {
    text: "To bridge the gap between academic learning and real-world development skills by giving students structured, project-based work with genuine review and feedback.",
  },
  "about.vision": {
    text: "A world where anyone motivated to learn can build a credible, project-based portfolio — regardless of their starting point.",
  },
  "about.values": {
    items: [
      "Honesty — no inflated claims, no fake numbers",
      "Rigor — certificates are earned through real review, not just payment",
      "Accessibility — virtual, self-paced, and affordable",
    ],
  },
  "about.whatWeOffer": {
    text: "Structured internship programs with real project tasks, expert review of every submission, and a QR-verifiable Certificate of Internship Completion upon successful completion.",
  },
};

// Optional hero picture (e.g. "/images/about-hero.png"). When null, a simple
// laptop illustration is drawn instead.
const HERO_IMAGE = null;

// Icon + colour per value card (cycles if the admin adds more than three values).
const VALUE_STYLES = [
  { icon: ShieldCheck, bg: "bg-blue-100", color: "text-blue-600" },
  { icon: Users, bg: "bg-green-100", color: "text-green-600" },
  { icon: Zap, bg: "bg-amber-100", color: "text-amber-500" },
];

// "Honesty — no inflated claims" -> { title: "Honesty", text: "No inflated claims" }.
// Presentation only: the stored strings are not changed.
function splitValue(item) {
  const match = item.match(/^(.*?)\s[—–-]\s(.*)$/);
  if (!match) return { title: item, text: "" };
  const text = match[2];
  return { title: match[1], text: text.charAt(0).toUpperCase() + text.slice(1) };
}

const OFFER_CARDS = [
  {
    icon: Laptop,
    title: "Project-Based Internships",
    text: "Structured programs with real-world tasks and industry-relevant technologies.",
    box: "bg-blue-50/70 border-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: UserCheck,
    title: "Expert Review & Feedback",
    text: "Get your submissions reviewed by mentors with detailed, actionable feedback.",
    box: "bg-green-50/70 border-green-100",
    iconBg: "bg-green-100 text-green-600",
  },
  {
    icon: Award,
    title: "Verifiable Certificates",
    text: "Earn a QR-verifiable Certificate of Internship Completion upon successful completion.",
    box: "bg-purple-50/70 border-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    icon: BarChart3,
    title: "Build a Strong Portfolio",
    text: "Work on real projects and showcase your skills to stand out in placements and job applications.",
    box: "bg-amber-50/70 border-amber-100",
    iconBg: "bg-amber-100 text-amber-500",
  },
];

/** Floating white label card used around the hero illustration. */
function FloatCard({ icon: Icon, iconClass, children, className = "" }) {
  return (
    <div
      className={`absolute flex items-center gap-2 sm:gap-2.5 rounded-xl bg-white px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-lg ring-1 ring-slate-100 ${className}`}
    >
      <span className={`inline-flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full ${iconClass}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      </span>
      <span className="text-[11px] sm:text-sm font-semibold leading-tight text-navy">{children}</span>
    </div>
  );
}

/** Right side of the hero: soft blobs, dotted grid, laptop (or picture) + floating cards. */
function HeroArt() {
  return (
    <div className="relative mx-auto h-64 w-full max-w-md xs:h-72 sm:h-96 sm:max-w-xl lg:h-[26rem]">
      {/* blobs */}
      <div className="absolute right-2 top-2 h-[85%] w-[78%] rounded-full bg-gradient-to-br from-blue-200 to-blue-400/70 opacity-70 blur-[2px]" />
      <div className="absolute -bottom-6 left-4 h-32 w-48 sm:h-40 sm:w-64 rounded-full bg-blue-200/60 blur-xl" />
      {/* dotted grids */}
      <div
        className="absolute left-[18%] top-3 h-12 w-16 sm:h-16 sm:w-24 opacity-50"
        style={{
          backgroundImage: "radial-gradient(#93B4F5 1.4px, transparent 1.6px)",
          backgroundSize: "12px 12px",
        }}
      />
      <div
        className="absolute left-0 top-[42%] h-16 w-16 sm:h-24 sm:w-24 opacity-50"
        style={{
          backgroundImage: "radial-gradient(#93B4F5 1.4px, transparent 1.6px)",
          backgroundSize: "12px 12px",
        }}
      />

      {HERO_IMAGE ? (
        <img
          src={HERO_IMAGE}
          alt=""
          decoding="async"
          className="absolute bottom-0 left-1/2 h-[92%] w-auto max-w-full -translate-x-1/2 object-contain"
        />
      ) : (
        <>
          {/* code panel */}
          <div className="absolute right-[12%] top-[8%] h-[46%] w-[42%] -rotate-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-2 sm:p-3 shadow-xl overflow-hidden">
            <div className="mb-2 flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            </div>
            {[70, 45, 82, 55, 66, 38].map((w, i) => (
              <div
                key={i}
                className="mb-1.5 h-1.5 rounded-full bg-white/40"
                style={{ width: `${w}%`, marginLeft: i % 3 === 1 ? "10%" : 0 }}
              />
            ))}
          </div>
          {/* laptop */}
          <svg
            viewBox="0 0 300 190"
            className="absolute bottom-[6%] left-1/2 w-[82%] sm:w-[78%] -translate-x-1/2 drop-shadow-xl"
          >
            <polygon points="62,10 238,10 262,150 38,150" fill="#7C8CB3" />
            <polygon points="70,18 230,18 250,142 50,142" fill="#8E9DC3" />
            <polygon points="150,62 168,80 150,98 132,80" fill="#E8EEFB" />
            <polygon points="150,70 160,80 150,90 140,80" fill="#7C8CB3" />
            <polygon points="20,152 280,152 296,172 4,172" fill="#B4BFD8" />
            <rect x="120" y="156" width="60" height="6" rx="3" fill="#97A5C7" />
          </svg>
        </>
      )}

      {/* plant */}
      <div className="absolute bottom-[8%] right-[2%] hidden sm:block">
        <div className="mx-auto h-10 w-10 rounded-b-xl bg-gradient-to-b from-pink-100 to-pink-200" />
        <div className="absolute bottom-8 left-1 h-12 w-3 rotate-[-25deg] rounded-full bg-green-500" />
        <div className="absolute bottom-8 left-4 h-14 w-3 rounded-full bg-green-600" />
        <div className="absolute bottom-8 left-7 h-12 w-3 rotate-[25deg] rounded-full bg-green-500" />
      </div>

      {/* floating cards */}
      <FloatCard
        icon={CheckCircle2}
        iconClass="bg-green-500 text-white"
        className="left-0 top-[14%] sm:top-[16%] -rotate-6"
      >
        Build
        <br />
        Projects
      </FloatCard>
      <FloatCard
        icon={TrendingUp}
        iconClass="bg-blue-100 text-blue-600"
        className="right-0 top-[14%] sm:top-[18%] -rotate-6"
      >
        Learn
        <br />
        <span className="font-medium">In-Demand Skills</span>
      </FloatCard>
      <FloatCard
        icon={Award}
        iconClass="bg-purple-100 text-purple-600"
        className="right-[2%] top-[46%] sm:top-[44%] -rotate-6"
      >
        Get
        <br />
        Certified
      </FloatCard>
    </div>
  );
}

function About() {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    fetchContent(["about.mission", "about.vision", "about.values", "about.whatWeOffer"])
      .then((data) => setContent((prev) => ({ ...prev, ...data })))
      .catch(() => {
        // Keep defaults.
      });
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Seo title="About Us" description="CodeVantage's mission, vision, values, and what we offer." path="/about" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/60 py-10 sm:py-14 lg:py-16">
        <Container size="2xl" padY={false}>
          <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr,1fr] lg:gap-12">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs sm:px-3.5 sm:text-sm font-semibold text-brand">
                <Gem className="h-4 w-4" aria-hidden="true" /> About Us
              </span>
              <h1 className="mt-4 sm:mt-5 text-3xl xs:text-4xl font-extrabold tracking-tight text-navy sm:text-5xl break-words">
                About <span className="text-brand">CodeVantage</span>
              </h1>
              <p className="mt-3 sm:mt-4 text-base text-muted sm:text-lg lg:text-xl">
                A project-based virtual internship platform focused on real, verifiable skill-building.
              </p>
              <p className="mt-4 sm:mt-5 text-sm leading-relaxed text-muted sm:text-base">
                At CodeVantage, we believe learning is most powerful when it&apos;s practical. Our mission is to help
                students and aspiring developers gain real-world experience through structured, project-based
                internships, genuine mentor feedback, and verifiable certificates.
              </p>
              <div className="mt-6 sm:mt-7 flex flex-col xs:flex-row flex-wrap gap-3">
                <Button to="/internships" className="w-full xs:w-auto justify-center">
                  Our Internships <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/how-it-works" variant="outline" className="w-full xs:w-auto justify-center">
                  <PlayCircle className="h-4 w-4" /> How It Works
                </Button>
              </div>
            </div>
            <HeroArt />
          </div>
        </Container>
      </section>

      <Container size="2xl" padY={false} className="space-y-4 sm:space-y-5 py-8 sm:py-10 lg:py-12">
        {/* Mission + Vision */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <div className="flex flex-col xs:flex-row gap-4 sm:gap-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
            <span className="inline-flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand">
              <Target className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-navy">Our Mission</h2>
              <div className="mb-3 mt-2 h-0.5 w-10 bg-brand" />
              <RichText html={content["about.mission"].text} className="text-sm" />
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-4 sm:gap-5 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 sm:p-6">
            <span className="inline-flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-navy">Our Vision</h2>
              <div className="mb-3 mt-2 h-0.5 w-10 bg-purple-600" />
              <RichText html={content["about.vision"].text} className="text-sm" />
            </div>
          </div>
        </div>

        {/* Values */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Heart className="mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-navy">Our Values</h2>
              <p className="text-sm text-muted">These values guide everything we do at CodeVantage.</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-0">
            {content["about.values"].items.map((item, i) => {
              const { title, text } = splitValue(item);
              const s = VALUE_STYLES[i % VALUE_STYLES.length];
              return (
                <div
                  key={item}
                  className={`flex gap-3 sm:gap-4 lg:px-6 ${i > 0 ? "lg:border-l lg:border-slate-200" : "lg:pl-3"}`}
                >
                  <span
                    className={`inline-flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}
                  >
                    <s.icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy">{title}</p>
                    {text && <p className="mt-1 text-sm text-muted break-words">{text}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* What we offer */}
        <div className="pt-3">
          <div className="flex items-start gap-3">
            <Layers className="mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-navy">What We Offer</h2>
              <RichText html={content["about.whatWeOffer"].text} className="text-sm" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {OFFER_CARDS.map((c) => (
              <div key={c.title} className={`flex gap-3 rounded-xl border p-4 ${c.box}`}>
                <span
                  className={`inline-flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}
                >
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default About;
