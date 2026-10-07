import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, RotateCcw, Lock, Plus, X, RefreshCw } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  fetchCertificateTemplateFields,
  updateCertificateTemplateField,
  resetCertificateTemplateField,
  previewCertificateTemplate,
} from "../../services/certificateTemplateService";

// Purely a display grouping for the admin UI — the backend has no concept of
// groups, just a flat list of fields. Order follows the certificate design
// from top to bottom.
const FIELD_GROUPS = [
  { title: "Top Right Tagline (Skills Today...)", fields: ["skillsTodayLine1", "skillsTodayLine2"] },
  { title: "Heading & Certify Line", fields: ["heading", "certifyLabel"] },
  { title: "Completion Description", fields: ["completionDescription"] },
  { title: "Left Side Taglines", fields: ["taglineScript", "learnBuildGrowText"] },
  { title: "Signature", fields: ["signatureScriptText", "signatureFullName", "signatureTitle"] },
  { title: "Seal Badge Text", fields: ["sealBadgeText", "sealSubText1", "sealSubText2"] },
  { title: "Verification Box", fields: ["verifyHeading", "verifyInstructions", "verifyUrl"] },
  { title: "Technology Badges", fields: ["techStack"] },
  { title: "Footer", fields: ["footerTagline"] },
];

const PREVIEW_DEBOUNCE_MS = 900;

// Shared look (taken from the certificate design): white-to-pale-blue card with a fine gold edge.
const CARD_LOOK = "!bg-gradient-to-b from-white to-[#F4F8FF] !border !border-[#E4B95B]/50";

function TextFieldCard({ field, value, onChange, onFieldSaved }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const isDirty = value !== field.fieldValue;

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await updateCertificateTemplateField(field.fieldName, value);
      onFieldSaved(updated);
      toast.success(`${field.label} updated.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      const updated = await resetCertificateTemplateField(field.fieldName);
      onChange(updated.fieldValue);
      onFieldSaved(updated);
      toast.success(`${field.label} reset to default.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't reset.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <Card className={`p-5 ${CARD_LOOK}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-navy text-sm">{field.label}</p>
        {!field.isEditable && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Lock className="h-3 w-3" /> Protected
          </span>
        )}
      </div>

      {field.fieldType === "textarea" ? (
        <textarea
          className="input min-h-[90px]"
          value={value}
          disabled={!field.isEditable}
          maxLength={1000}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input"
          value={value}
          disabled={!field.isEditable}
          maxLength={300}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.isEditable && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button size="md" onClick={handleSave} disabled={!isDirty || isSaving}>
            <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="md" variant="outline" onClick={handleReset} disabled={isResetting}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </Button>
        </div>
      )}
    </Card>
  );
}

function TechStackCard({ field, value: items, onChange, onFieldSaved }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  function updateItem(index, key, val) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: val } : item)));
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    if (items.length >= 10) return;
    onChange([...items, { label: "New Tech", color: "#2563EB" }]);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await updateCertificateTemplateField(field.fieldName, items);
      onFieldSaved(updated);
      toast.success("Technology badges updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      const updated = await resetCertificateTemplateField(field.fieldName);
      onChange(updated.fieldValue);
      onFieldSaved(updated);
      toast.success("Technology badges reset to default.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't reset.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <Card className={`p-5 ${CARD_LOOK}`}>
      <p className="font-semibold text-navy text-sm mb-3">{field.label}</p>

      <div className="space-y-2 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5">
            <input
              type="color"
              value={item.color}
              onChange={(e) => updateItem(i, "color", e.target.value)}
              className="h-9 w-9 rounded border border-slate-200 shrink-0 cursor-pointer"
              aria-label="Badge color"
            />
            <input
              className="input flex-1"
              value={item.label}
              maxLength={40}
              onChange={(e) => updateItem(i, "label", e.target.value)}
            />
            <button onClick={() => removeItem(i)} aria-label="Remove badge" className="shrink-0">
              <X className="h-4 w-4 text-muted hover:text-danger" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="md" variant="outline" onClick={addItem} disabled={items.length >= 10}>
          <Plus className="h-3.5 w-3.5" /> Add badge
        </Button>
        <Button size="md" onClick={handleSave} disabled={isSaving || items.length === 0}>
          <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button size="md" variant="outline" onClick={handleReset} disabled={isResetting}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset to default
        </Button>
      </div>
    </Card>
  );
}

function LivePreviewPanel({ draftValues, refreshToken }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUrlRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!draftValues) return;

    setIsLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = await previewCertificateTemplate(draftValues);
        if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        toast.error("Couldn't refresh the preview.");
      } finally {
        setIsLoading(false);
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftValues, refreshToken]);

  useEffect(() => {
    return () => {
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
    };
  }, []);

  return (
    <Card className="p-4 lg:sticky lg:top-6 !border-2 !border-navy">
      <div className="flex items-center justify-between mb-3">
        <p className="font-serif font-bold text-navy">Live Preview</p>
        {isLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Loader2 className="h-3 w-3 animate-spin" /> Updating...
          </span>
        )}
      </div>
      <p className="text-xs text-muted mb-3">
        Uses placeholder candidate data ("Amit Kumar") so you can see your text changes before saving.
      </p>
      <div className="aspect-[3/2] bg-surface rounded-sm overflow-hidden border-2 border-[#C9962B]">
        {previewUrl ? (
          <iframe title="Certificate preview" src={previewUrl} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
          </div>
        )}
      </div>
    </Card>
  );
}

function CertificateTemplate() {
  const [fields, setFields] = useState(null);
  const [draftValues, setDraftValues] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    fetchCertificateTemplateFields()
      .then((loaded) => {
        setFields(loaded);
        setDraftValues(Object.fromEntries(loaded.map((f) => [f.fieldName, f.fieldValue])));
      })
      .catch(() => toast.error("Couldn't load certificate template content."));
  }, []);

  function handleFieldSaved(updated) {
    setFields((prev) => prev.map((f) => (f.fieldName === updated.fieldName ? updated : f)));
  }

  function handleDraftChange(fieldName, value) {
    setDraftValues((prev) => ({ ...prev, [fieldName]: value }));
  }

  if (!fields || !draftValues) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const byFieldName = new Map(fields.map((f) => [f.fieldName, f]));

  return (
    <div>
      <h1 className="inline-block font-serif text-2xl sm:text-3xl font-bold text-navy mb-2 pb-1 border-b-2 border-[#C9962B]">
        Certificate Template Content
      </h1>
      <p className="text-muted mb-8 max-w-2xl">
        Edit the certificate's text below — changes apply to every certificate generated once saved. The
        logo, border, seal, and overall design are fixed and can't be changed here.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8 min-w-0">
          {FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold text-brand uppercase tracking-[0.25em] mb-3 pb-2 border-b border-[#E4B95B]/60">
                {group.title}
              </h2>
              <div className="space-y-4">
                {group.fields.map((fieldName) => {
                  const field = byFieldName.get(fieldName);
                  if (!field) return null;
                  return field.fieldType === "list" ? (
                    <TechStackCard
                      key={fieldName}
                      field={field}
                      value={draftValues[fieldName]}
                      onChange={(val) => handleDraftChange(fieldName, val)}
                      onFieldSaved={handleFieldSaved}
                    />
                  ) : (
                    <TextFieldCard
                      key={fieldName}
                      field={field}
                      value={draftValues[fieldName]}
                      onChange={(val) => handleDraftChange(fieldName, val)}
                      onFieldSaved={handleFieldSaved}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <LivePreviewPanel draftValues={draftValues} refreshToken={refreshToken} />
          <Button
            size="md"
            variant="outline"
            className="w-full mt-3"
            onClick={() => setRefreshToken((t) => t + 1)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh preview now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CertificateTemplate;
