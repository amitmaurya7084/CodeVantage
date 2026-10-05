const { z } = require("zod");
const path = require("path");
const { CertificateTemplateContent } = require("../models");
const { DEFAULT_TEMPLATE_CONTENT, generateCertificatePdf, OUTPUT_DIR } = require("../utils/pdfGenerator");
const { generateVerificationQrCode } = require("../utils/qrCodeGenerator");
const { loadCertificateTemplateContent } = require("../utils/loadCertificateTemplateContent");

const TEMPLATE_ID = "default";

// Keeps the admin UI list in a stable, sensible reading order rather than
// whatever order MongoDB happens to return rows in.
const FIELD_ORDER = Object.keys(DEFAULT_TEMPLATE_CONTENT);

const techStackItemSchema = z.object({
  label: z.string().trim().min(1).max(40),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex value like #2563EB"),
});

// A field's allowed value shape depends on its fieldType, so the request
// body is validated against the schema matching the field being updated.
const valueSchemaByFieldType = {
  text: z.string().trim().min(1, "This field can't be empty").max(300),
  textarea: z.string().trim().min(1, "This field can't be empty").max(1000),
  list: z.array(techStackItemSchema).min(1, "Add at least one item").max(10, "10 items maximum"),
};

/** GET /api/admin/certificate-template — all editable fields, admin-only. */
async function getCertificateTemplateContent(req, res, next) {
  try {
    const rows = await CertificateTemplateContent.find({ templateId: TEMPLATE_ID }).lean();

    const byFieldName = new Map(rows.map((row) => [row.fieldName, row]));
    const ordered = FIELD_ORDER.filter((name) => byFieldName.has(name)).map((name) => byFieldName.get(name));
    // Any row that exists in the DB but isn't in the known default set
    // (shouldn't normally happen) is still returned, appended at the end.
    const extras = rows.filter((row) => !FIELD_ORDER.includes(row.fieldName));

    res.json({ success: true, fields: [...ordered, ...extras] });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/certificate-template/:fieldName — update one field's value. */
async function updateCertificateTemplateField(req, res, next) {
  try {
    const { fieldName } = req.params;

    const existing = await CertificateTemplateContent.findOne({ templateId: TEMPLATE_ID, fieldName });
    if (!existing) {
      const error = new Error("Unknown certificate template field.");
      error.statusCode = 404;
      throw error;
    }

    if (!existing.isEditable) {
      const error = new Error("This field is protected and cannot be edited.");
      error.statusCode = 403;
      throw error;
    }

    const valueSchema = valueSchemaByFieldType[existing.fieldType] || valueSchemaByFieldType.text;
    const parsed = valueSchema.safeParse(req.body?.fieldValue);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid value.");
      error.statusCode = 400;
      throw error;
    }

    existing.fieldValue = parsed.data;
    await existing.save();

    res.json({ success: true, field: existing });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/certificate-template/:fieldName — resets a field back to
 * CodeVantage's original default text. A certificate always needs *some*
 * value for every field, so "delete" here means "clear my customization",
 * not leaving the field blank or removing it from the certificate.
 */
async function resetCertificateTemplateField(req, res, next) {
  try {
    const { fieldName } = req.params;

    const existing = await CertificateTemplateContent.findOne({ templateId: TEMPLATE_ID, fieldName });
    if (!existing) {
      const error = new Error("Unknown certificate template field.");
      error.statusCode = 404;
      throw error;
    }

    if (!existing.isEditable) {
      const error = new Error("This field is protected and cannot be reset.");
      error.statusCode = 403;
      throw error;
    }

    if (!(fieldName in DEFAULT_TEMPLATE_CONTENT)) {
      const error = new Error("No default value exists for this field.");
      error.statusCode = 400;
      throw error;
    }

    existing.fieldValue = DEFAULT_TEMPLATE_CONTENT[fieldName];
    await existing.save();

    res.json({ success: true, field: existing });
  } catch (err) {
    next(err);
  }
}

const PREVIEW_PATH = path.join(OUTPUT_DIR, "_preview.pdf");

/**
 * Validates one incoming preview field against the same shape rules as a
 * real save, but never rejects the whole request — an invalid or
 * mid-edit value (e.g. briefly empty while the admin is retyping) just
 * falls back to that field's current default so the preview keeps
 * rendering something reasonable instead of erroring out while typing.
 */
function sanitizePreviewContent(rawContent) {
  const content = {};
  const source = rawContent && typeof rawContent === "object" ? rawContent : {};

  for (const [fieldName, defaultValue] of Object.entries(DEFAULT_TEMPLATE_CONTENT)) {
    const incoming = source[fieldName];
    let schema;
    if (Array.isArray(defaultValue)) {
      schema = z.array(
        z.object({
          label: z.string().trim().min(1).max(40),
          color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
        })
      ).min(1).max(10);
    } else if (fieldName === "completionDescription") {
      schema = z.string().trim().min(1).max(1000);
    } else {
      schema = z.string().trim().min(1).max(300);
    }

    const parsed = schema.safeParse(incoming);
    content[fieldName] = parsed.success ? parsed.data : defaultValue;
  }

  return content;
}

/**
 * POST /api/admin/certificate-template/preview — admin-only.
 * Renders a real certificate PDF from whatever field values the admin has
 * typed so far (saved or not) plus placeholder candidate data, using the
 * exact same generateCertificatePdf function real certificates use — so the
 * preview can never drift from what students will actually receive.
 */
async function previewCertificateTemplate(req, res, next) {
  try {
    const content = sanitizePreviewContent(req.body?.content);
    const previewCertificateId = "PREVIEW-0001";
    const { qrCodeDataUrl } = await generateVerificationQrCode(previewCertificateId);

    await generateCertificatePdf({
      certificateId: previewCertificateId,
      studentName: "Amit Kumar",
      programName: "Web Development",
      durationLabel: "1 Month",
      completionDate: new Date(),
      qrCodeDataUrl,
      content,
      outputPath: PREVIEW_PATH,
    });

    res.type("application/pdf");
    res.sendFile(PREVIEW_PATH);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/certificate-template/public — PUBLIC, no auth.
 * Powers the marketing site's sample-certificate preview (see the public
 * Certificates page) with the same text real certificates use, so it never
 * drifts out of sync with what the admin has configured. Returns a plain
 * fieldName -> fieldValue map — no isEditable/fieldType/label metadata, since
 * the public page has no use for it.
 */
async function getPublicCertificateTemplateContent(req, res, next) {
  try {
    const content = await loadCertificateTemplateContent();
    res.json({ success: true, content });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCertificateTemplateContent,
  updateCertificateTemplateField,
  resetCertificateTemplateField,
  previewCertificateTemplate,
  getPublicCertificateTemplateContent,
};
