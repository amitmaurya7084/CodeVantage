import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import TaskForm from "../../components/admin/TaskForm";
import { fetchProgramTasksAdmin, createTask, updateTask, deleteTask } from "../../services/adminTaskService";

function ProgramTasks() {
  const { id: programId } = useParams();
  const [tasks, setTasks] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function load() {
    fetchProgramTasksAdmin(programId)
      .then(setTasks)
      .catch(() => toast.error("Couldn't load tasks."));
  }

  useEffect(load, [programId]);

  async function handleCreate(values) {
    try {
      await createTask(programId, values);
      toast.success("Task created.");
      setIsAdding(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't create task.");
    }
  }

  async function handleUpdate(id, values) {
    try {
      await updateTask(id, values);
      toast.success("Task updated.");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update task.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this task permanently? This can't be undone.")) return;
    try {
      await deleteTask(id);
      toast.success("Task deleted.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete task.");
    }
  }

  return (
    <div>
      <Link to="/admin/programs" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Programs
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Manage Tasks</h1>
          <p className="text-muted">Add, edit, or retire this program's project tasks.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 mb-6">
          <p className="font-semibold text-navy mb-4">New Task</p>
          <TaskForm
            nextOrder={tasks ? tasks.length + 1 : 1}
            onSubmit={handleCreate}
            onCancel={() => setIsAdding(false)}
            submitLabel="Create Task"
          />
        </Card>
      )}

      {!tasks && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {tasks && (
        <div className="space-y-4">
          {tasks.map((task) =>
            editingId === task._id ? (
              <Card key={task._id} className="p-6">
                <p className="font-semibold text-navy mb-4">Edit: {task.title}</p>
                <TaskForm
                  initial={task}
                  onSubmit={(values) => handleUpdate(task._id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save Changes"
                />
              </Card>
            ) : (
              <Card key={task._id} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>Task {task.order}</Badge>
                    {!task.isActive && <Badge tone="neutral">Inactive</Badge>}
                  </div>
                  <p className="font-semibold text-navy">{task.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="md" onClick={() => setEditingId(task._id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-danger/20 text-danger hover:bg-danger/5"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            )
          )}
          {tasks.length === 0 && <Card className="p-6 text-center text-muted">No tasks yet.</Card>}
        </div>
      )}
    </div>
  );
}

export default ProgramTasks;
