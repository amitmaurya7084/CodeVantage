import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Building2,
  BookOpen,
  GraduationCap,
  ChevronDown,
  GitBranch,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Award,
  BarChart3,
  Rocket,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Container from "../components/ui/Container";
import { useAuth } from "../context/AuthContext";
import { programs as staticPrograms } from "../data/programs";
import { fetchPrograms } from "../services/programService";

// IMAGE SLOT: set to your illustration (e.g. "/images/register-hero.png").
// While null, a placeholder box is shown in its place.
const REGISTER_HERO_IMAGE = "/images/hero-student.png";

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Project-Based Internships",
    text: "Work on real projects with clear tasks and guidance.",
    box: "bg-purple-100 text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Mentor Review & Feedback",
    text: "Get expert feedback on every submission.",
    box: "bg-green-100 text-green-600",
  },
  {
    icon: Award,
    title: "Verifiable Certificates",
    text: "Earn a QR-verifiable certificate upon successful completion.",
    box: "bg-orange-100 text-orange-500",
  },
  {
    icon: BarChart3,
    title: "Build a Strong Portfolio",
    text: "Showcase your skills to stand out in placements and job applications.",
    box: "bg-blue-100 text-blue-600",
  },
];

const iconCls = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/70";
const padLeft = { paddingLeft: "2.5rem" };
const req = <span className="text-red-500"> *</span>;

function Register() {
  const navigate = useNavigate();
  const { register: registerStudent } = useAuth();
  const [programs, setPrograms] = useState(staticPrograms);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    fetchPrograms()
      .then((data) => {
        if (data && data.length > 0) setPrograms(data);
      })
      .catch(() => {
        // Keep static fallback.
      });
  }, []);

  async function onSubmit(values) {
    try {
      await registerStudent(values);
      toast.success("Welcome to CodeVantage!");
      navigate("/student/dashboard");
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/60">
      <Container size="2xl" padY={false} className="py-8 sm:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr,0.95fr]">
          {/* LEFT: intro, benefits, illustration slot */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1.5 text-sm font-semibold text-brand">
              <Rocket className="h-4 w-4" aria-hidden="true" /> Join Our Learners
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
              Create Your
              <br />
              <span className="text-brand">Account</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted">
              Start your internship journey with CodeVantage and build real-world skills through hands-on
              projects.
            </p>

            <ul className="mt-6 space-y-4">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <span
                    className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${b.box}`}
                  >
                    <b.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold text-navy">{b.title}</p>
                    <p className="max-w-sm text-sm text-muted">{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* IMAGE SLOT — illustration (boy with laptop, Learn / Build / Get Certified tags, plant, books) */}
            <div className="relative mt-6 hidden lg:block">
              {REGISTER_HERO_IMAGE ? (
                <img src={REGISTER_HERO_IMAGE} alt="" className="h-80 w-full object-contain object-left-bottom" />
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-blue-300/70 bg-gradient-to-b from-blue-50 to-blue-100/60 text-center text-sm font-medium text-blue-700/80">
                  <div>
                    Image yahan lagegi
                    <br />
                    <span className="text-xs font-normal">REGISTER_HERO_IMAGE</span>
                  </div>
                </div>
              )}
              <div
                className="pointer-events-none absolute right-2 top-2 -rotate-6 text-navy"
                style={{ fontFamily: "CertSignature", fontSize: "1.9rem", lineHeight: 1.05 }}
                aria-hidden="true"
              >
                Turn
                <br />
                <span className="ml-3 inline-block">Ideas into</span>
                <br />
                <span className="ml-6 inline-block">Impact!</span>
                <svg className="ml-2 mt-1 w-32" viewBox="0 0 130 24" fill="none">
                  <path d="M2 20 C40 14 90 8 126 2" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT: form */}
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand">
                <User className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-navy">Create Your Account</h2>
                <p className="text-sm text-muted">Register to start your internship program.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Field label={<>Full Name{req}</>} error={errors.fullName}>
                <div className="relative">
                  <User className={iconCls} aria-hidden="true" />
                  <input
                    className="input"
                    style={padLeft}
                    placeholder="Enter your full name"
                    {...register("fullName", { required: "Full name is required" })}
                  />
                </div>
              </Field>

              <Field label={<>Email{req}</>} error={errors.email}>
                <div className="relative">
                  <Mail className={iconCls} aria-hidden="true" />
                  <input
                    type="email"
                    className="input"
                    style={padLeft}
                    placeholder="Enter your email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                  />
                </div>
              </Field>

              <Field label={<>Phone{req}</>} error={errors.phone}>
                <div className="relative">
                  <Phone className={iconCls} aria-hidden="true" />
                  <input
                    className="input"
                    style={padLeft}
                    placeholder="Enter your phone number"
                    {...register("phone", { required: "Phone number is required" })}
                  />
                </div>
              </Field>

              <div className="grid xs:grid-cols-2 gap-4">
                <Field label={<>College / School{req}</>} error={errors.college}>
                  <div className="relative">
                    <Building2 className={iconCls} aria-hidden="true" />
                    <input
                      className="input"
                      style={padLeft}
                      placeholder="Enter your college name"
                      {...register("college", { required: "Required" })}
                    />
                  </div>
                </Field>
                <Field label={<>Course / Class{req}</>} error={errors.course}>
                  <div className="relative">
                    <BookOpen className={iconCls} aria-hidden="true" />
                    <input
                      className="input"
                      style={padLeft}
                      placeholder="Enter your course / class"
                      {...register("course", { required: "Required" })}
                    />
                  </div>
                </Field>
              </div>

              <Field label={<>Program{req}</>} error={errors.programSlug}>
                <div className="relative">
                  <GraduationCap className={iconCls} aria-hidden="true" />
                  <select
                    className="input appearance-none"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    {...register("programSlug", { required: "Please select a program" })}
                  >
                    <option value="">Select a program</option>
                    {programs.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy"
                    aria-hidden="true"
                  />
                </div>
              </Field>

              <div className="grid xs:grid-cols-2 gap-4">
                <Field label="GitHub URL (optional)" error={errors.githubUrl}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white">
                      <GitBranch className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <input
                      className="input"
                      style={padLeft}
                      placeholder="https://github.com/username"
                      {...register("githubUrl")}
                    />
                  </div>
                </Field>
                <Field label="LinkedIn URL (optional)" error={errors.linkedinUrl}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-[#0A66C2] text-[10px] font-bold text-white">
                      in
                    </span>
                    <input
                      className="input"
                      style={padLeft}
                      placeholder="https://linkedin.com/in/username"
                      {...register("linkedinUrl")}
                    />
                  </div>
                </Field>
              </div>

              <Field label={<>Password{req}</>} error={errors.password}>
                <div className="relative">
                  <Lock className={iconCls} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                    placeholder="Create a strong password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-navy/70 hover:text-navy"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field label={<>Confirm Password{req}</>} error={errors.confirmPassword}>
                <div className="relative">
                  <Lock className={iconCls} aria-hidden="true" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                    placeholder="Confirm your password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-navy/70 hover:text-navy"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <label className="flex items-start gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register("agreedToTerms", { required: "You must agree to continue" })}
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="text-brand underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-brand underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-caption text-danger -mt-3">{errors.agreedToTerms.message}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
                <UserPlus className="h-4 w-4" /> {isSubmitting ? "Creating account..." : "Create Account"}{" "}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-4 text-sm text-muted">
              <span className="h-px flex-1 bg-slate-200" />
              <p>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-brand underline">
                  Login
                </Link>
              </p>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default Register;
