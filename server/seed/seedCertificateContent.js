// Run with: npm run seed:certificate-content (from /server)
// Upserts the default certificate template content fields. Safe to re-run —
// existing rows are updated in place, not duplicated. The server also does
// this automatically on startup if the collection is empty (see
// utils/ensureDefaultCertificateContent.js); this script is for explicitly
// resetting field values back to their defaults.
require("dotenv").config();
const mongoose = require("mongoose");
const { CertificateTemplateContent } = require("../models");
const { certificateTemplateContentRows } = require("./defaultCertificateContent");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const row of certificateTemplateContentRows) {
    await CertificateTemplateContent.findOneAndUpdate({ templateId: row.templateId, fieldName: row.fieldName }, row, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  console.log(`Upserted ${certificateTemplateContentRows.length} certificate template content fields.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
