import { useForm } from "react-hook-form";
import Button from "../ui/Button";

const LEVELS = ["Beginner Friendly", "Intermediate", "Advanced"];

function ProgramForm({ initial, onSubmit, onCancel, submitLabel }) {
  const defaultValues = {
    name: "",
    slug: "",
    shortDescription: "",
    overview: "",
    durationLabel: "1 Month",
    projectsCount: 3,
    level: "Beginner Friendly",
    format: "Virtual / Project-Based",
    isPopular: false,
    isActive: true,
    displayOrder: 0,
    ...initial,
    technologies: Array.isArray(initial?.technologies) ? initial.technologies.join(", ") : initial?.technologies || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  function handleFormSubmit(values) {
    const technologies =
      typeof values.technologies === "string"
        ? values.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : values.technologies;
    return onSubmit({ ...values, technologies });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Name</label>
          <input className="input" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Slug (URL)</label>
          <input
            className="input"
            placeholder="e.g. web-development"
            {...register("slug", {
              required: "Slug is required",
              pattern: { value: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only" },
            })}
          />
          {errors.slug && <p className="text-danger text-xs mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Short Description</label>
        <textarea
          className="input"
          rows={2}
          {...register("shortDescription", { required: "Short description is required" })}
        />
        {errors.shortDescription && <p className="text-danger text-xs mt-1">{errors.shortDescription.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Full Overview (optional)</label>
        <textarea className="input" rows={3} {...register("overview")} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Duration</label>
          <input className="input" {...register("durationLabel", { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5"># Projects</label>
          <input type="number" min={1} className="input" {...register("projectsCount", { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Level</label>
          <select className="input" {...register("level")}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Format</label>
          <input className="input" {...register("format")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Technologies (comma-separated)</label>
          <input
            className="input"
            placeholder="HTML, CSS, JavaScript"
            {...register("technologies")}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" {...register("isPopular")} /> Mark as "Most Popular"
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" {...register("isActive")} /> Active (visible on site)
        </label>
      </div>

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

export default ProgramForm;
