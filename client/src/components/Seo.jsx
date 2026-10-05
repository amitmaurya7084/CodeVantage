import { Helmet } from "react-helmet-async";

const SITE_NAME = "CodeVantage";
const DEFAULT_DESCRIPTION =
  "Project-based virtual internship programs with real projects, expert review, and a QR-verifiable Certificate of Internship Completion.";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://codevantage.in";

function Seo({ title, description = DEFAULT_DESCRIPTION, path = "" }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Build Skills. Create Projects. Get Certified.`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImageUrl = `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
    </Helmet>
  );
}

export default Seo;
