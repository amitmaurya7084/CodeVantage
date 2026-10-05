import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchReviewQueue } from "../../services/adminService";

const statusTabs = [
  { value: "", label: "Needs Attention" },
  { value: "Pending Review", label: "Pending Review" },
  { value: "Under Review", label: "Under Review" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Changes Requested", label: "Changes Requested" },
];

function Reviews() {
  const [status, setStatus] = useState("");
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewQueue({ status: status || undefined })
      .then((data) => setSubmissions(data.submissions))
      .catch(() => setError("Couldn't load submissions."));
  }, [status]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Reviews</h1>
      <p className="text-muted mb-6">Approve, reject, or request changes on student submissions.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              status === tab.value ? "bg-brand text-white" : "bg-white text-navy border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-danger">{error}</p>}

      {!submissions && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {submissions && (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s._id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-navy">{s.student?.fullName}</p>
                <p className="text-xs text-muted truncate">{s.student?.email}</p>
                <p className="text-sm text-navy mt-1">
                  Task {s.task?.order}: {s.task?.title}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                <StatusBadge status={s.status} />
                <Link to={`/admin/reviews/${s._id}`} className="text-brand text-sm font-medium inline-flex items-center gap-1">
                  Review <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
          {submissions.length === 0 && (
            <Card className="p-6 text-center text-muted">Nothing here right now.</Card>
          )}
        </div>
      )}
    </div>
  );
}

export default Reviews;
