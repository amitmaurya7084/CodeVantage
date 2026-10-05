import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Mail,User,Send,Headphones,
  GraduationCap,FileText,
  MessageCircle,
  Copy,
  Clock,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Code,
  IndianRupee,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";
import { sendContactMessage } from "../services/contactService";
import { fetchContent } from "../services/contentService";
// import heroimage from "../images/hero-student.png";

const DEFAULT_CONTACT_INFO = { supportEmail: "support@codevantage.in" };

// IMAGE SLOT: set this to your illustration (e.g. "/images/contact-hero.png").
// While it is null, a placeholder box is shown in its place.
const CONTACT_HERO_IMAGE = "/images/hero-student.png";

const SUBJECTS = ["Quick Support", "Program Guidance", "Certificate Queries", "General Inquiries"];

const HELP_TOPICS = [
  {
    icon: Headphones,
    title: "Quick Support",
    text: "Get help with tasks, submissions, or technical issues.",
    iconBox: "bg-blue-100 text-blue-600",
  },
  {
    icon: GraduationCap,
    title: "Program Guidance",
    text: "Not sure which internship to choose? We can help.",
    iconBox: "bg-purple-100 text-purple-600",
  },
  {
    icon: FileText,
    title: "Certificate Queries",
    text: "Have questions about eligibility or certificate download?",
    iconBox: "bg-green-100 text-green-600",
  },
  {
    icon: MessageCircle,
    title: "General Inquiries",
    text: "Partnerships, feedback, or other questions.",
    iconBox: "bg-orange-100 text-orange-500",
  },
];

const FAQS = [
  {
    icon: FileText,
    q: "How to start an internship?",
    a: "Learn how to register and choose the right program.",
    iconBox: "bg-blue-100 text-blue-600",
  },
  {
    icon: Code,
    q: "How many projects are required for certificate?",
    a: "You need to complete and get approved for all assigned projects.",
    iconBox: "bg-blue-100 text-blue-600",
  },
  {
    icon: IndianRupee,
    q: "What is the certification fee?",
    a: "The certificate fee is ₹149 after successful completion.",
    iconBox: "bg-green-100 text-green-600",
  },
  {
    icon: Clock,
    q: "How long does review take?",
    a: "Our team usually reviews submissions within 3–7 days.",
    iconBox: "bg-purple-100 text-purple-600",
  },
];

const inputIconCls = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted";
const required = <span className="text-red-500"> *</span>;

function Contact() {
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_INFO);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const messageLength = (watch("message") || "").length;

  useEffect(() => {
    fetchContent(["contact.info"])
      .then((data) => {
        if (data["contact.info"]) setContactInfo(data["contact.info"]);
      })
      .catch(() => {
        // Keep default.
      });
  }, []);

  async function onSubmit(values) {
    try {
      await sendContactMessage(values);
      toast.success("Message sent — we'll get back to you soon.");
      reset();
    } catch (err) {
      const message = err?.response?.data?.message || "Couldn't send your message. Please try again.";
      toast.error(message);
    }
  }

  function copyEmail() {
    navigator.clipboard
      ?.writeText(contactInfo.supportEmail)
      .then(() => toast.success("Email copied"))
      .catch(() => {});
  }

  return (
    <div className="bg-gradient-to-b from-blue-90/100 via-white to-white">
      <Seo title="Contact Us" description="Get in touch with the CodeVantage support team." path="/contact" />

      <Container size="2xl" padY={false} className="py-5 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr,1.05fr,0.85fr]">
          {/* LEFT: intro + topics */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1.5 text-sm font-semibold text-brand">
              <Mail className="h-4 w-4" aria-hidden="true" /> Get in Touch
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
              Contact <span className="text-brand">Us</span>
            </h1>
            <p className="mt-3 text-lg text-muted">
              Questions about a program, submission, or your certificate? We&apos;re here to help you.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Our team typically responds within 24 hours. Feel free to reach out using the form or any of the
              contact options below.
            </p>

            <div className="mt-6 space-y-3">
              {HELP_TOPICS.map((t) => (
                <div
                  key={t.title}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <span
                    className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}
                  >
                    <t.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold text-navy">{t.title}</p>
                    <p className="text-sm text-muted">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE: form */}
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-4">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-navy">Send Us a Message</h2>
                <p className="text-sm text-muted">Fill out the form below and we&apos;ll get back to you soon.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Field label={<>Name{required}</>} htmlFor="name" error={errors.name}>
                <div className="relative">
                  <User className={inputIconCls} aria-hidden="true" />
                  <input
                    id="name"
                    className="input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Enter your full name"
                    {...register("name", { required: "Name is required" })}
                    aria-invalid={!!errors.name}
                  />
                </div>
              </Field>

              <Field label={<>Email{required}</>} htmlFor="email" error={errors.email}>
                <div className="relative">
                  <Mail className={inputIconCls} aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    className="input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Enter your email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                    aria-invalid={!!errors.email}
                  />
                </div>
              </Field>

              <Field label={<>Subject{required}</>} htmlFor="subject" error={errors.subject}>
                <div className="relative">
                  <Mail className={inputIconCls} aria-hidden="true" />
                  <select
                    id="subject"
                    className="input appearance-none"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    defaultValue=""
                    {...register("subject", { required: "Subject is required" })}
                    aria-invalid={!!errors.subject}
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </Field>

              <Field label={<>Message{required}</>} htmlFor="message" error={errors.message}>
                <textarea
                  id="message"
                  rows={5}
                  maxLength={500}
                  className="input"
                  placeholder="Type your message here..."
                  {...register("message", { required: "Message is required" })}
                  aria-invalid={!!errors.message}
                />
                <p className="mt-1 text-right text-xs text-muted">{messageLength}/500</p>
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
                <Send className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>

          {/* RIGHT: illustration slot + other ways */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* IMAGE SLOT — illustration goes here */}
            {CONTACT_HERO_IMAGE ? (
              <img
                    src={CONTACT_HERO_IMAGE}
                    alt="Student working on real-world projects"
                    decoding="async"
                    className="block w-full h-auto max-h-[340px] sm:max-h-none object-contain object-bottom drop-shadow-2xl"
                  />
            ) : (
              <div className="flex h-64 items-center justify-center bg-gradient-to-b from-blue-200 to-blue-50">
                <div className="rounded-xl border-2 border-dashed border-blue-400/60 px-6 py-8 text-center text-sm font-medium text-blue-700/80">
                  Image yahan lagegi
                  <br />
                  <span className="text-xs font-normal">CONTACT_HERO_IMAGE</span>
                </div>
              </div>
            )}

            <div className="p-5">
              <h2 className="text-xl font-bold text-navy">Prefer Other Ways?</h2>
              <p className="text-sm text-muted">You can also reach us through these channels.</p>

              <ul className="mt-4 space-y-4">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy">Email Us</p>
                    <a
                      href={`mailto:${contactInfo.supportEmail}`}
                      className="block truncate text-sm text-muted hover:text-brand"
                    >
                      {contactInfo.supportEmail}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="rounded-md p-1.5 text-brand hover:bg-blue-50"
                    aria-label="Copy email address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">Response Time</p>
                    <p className="text-sm text-muted">
                      Within <span className="font-semibold text-brand">24 hours</span>
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3 opacity-60">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-muted">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">Live Support (Soon)</p>
                    <p className="text-sm text-muted">Chat with our team (Coming soon)</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common questions */}
        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-brand" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-bold text-navy">Common Questions</h2>
                <p className="text-sm text-muted">Find quick answers to the most common questions.</p>
              </div>
            </div>
            <a
              href="/faq"
              className="inline-flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              View All FAQs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FAQS.map((f) => (
              <div key={f.q} className="flex gap-3 rounded-xl border border-slate-100 p-4">
                <span
                  className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${f.iconBox}`}
                >
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-navy">{f.q}</p>
                    <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand">
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}

export default Contact;
