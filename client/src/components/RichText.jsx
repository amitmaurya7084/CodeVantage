/**
 * Renders CMS-authored HTML. Safe because the server sanitizes every string
 * in SiteContent.data (see server/utils/sanitizeContent.js) through a strict
 * tag/attribute allowlist before it's ever stored — this component trusts
 * that contract rather than re-sanitizing on every render.
 */
function RichText({ html, className = "" }) {
  if (!html) return null;
  return (
    <div
      className={`max-w-none text-sm leading-relaxed text-muted
        [&_h1]:text-navy [&_h1]:font-bold [&_h1]:text-xl [&_h1]:mt-6 [&_h1]:mb-3
        [&_h2]:text-navy [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-6 [&_h2]:mb-2
        [&_h3]:text-navy [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2
        [&_p]:mb-4 [&_p:last-child]:mb-0
        [&_a]:text-brand [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-dark
        [&_strong]:font-semibold [&_strong]:text-navy
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
        [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted
        [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default RichText;
