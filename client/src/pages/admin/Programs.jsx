import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ProgramForm from "../../components/admin/ProgramForm";
import { fetchProgramsAdmin, createProgram, updateProgram, deleteProgram } from "../../services/adminProgramService";

function Programs() {
  const [programs, setPrograms] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function load() {
    fetchProgramsAdmin()
      .then(setPrograms)
      .catch(() => toast.error("Couldn't load programs."));
  }

  useEffect(load, []);

  async function handleCreate(values) {
    try {
      await createProgram(values);
      toast.success("Program created.");
      setIsAdding(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't create program.");
    }
  }

  async function handleUpdate(id, values) {
    try {
      await updateProgram(id, values);
      toast.success("Program updated.");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update program.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this program permanently? This can't be undone.")) return;
    try {
      await deleteProgram(id);
      toast.success("Program deleted.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete program.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Programs</h1>
          <p className="text-muted">Add, edit, or retire internship programs.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" /> Add Program
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-5 sm:p-6 mb-6">
          <p className="font-semibold text-navy mb-4">New Program</p>
          <ProgramForm onSubmit={handleCreate} onCancel={() => setIsAdding(false)} submitLabel="Create Program" />
        </Card>
      )}

      {!programs && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {programs && (
        <div className="space-y-4">
          {programs.map((program) =>
            editingId === program._id ? (
              <Card key={program._id} className="p-6">
                <p className="font-semibold text-navy mb-4">Edit: {program.name}</p>
                <ProgramForm
                  initial={program}
                  onSubmit={(values) => handleUpdate(program._id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save Changes"
                />
              </Card>
            ) : (
              <Card key={program._id} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-navy">{program.name}</p>
                    {program.isPopular && <Badge tone="brand">Most Popular</Badge>}
                    {!program.isActive && <Badge tone="neutral">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted">
                    /{program.slug} · {program.durationLabel} · {program.projectsCount} projects
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/programs/${program._id}/tasks`}>
                    <Button variant="outline" size="md">
                      <ListChecks className="h-4 w-4" /> Tasks
                    </Button>
                  </Link>
                  <Button variant="outline" size="md" onClick={() => setEditingId(program._id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => handleDelete(program._id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-danger/20 text-danger hover:bg-danger/5"
                    aria-label="Delete program"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Programs;
