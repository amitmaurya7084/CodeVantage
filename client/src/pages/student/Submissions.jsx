import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchMySubmissions } from "../../services/submissionService";

function Submissions() {
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Your Submissions</h1>
      <p className="text-muted mb-8">Every project you've submitted, and its current review status.</p>

      {submissions.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted mb-4">You haven't submitted any projects yet.</p>
          <Link to="/student/tasks" className="text-brand font-medium inline-flex items-center gap-1">
            Go to Tasks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {submissions.map((s) => (
          <Card key={s._id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium mb-1">Task {s.task?.order}</p>
              <p className="font-semibold text-navy">{s.task?.title}</p>
              <p className="text-sm text-muted mt-1">
                Submitted {new Date(s.createdAt).toLocaleDateString()} · {s.submissionCount}{" "}
                {s.submissionCount === 1 ? "attempt" : "attempts"}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
              <StatusBadge status={s.status} />
              <Link to={`/student/tasks/${s.task?._id}`} className="text-brand text-sm font-medium inline-flex items-center gap-1">
                View <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Submissions;
