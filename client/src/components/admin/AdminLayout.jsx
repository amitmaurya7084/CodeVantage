import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Layers,
  FolderGit2,
  ClipboardCheck,
  Wallet,
  Award,
  FileSignature,
  Settings,
  Image,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useBranding } from "../../context/BrandingContext";
import Container from "../ui/Container";
import logoIconWhite from "../../assets/logo-icon-white.png";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/content", label: "Website Content", icon: FileText },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/programs", label: "Programs", icon: Layers },
  { to: "/admin/submissions", label: "Submissions", icon: FolderGit2 },
  { to: "/admin/reviews", label: "Reviews", icon: ClipboardCheck },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/certificate-template", label: "Certificate Template", icon: FileSignature },
  { to: "/admin/media", label: "Media Library", icon: Image },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const { siteName } = useBranding();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-navy text-white flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 font-bold">
          <img src={logoIconWhite} alt="" className="h-5 w-5" aria-hidden="true" /> {siteName} Admin
        </span>
        <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy text-slate-300 flex flex-col transition-transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <span className="flex items-center gap-2 font-bold text-white">
            <img src={logoIconWhite} alt="" className="h-6 w-6" aria-hidden="true" /> {siteName} Admin
          </span>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-sm font-semibold text-white truncate">{admin?.fullName}</p>
          <p className="text-xs text-slate-400 truncate">{admin?.role}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <Container size="2xl" tight>
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

export default AdminLayout;
