import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  Search,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  MessageCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchMyTasks } from "../../services/taskService";

// Display-only tab filters. NOTE: status strings are an assumption — adjust to your backend values.
const TABS = [
  { key: "all", label: "All Tasks" },
  { key: "not_started", label: "Not Started" },
  { key: "in_progress", label: "In Progress" },
  { key: "submitted", label: "Submitted" },
  { key: "approved", label: "Completed" },
];

const CHIP_STYLES = [
  "bg-sky-50 text-sky-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-orange-50 text-orange-500",
];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-brand" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted leading-tight">{label}</p>
        <p className="text-sm text-muted leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ActionLink({ to, icon: Icon, title, sub }) {
  return (
    <Link to={to} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 min-w-0 hover:bg-slate-50/70 transition">
      <span className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base font-semibold text-navy">{title}</p>
        <p className="text-xs sm:text-sm text-muted">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-brand flex-shrink-0" />
    </Link>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    fetchMyTasks()
      .then((data) => setTasks(data.tasks))
      .catch(() => setError("Couldn't load your tasks. Please refresh."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!tasks) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const countOf = (key) => (key === "all" ? tasks.length : tasks.filter((t) => t.status === key).length);

  const visible = tasks
    .filter((t) => tab === "all" || t.status === tab)
    .filter((t) => (t.title || "").toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (newestFirst ? (b.order ?? 0) - (a.order ?? 0) : (a.order ?? 0) - (b.order ?? 0)));

  return (
    <div>
      <h1 className="text-2xl sm:text-[30px] font-bold text-navy mb-1">Your Tasks</h1>
      <p className="text-sm sm:text-base text-muted mb-5 sm:mb-6">
        Complete the assigned project tasks and submit them to get certified.
      </p>

      {/* Tabs + search + sort.
          The student sidebar shows from `lg`, which leaves only ~700px for content,
          so the single-row toolbar only kicks in at `xl`. */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
        {/* Tabs scroll sideways on phones instead of wrapping into 3 rows */}
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-visible sm:flex-wrap -mx-1 px-1 pb-1 sm:pb-0">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full border px-4 sm:px-5 py-2 sm:py-2.5 text-[13px] sm:text-sm font-medium transition ${
                  active
                    ? "bg-brand border-brand text-white shadow-sm"
                    : "bg-white border-slate-200 text-navy hover:border-brand/40"
                }`}
              >
                {t.label} ({countOf(t.key)})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:flex-1 xl:flex-none xl:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 py-2.5 sm:py-3 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            className="inline-flex flex-shrink-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 sm:py-3 text-sm font-medium text-navy hover:border-brand/40"
          >
            <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
              <ArrowUpDown className="h-4 w-4" /> {newestFirst ? "Newest First" : "Oldest First"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
        </div>
      </div>

      {tasks.length === 0 && <p className="text-muted">No tasks assigned yet.</p>}

      <div className="space-y-4 sm:space-y-5">
        {visible.map((task) => (
          <Card key={task._id} className="!p-0 !rounded-2xl overflow-hidden">
            {/* Stacked (image, details, meta) until `xl`; 3 columns after that */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 p-4 sm:p-6">
              {/* Thumbnail — IMAGE PLACEHOLDER (task banner: task.thumbnail / task.image) */}
              <div className="w-full xl:w-[300px] 2xl:w-[344px] h-44 sm:h-56 xl:h-[216px] flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-700 to-navy">
                {task.thumbnail || task.image ? (
                  <img
                    src={task.thumbnail || task.image}
                    alt={task.title || "Task"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-white/60">
                    Task image
                  </div>
                )}
              </div>

              <div className="hidden xl:block w-px bg-slate-100" />

              {/* Middle */}
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-blue-50 px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs font-medium text-brand mb-2">
                  Task {task.order}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-navy break-words">{task.title}</p>
                <p className="text-sm sm:text-base text-muted mt-2 line-clamp-3 sm:line-clamp-2">{task.description}</p>
                {Array.isArray(task.techStack) && task.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-3 sm:mt-4">
                    {task.techStack.map((t, i) => (
                      <span
                        key={i}
                        className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium ${CHIP_STYLES[i % CHIP_STYLES.length]}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden xl:block w-px bg-slate-100" />

              {/* Right / meta: a wrapping row on small screens, a column on xl */}
              <div className="xl:w-[190px] flex-shrink-0 flex flex-row flex-wrap items-start gap-x-6 gap-y-3 xl:flex-col xl:flex-nowrap xl:gap-y-3.5 border-t border-slate-100 pt-4 xl:border-t-0 xl:pt-0">
                <div className="w-full sm:w-auto xl:w-full">
                  <StatusBadge status={task.status} />
                </div>
                {task.assignedAt && <MetaRow icon={Calendar} label="Assigned" value={fmtDate(task.assignedAt)} />}
                {task.submittedAt && <MetaRow icon={Calendar} label="Submitted" value={fmtDate(task.submittedAt)} />}
                {task.submissionCount != null && (
                  <MetaRow
                    icon={CheckCircle2}
                    label="Attempts"
                    value={`${task.submissionCount} ${task.submissionCount === 1 ? "attempt" : "attempts"}`}
                  />
                )}
              </div>
            </div>

            {/* Bottom action row */}
            <div className="border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <ActionLink
                to={`/student/tasks/${task._id}`}
                icon={ExternalLink}
                title="Task Instructions"
                sub="View complete requirements"
              />
              <ActionLink
                to={`/student/tasks/${task._id}`}
                icon={FileText}
                title="Your Submission"
                sub="View submitted project"
              />
              <ActionLink
                to={`/student/tasks/${task._id}`}
                icon={MessageCircle}
                title="Feedback"
                sub="View reviewer feedback"
              />
            </div>
          </Card>
        ))}

        {tasks.length > 0 && visible.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-muted">No tasks match your filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
export default Tasks;
