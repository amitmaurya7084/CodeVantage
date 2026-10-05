import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import Button from "../ui/Button";
import SearchOverlay from "./SearchOverlay";
import { useAuth } from "../../context/AuthContext";
import { useBranding, defaultLogo } from "../../context/BrandingContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/internships", label: "Internships" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/certificates", label: "Certificates" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, student, logout } = useAuth();
  const { logoUrl, siteName } = useBranding();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b transition-shadow ${
        isScrolled ? "shadow-sm border-slate-200" : "border-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center">
          <img src={logoUrl || defaultLogo} alt={siteName} className="h-8 w-auto" />
        </Link>

        <ul className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-medium text-navy">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `relative py-1 transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-brand after:transition-all after:duration-300 ${
                    isActive ? "text-brand after:w-full" : "hover:text-brand after:w-0 hover:after:w-full"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          <button aria-label="Search" className="text-muted hover:text-navy" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted max-w-[110px] truncate">Hi, {student?.fullName?.split(" ")[0]}</span>
              <Button to="/student/dashboard" variant="outline" size="md">
                Dashboard
              </Button>
              <Button onClick={handleLogout} variant="primary" size="md">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="outline" size="md">
                Login
              </Button>
              <Button to="/register" variant="primary" size="md">
                Apply Now
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-navy"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 px-4 sm:px-6 py-4 bg-white">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex items-center gap-2 text-navy font-medium mb-4"
          >
            <Search className="h-4 w-4" /> Search Internships
          </button>
          <ul className="flex flex-col gap-4 text-navy font-medium mb-4">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "text-brand" : "")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Button to="/student/dashboard" variant="outline" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  variant="primary"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="outline" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Button>
                <Button to="/register" variant="primary" onClick={() => setIsMenuOpen(false)}>
                  Apply Now
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

export default Navbar;
