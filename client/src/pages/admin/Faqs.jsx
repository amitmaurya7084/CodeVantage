import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import RichTextEditor from "../../components/admin/RichTextEditor";
import { fetchFaqsAdmin, createFaq, updateFaq, deleteFaq } from "../../services/adminFaqService";

function FaqForm({ initial, onSubmit, onCancel, submitLabel }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initial || { question: "", answer: "", isActive: true } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Question</label>
        <input className="input" {...register("question", { required: "Question is required" })} />
        {errors.question && <p className="text-danger text-xs mt-1">{errors.question.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Answer</label>
        <Controller
          name="answer"
          control={control}
          rules={{ required: "Answer is required" }}
          render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
        />
        {errors.answer && <p className="text-danger text-xs mt-1">{errors.answer.message}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" {...register("isActive")} /> Active (visible on site)
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
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

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function Faqs() {
  const [faqs, setFaqs] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function load() {
    fetchFaqsAdmin()
      .then(setFaqs)
      .catch(() => toast.error("Couldn't load FAQs."));
  }

  useEffect(load, []);

  async function handleCreate(values) {
    try {
      await createFaq(values);
      toast.success("FAQ created.");
      setIsAdding(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't create FAQ.");
    }
  }

  async function handleUpdate(id, values) {
    try {
      await updateFaq(id, values);
      toast.success("FAQ updated.");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update FAQ.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this FAQ permanently?")) return;
    try {
      await deleteFaq(id);
      toast.success("FAQ deleted.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete FAQ.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">FAQs</h1>
          <p className="text-muted">Manage the questions shown on the FAQ page and homepage.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 mb-6">
          <p className="font-semibold text-navy mb-4">New FAQ</p>
          <FaqForm onSubmit={handleCreate} onCancel={() => setIsAdding(false)} submitLabel="Create FAQ" />
        </Card>
      )}

      {!faqs && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {faqs && (
        <div className="space-y-4">
          {faqs.map((faq) =>
            editingId === faq._id ? (
              <Card key={faq._id} className="p-6">
                <p className="font-semibold text-navy mb-4">Edit FAQ</p>
                <FaqForm
                  initial={faq}
                  onSubmit={(values) => handleUpdate(faq._id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save Changes"
                />
              </Card>
            ) : (
              <Card key={faq._id} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-navy">{faq.question}</p>
                    {!faq.isActive && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                  <p className="text-sm text-muted line-clamp-2">{stripHtml(faq.answer)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="md" onClick={() => setEditingId(faq._id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-danger/20 text-danger hover:bg-danger/5"
                    aria-label="Delete FAQ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            )
          )}
          {faqs.length === 0 && <Card className="p-6 text-center text-muted">No FAQs yet.</Card>}
        </div>
      )}
    </div>
  );
}

export default Faqs;
