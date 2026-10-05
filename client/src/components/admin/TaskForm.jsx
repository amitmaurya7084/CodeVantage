import { useForm } from "react-hook-form";
import Button from "../ui/Button";

function toLines(arr) {
  return Array.isArray(arr) ? arr.join("\n") : arr || "";
}

function TaskForm({ initial, nextOrder, onSubmit, onCancel, submitLabel }) {
  const defaultValues = {
    order: nextOrder || 1,
    title: "",
    description: "",
    expectedOutput: "",
    isActive: true,
    ...initial,
    objectives: toLines(initial?.objectives),
    requirements: toLines(initial?.requirements),
    technologies: Array.isArray(initial?.technologies) ? initial.technologies.join(", ") : initial?.technologies || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  function handleFormSubmit(values) {
    return onSubmit({
      ...values,
      objectives: values.objectives.split("\n").map((s) => s.trim()).filter(Boolean),
      requirements: values.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      technologies: values.technologies.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Order</label>
          <input type="number" min={1} className="input" {...register("order", { required: true })} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-navy mb-1.5">Title</label>
          <input className="input" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
        <textarea className="input" rows={2} {...register("description", { required: "Description is required" })} />
        {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Objectives (one per line)</label>
          <textarea className="input" rows={4} {...register("objectives")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Requirements (one per line)</label>
          <textarea className="input" rows={4} {...register("requirements")} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Technologies (comma-separated)</label>
        <input className="input" placeholder="HTML, CSS, JavaScript" {...register("technologies")} />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Expected Output</label>
        <textarea className="input" rows={2} {...register("expectedOutput")} />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" {...register("isActive")} /> Active (visible to students)
      </label>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
