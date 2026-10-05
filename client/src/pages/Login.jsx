import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, GraduationCap, Mail, Lock, Eye, EyeOff, FileText, BarChart3, Award, Users } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Container from "../components/ui/Container";
import { useAuth } from "../context/AuthContext";

// IMAGE SLOT: set to your illustration (e.g. "/images/login-hero.png").
// While null, a placeholder box is shown in its place.
const LOGIN_HERO_IMAGE = "/images/hero-student.png";

const BENEFITS = [
  { icon: FileText, title: "Access Your Tasks", text: "Continue where you left off", box: "bg-purple-100 text-purple-600" },
  { icon: BarChart3, title: "Track Your Progress", text: "See completed and pending tasks", box: "bg-green-100 text-green-600" },
  { icon: Award, title: "Earn Certificates", text: "Get verifiable certificates", box: "bg-orange-100 text-orange-500" },
  { icon: Users, title: "Get Mentor Feedback", text: "Improve with expert reviews", box: "bg-blue-100 text-blue-600" },
];

const iconCls = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/70";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden="true" fill="#0F172A">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const redirectTo = location.state?.from?.pathname || "/student/dashboard";

  async function onSubmit(values) {
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/60">
      <Container size="2xl" padY={false} className="py-8 sm:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          {/* LEFT: intro, benefits, illustration slot */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1.5 text-sm font-semibold text-brand">
              <GraduationCap className="h-4 w-4" aria-hidden="true" /> Welcome Back!
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
              Continue Your
              <br />
              <span className="text-brand">Learning Journey</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              Log in to access your dashboard, complete tasks, submit projects, get expert feedback, and earn
              verifiable certificates.
            </p>

            <ul className="mt-6 space-y-4">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-center gap-4">
                  <span
                    className={`inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${b.box}`}
                  >
                    <b.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold text-navy">{b.title}</p>
                    <p className="text-sm text-muted">{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* IMAGE SLOT — illustration (boy with laptop, Complete Projects / Get Certified chips, plant, books) */}
            <div className="relative mt-6 hidden lg:block">
              {LOGIN_HERO_IMAGE ? (
                <img src={LOGIN_HERO_IMAGE} alt="" className="h-80 w-full object-contain object-right-bottom" />
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-blue-300/70 bg-gradient-to-b from-blue-50 to-blue-100/60 text-center text-sm font-medium text-blue-700/80">
                  <div>
                    Image yahan lagegi
                    <br />
                    <span className="text-xs font-normal">LOGIN_HERO_IMAGE</span>
                  </div>
                </div>
              )}
              <div
                className="pointer-events-none absolute bottom-2 left-2 -rotate-6 text-navy"
                style={{ fontFamily: "CertSignature", fontSize: "1.8rem", lineHeight: 1.05 }}
                aria-hidden="true"
              >
                Build
                <br />
                <span className="ml-2 inline-block">Real Skills</span>
                <br />
                <span className="ml-5 inline-block">for a Brighter</span>
                <br />
                <span className="ml-10 inline-block">Future</span>
                <svg className="ml-2 mt-1 w-32" viewBox="0 0 130 24" fill="none">
                  <path d="M2 20 C40 14 90 8 126 2" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT: login card */}
          <Card className="mx-auto w-full max-w-xl p-6 sm:p-10">
            <div className="text-center">
              <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-brand">
                <GraduationCap className="h-10 w-10" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-navy">Student Login</h2>
              <p className="mt-1 text-muted">Log in to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
              <Field label="Email Address" htmlFor="email" error={errors.email}>
                <div className="relative">
                  <Mail className={iconCls} aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    className="input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Enter your email address"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
              </Field>

              <Field
                label="Password"
                htmlFor="password"
                error={errors.password}
                labelExtra={
                  <Link to="/forgot-password" className="text-xs text-brand hover:underline">
                    Forgot password?
                  </Link>
                }
              >
                <div className="relative">
                  <Lock className={iconCls} aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                    placeholder="Enter your password"
                    {...register("password", { required: "Password is required" })}
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

              <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
                <LogIn className="h-4 w-4" /> {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4 text-sm text-muted">
              <span className="h-px flex-1 bg-slate-200" />
              OR
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => toast("Google login is coming soon.")}
                className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm hover:bg-slate-50"
              >
                <GoogleMark /> Continue with Google
              </button>
              <button
                type="button"
                onClick={() => toast("GitHub login is coming soon.")}
                className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm hover:bg-slate-50"
              >
                <GitHubMark /> Continue with GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-brand hover:underline">
                Register
              </Link>
            </p>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default Login;
