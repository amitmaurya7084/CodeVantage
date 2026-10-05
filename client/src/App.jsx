import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import StudentLayout from "./components/student/StudentLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Internships from "./pages/Internships";
import ProgramDetail from "./pages/ProgramDetail";
import HowItWorks from "./pages/HowItWorks";
import Certificates from "./pages/Certificates";
import Verify from "./pages/Verify";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import RefundPolicy from "./pages/legal/RefundPolicy";
import InternshipPolicy from "./pages/legal/InternshipPolicy";
import CertificatePolicy from "./pages/legal/CertificatePolicy";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/student/Dashboard";
import Tasks from "./pages/student/Tasks";
import TaskDetail from "./pages/student/TaskDetail";
import Submissions from "./pages/student/Submissions";
import StudentCertificate from "./pages/student/Certificate";
import Profile from "./pages/student/Profile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminStudentDetail from "./pages/admin/StudentDetail";
import AdminReviews from "./pages/admin/Reviews";
import AdminReviewDetail from "./pages/admin/ReviewDetail";
import AdminPayments from "./pages/admin/Payments";
import AdminCertificates from "./pages/admin/Certificates";
import AdminMediaLibrary from "./pages/admin/MediaLibrary";
import AdminContentHub from "./pages/admin/ContentHub";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminCertificateTemplate from "./pages/admin/CertificateTemplate";
import AdminContentHomepage from "./pages/admin/ContentHomepage";
import AdminPrograms from "./pages/admin/Programs";
import AdminProgramTasks from "./pages/admin/ProgramTasks";
import AdminContentAbout from "./pages/admin/ContentAbout";
import AdminContentContact from "./pages/admin/ContentContact";
import AdminContentLegalHub from "./pages/admin/ContentLegalHub";
import AdminContentLegalDoc from "./pages/admin/ContentLegalDoc";
import AdminFaqs from "./pages/admin/Faqs";
import AdminSettings from "./pages/admin/Settings";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/internships/:slug" element={<ProgramDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:certificateId" element={<Verify />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/internship-policy" element={<InternshipPolicy />} />
        <Route path="/certificate-policy" element={<CertificatePolicy />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Student area — own layout (sidebar), gated behind real student auth */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="certificate" element={<StudentCertificate />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin login is public; everything else under /admin is gated */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/:id" element={<AdminStudentDetail />} />
        <Route path="programs" element={<AdminPrograms />} />
        <Route path="programs/:id/tasks" element={<AdminProgramTasks />} />
        <Route path="submissions" element={<ComingSoon title="All Submissions (see Reviews)" step="the Reviews screen, already live" />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reviews/:id" element={<AdminReviewDetail />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="media" element={<AdminMediaLibrary />} />
        <Route path="content" element={<AdminContentHub />} />
        <Route path="content/homepage" element={<AdminContentHomepage />} />
        <Route path="content/about" element={<AdminContentAbout />} />
        <Route path="content/contact" element={<AdminContentContact />} />
        <Route path="content/legal" element={<AdminContentLegalHub />} />
        <Route path="content/legal/:key" element={<AdminContentLegalDoc />} />
        <Route path="certificate-template" element={<AdminCertificateTemplate />} />
        <Route path="faqs" element={<AdminFaqs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
