import { createContext, useContext, useEffect, useState } from "react";
import { fetchContent } from "../services/contentService";
import defaultLogo from "../assets/logo-color.png";

const DEFAULTS = {
  siteName: "CodeVantage",
  tagline: "Build Skills. Create Projects. Get Certified.",
  topBarText: "Project-Based Learning • Real Skills • Recognized Certificates",
  logoUrl: null, // null means "use the bundled default logo image"
};

const BrandingContext = createContext(DEFAULTS);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULTS);

  useEffect(() => {
    fetchContent(["settings.branding", "settings.logo"])
      .then((data) => {
        const brandingData = data["settings.branding"];
        const logoData = data["settings.logo"];
        setBranding((prev) => ({
          siteName: brandingData?.siteName || prev.siteName,
          tagline: brandingData?.tagline || prev.tagline,
          topBarText: brandingData?.topBarText || prev.topBarText,
          logoUrl: logoData?.url || null,
        }));
      })
      .catch(() => {
        // Keep defaults — branding should never block the app from rendering.
      });
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}

export { defaultLogo };
