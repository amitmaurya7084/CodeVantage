import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Save, X, Plus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import RichTextEditor from "../../components/admin/RichTextEditor";
import { fetchContent } from "../../services/contentService";
import { updateContentBlock } from "../../services/adminContentService";

function TextBlockForm({ contentKey, label, initial }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: initial });

  async function onSubmit(values) {
    try {
      await updateContentBlock(contentKey, values);
      toast.success(`${label} updated.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">{label}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="text"
          control={control}
          render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
        />
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : `Save ${label}`}
        </Button>
      </form>
    </Card>
  );
}

function ValuesForm({ initial }) {
  const [items, setItems] = useState(initial.items || []);
  const [newItem, setNewItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function addItem() {
    const trimmed = newItem.trim();
    if (trimmed) {
      setItems([...items, trimmed]);
      setNewItem("");
    }
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateContentBlock("about.values", { items });
      toast.success("Values updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">Our Values</p>
      <ul className="space-y-2 mb-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm text-navy bg-surface rounded-lg px-3 py-2">{item}</span>
            <button onClick={() => removeItem(i)} aria-label="Remove value">
              <X className="h-4 w-4 text-muted hover:text-danger" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mb-4">
        <input
          className="input"
          placeholder="e.g. Honesty — no inflated claims"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
        />
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Values"}
      </Button>
    </Card>
  );
}

function ContentAbout() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent(["about.mission", "about.vision", "about.values", "about.whatWeOffer"])
      .then(setContent)
      .catch(() => toast.error("Couldn't load About page content."));
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
      <h1 className="text-2xl font-bold text-navy mb-1">About Page Content</h1>
      <p className="text-muted mb-6">Changes go live on the About page immediately after saving.</p>

      <div className="space-y-6">
        <TextBlockForm contentKey="about.mission" label="Our Mission" initial={content["about.mission"] || {}} />
        <TextBlockForm contentKey="about.vision" label="Our Vision" initial={content["about.vision"] || {}} />
        <ValuesForm initial={content["about.values"] || {}} />
        <TextBlockForm contentKey="about.whatWeOffer" label="What We Offer" initial={content["about.whatWeOffer"] || {}} />
      </div>
    </div>
  );
}

export default ContentAbout;
