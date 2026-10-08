import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  Plus,
  Search,
  ListFilter,
  ChevronDown,
  Calendar,
  RotateCcw,
  ExternalLink,
  FileText,
  Github,
  Star,
  Award,
  FileSearch,
} from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchMySubmissions } from "../../services/submissionService";

// Display-only tab filters. NOTE: the status strings below are my assumption —
// change them if your backend uses different values.
const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_review", label: "In Review" },
  { key: "approved", label: "Approved" },
  { key: "needs_changes", label: "Needs Changes" },
];

function Submissions() {
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    fetchMySubmissions()
      .then((data) => setSubmissions(data.submissions))
      .catch(() => setError("Couldn't load your submissions. Please refresh."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!submissions) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const countOf = (key) => (key === "all" ? submissions.length : submissions.filter((s) => s.status === key).length);

  const visible = submissions
    .filter((s) => tab === "all" || s.status === tab)
    .filter((s) => (s.task?.title || "").toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (newestFirst ? 1 : -1) * (new Date(b.createdAt) - new Date(a.createdAt)));

  const formatDateTime = (d) =>
    new Date(d)
      .toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
      .replace(",", "")
      .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold text-navy mb-1">Your Submissions</h1>
          <p className="text-muted">Track all your project submissions and their current review status.</p>
        </div>
        <Link
          to="/student/tasks"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition sm:self-start flex-shrink-0"
        >
          <Plus className="h-4 w-4" /> Submit New Project
        </Link>
      </div>

      {/* Tabs + search + sort */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible -mx-1 px-1 pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 sm:px-4 py-2 text-sm font-medium transition ${
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search submissions..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            className="inline-flex w-full sm:w-auto items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:border-brand/40"
          >
            <span className="inline-flex items-center gap-2">
              <ListFilter className="h-4 w-4" /> {newestFirst ? "Newest First" : "Oldest First"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
        </div>
      </div>

      {submissions.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted mb-4">You haven't submitted any projects yet.</p>
          <Link to="/student/tasks" className="text-brand font-medium inline-flex items-center gap-1">
            Go to Tasks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      )}

      <div className="space-y-5">
        {visible.map((s) => (
          <Card key={s._id} className="p-4 sm:p-5 !rounded-2xl">
            {/* Top row */}
            <div className="grid gap-4 sm:gap-5 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_250px]">
              {/* Thumbnail — IMAGE PLACEHOLDER (put project screenshot here: s.thumbnail / s.image) */}
              <div className="w-full aspect-video md:aspect-auto md:h-full md:min-h-[150px] xl:h-[164px] rounded-lg overflow-hidden bg-navy">
                {s.thumbnail || s.image ? (
                  <img src={s.thumbnail || s.image} alt={s.task?.title || "Project"} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-white/60">Project image</div>
                )}
              </div>

              {/* Middle */}
              <div className="min-w-0 xl:border-l xl:border-slate-200 xl:pl-5">
                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-brand mb-1.5">
                  Task {s.task?.order}
                </span>
                <p className="text-lg sm:text-xl font-bold text-navy break-words">{s.task?.title}</p>
                {(s.description || s.task?.description) && (
                  <p className="text-[15px] text-muted mt-1 line-clamp-2">{s.description || s.task?.description}</p>
                )}
                {Array.isArray(s.techStack) && s.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.techStack.map((t, i) => (
                      <span
                        key={i}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          i < 3 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-brand"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: status + meta */}
              <div className="md:col-span-2 xl:col-span-1 grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-1 gap-3 items-start">
                <div className="min-[480px]:col-span-2 xl:col-span-1">
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex items-start gap-3">
                  <span className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-brand" />
                  </span>
                  <div>
                    <p className="text-sm text-muted">Submitted</p>
                    <p className="text-sm font-medium text-navy">{formatDateTime(s.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="h-4 w-4 text-brand" />
                  </span>
                  <div>
                    <p className="text-sm text-muted">Attempts</p>
                    <p className="text-sm font-medium text-navy">
                      {s.submissionCount} {s.submissionCount === 1 ? "attempt" : "attempts"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links row */}
            {(s.liveUrl || s.githubUrl || s.reportUrl) && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
                {s.liveUrl && (
                  <a href={s.liveUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-4 min-w-0">
                    <ExternalLink className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">Live Project URL</p>
                      <p className="text-sm text-brand underline truncate">{s.liveUrl}</p>
                    </div>
                  </a>
                )}
                {s.githubUrl && (
                  <a href={s.githubUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-4 min-w-0">
                    <Github className="h-5 w-5 text-navy mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">GitHub Repository</p>
                      <p className="text-sm text-brand underline truncate">{s.githubUrl}</p>
                    </div>
                  </a>
                )}
                {s.reportUrl && (
                  <a href={s.reportUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-4 min-w-0">
                    <FileText className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">Project Report (PDF)</p>
                      <p className="text-sm text-brand underline">Download Report</p>
                    </div>
                  </a>
                )}
              </div>
            )}

            {/* Reviewer feedback */}
            {s.feedback && (
              <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 rounded-lg bg-emerald-50 px-4 py-3">
                <span className="h-10 w-10 rounded-full bg-emerald-600 text-white font-semibold flex items-center justify-center flex-shrink-0">
                  R
                </span>
                <div className="lg:w-44 flex-shrink-0">
                  <p className="text-sm font-semibold text-navy">Reviewer Feedback</p>
                  {s.reviewedAt && <p className="text-xs text-muted">{formatDateTime(s.reviewedAt)}</p>}
                </div>
                <p className="flex-1 min-w-0 text-sm text-navy/80 break-words">“{s.feedback}”</p>
                {s.score != null && (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                    <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" /> Score: {s.score}/10
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col-reverse sm:flex-row sm:flex-wrap sm:justify-end gap-3">
              <Link
                to={`/student/tasks/${s.task?._id}`}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-brand bg-white px-5 py-2.5 text-sm font-semibold text-brand hover:bg-blue-50 transition"
              >
                View Details <ArrowRight className="h-4 w-4" />
              </Link>
              {s.status === "approved" && (
                <Link
                  to="/student/certificates"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  <Award className="h-4 w-4" /> View Certificate
                </Link>
              )}
            </div>
          </Card>
        ))}

        {submissions.length > 0 && visible.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-muted">No submissions match your filters.</p>
          </Card>
        )}
      </div>

      {/* Bottom empty-state strip */}
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 sm:justify-center">
        {/* IMAGE PLACEHOLDER (documents + magnifier illustration) */}
        <div className="h-24 w-28 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
          <FileSearch className="h-9 w-9 text-brand/60" />
        </div>
        <div className="text-center sm:text-left">
          <p className="font-semibold text-navy">No more submissions</p>
          <p className="text-sm text-muted mb-3">You haven't submitted any other projects yet.</p>
          <Link
            to="/student/tasks"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Browse Available Tasks <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Submissions;
