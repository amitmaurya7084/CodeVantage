import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Instagram, Youtube, Twitter } from "lucide-react";
import logoIconWhite from "../../assets/logo-icon-white.png";
import { fetchContent } from "../../services/contentService";
import { useBranding } from "../../context/BrandingContext";

const columns = [
  {
    title: "Quick Links",
    links: [
      { to: "/", label: "Home" },
      { to: "/internships", label: "Internships" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/certificates", label: "Certificates" },
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/verify", label: "Verify Certificate" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/refund-policy", label: "Refund Policy" },
      { to: "/internship-policy", label: "Internship Policy" },
      { to: "/certificate-policy", label: "Certificate Policy" },
      { to: "/admin/login", label: "Admin Login" },
    ],
  },
];

function Footer() {
  const { siteName, tagline } = useBranding();
  const [contactInfo, setContactInfo] = useState({
    supportEmail: "support@codevantage.in",
    phone: "",
    address: "",
    social: {},
  });

  useEffect(() => {
    fetchContent(["contact.info"])
      .then((data) => {
        if (data["contact.info"]) setContactInfo(data["contact.info"]);
      })
      .catch(() => {
        // Keep default.
      });
  }, []);

  return (
    <footer className="bg-navy text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 sm:gap-x-8 gap-y-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-1.5">
            <img src={logoIconWhite} alt="" className="h-7 w-7" aria-hidden="true" />
            <p className="text-white font-bold text-xl">{siteName}</p>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            {tagline} A project-based virtual internship platform for aspiring developers.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href={contactInfo.social?.linkedin || "#"} aria-label="LinkedIn" className="hover:text-cyan">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href={contactInfo.social?.instagram || "#"} aria-label="Instagram" className="hover:text-cyan">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={contactInfo.social?.youtube || "#"} aria-label="YouTube" className="hover:text-cyan">
              <Youtube className="h-4 w-4" />
            </a>
            <a href={contactInfo.social?.twitter || "#"} aria-label="Twitter" className="hover:text-cyan">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-white font-semibold mb-1.5 text-sm">{col.title}</p>
            <ul className="space-y-1 text-sm">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-cyan">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-white font-semibold mb-1.5 text-sm">Contact Us</p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{contactInfo.supportEmail}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{contactInfo.phone || "7347760836"}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{contactInfo.address || "Noida, Uttar Pradesh, India"}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 sm:px-6 lg:px-10 py-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1 max-w-7xl mx-auto text-center sm:text-left">
        <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p>{tagline}</p>
      </div>
    </footer>
  );
}

export default Footer;
