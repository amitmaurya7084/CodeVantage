import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchSubmissionDetail, decideSubmission } from "../../services/adminService";

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  function load() {
    fetchSubmissionDetail(id)
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || "Couldn't load this submission."));
  }

  useEffect(load, [id]);

  async function onDecide(decision, values) {
    try {
      await decideSubmission(id, { decision, comments: values.comments });
      toast.success(`Marked as ${decision}.`);
      reset();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't submit review.");
    }
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const { submission, reviews } = data;
  const isDecided = submission.status === "Approved"; // locked once approved, same as the student-facing rule

  return (
    <div>
      <button onClick={() => navigate("/admin/reviews")} className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Reviews
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{submission.student?.fullName}</h1>
          <p className="text-muted text-sm">{submission.student?.email}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Badge className="mb-2">Task {submission.task?.order}</Badge>
          <p className="font-semibold text-navy mb-1">{submission.task?.title}</p>
          <p className="text-sm text-muted mb-4">{submission.task?.description}</p>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted">GitHub: </span>
              <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="text-brand underline break-all">
                {submission.githubUrl}
              </a>
            </p>
            {submission.liveUrl && (
              <p>
                <span className="text-muted">Live: </span>
                <a href={submission.liveUrl} target="_blank" rel="noreferrer" className="text-brand underline break-all">
                  {submission.liveUrl}
                </a>
              </p>
            )}
            {submission.linkedinUrl && (
              <p>
                <span className="text-muted">LinkedIn: </span>
                <a href={submission.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand underline break-all">
                  {submission.linkedinUrl}
                </a>
              </p>
            )}
            {submission.description && <p className="text-muted mt-2">{submission.description}</p>}
          </div>

          <p className="text-xs text-muted mt-4">Attempt #{submission.submissionCount}</p>
        </Card>

        <Card className="p-6">
          <p className="font-semibold text-navy mb-3 text-sm">Review History</p>
          {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-slate-100 last:border-0 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <StatusBadge status={r.decision} />
                  <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-navy">{r.comments}</p>
                <p className="text-xs text-muted mt-1">— {r.admin?.fullName}</p>
              </div>
            ))}
          </div>

          {isDecided ? (
            <p className="text-sm text-success bg-success/5 rounded-lg px-3 py-2 mt-4">
              This submission is approved and locked from further review changes.
            </p>
          ) : (
            <form className="mt-4 space-y-3">
              <textarea
                className="input"
                rows={3}
                placeholder="Review comments (required for any decision)..."
                {...register("comments", { required: "Comments are required" })}
              />
              {errors.comments && <p className="text-danger text-xs">{errors.comments.message}</p>}

              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                <Button
                  type="button"
                  onClick={handleSubmit((values) => onDecide("Approved", values))}
                  className="!bg-success hover:!bg-success"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit((values) => onDecide("Changes Requested", values))}
                >
                  <RotateCcw className="h-4 w-4" /> Changes
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit((values) => onDecide("Rejected", values))}
                  className="!bg-danger hover:!bg-danger"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      <Link to={`/admin/students`} className="text-sm text-brand mt-6 inline-block">
        View all students →
      </Link>
    </div>
  );
}

export default ReviewDetail;
