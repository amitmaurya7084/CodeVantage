const { DEFAULT_TEMPLATE_CONTENT } = require("../utils/pdfGenerator");

// Human-readable label + UI control type for each editable field.
// Anything with fieldType "list" is edited as a repeatable set of rows in
// the admin UI (currently only the tech-stack badges); everything else is
// a single text or textarea input.
const FIELD_META = {
  heading: { label: "Certificate Heading", fieldType: "text" },
  certifyLabel: { label: "Certify Line (\"This is to certify that\")", fieldType: "text" },
  completionDescription: { label: "Completion Description", fieldType: "textarea" },
  taglineScript: { label: "Script Tagline (\"Turning Ideas into Impact\")", fieldType: "text" },
  learnBuildGrowText: { label: "Learn / Build / Grow Tagline", fieldType: "text" },
  skillsTodayLine1: { label: "Top-Right Tagline — Line 1", fieldType: "text" },
  skillsTodayLine2: { label: "Top-Right Tagline — Line 2", fieldType: "text" },
  signatureScriptText: { label: "Signature (script)", fieldType: "text" },
  signatureFullName: { label: "Signatory Full Name", fieldType: "text" },
  signatureTitle: { label: "Signatory Title / Designation", fieldType: "text" },
  sealBadgeText: { label: "Seal Badge Text", fieldType: "text" },
  sealSubText1: { label: "Seal Sub-text — Line 1", fieldType: "text" },
  sealSubText2: { label: "Seal Sub-text — Line 2", fieldType: "text" },
  verifyHeading: { label: "Verify Box Heading", fieldType: "text" },
  verifyInstructions: { label: "Verify Box Instructions", fieldType: "text" },
  verifyUrl: { label: "Verify URL (display text)", fieldType: "text" },
  footerTagline: { label: "Footer Tagline", fieldType: "text" },
  techStack: { label: "Technology Badges", fieldType: "list" },
};

const certificateTemplateContentRows = Object.entries(DEFAULT_TEMPLATE_CONTENT).map(([fieldName, fieldValue]) => ({
  templateId: "default",
  fieldName,
  fieldValue,
  fieldType: FIELD_META[fieldName]?.fieldType || "text",
  label: FIELD_META[fieldName]?.label || fieldName,
  isEditable: true,
}));

module.exports = { certificateTemplateContentRows };
