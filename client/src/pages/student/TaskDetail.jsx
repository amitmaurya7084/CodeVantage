import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, UploadCloud, Lock } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchTaskById } from "../../services/taskService";
import { submitTask } from "../../services/submissionService";

function TaskDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  function loadTask() {
    fetchTaskById(id)
      .then((res) => {
        setData(res);
        reset({
          githubUrl: res.submission?.githubUrl || "",
          liveUrl: res.submission?.liveUrl || "",
          linkedinUrl: res.submission?.linkedinUrl || "",
          description: res.submission?.description || "",
        });
      })
      .catch((err) => setError(err?.response?.data?.message || "Couldn't load this task."));
  }

  useEffect(loadTask, [id]);

  async function onSubmit(values) {
    try {
      await submitTask(id, values);
      toast.success("Project submitted for review.");
      loadTask();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't submit. Please try again.");
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

  const { task, submission } = data;
  const isLocked = submission?.status === "Approved";

  return (
    <div>
      <Link to="/student/tasks" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Tasks
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div className="min-w-0">
          <Badge className="mb-2">Task {task.order}</Badge>
          <h1 className="text-xl sm:text-2xl font-bold text-navy">{task.title}</h1>
        </div>
        <StatusBadge status={submission?.status || "Not Started"} />
      </div>

      <Card className="p-5 sm:p-6 space-y-6">
        <p className="text-muted">{task.description}</p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-navy mb-2 text-sm">Objectives</p>
            <ul className="text-sm text-muted space-y-1.5">
              {task.objectives?.map((o) => (
                <li key={o} className="flex gap-2">
                  <span className="text-brand">•</span> {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-navy mb-2 text-sm">Requirements</p>
            <ul className="text-sm text-muted space-y-1.5">
              {task.requirements?.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-brand">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {task.technologies?.map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted">
          <span className="font-semibold text-navy">Expected output: </span>
          {task.expectedOutput}
        </p>
      </Card>

      <Card className="p-5 sm:p-6 mt-6">
        <p className="font-semibold text-navy mb-1 flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-brand" />
          {submission ? "Update Your Submission" : "Submit Your Project"}
        </p>

        {submission?.status === "Changes Requested" && (
          <p className="text-sm text-danger bg-danger/5 rounded-lg px-3 py-2 mt-3">
            Changes were requested on your last submission. Update the links below and resubmit.
          </p>
        )}

        {isLocked ? (
          <p className="text-sm text-success bg-success/5 rounded-lg px-3 py-2 mt-3 flex items-center gap-2">
            <Lock className="h-4 w-4" /> This task is approved and locked from further edits.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">GitHub Repository URL</label>
              <input
                className="input"
                placeholder="https://github.com/your-username/project"
                {...register("githubUrl", { required: "GitHub URL is required" })}
              />
              {errors.githubUrl && <p className="text-danger text-xs mt-1">{errors.githubUrl.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Live Project URL</label>
              <input className="input" placeholder="https://your-project.vercel.app" {...register("liveUrl")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">LinkedIn Post URL (optional)</label>
              <input className="input" placeholder="https://linkedin.com/posts/..." {...register("linkedinUrl")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Description (optional)</label>
              <textarea className="input" rows={3} {...register("description")} />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : submission ? "Resubmit Project" : "Submit Project"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default TaskDetail;
