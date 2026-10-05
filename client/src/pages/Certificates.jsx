import { Fragment, useEffect, useState } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  ShieldCheck,
  Briefcase,
  FileCheck2,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";
import { verifyCertificate, fetchPublicCertificateTemplateContent } from "../services/certificateService";
import { useBranding, defaultLogo } from "../context/BrandingContext";

/**
 * Small brand-style icon per tech badge — mirrors the shapes drawn in
 * server/utils/pdfGenerator.js (the real certificate PDF) so the public
 * sample preview matches what students actually receive. Matching is by
 * substring so an admin-renamed label (e.g. "ReactJS") still resolves; any
 * unmatched label falls back to a plain dot, same as the PDF version.
 *
 * Sizes use container-query units (cqw) so the icon scales together with the
 * certificate preview (the preview is a size container).
 */
function TechIcon({ label, color }) {
  const l = label.toLowerCase();
  const cls = "h-[3cqw] w-[3cqw] flex-shrink-0";

  if (l.includes("react")) {
    return (
      <svg viewBox="-12 -12 24 24" className={cls}>
        <circle r="2.2" fill={color} />
        <g fill="none" stroke={color} strokeWidth="1.1">
          <ellipse rx="10" ry="4" />
          <ellipse rx="10" ry="4" transform="rotate(60)" />
          <ellipse rx="10" ry="4" transform="rotate(120)" />
        </g>
      </svg>
    );
  }
  if (l.includes("node")) {
    return (
      <svg viewBox="0 0 20 20" className={cls}>
        <polygon
          points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5"
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="1.8"
        />
        <text x="10" y="13" textAnchor="middle" fontSize="7" fontWeight="bold" fill={color}>
          JS
        </text>
      </svg>
    );
  }
  if (l.includes("mongo")) {
    return (
      <svg viewBox="0 0 20 20" className={cls}>
        <path d="M10 1 C14 5 14 9 10 19 C6 9 6 5 10 1 Z" fill={color} />
        <line x1="10" y1="3" x2="10" y2="17" stroke="#FFFFFF" strokeWidth="0.6" />
      </svg>
    );
  }
  if (l.includes("express")) {
    return (
      <svg viewBox="0 0 20 20" className={cls}>
        <circle cx="10" cy="10" r="9" fill={color} />
        <text x="10" y="13" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">
          ex
        </text>
      </svg>
    );
  }
  if (l.includes("tailwind")) {
    return (
      <svg viewBox="0 0 20 20" className={cls}>
        <path
          d="M4 11c1.2-3.6 3.6-4.8 6-4.8 3.2 0 4.4 2.4 6.6 2.76-1.2 3.6-3.6 4.8-6 4.8-3.2 0-4.4-2.4-6.6-2.76Z"
          fill={color}
        />
        <path
          d="M1 15.6c1.2-3.6 3.6-4.8 6-4.8 3.2 0 4.4 2.4 6.6 2.76-1.2 3.6-3.6 4.8-6 4.8-3.2 0-4.4-2.4-6.6-2.76Z"
          fill={color}
          opacity="0.65"
        />
      </svg>
    );
  }
  if (l.includes("git")) {
    return (
      <svg viewBox="0 0 20 20" className={cls}>
        <rect x="4" y="4" width="12" height="12" rx="1.5" fill={color} transform="rotate(45 10 10)" />
        <circle cx="10" cy="7" r="1.3" fill="#FFFFFF" />
        <circle cx="10" cy="13.2" r="1.3" fill="#FFFFFF" />
        <line x1="10" y1="7" x2="10" y2="13.2" stroke="#FFFFFF" strokeWidth="1" />
      </svg>
    );
  }
  return <span className="h-[1.2cqw] w-[1.2cqw] rounded-full flex-shrink-0" style={{ background: color }} />;
}

/** Points for a finely-scalloped circle (the seal's medal-edge look). */
function scallopedCirclePoints(cx, cy, rOuter, rInner, spikes) {
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Points for a 5-point star, used for the small stars inside the seal. */
function starPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Laurel branch (row of small leaves along an arc) for one side of the seal. */
function Laurel({ cx, cy, r, from, to, count, fill }) {
  return Array.from({ length: count }, (_, i) => {
    const t = from + ((to - from) * i) / (count - 1);
    const rad = (t * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return (
      <ellipse
        key={i}
        rx="1.5"
        ry="3.6"
        fill={fill}
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${t})`}
      />
    );
  });
}

/** Decorative QR-style placeholder for the static sample (not a scannable code). */
function QrPlaceholder({ className }) {
  const n = 21;
  const navy = "#0F172A";
  const inFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (inFinder(r, c)) continue;
      if ((r * 7 + c * 13 + r * c) % 5 < 2) {
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={navy} />);
      }
    }
  }
  const finder = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill={navy} />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#FFFFFF" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill={navy} />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className={className} shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#FFFFFF" />
      {cells}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

/** Blue + gold diagonal corner ribbon. Rotate 180° for the bottom-right corner. */
function CornerRibbon({ className = "" }) {
  return (
    <div className={`absolute w-[17%] aspect-square pointer-events-none ${className}`}>
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)", background: "#C9962B" }}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 97% 0, 0 97%)", background: "#FFFFFF" }}
      />
      <div
        className="absolute inset-0"
        style={{
          clipPath: "polygon(0 0, 77% 0, 0 77%)",
          background: "linear-gradient(135deg,#0A2259 0%,#1740A8 60%,#2563EB 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 80%, 80% 0, 85% 0, 0 85%)", background: "#C9962B" }}
      />
    </div>
  );
}

// Shown until the real content loads from the API, and as a safe fallback if
// that request ever fails — mirrors DEFAULT_TEMPLATE_CONTENT in
// server/utils/pdfGenerator.js so the sample never looks broken or empty.
const FALLBACK_CONTENT = {
  heading: "CERTIFICATE OF COMPLETION",
  certifyLabel: "THIS IS TO CERTIFY THAT",
  completionDescription:
    "During this internship, the candidate has worked on real-world projects, demonstrated practical skills, and shown commitment to learning and professional growth.",
  taglineScript: "Turning Ideas into Impact",
  learnBuildGrowText: "LEARN | BUILD | GROW",
  skillsTodayLine1: "SKILLS TODAY",
  skillsTodayLine2: "A BETTER TOMORROW",
  signatureScriptText: "Amit",
  signatureFullName: "Amit Maurya",
  signatureTitle: "Founder, CodeVantage",
  sealBadgeText: "CodeVantage",
  sealSubText1: "LEARN TODAY",
  sealSubText2: "BUILD TOMORROW",
  footerTagline: "REAL PROJECTS  |  REAL SKILLS  |  BRIGHTER TOMORROW",
  techStack: [
    { label: "React", color: "#149ECA" },
    { label: "Node.js", color: "#3C873A" },
    { label: "MongoDB", color: "#13AA52" },
    { label: "Express.js", color: "#5B6472" },
    { label: "Tailwind CSS", color: "#38BDF8" },
    { label: "Git & GitHub", color: "#E24329" },
  ],
};

const features = [
  {
    icon: FileCheck2,
    title: "Industry Recognized",
    description: "Valid for career growth and skill validation.",
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Unique Certificate ID",
    description: "Easily verifiable online, anytime.",
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    icon: Award,
    title: "Showcase Your Skills",
    description: "Add to your resume & LinkedIn profile.",
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    icon: Briefcase,
    title: "Boost Your Career",
    description: "Stand out with real project experience.",
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
];

function Certificates() {
  const branding = useBranding();
  const [templateContent, setTemplateContent] = useState(FALLBACK_CONTENT);
  const [certificateId, setCertificateId] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | found | not_found | error
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchPublicCertificateTemplateContent()
      .then(setTemplateContent)
      .catch(() => {}); // keep FALLBACK_CONTENT — never break the page over this
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setStatus("loading");
    try {
      const data = await verifyCertificate(certificateId.trim());
      if (data?.success && data?.certificate) {
        setResult(data.certificate);
        setStatus("found");
      } else {
        setResult(null);
        setStatus("not_found");
      }
    } catch {
      // Any network issue is shown honestly rather than faking a result.
      setStatus("error");
    }
  }

  return (
    <div>
      <Seo
        title="Certificates"
        description="Learn how CodeVantage's QR-verifiable Certificate of Internship Completion works, and verify any certificate."
        path="/certificates"
      />

      {/* Hero */}
      <section className="bg-surface py-12 sm:py-16 text-center">
        <Container size="md" padY={false}>
          <Badge className="mb-4">Certificate</Badge>
          <h1 className="text-display text-navy">
            Get a Recognized <span className="text-brand">Certificate</span>
          </h1>
          <p className="mt-4 text-muted text-base sm:text-lg">
            Complete your internship, submit your projects, and get a verified certificate that
            adds value to your resume and LinkedIn profile.
          </p>
        </Container>
      </section>

      {/* Sample certificate mockup + Verify widget */}
      <section className="py-10 sm:py-14">
        <Container size="2xl" padY={false}>
          <div className="grid lg:grid-cols-[1.3fr,1fr] gap-6 lg:gap-8 items-stretch">
          {/* Sample certificate mockup — visual reference matching the real template; not a real issued certificate */}
          <div
            id="sample-certificate"
            className="rounded-2xl border border-slate-200 bg-surface p-4 sm:p-6 scroll-mt-24"
          >
            {/* The certificate is a size container: every font/size inside uses cqw units,
                so the whole layout scales perfectly with its width (same look at any screen size). */}
            <div
              className="relative w-full overflow-hidden rounded-sm shadow-sm"
              style={{
                aspectRatio: "3 / 2",
                containerType: "inline-size",
                background: "linear-gradient(180deg,#FFFFFF 0%,#F4F8FF 100%)",
                border: "1px solid #E2E8F0",
              }}
            >
              {/* frame: thin navy line + fine gold line */}
              <div className="absolute inset-[1%] border border-navy pointer-events-none" />
              <div
                className="absolute inset-[2.2%] pointer-events-none"
                style={{ border: "1px solid #E4B95B" }}
              />

              {/* corner ribbons */}
              <CornerRibbon className="top-0 left-0" />
              <CornerRibbon className="bottom-0 right-0 rotate-180" />

              {/* header — real logo (admin-configurable via Settings, same as the rest of the site) */}
              <img
                src={branding.logoUrl || defaultLogo}
                alt={templateContent.sealBadgeText}
                className="absolute top-[5.5%] left-[11.5%] w-[30%] h-auto object-contain object-left"
              />
              <p
                className="absolute top-[13.6%] left-[19%] text-navy font-medium whitespace-nowrap"
                style={{ fontSize: "1.2cqw", letterSpacing: "0.32em" }}
              >
                {templateContent.learnBuildGrowText}
              </p>

              {/* top-right slogan with gold underline */}
              <div className="absolute top-[5.8%] right-[5.5%] w-[14%] text-center">
                <p
                  className="font-medium text-brand leading-snug"
                  style={{ fontSize: "1.1cqw", letterSpacing: "0.22em" }}
                >
                  {templateContent.skillsTodayLine1}
                  <br />
                  {templateContent.skillsTodayLine2}
                </p>
                <div className="mx-auto mt-[4%] h-px w-[85%]" style={{ background: "#C9962B" }} />
              </div>

              {/* title — nowrap + ellipsis so a long heading truncates instead of wrapping
                  and overlapping the rows underneath */}
              <h2
                className="absolute top-[17.2%] left-0 right-0 text-center font-serif font-bold text-navy px-[8%] whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontSize: "4cqw", lineHeight: 1.15 }}
              >
                {templateContent.heading}
              </h2>

              {/* "THIS IS TO CERTIFY THAT" with gold rules either side */}
              <div className="absolute top-[27.4%] left-[26.5%] right-[26.5%] flex items-center gap-[2.4%]">
                <span className="h-px flex-1" style={{ background: "#C9962B" }} />
                <p
                  className="text-navy whitespace-nowrap"
                  style={{ fontSize: "1.45cqw", letterSpacing: "0.3em" }}
                >
                  {templateContent.certifyLabel}
                </p>
                <span className="h-px flex-1" style={{ background: "#C9962B" }} />
              </div>

              {/* student name + gold underline */}
              <p
                className="absolute top-[30.6%] left-0 right-0 text-center font-serif font-bold text-navy"
                style={{ fontSize: "4.8cqw", lineHeight: 1.2 }}
              >
                Amit Kumar
              </p>
              <div
                className="absolute top-[39.8%] left-[30%] right-[30%]"
                style={{ height: "0.14cqw", background: "#C9962B" }}
              />

              <p
                className="absolute top-[42.2%] left-0 right-0 text-center text-navy"
                style={{ fontSize: "1.85cqw" }}
              >
                has successfully completed the
              </p>
              <p
                className="absolute top-[45.6%] left-0 right-0 text-center font-bold text-brand px-[12%] whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontSize: "2.75cqw", lineHeight: 1.2 }}
              >
                Web Development Internship Program
              </p>
              <p
                className="absolute top-[50.8%] left-0 right-0 text-center font-bold text-navy"
                style={{ fontSize: "2.2cqw" }}
              >
                at CodeVantage
              </p>

              <p
                className="absolute top-[56%] left-[27.5%] right-[27.5%] text-center text-navy"
                style={{ fontSize: "1.45cqw", lineHeight: 1.5 }}
              >
                {templateContent.completionDescription}
              </p>

              {/* script tagline + blue swoosh */}
              {/* tagline text and its blue swoosh live in ONE rotated block so they always stay together */}
              <div
                className="absolute top-[27%] left-[4.5%] w-[15%] -rotate-12 origin-top-left text-navy"
                style={{ fontFamily: "CertSignature" }}
              >
                <p style={{ fontSize: "3.6cqw", lineHeight: 1.02 }}>{templateContent.taglineScript}</p>
                <svg
                  className="block ml-[22%] w-[82%]"
                  style={{ marginTop: "0.4cqw" }}
                  viewBox="0 0 170 30"
                  fill="none"
                >
                  <path
                    d="M2 26 C40 18 100 8 166 2"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* faint mountains */}
              <svg
                className="absolute top-[49%] left-[1.5%] w-[27%] opacity-60 pointer-events-none"
                viewBox="0 0 400 180"
              >
                <polygon points="0,180 110,30 250,180" fill="#C9D8EC" />
                <polygon points="110,30 82,72 104,64 126,78" fill="#FFFFFF" opacity="0.85" />
                <polygon points="130,180 255,62 400,180" fill="#DCE7F5" />
                <polygon points="255,62 232,96 252,90 272,100" fill="#FFFFFF" opacity="0.85" />
              </svg>

              {/* LEARN / BUILD / GROW stack + gold underline */}
              <p
                className="absolute top-[62.4%] left-[4.9%] font-medium text-navy"
                style={{ fontSize: "1.15cqw", lineHeight: 1.55, letterSpacing: "0.35em" }}
              >
                {templateContent.learnBuildGrowText.split("|").map((word, i) => (
                  <span key={i}>
                    {word.trim()}
                    <br />
                  </span>
                ))}
              </p>
              <div
                className="absolute top-[70.6%] left-[4.9%] w-[4.8%]"
                style={{ height: "0.12cqw", background: "#C9962B" }}
              />

              {/* faint leaf watermark (right) */}
              <svg
                className="absolute top-[56%] right-[1.6%] w-[5.5%] opacity-40 pointer-events-none"
                viewBox="0 0 80 120"
                fill="#DCE7F5"
              >
                <ellipse cx="42" cy="30" rx="16" ry="28" transform="rotate(20 42 30)" />
                <ellipse cx="22" cy="72" rx="13" ry="24" transform="rotate(-25 22 72)" />
                <ellipse cx="54" cy="84" rx="12" ry="22" transform="rotate(25 54 84)" />
              </svg>

              {/* signature */}
              <div className="absolute top-[65.5%] left-0 right-0 text-center">
                <p className="text-navy" style={{ fontFamily: "CertSignature", fontSize: "4.6cqw", lineHeight: 1.1 }}>
                  {templateContent.signatureScriptText}
                </p>
                <div
                  className="mx-auto w-[18%] bg-navy"
                  style={{ height: "0.1cqw", marginTop: "-0.4cqw" }}
                />
                <p className="text-navy font-bold" style={{ fontSize: "1.55cqw", marginTop: "0.5cqw" }}>
                  {templateContent.signatureFullName}
                </p>
                <p className="text-navy" style={{ fontSize: "1.2cqw" }}>
                  {templateContent.signatureTitle}
                </p>
              </div>

              {/* Issue Date — illustrative sample value (static mockup, not a real certificate) */}
              <div className="absolute top-[74.4%] left-[9%] flex items-center" style={{ gap: "0.9cqw" }}>
                <svg
                  viewBox="0 0 20 20"
                  className="flex-shrink-0"
                  style={{ width: "3cqw", height: "3cqw" }}
                  fill="none"
                  stroke="#0F2A66"
                  strokeWidth="1.6"
                >
                  <rect x="2" y="4" width="16" height="14" rx="1.8" fill="#0F2A66" stroke="none" />
                  <rect x="2" y="7.5" width="16" height="10.5" rx="1.2" fill="#FFFFFF" stroke="none" />
                  <line x1="6" y1="2" x2="6" y2="5.5" />
                  <line x1="14" y1="2" x2="14" y2="5.5" />
                  <g fill="#0F2A66" stroke="none">
                    <rect x="4.5" y="9.5" width="2" height="1.8" />
                    <rect x="8" y="9.5" width="2" height="1.8" />
                    <rect x="11.5" y="9.5" width="2" height="1.8" />
                    <rect x="4.5" y="13" width="2" height="1.8" />
                    <rect x="8" y="13" width="2" height="1.8" />
                    <rect x="11.5" y="13" width="2" height="1.8" />
                  </g>
                </svg>
                <div>
                  <p className="text-navy leading-tight" style={{ fontSize: "1.3cqw" }}>
                    Issue Date
                  </p>
                  <p className="font-bold text-navy leading-tight" style={{ fontSize: "1.6cqw" }}>
                    March 15, 2025
                  </p>
                </div>
              </div>

              {/* Verify block: QR card + details */}
              <div
                className="absolute top-[66.2%] left-[71.8%] right-[6.2%] flex items-stretch"
                style={{ height: "13.8%" }}
              >
                <div
                  className="flex items-center justify-center bg-white flex-shrink-0 rounded-md"
                  style={{
                    padding: "0.5cqw",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.12)",
                    width: "9.2cqw",
                  }}
                >
                  <QrPlaceholder className="w-full h-full" />
                </div>
                <div
                  className="flex-1 flex flex-col justify-center"
                  style={{ paddingLeft: "1.1cqw", background: "linear-gradient(90deg,#FFFFFF,#F1F5FB)" }}
                >
                  <p className="font-bold text-navy leading-tight" style={{ fontSize: "1.3cqw" }}>
                    Verify Certificate
                  </p>
                  <p className="text-navy leading-snug" style={{ fontSize: "1.05cqw" }}>
                    Scan the QR code or visit
                  </p>
                  <p className="font-bold text-navy leading-snug" style={{ fontSize: "1.1cqw" }}>
                    codevantage.in/verify
                  </p>
                  <div className="h-px bg-slate-200" style={{ margin: "0.5cqw 0" }} />
                  <p className="text-navy leading-snug" style={{ fontSize: "1.1cqw" }}>
                    Certificate ID
                  </p>
                  <p className="font-bold text-navy leading-snug" style={{ fontSize: "1.35cqw" }}>
                    CV202509001
                  </p>
                </div>
              </div>

              {/* seal badge — gold scalloped edge, navy medal, laurel wreath, stars, ribbon tails */}
              <div className="absolute top-[22.5%] right-[3.2%] w-[16%]">
                <svg viewBox="0 0 120 170">
                  <defs>
                    <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F3D58A" />
                      <stop offset="50%" stopColor="#C9962B" />
                      <stop offset="100%" stopColor="#8F6A1B" />
                    </linearGradient>
                  </defs>
                  {/* ribbon tails */}
                  <polygon
                    points="44,92 64,98 54,140 43,129 32,150"
                    fill="#0F2A66"
                    stroke="#C9962B"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points="76,92 56,98 66,140 77,129 88,150"
                    fill="#0A1F4D"
                    stroke="#C9962B"
                    strokeWidth="1.2"
                  />
                  {/* medal */}
                  <polygon points={scallopedCirclePoints(60, 55, 54, 47, 18)} fill="url(#sealGold)" />
                  <circle cx="60" cy="55" r="43" fill="none" stroke="#F3D58A" strokeWidth="1" />
                  <circle cx="60" cy="55" r="40" fill="#0F172A" stroke="#E4B95B" strokeWidth="2" />
                  {/* laurel wreath */}
                  <Laurel cx={60} cy={55} r={34} from={105} to={255} count={8} fill="#E4B95B" />
                  <Laurel cx={60} cy={55} r={34} from={75} to={-75} count={8} fill="#E4B95B" />
                  {/* diamond mark */}
                  <polygon points="60,20 70,30 60,40 50,30" fill="#2563EB" />
                  <polygon points="60,25 65,30 60,35 55,30" fill="#FFFFFF" opacity="0.9" />
                  <text x="60" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                    {templateContent.sealBadgeText}
                  </text>
                  <text x="60" y="63" textAnchor="middle" fill="#E4B95B" fontSize="5">
                    {templateContent.sealSubText1}
                  </text>
                  <text x="60" y="70.5" textAnchor="middle" fill="#E4B95B" fontSize="5">
                    {templateContent.sealSubText2}
                  </text>
                  <polygon points={starPoints(51, 79, 2.4)} fill="#E4B95B" />
                  <polygon points={starPoints(60, 79, 2.4)} fill="#E4B95B" />
                  <polygon points={starPoints(69, 79, 2.4)} fill="#E4B95B" />
                </svg>
              </div>

              {/* tech badges — single white strip with dividers */}
              <div
                className="absolute top-[83%] left-[8.5%] right-[8.7%] flex items-center justify-around bg-white rounded-lg"
                style={{
                  height: "7.8%",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                }}
              >
                {templateContent.techStack.map((t, i) => (
                  <Fragment key={t.label}>
                    {i > 0 && <span className="w-px bg-slate-200" style={{ height: "55%" }} />}
                    <span
                      className="inline-flex items-center font-medium text-navy whitespace-nowrap"
                      style={{ fontSize: "1.1cqw", gap: "0.8cqw" }}
                    >
                      <TechIcon label={t.label} color={t.color} />
                      {t.label}
                    </span>
                  </Fragment>
                ))}
              </div>

              {/* footer tagline with gold rules */}
              <div className="absolute top-[92.3%] left-[16%] right-[16%] flex items-center gap-[2%]">
                <span className="h-px flex-1" style={{ background: "#C9962B" }} />
                <p
                  className="text-navy font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontSize: "1.05cqw", letterSpacing: "0.22em" }}
                >
                  {templateContent.footerTagline}
                </p>
                <span className="h-px flex-1" style={{ background: "#C9962B" }} />
              </div>
            </div>
            <p className="text-center text-xs text-muted mt-3">
              Sample preview — your certificate will carry your name, program, and a scannable QR code for
              verification.
            </p>
          </div>

          {/* Verify widget */}
          <Card className="p-6 sm:p-8 flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl font-bold text-navy">Verify Your Certificate</h2>
            <p className="text-sm text-muted mt-2">
              Enter the certificate ID below to verify the authenticity of any CodeVantage
              certificate.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <label htmlFor="certificateId" className="sr-only">
                Certificate ID
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. CV202509001)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                />
              </div>
              <Button type="submit" disabled={status === "loading"} className="w-full justify-center">
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify Certificate <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-muted font-medium">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <a href="#sample-certificate">
              <Button variant="outline" className="w-full justify-center">
                View Sample Certificate <ArrowRight className="h-4 w-4" />
              </Button>
            </a>

            {/* Inline result states */}
            {status === "found" && result && (
              <div className="mt-5 rounded-lg border border-l-4 border-l-success border-slate-200 p-4">
                <p className="flex items-center gap-2 text-success font-semibold text-sm mb-3">
                  <CheckCircle2 className="h-4 w-4" /> Certificate Verified
                </p>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <dt className="text-muted">Student Name</dt>
                  <dd className="text-navy font-medium">{result.studentNameSnapshot}</dd>
                  <dt className="text-muted">Program</dt>
                  <dd className="text-navy font-medium">{result.programNameSnapshot}</dd>
                  <dt className="text-muted">Certificate ID</dt>
                  <dd className="text-navy font-medium">{result.certificateId}</dd>
                </dl>
              </div>
            )}
            {status === "not_found" && (
              <div className="mt-5 rounded-lg border border-l-4 border-l-danger border-slate-200 p-4">
                <p className="flex items-center gap-2 text-danger font-semibold text-sm">
                  <XCircle className="h-4 w-4" /> Certificate Not Found
                </p>
                <p className="text-xs text-muted mt-1">Double-check the certificate ID and try again.</p>
              </div>
            )}
            {status === "error" && (
              <div className="mt-5 rounded-lg border border-l-4 border-l-slate-300 border-slate-200 p-4">
                <p className="text-navy font-semibold text-sm">Verification temporarily unavailable</p>
                <p className="text-xs text-muted mt-1">Please try again shortly.</p>
              </div>
            )}
          </Card>
          </div>
        </Container>
      </section>

      {/* 4-icon feature row */}
      <section className="border-t border-slate-100 py-10 sm:py-14">
        <Container size="2xl" padY={false} className="grid xs:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 text-center">
          {features.map((f) => (
            <div key={f.title}>
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${f.bg} ${f.color} mb-3`}
              >
                <f.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="font-semibold text-navy">{f.title}</p>
              <p className="text-sm text-muted mt-1">{f.description}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Fee details + policy */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-navy text-lg mb-2">The ₹149 Certificate Fee Covers</h2>
          <ul className="text-muted text-sm space-y-2 list-disc list-inside">
            <li>Generation of your PDF certificate</li>
            <li>A unique, permanent certificate ID</li>
            <li>A QR code linked to public verification</li>
            <li>Certificate hosting for verification purposes</li>
          </ul>
          <p className="text-sm text-muted mt-4">
            This fee is only requested after you become certificate-eligible — never before, and
            never as a condition to access tasks or reviews. See our{" "}
            <a href="/refund-policy" className="text-brand underline">
              Refund Policy
            </a>{" "}
            for details.
          </p>
        </Card>
        <div className="mt-6 text-center">
          <Button to="/certificate-policy" variant="outline" className="w-full xs:w-auto justify-center">
            Read Certificate Policy
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Certificates;
