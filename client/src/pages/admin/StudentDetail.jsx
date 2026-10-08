import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Plus,
  FileText,
  Users,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Layers,
  Briefcase,
  Award,
  Github,
  Linkedin,
  Calendar,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchStudentById } from "../../services/adminService";

const PILL_STYLES = {
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-brand",
  gray: "bg-slate-100 text-slate-600",
};

// Display-only helper: picks a pill colour from the status text.
function pillTone(value) {
  const v = String(value || "").toLowerCase();
  if (["completed", "generated", "active"].some((k) => v.includes(k))) return "green";
  if (["eligible", "progress", "pending"].some((k) => v.includes(k))) return "blue";
  return "gray";
}

function Row({ label, value, icon: Icon, pill, link }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      {Icon && <Icon className="h-5 w-5 text-muted flex-shrink-0" />}
      <span className="w-28 sm:w-36 flex-shrink-0 text-sm text-muted">{label}</span>
      <div className="min-w-0 flex-1 text-right text-sm font-medium text-navy break-words">
        {pill && value ? (
          <span className={`inline-block rounded-full px-3.5 py-1 text-xs sm:text-sm font-medium ${PILL_STYLES[pillTone(value)]}`}>
            {value}
          </span>
        ) : link ? (
          value ? (
            <a href={value} target="_blank" rel="noreferrer" className="text-brand underline break-all">
              {value}
            </a>
          ) : (
            <span className="inline-flex items-center justify-end gap-3 sm:gap-6">
              <span className="text-muted">—</span>
              <span className="text-brand underline">Add Link</span>
            </span>
          )
        ) : (
          value || "—"
        )}
      </div>
    </div>
  );
}

const TILE_TONES = [
  "bg-blue-50 text-brand",
  "bg-purple-50 text-purple-600",
  "bg-orange-50 text-orange-500",
];

function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentById(id)
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || "Couldn't load this student."));
  }, [id]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const { student, submissions } = data;

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  // Display-only "Active" pill — shown only if the record carries an active flag/status.
  const activeLabel =
    student.status || (typeof student.isActive === "boolean" ? (student.isActive ? "Active" : "Inactive") : null);

  return (
    <div>
      <Link to="/admin/students" className="text-sm text-muted hover:text-navy inline-flex items-center gap-1.5 mb-5 sm:mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
      </Link>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[32px] font-bold text-navy leading-tight break-words">{student.fullName}</h1>
          <p className="text-muted mt-1">View student details, submissions, and progress.</p>
        </div>
        <button
          type="button"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-brand bg-white px-5 py-3 text-sm font-semibold text-brand hover:bg-blue-50 transition flex-shrink-0"
        >
          <Pencil className="h-4 w-4" /> Edit Student
        </button>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* Profile */}
        <Card className="p-4 sm:p-6 !rounded-2xl">
          <div className="flex items-center gap-4 sm:gap-5 mb-5">
            <span className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full bg-blue-50 text-brand text-2xl font-semibold flex items-center justify-center flex-shrink-0">
              {(student.fullName || "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-xl font-bold text-navy break-words">{student.fullName}</p>
                {activeLabel && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${PILL_STYLES[pillTone(activeLabel)]}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" /> {activeLabel}
                  </span>
                )}
              </div>
              <p className="text-muted break-all">{student.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-blue-50/70 px-3 sm:px-4 py-3 mb-1">
            <Users className="h-5 w-5 text-brand" />
            <p className="font-semibold text-navy">Student Information</p>
          </div>

          <div className="px-1 sm:px-2">
            <Row icon={Mail} label="Email" value={student.email} />
            <Row icon={Phone} label="Phone" value={student.phone} />
            <Row icon={GraduationCap} label="College" value={student.college} />
            <Row icon={BookOpen} label="Course" value={student.course} />
            <Row icon={Layers} label="Program" value={student.program?.name} />
            <Row icon={Briefcase} label="Internship Status" value={student.internshipStatus} pill />
            <Row
              icon={Award}
              label="Certificate Status"
              value={student.certificateStatus.replace("_", " ")}
              pill
            />
            <Row icon={Github} label="GitHub" value={student.githubUrl} link />
            <Row icon={Linkedin} label="LinkedIn" value={student.linkedinUrl} link />
          </div>
        </Card>

        {/* Submissions */}
        <Card className="p-4 sm:p-6 !rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-brand" />
                <p className="text-xl font-bold text-navy">Submissions</p>
                <span className="h-8 min-w-8 px-2 rounded-full bg-blue-50 text-brand text-sm font-semibold flex items-center justify-center">
                  {submissions.length}
                </span>
              </div>
              <p className="text-sm text-muted mt-2">All project submissions by this student.</p>
            </div>
            <button
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition flex-shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Submission
            </button>
          </div>

          {submissions.length === 0 && <p className="text-sm text-muted">No submissions yet.</p>}

          <div className="space-y-3">
            {submissions.map((s, i) => (
              <Link
                key={s._id}
                to={`/admin/reviews/${s._id}`}
                className="block rounded-xl border border-slate-200 p-3 sm:p-4 hover:bg-slate-50 hover:border-brand/30 transition"
              >
                <div className="flex gap-3 sm:gap-4">
                  <span
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${TILE_TONES[i % TILE_TONES.length]}`}
                  >
                    <FileText className="h-6 w-6" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-navy break-words">
                          Task {s.task?.order}: {s.task?.title}
                        </p>
                        {s.githubUrl && (
                          <p className="mt-1 inline-flex max-w-full items-center gap-2 text-sm text-brand underline">
                            <span className="break-all">{s.githubUrl}</span>
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={s.status} />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm text-muted">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Submitted {fmtDate(s.createdAt)}
                        </span>
                        {s.submissionCount != null && (
                          <span className="inline-flex items-center gap-2">
                            <FileText className="h-4 w-4" /> {s.submissionCount}{" "}
                            {s.submissionCount === 1 ? "attempt" : "attempts"}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand">
                        View <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">Click a submission to open its review screen.</p>
        </Card>
      </div>
    </div>
  );
}

export default StudentDetail;
 
