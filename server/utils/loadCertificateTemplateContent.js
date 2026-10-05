const { CertificateTemplateContent } = require("../models");
const { DEFAULT_TEMPLATE_CONTENT } = require("./pdfGenerator");

/**
 * Builds the `content` object generateCertificatePdf expects, by starting
 * from the template's hardcoded defaults and layering the admin's saved
 * values on top. Any field an admin hasn't touched yet (or that's somehow
 * missing from the DB) simply keeps its default — a certificate is never
 * generated with a blank field. Shared by certificate generation and the
 * admin live-preview endpoint so both always render from the same content.
 */
async function loadCertificateTemplateContent(templateId = "default") {
  const rows = await CertificateTemplateContent.find({ templateId }).lean();

  const content = { ...DEFAULT_TEMPLATE_CONTENT };
  for (const row of rows) {
    content[row.fieldName] = row.fieldValue;
  }
  return content;
}

module.exports = { loadCertificateTemplateContent };
