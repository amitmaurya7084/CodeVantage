import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { trackVisit } from "../../services/analyticsService";

function Layout() {
  const location = useLocation();

  // Records one visit per public-page navigation. Scoped to this layout so
  // only the public site is tracked — the student and admin areas use their
  // own layouts and are never counted here.
  useEffect(() => {
    trackVisit(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
