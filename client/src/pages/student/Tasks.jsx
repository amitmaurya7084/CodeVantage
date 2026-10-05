import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/student/StatusBadge";
import { fetchMyTasks } from "../../services/taskService";

function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Your Tasks</h1>
      <p className="text-muted mb-8">Complete each project and submit it for review.</p>

      {tasks.length === 0 && <p className="text-muted">No tasks assigned yet.</p>}

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium mb-1">Task {task.order}</p>
              <p className="font-semibold text-navy">{task.title}</p>
              <p className="text-sm text-muted mt-1 line-clamp-1">{task.description}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
              <StatusBadge status={task.status} />
              <Link
                to={`/student/tasks/${task._id}`}
                className="text-brand text-sm font-medium inline-flex items-center gap-1"
              >
                View <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
