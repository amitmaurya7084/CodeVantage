import { useEffect, useState } from "react";
import { Loader2, Users, Activity, ClipboardList, CheckCircle2, Wallet, Award } from "lucide-react";
import Card from "../../components/ui/Card";
import { fetchAdminDashboard } from "../../services/adminService";

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-6">
      <Icon className="h-6 w-6 text-brand mb-3" />
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </Card>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminDashboard()
      .then((data) => setStats(data.stats))
      .catch(() => setError("Couldn't load dashboard stats."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Admin Dashboard</h1>
      <p className="text-muted mb-8">Live platform stats, computed directly from the database.</p>

      <div className="grid xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} />
        <StatCard icon={Activity} label="Active Internships" value={stats.activeInternships} />
        <StatCard icon={ClipboardList} label="Pending Reviews" value={stats.pendingReviews} />
        <StatCard icon={CheckCircle2} label="Approved Submissions" value={stats.approvedSubmissions} />
        <StatCard icon={Wallet} label="Completed Payments" value={stats.totalPayments} />
        <StatCard icon={Award} label="Certificates Issued" value={stats.totalCertificates} />
      </div>
    </div>
  );
}

export default Dashboard;
