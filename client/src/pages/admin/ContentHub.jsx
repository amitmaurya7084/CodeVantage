import { Link } from "react-router-dom";
import { Home, Info, Mail, FileText, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";

const sections = [
  {
    to: "/admin/content/homepage",
    icon: Home,
    title: "Homepage",
    description: "Hero section, technologies strip, and final call-to-action.",
  },
  {
    to: "/admin/content/about",
    icon: Info,
    title: "About Page",
    description: "Mission, vision, values, and what we offer.",
  },
  {
    to: "/admin/content/contact",
    icon: Mail,
    title: "Contact Info",
    description: "Support email, phone, address, and social links — used sitewide.",
  },
  {
    to: "/admin/content/legal",
    icon: FileText,
    title: "Legal Pages",
    description: "Privacy, Terms, Refund, Internship, and Certificate policies.",
  },
];

function ContentHub() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Website Content</h1>
      <p className="text-muted mb-6">Edit the text shown on public pages without touching code.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="p-6">
            <section.icon className="h-7 w-7 text-brand mb-3" />
            <p className="font-semibold text-navy mb-1">{section.title}</p>
            <p className="text-sm text-muted mb-4">{section.description}</p>
            <Link to={section.to} className="text-brand text-sm font-medium inline-flex items-center gap-1">
              Edit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ContentHub;
