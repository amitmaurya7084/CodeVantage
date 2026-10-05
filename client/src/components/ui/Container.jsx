/**
 * Shared page-level wrapper — standardizes max-width + horizontal/vertical
 * padding so every page uses the same spacing rhythm instead of each page
 * re-typing "max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16".
 *
 * Usage:
 *   <Container size="md">...</Container>          // standard content page
 *   <Container size="lg" tight>...</Container>     // wider page, less vertical padding
 *   <Container size="full" padY={false}>...</Container>  // full-bleed section, no vertical padding
 */
const sizes = {
  xs: "max-w-md", // narrow — auth forms
  sm: "max-w-xl", // Register-style forms
  md: "max-w-3xl", // FAQ, Verify, legal-ish content
  lg: "max-w-4xl", // About, Certificates
  xl: "max-w-5xl", // How It Works, dashboards
  "2xl": "max-w-6xl", // Certificates hero/verify layout
  full: "max-w-7xl", // Home, Internships — widest marketing sections
};

function Container({ size = "xl", tight = false, padY = true, className = "", children, ...rest }) {
  const maxWidth = sizes[size] || sizes.xl;
  const vertical = padY ? (tight ? "py-8 sm:py-12" : "py-10 sm:py-16") : "";

  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-10 ${vertical} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default Container;
