import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { fetchStudents } from "../../services/adminService";

const certificateStatusOptions = [
  { value: "", label: "All Certificate Statuses" },
  { value: "not_eligible", label: "Not Eligible" },
  { value: "eligible", label: "Eligible" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "generated", label: "Generated" },
];

function Students() {
  const [students, setStudents] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [certificateStatus, setCertificateStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStudents({ search, certificateStatus, page })
        .then((data) => {
          setStudents(data.students);
          setPagination(data.pagination);
        })
        .catch(() => setError("Couldn't load students."));
    }, 300); // debounce search input

    return () => clearTimeout(timeout);
  }, [search, certificateStatus, page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Students</h1>
      <p className="text-muted mb-6">Search and filter every registered student.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="input sm:w-64"
          value={certificateStatus}
          onChange={(e) => {
            setCertificateStatus(e.target.value);
            setPage(1);
          }}
        >
          {certificateStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {!students && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {students && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Certificate</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{s.fullName}</p>
                    <p className="text-muted text-xs">{s.email}</p>
                  </td>
                  <td className="px-4 py-3 text-navy">{s.program?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.internshipStatus === "completed" ? "success" : "brand"}>
                      {s.internshipStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-navy">{s.certificateStatus.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="text-brand inline-flex items-center gap-1 font-medium"
                    >
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No students match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === page ? "bg-brand text-white" : "text-navy hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Students;
