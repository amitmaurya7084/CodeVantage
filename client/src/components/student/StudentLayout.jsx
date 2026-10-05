import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ListChecks, FolderGit2, Award, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useBranding, defaultLogo } from "../../context/BrandingContext";
import Container from "../ui/Container";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/tasks", label: "Tasks", icon: ListChecks },
  { to: "/student/submissions", label: "Submissions", icon: FolderGit2 },
  { to: "/student/certificate", label: "Certificate", icon: Award },
  { to: "/student/profile", label: "Profile", icon: User },
];

function StudentLayout() {
  const { student, logout } = useAuth();
  const { logoUrl, siteName } = useBranding();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3">
        <img src={logoUrl || defaultLogo} alt={siteName} className="h-6 w-auto" />
        <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-navy" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <img src={logoUrl || defaultLogo} alt={siteName} className="h-7 w-auto" />
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          {student?.profilePictureUrl ? (
            <img
              src={student.profilePictureUrl}
              alt={student.fullName}
              className="h-9 w-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm font-bold flex-shrink-0">
              {(student?.fullName || "?")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy truncate">{student?.fullName}</p>
            <p className="text-xs text-muted truncate">{student?.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-brand/10 text-brand" : "text-navy hover:bg-slate-50"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 w-full"
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
        <Container size="xl" tight>
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

export default StudentLayout;
