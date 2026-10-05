import {
  UserPlus,ListChecks,
  ClipboardList,Code,
  UploadCloud,
  Search,BadgeCheck,
  Award,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Link2,
  Star,
  Info,
  FileText,
  Eye,
} from "lucide-react";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";

const steps = [
  { icon: UserPlus, title: "Register", description: "Create your free CodeVantage account in just a few seconds.", tint: "bg-orange-50" },
  { icon: ListChecks, title: "Choose Program", description: "Select the internship program that fits your interests and goals.", tint: "bg-blue-50" },
  { icon: ClipboardList, title: "Receive Tasks", description: "Get 3 project tasks with clear instructions and requirements.", tint: "bg-amber-50" },
  { icon: Code, title: "Build Projects", description: "Complete and develop your projects at your own pace using real-world technologies.", tint: "bg-blue-50" },
  { icon: UploadCloud, title: "Submit Projects", description: "Share your GitHub repository, live demo link, and LinkedIn URL for each task.", tint: "bg-sky-50" },
  { icon: Search, title: "CodeVantage Review", description: "Our team reviews each submission and provides detailed feedback to help you improve.", tint: "bg-purple-50" },
  { icon: BadgeCheck, title: "Get Approved", description: "Once all 3 tasks are approved, you become certificate-eligible.", tint: "bg-green-50" },
  { icon: Award, title: "Pay ₹149 & Get Certificate", description: "Pay the certificate fee and download your verified certificate of internship completion.", tint: "bg-blue-50" },
];

/** Small illustrative mock-up shown at the top of each step card (purely decorative). */
function StepArt({ index, Icon }) {
  const bar = "h-1.5 rounded-full bg-slate-200";

  switch (index) {
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
                <span
                  className={`h-2.5 w-2.5 rounded-sm ${["bg-blue-500", "bg-purple-500", "bg-rose-500"][i]}`}
                />
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

/** Little floating label chip used in the hero's top-right decoration. */
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

function HowItWorks() {
  return (
    <div className="relative overflow-x-hidden overflow-hidden bg-gradient-to-b from-blue-70/90 via-white to-white">
      <Seo
        title="How It Works"
        description="The 8-step CodeVantage process, from registration to a QR-verified certificate."
        path="/how-it-works"
      />


      <Container size="2xl">
        {/* Hero */}
        <div className="mx-auto max-w-6xl pt-4 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs sm:text-sm font-semibold text-brand">
            Simple Process
          </span>
          <h1 className="mt-4 sm:mt-5 text-3xl xs:text-4xl font-extrabold tracking-tight text-navy sm:text-5xl break-words">
            How <span className="text-brand">CodeVantage</span> Works
          </h1>
          <p className="mt-3 sm:mt-4 text-sm text-muted sm:text-base lg:text-lg">
            From registration to a verified certificate — follow these simple steps and build real-world
            skills with hands-on projects.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-9 sm:mt-12 grid grid-cols-2 gap-x-5 gap-y-3 sm:gap-y-9 sm:grid-cols-5 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className={`relative h-32 overflow-hidden rounded-xl ${step.tint}`}>
                  <span className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-white">
                    {i + 1}
                  </span>
                  <StepArt index={i} Icon={step.icon} />
                </div>
                <p className="mt-3 text-base sm:text-lg font-bold text-navy">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
              {i % 4 !== 3 && (
                <span
                  className="absolute -right-[1.4rem] top-[30%] z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-brand ring-4 ring-white lg:inline-flex"
                  aria-hidden="true"
                >
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Important note */}
        <div className="mx-auto mt-8 sm:mt-10 flex max-w-4xl flex-col xs:flex-row gap-3 sm:gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
          <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <Info className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="mb-1 font-bold text-brand">Important: Certificate Eligibility</p>
            <p className="text-sm leading-relaxed text-muted">
              The certificate is <strong className="text-navy">not issued automatically</strong> after
              payment. You must first successfully complete and pass the review for all 3 assigned
              projects. Only then does the ₹149 certificate fee become available to pay, and the
              certificate gets generated after payment is verified.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 pb-4 text-center">
          <Button to="/register" size="lg" className="w-full xs:w-auto justify-center">
            Start Your Internship <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-xs text-muted">Build your skills with real projects.</p>
        </div>
      </Container>
    </div>
  );
}

export default HowItWorks;
