import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, ArrowRight, Calendar, Layers,
  CheckCircle2, Clock, Award,
  Activity, BookOpen, HelpCircle,
  FileText, Code2, Info,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchDashboard } from "../../services/studentService";

// IMAGE SLOT: welcome-banner illustration (e.g. "/images/dashboard-hero.png").
// While null, a placeholder box is shown in its place.
const DASHBOARD_HERO_IMAGE="/images/hero-student.png";

const certificateStatusLabel = {
  not_eligible: "Not Eligible Yet",
  eligible: "Eligible — Pay to Generate",
  payment_pending: "Payment Pending",
  generated: "Certificate Ready",
};

const certificateStatusTone = {
  not_eligible: "text-muted",
  eligible: "text-brand",
  payment_pending: "text-amber-600",
  generated: "text-success",
};

// Brand logos for technology chips (falls back to a plain chip when unknown).
const TECH_ICONS = {
  react: "react",
  "node.js": "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  "express.js": "express",
  express: "express",
  javascript: "javascript",
  js: "javascript",
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  git: "git",
  github: "github",
  python: "python",
  php: "php",
  mysql: "mysql",
  "vs code": "vscode",
};

function techIconUrl(tech) {
  const key = TECH_ICONS[tech.trim().toLowerCase()];
  return key ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg` : null;
}

// Where the floating technology chips sit over the banner illustration.
const CHIP_POSITIONS = [
  "left-[6%] top-[22%] -rotate-6",
  "left-[0%] top-[48%] rotate-3",
  "right-[8%] top-[34%] rotate-6",
  "right-[16%] top-[58%] -rotate-3",
];

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
}

function dueLabel(dateString) {
  const diffDays = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: "Overdue", tone: "bg-danger/10 text-danger" };
  if (diffDays === 0) return { text: "Due today", tone: "bg-danger/10 text-danger" };
  if (diffDays <= 3) return { text: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`, tone: "bg-amber-100 text-amber-700" };
  return { text: `Due in ${diffDays} days`, tone: "bg-brand/10 text-brand" };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function StatCard({ icon: Icon, value, label, hint, tone }) {
  const tones = {
    brand: "bg-blue-100 text-brand",
    success: "bg-green-100 text-success",
    warning: "bg-orange-100 text-orange-500",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <Card className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-extrabold text-navy leading-none">{value}</p>
        <p className="text-sm font-semibold text-navy mt-1.5 truncate">{label}</p>
        <p className="text-xs text-muted mt-0.5 truncate">{hint}</p>
      </div>
    </Card>
  );
}

function ChecklistItem({ done, label, fraction }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2.5 text-sm text-navy">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
        ) : (
          <span className="h-5 w-5 rounded-full border-2 border-brand flex-shrink-0" />
        )}
        {label}
      </span>
      <span className="text-xs text-muted flex-shrink-0">{fraction}</span>
    </div>
  );
}

/** Circular overall-progress ring. */
function ProgressRing({ percent }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const safe = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="relative h-36 w-36 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E8EEFB" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#2563EB"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - safe / 100)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-navy leading-none">{safe}%</span>
        <span className="mt-1 text-[11px] text-muted">Overall Progress</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res))
      .catch(() => setError("Couldn't load your dashboard. Please refresh."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const { student, tasks, progressPercent, approvedCount, totalTasks, upcomingTasks, recentActivity } = data;
  const firstName = student.fullName.split(" ")[0];
  const submittedCount = tasks.filter((t) => t.status !== "Not Started").length;
  const technologies = student.program?.technologies || [];

  return (
    <div className="grid xl:grid-cols-[1fr,22rem] gap-6 items-start">
      {/* ================= LEFT COLUMN ================= */}
      <div className="space-y-6 min-w-0">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100">
          <div className="grid md:grid-cols-[1fr,1.05fr] items-center">
            <div className="relative z-10 p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
                Welcome back,
                <br />
                <span className="text-brand">{firstName}</span> <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-navy/80 mt-3 max-w-sm">
                Continue your internship journey and build real-world skills with CodeVantage.
              </p>
              <Button to="/student/tasks" className="mt-6">
                Continue Learning <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* IMAGE SLOT — illustration (student with laptop) + floating tech chips */}
            <div className="relative h-56 md:h-64">
              {DASHBOARD_HERO_IMAGE ? (
                <img
                  src={DASHBOARD_HERO_IMAGE}
                  alt="dashboard"
                  className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 object-contain"
                />
              ) : (
                <div className="absolute inset-x-6 inset-y-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-blue-300/70 text-center text-sm font-medium text-blue-700/80">
                  <div>
                    Image yahan lagegi
                    <br />
                    <span className="text-xs font-normal">DASHBOARD_HERO_IMAGE</span>
                  </div>
                </div>
              )}

              {technologies.slice(0, CHIP_POSITIONS.length).map((tech, i) => {
                const icon = techIconUrl(tech);
                return (
                  <span
                    key={tech}
                    className={`absolute inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-navy shadow-md ring-1 ring-slate-100 ${CHIP_POSITIONS[i]}`}
                  >
                    {icon && <img src={icon} alt="" className="h-4 w-4 object-contain" />}
                    {tech}
                  </span>
                );
              })}
              <div className="pointer-events-none absolute bottom-0 right-7 hidden -rotate-3 rounded-lg bg-white px-9 py- 4 text-xs font-bold leading-tight text-navy shadow-md lg:block">
                Build
                <br />
                Real-World
                <br />
                Projects
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid xs:grid-cols-2 2xl:grid-cols-4 gap-4">
          <StatCard icon={Layers} value={totalTasks} label="Total Projects" hint="Assigned in this program" tone="brand" />
          <StatCard icon={CheckCircle2} value={approvedCount} label="Completed" hint="Great progress!" tone="success" />
          <StatCard icon={Clock} value={totalTasks - approvedCount} label="Pending" hint="Keep going!" tone="warning" />
          <StatCard
            icon={Award}
            value={student.certificateStatus === "generated" ? 1 : 0}
            label="Certificates"
            hint="Complete tasks to earn"
            tone="purple"
          />
        </div>

        {/* Internship progress */}
        <Card className="p-6">
          <p className="text-lg font-bold text-navy mb-4">Internship Progress</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ProgressRing percent={progressPercent} />
            <div className="min-w-0 flex-1 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-lg font-bold text-navy">{student.program?.name || "Not assigned"}</p>
                {student.program && (
                  <span className="text-xs font-medium bg-green-100 text-success rounded-full px-2.5 py-0.5">
                    {student.internshipStatus === "completed" ? "Completed" : "Active"}
                  </span>
                )}
              </div>
              {student.program && (
                <div className="flex items-center gap-5 mt-2 text-sm text-muted flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {student.program.durationLabel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" /> {student.program.projectsCount} Projects
                  </span>
                  {technologies.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-4 w-4" /> {technologies.slice(0, 3).join(", ")}
                    </span>
                  )}
                </div>
              )}
              {!!totalTasks && (
                <div className="mt-5">
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-2 text-right">
                    {approvedCount}/{totalTasks} Projects Completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid 2xl:grid-cols-[1.35fr,1fr] gap-6">
          {/* Task progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-bold text-navy">Recent Tasks</p>
              <Link to="/student/tasks" className="text-brand text-sm font-medium inline-flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3">
                  {/* IMAGE SLOT — task thumbnail */}
                  <div className="flex h-14 w-16 sm:h-16 sm:w-24 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-gradient-to-br from-slate-900 to-slate-700 text-lg font-bold text-white/80">
                    {task.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-muted truncate mt-0.5">{task.description}</p>}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                    <StatusBadge status={task.status} />
                    <Link
                      to={`/student/tasks/${task._id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand whitespace-nowrap"
                    >
                      {task.status === "Not Started" ? "Start Project" : "View"}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-muted">No tasks assigned yet.</p>}
            </div>
          </Card>

          {/* Certificate status */}
          <Card className="p-6">
            <p className="text-lg font-bold text-navy mb-4">Certificate Status</p>
            <div className="flex items-start gap-3 mb-4">
              <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Award className="h-8 w-8 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className={`text-lg font-bold ${certificateStatusTone[student.certificateStatus]}`}>
                  {certificateStatusLabel[student.certificateStatus]}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {student.certificateStatus === "not_eligible"
                    ? "Complete the checklist below to become eligible."
                    : "Manage your certificate from the Certificate tab."}
                </p>
              </div>
            </div>

            {!!totalTasks && (
              <div className="rounded-xl border border-slate-200 px-3 py-1 space-y-0.5">
                <ChecklistItem done={submittedCount === totalTasks} label="Submit all tasks" fraction={`${submittedCount}/${totalTasks}`} />
                <ChecklistItem done={approvedCount === totalTasks} label="Get all tasks approved" fraction={`${approvedCount}/${totalTasks}`} />
              </div>
            )}

            {student.certificateStatus !== "generated" && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-brand">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Once you complete all requirements, your certificate will be available here.
              </div>
            )}

            <Link
              to="/student/certificate"
              className="mt-4 inline-flex items-center gap-1.5 text-brand text-sm font-medium"
            >
              View Certificate <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </div>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <div className="grid md:grid-cols-2 xl:grid-cols-1 gap-6 items-start min-w-0">
        {/* Current program */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold text-navy">Current Program</p>
            {student.program?.slug && (
              <Link
                to={`/internships/${student.program.slug}`}
                className="text-brand text-sm font-medium inline-flex items-center gap-1"
              >
                View Program <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Technology logo tile (built from program.technologies) */}
            <div className="grid h-20 w-24 flex-shrink-0 grid-cols-2 place-items-center gap-1 rounded-xl bg-slate-900 p-2">
              {technologies.slice(0, 4).map((tech) => {
                const icon = techIconUrl(tech);
                return icon ? (
                  <img key={tech} src={icon} alt={tech} className="h-7 w-7 object-contain" />
                ) : (
                  <span key={tech} className="text-[10px] font-bold text-white/80">
                    {tech.slice(0, 2).toUpperCase()}
                  </span>
                );
              })}
              {technologies.length === 0 && <Layers className="col-span-2 h-7 w-7 text-white/70" />}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-navy leading-snug">{student.program?.name || "Not assigned"}</p>
              {student.program && (
                <span className="mt-1.5 inline-block text-xs font-medium bg-green-100 text-success rounded-full px-2.5 py-0.5">
                  {student.internshipStatus === "completed" ? "Completed" : "Active"}
                </span>
              )}
            </div>
          </div>

          {student.program && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Calendar className="h-4 w-4" /> {student.program.durationLabel}
            </p>
          )}

          <Button to="/student/tasks" className="mt-4 w-full justify-center">
            Continue Learning <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        {/* Upcoming tasks */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold text-navy">Upcoming Tasks</p>
            <Link to="/student/tasks" className="text-brand text-sm font-medium inline-flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingTasks?.length > 0 ? (
              upcomingTasks.map((task) => {
                const due = dueLabel(task.deadline);
                return (
                  <Link
                    key={task._id}
                    to={`/student/tasks/${task._id}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="h-11 w-11 rounded-xl bg-blue-100 text-brand flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy group-hover:text-brand truncate">{task.title}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(task.deadline)}
                        </span>
                        <span className={`inline-block text-xs font-medium rounded-full px-2.5 py-0.5 ${due.tone}`}>
                          {due.text}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-muted">No upcoming deadlines right now.</p>
            )}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <p className="text-lg font-bold text-navy mb-4">Recent Activity</p>
          <div className="space-y-4">
            {recentActivity?.length > 0 ? (
              recentActivity.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">{event.message}</p>
                    <p className="text-xs text-muted mt-0.5">{timeAgo(event.at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No activity yet — submit your first task to get started.</p>
            )}
          </div>
        </Card>

        {/* Help & resources */}
        <Card className="p-5">
          <p className="text-lg font-bold text-navy mb-4">Help & Resources</p>
          <div className="space-y-4">
            <Link to="/student/tasks" className="flex items-start gap-3 group">
              <FileText className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-navy group-hover:text-brand">Project Guidelines</p>
                <p className="text-xs text-muted">Read detailed instructions</p>
              </div>
            </Link>
            {student.program?.slug && (
              <Link to={`/internships/${student.program.slug}`} className="flex items-start gap-3 group">
                <BookOpen className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-navy group-hover:text-brand">Program Overview</p>
                  <p className="text-xs text-muted">Revisit your program details</p>
                </div>
              </Link>
            )}
            <Link to="/faq" className="flex items-start gap-3 group">
              <HelpCircle className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-navy group-hover:text-brand">Ask for Help</p>
                <p className="text-xs text-muted">FAQs and support</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
