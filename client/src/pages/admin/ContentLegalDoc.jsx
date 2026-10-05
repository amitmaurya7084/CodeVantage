import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SectionsEditor from "../../components/admin/SectionsEditor";
import { fetchContent } from "../../services/contentService";
import { updateContentBlock } from "../../services/adminContentService";

const LABELS = {
  "legal.privacy": "Privacy Policy",
  "legal.terms": "Terms & Conditions",
  "legal.refundPolicy": "Refund Policy",
  "legal.internshipPolicy": "Internship Policy",
  "legal.certificatePolicy": "Certificate Policy",
};

function ContentLegalDoc() {
  const { key } = useParams();
  const [sections, setSections] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSections(null);
    fetchContent([key])
      .then((data) => setSections(data[key]?.sections || []))
      .catch(() => toast.error("Couldn't load this document."));
  }, [key]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateContentBlock(key, { sections });
      toast.success(`${LABELS[key] || "Document"} updated.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to="/admin/content/legal" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal Pages
      </Link>
      <h1 className="text-2xl font-bold text-navy mb-1">{LABELS[key] || "Legal Document"}</h1>
      <p className="text-muted mb-6">Add, edit, reorder, or remove sections. Changes go live immediately.</p>

      {!sections && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {sections && (
        <Card className="p-6">
          <SectionsEditor sections={sections} onChange={setSections} />
          <Button onClick={handleSave} disabled={isSaving} className="mt-6">
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Document"}
          </Button>
        </Card>
      )}
    </div>
  );
}

export default ContentLegalDoc;
