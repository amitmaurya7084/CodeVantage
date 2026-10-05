import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchStudentById } from "../../services/adminService";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-navy">{value || "—"}</span>
    </div>
  );
}

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

  return (
    <div>
      <Link to="/admin/students" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
      </Link>

      <h1 className="text-2xl font-bold text-navy mb-6">{student.fullName}</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="font-semibold text-navy mb-3 text-sm">Profile</p>
          <Row label="Email" value={student.email} />
          <Row label="Phone" value={student.phone} />
          <Row label="College" value={student.college} />
          <Row label="Course" value={student.course} />
          <Row label="Program" value={student.program?.name} />
          <Row label="Internship Status" value={student.internshipStatus} />
          <Row label="Certificate Status" value={student.certificateStatus.replace("_", " ")} />
          <Row label="GitHub" value={student.githubUrl} />
          <Row label="LinkedIn" value={student.linkedinUrl} />
        </Card>

        <Card className="p-6">
          <p className="font-semibold text-navy mb-3 text-sm">Submissions</p>
          {submissions.length === 0 && <p className="text-sm text-muted">No submissions yet.</p>}
          <div className="space-y-3">
            {submissions.map((s) => (
              <Link
                key={s._id}
                to={`/admin/reviews/${s._id}`}
                className="flex items-center justify-between border-b border-slate-100 last:border-0 py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-navy">
                    Task {s.task?.order}: {s.task?.title}
                  </p>
                  <p className="text-xs text-brand underline break-all">{s.githubUrl}</p>
                </div>
                <StatusBadge status={s.status} />
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
