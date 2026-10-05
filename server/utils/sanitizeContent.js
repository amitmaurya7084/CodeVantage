const sanitizeHtml = require("sanitize-html");

const RICH_TEXT_OPTIONS = {
  allowedTags: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "blockquote", "h3", "h4"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  // Force safe link behavior regardless of what the editor produced
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

/**
 * Recursively sanitizes every string value in a CMS content object.
 * SiteContent.data is intentionally free-form (Mixed), so rather than trust
 * each admin form to sanitize correctly, every string is run through the
 * same restricted allowlist here — defense in depth, since this content is
 * later rendered with dangerouslySetInnerHTML on public pages.
 */
function sanitizeContentData(value) {
  if (typeof value === "string") {
    return sanitizeHtml(value, RICH_TEXT_OPTIONS);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeContentData);
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = sanitizeContentData(val);
    }
    return result;
  }
  return value;
}

module.exports = { sanitizeContentData };
