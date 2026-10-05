const { SiteContent } = require("../models");
const { contentBlocks } = require("../seed/defaultContent");

/**
 * Safety net for the Website Content Management admin pages: if the
 * SiteContent collection is empty (fresh database, or someone forgot to run
 * `npm run seed:content`), the Homepage/About/Contact/Legal admin editors
 * would otherwise crash on load because they expect each content key to
 * already exist. Called once after the DB connects; a no-op once content
 * has been seeded, so it's safe to leave in permanently.
 *
 * Also handles the incremental case: when a later update to the codebase
 * adds a brand-new key to `contentBlocks` (e.g. "settings.upiPayment") but
 * the DB already has other content in it, we add just that missing key —
 * never touch or overwrite keys that already exist, since an admin may have
 * already edited their data.
 */
async function ensureDefaultContent() {
  try {
    const existingCount = await SiteContent.countDocuments();

    if (existingCount === 0) {
      for (const block of contentBlocks) {
        await SiteContent.findOneAndUpdate({ key: block.key }, block, {
          upsert: true,
          setDefaultsOnInsert: true,
        });
      }
      console.log(`Auto-seeded ${contentBlocks.length} default content blocks (SiteContent was empty).`);
      return;
    }

    // `key` is lowercased by the schema before it's ever written to the DB
    // (see models/SiteContent.js), so "home.techTools" is stored as
    // "home.techtools". Compare lowercased on both sides here — otherwise a
    // camelCase key from `contentBlocks` never matches its already-existing
    // lowercased DB entry, gets treated as "missing", and insertMany() then
    // throws a duplicate-key error trying to insert it again.
    const existingKeys = new Set((await SiteContent.find().select("key")).map((b) => b.key.toLowerCase()));
    const missingBlocks = contentBlocks.filter((b) => !existingKeys.has(b.key.toLowerCase()));
    if (missingBlocks.length === 0) return;

    await SiteContent.insertMany(missingBlocks);
    console.log(`Added ${missingBlocks.length} new default content block(s): ${missingBlocks.map((b) => b.key).join(", ")}`);
  } catch (err) {
    // Non-fatal — the admin CMS pages still handle a missing key gracefully.
    console.error("Auto-seed of default content failed:", err.message);
  }
}

module.exports = ensureDefaultContent;
