import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import Button from "../ui/Button";
import RichTextEditor from "./RichTextEditor";

function SectionsEditor({ sections, onChange }) {
  function updateSection(index, field, value) {
    const next = [...sections];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function removeSection(index) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function addSection() {
    onChange([...sections, { heading: "New Section", body: "" }]);
  }

  function moveSection(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const next = [...sections];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              className="input flex-1 font-medium"
              value={section.heading}
              onChange={(e) => updateSection(index, "heading", e.target.value)}
              placeholder="Section heading"
            />
            <button
              type="button"
              onClick={() => moveSection(index, -1)}
              disabled={index === 0}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-muted hover:bg-surface disabled:opacity-30 flex-shrink-0"
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moveSection(index, 1)}
              disabled={index === sections.length - 1}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-muted hover:bg-surface disabled:opacity-30 flex-shrink-0"
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-danger/20 text-danger hover:bg-danger/5 flex-shrink-0"
              aria-label="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <RichTextEditor
            value={section.body}
            onChange={(val) => updateSection(index, "body", val)}
            placeholder="Section text"
          />
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addSection}>
        <Plus className="h-4 w-4" /> Add Section
      </Button>
    </div>
  );
}

export default SectionsEditor;
