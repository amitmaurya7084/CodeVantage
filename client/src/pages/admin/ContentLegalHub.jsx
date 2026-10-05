import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import Card from "../../components/ui/Card";

const legalDocs = [
  { key: "legal.privacy", label: "Privacy Policy" },
  { key: "legal.terms", label: "Terms & Conditions" },
  { key: "legal.refundPolicy", label: "Refund Policy" },
  { key: "legal.internshipPolicy", label: "Internship Policy" },
  { key: "legal.certificatePolicy", label: "Certificate Policy" },
];

function ContentLegalHub() {
  return (
    <div>
      <Link to="/admin/content" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Content
      </Link>
      <h1 className="text-2xl font-bold text-navy mb-1">Legal Pages</h1>
      <p className="text-muted mb-6">Edit the section headings and body text for each legal document.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {legalDocs.map((doc) => (
          <Card key={doc.key} className="p-6 flex items-center justify-between">
            <span className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-brand" />
              <span className="font-medium text-navy">{doc.label}</span>
            </span>
            <Link
              to={`/admin/content/legal/${doc.key}`}
              className="text-brand text-sm font-medium inline-flex items-center gap-1"
            >
              Edit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ContentLegalHub;
