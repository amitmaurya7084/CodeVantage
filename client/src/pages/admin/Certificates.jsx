import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";
import Card from "../../components/ui/Card";
import { fetchAllCertificates } from "../../services/adminService";

function Certificates() {
  const [certificates, setCertificates] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllCertificates()
      .then((data) => setCertificates(data.certificates))
      .catch(() => setError("Couldn't load certificates."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!certificates) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Certificates</h1>
      <p className="text-muted mb-6">Every certificate issued on the platform.</p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Certificate ID</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Program</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((c) => (
              <tr key={c._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-navy">{c.certificateId}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{c.student?.fullName}</p>
                  <p className="text-muted text-xs">{c.student?.email}</p>
                </td>
                <td className="px-4 py-3 text-navy">{c.program?.name}</td>
                <td className="px-4 py-3 text-muted">{new Date(c.issuedDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/verify/${c.certificateId}`}
                    target="_blank"
                    className="text-brand inline-flex items-center gap-1 font-medium"
                  >
                    Verify <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {certificates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No certificates issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

export default Certificates;
