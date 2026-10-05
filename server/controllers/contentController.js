const { z } = require("zod");
const { SiteContent } = require("../models");
const { sanitizeContentData } = require("../utils/sanitizeContent");

/**
 * GET /api/content — PUBLIC, no auth.
 * ?keys=home.hero,home.techTools fetches just those; omit for everything.
 * Returns a { "key": data } map so pages can destructure directly.
 */
async function getPublicContent(req, res, next) {
  try {
    const { keys } = req.query;
    const requestedKeys = keys ? keys.split(",").map((k) => k.trim()) : null;

    // The SiteContent schema lowercases the `key` field on save (e.g.
    // "settings.upiPayment" is stored as "settings.upipayment"), but every
    // page component requests and indexes content by its original camelCase
    // key (content["settings.upiPayment"]). Querying case-insensitively and
    // then responding under the ORIGINAL requested casing keeps both sides
    // in sync — without this, a camelCase key silently never matches
    // anything and the page just sees `undefined`, even though the data is
    // sitting right there in the database under its lowercased key.
    const query = requestedKeys ? { key: { $in: requestedKeys.map((k) => k.toLowerCase()) } } : {};

    const blocks = await SiteContent.find(query).select("key data");

    const byLowerKey = {};
    blocks.forEach((block) => {
      byLowerKey[block.key] = block.data;
    });

    const content = {};
    if (requestedKeys) {
      requestedKeys.forEach((k) => {
        content[k] = byLowerKey[k.toLowerCase()];
      });
    } else {
      Object.assign(content, byLowerKey);
    }

    res.json({ success: true, content });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/content — every content block, for the CMS editor list */
async function getAllContentAdmin(req, res, next) {
  try {
    const blocks = await SiteContent.find().sort({ group: 1, label: 1 });
    res.json({ success: true, content: blocks });
  } catch (err) {
    next(err);
  }
}

const updateContentSchema = z.object({
  data: z.record(z.any()).refine((val) => Object.keys(val).length > 0, "Content cannot be empty"),
});

/** PUT /api/admin/content/:key — updates one block's data */
async function updateContent(req, res, next) {
  try {
    const parsed = updateContentSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || "Invalid content payload.");
      error.statusCode = 400;
      throw error;
    }

    const existing = await SiteContent.findOne({ key: req.params.key });
    if (!existing) {
      const error = new Error("Content block not found.");
      error.statusCode = 404;
      throw error;
    }

    // Shallow-merge onto the existing block's data instead of a full
    // replace. This is a defense-in-depth safety net: every admin form is
    // expected to send the full set of fields *it* manages, but if two
    // different forms ever save the same key from stale/partial state (as
    // happened with settings.upiPayment — the QR upload and the UPI ID form
    // used to each overwrite the other's field), a field neither form sent
    // in this request is still preserved here rather than silently dropped.
    const existingData =
      existing.data && typeof existing.data === "object" && !Array.isArray(existing.data) ? existing.data : {};
    const mergedData = { ...existingData, ...sanitizeContentData(parsed.data.data) };

    existing.data = mergedData;
    existing.updatedBy = req.admin._id;
    await existing.save();

    res.json({ success: true, message: "Content updated.", content: existing });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicContent, getAllContentAdmin, updateContent };
