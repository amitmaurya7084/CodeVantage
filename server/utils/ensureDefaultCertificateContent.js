const { CertificateTemplateContent } = require("../models");
const { certificateTemplateContentRows } = require("../seed/defaultCertificateContent");

/**
 * Safety net for the Certificate Template Content Management admin page,
 * same reasoning as ensureDefaultContent.js: if this collection is empty
 * (fresh database, or the seed script was never run), the certificate would
 * otherwise fall back to pdfGenerator.js's hardcoded defaults with no way
 * for the admin to see or edit them as "content" yet. Called once after the
 * DB connects; a no-op once seeded, so it's safe to leave in permanently.
 */
async function ensureDefaultCertificateContent() {
  try {
    const existingCount = await CertificateTemplateContent.countDocuments();
    if (existingCount > 0) return;

    for (const row of certificateTemplateContentRows) {
      await CertificateTemplateContent.findOneAndUpdate({ templateId: row.templateId, fieldName: row.fieldName }, row, {
        upsert: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log(`Auto-seeded ${certificateTemplateContentRows.length} certificate template content fields.`);
  } catch (err) {
    // Non-fatal — certificate generation still works from pdfGenerator.js's
    // own hardcoded defaults even if this seed step fails.
    console.error("Auto-seed of certificate template content failed:", err.message);
  }
}

module.exports = ensureDefaultCertificateContent;
