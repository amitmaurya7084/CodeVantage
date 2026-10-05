import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Save, X, Plus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchContent } from "../../services/contentService";
import { updateContentBlock } from "../../services/adminContentService";

function HeroForm({ initial }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: initial });

  async function onSubmit(values) {
    try {
      await updateContentBlock("home.hero", values);
      toast.success("Hero section updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">Hero Section</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Badge Text</label>
          <input className="input" {...register("badge")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Heading Line 1</label>
            <input className="input" {...register("headingLine1")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Heading Line 2</label>
            <input className="input" {...register("headingLine2")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Heading Line 3 (accent color)</label>
            <input className="input" {...register("headingLine3")} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
          <textarea className="input" rows={3} {...register("description")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Primary Button Text</label>
            <input className="input" {...register("ctaPrimaryText")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Secondary Button Text</label>
            <input className="input" {...register("ctaSecondaryText")} />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Hero Section"}
        </Button>
      </form>
    </Card>
  );
}

function TechToolsForm({ initial }) {
  const [items, setItems] = useState(initial.items || []);
  const [newItem, setNewItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function addItem() {
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setNewItem("");
    }
  }

  function removeItem(item) {
    setItems(items.filter((i) => i !== item));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateContentBlock("home.techTools", { items });
      toast.success("Technologies & Tools updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">Technologies & Tools Strip</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5 bg-surface text-navy text-sm px-3 py-1.5 rounded-full">
            {item}
            <button onClick={() => removeItem(item)} aria-label={`Remove ${item}`}>
              <X className="h-3.5 w-3.5 text-muted hover:text-danger" />
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">No items yet.</p>}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="input"
          placeholder="e.g. React"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
        />
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Technologies List"}
      </Button>
    </Card>
  );
}

function FinalCtaForm({ initial }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: initial });

  async function onSubmit(values) {
    try {
      await updateContentBlock("home.finalCta", values);
      toast.success("Final CTA updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">Final Call-to-Action Banner</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Heading</label>
          <input className="input" {...register("heading")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
          <textarea className="input" rows={2} {...register("description")} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Final CTA"}
        </Button>
      </form>
    </Card>
  );
}

function ContentHomepage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent(["home.hero", "home.techTools", "home.finalCta"])
      .then(setContent)
      .catch(() => toast.error("Couldn't load homepage content."));
  }, []);

  if (!content) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link to="/admin/content" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Content
      </Link>
      <h1 className="text-2xl font-bold text-navy mb-1">Homepage Content</h1>
      <p className="text-muted mb-6">Changes go live on the homepage immediately after saving.</p>

      <div className="space-y-6">
        <HeroForm initial={content["home.hero"] || {}} />
        <TechToolsForm initial={content["home.techTools"] || {}} />
        <FinalCtaForm initial={content["home.finalCta"] || {}} />
      </div>
    </div>
  );
}

export default ContentHomepage;
