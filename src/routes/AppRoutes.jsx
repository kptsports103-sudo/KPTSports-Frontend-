import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

import Home from '../pages/Home';

import About from '../pages/About';

import History from '../pages/History';

import Events from '../pages/Events';
import AnnualSportsCelebration from '../pages/AnnualSportsCelebration';

import Gallery from '../pages/Gallery';


import Results from '../pages/Results';

import Login from '../pages/Login';

import OTPVerify from '../pages/OTPVerify';

import AdminDashboard from '../pages/admin/AdminDashboard';


import CoachDashboard from '../components/Creator/CoachDashboard';

import CreatorDashboard from '../components/Creator/CreatorDashboard';

import ManageEvents from '../pages/admin/ManageEvents';

import ManageGallery from '../pages/admin/ManageGallery';


import ManageResults from '../pages/admin/ManageResults';
import SportsMeetRegistrations from '../pages/admin/SportsMeetRegistrations';

import ManageHome from '../pages/admin/ManageHome';

import UpdatePages from '../pages/admin/UpdatePages';
import UpdateDetails from '../pages/admin/UpdateDetails';

import ManageAbout from '../pages/admin/ManageAbout';

import ManageHistory from '../pages/admin/ManageHistory';

import Media from '../pages/admin/Media';
import AddMedia from '../pages/admin/AddMedia';

import IAMUsers from '../pages/super-admin/IAMUsers';
import UsersManage from '../pages/admin/UsersManage';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import CreateUser from '../pages/super-admin/CreateUser';
import AuditLogs from '../pages/super-admin/AuditLogs';
import ErrorDashboard from '../pages/super-admin/ErrorDashboard';
import MediaStats from '../pages/super-admin/MediaStats';
import LoginActivityPage from '../pages/super-admin/LoginActivityPage';
import Approvals from '../pages/super-admin/Approvals';
import AbuseLogs from '../pages/super-admin/AbuseLogs';

import SportsDashboard from '../pages/SportsDashboard';
import VerifyCertificate from '../pages/VerifyCertificate';

import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/otp-verify';
  const isAdmin = location.pathname.startsWith('/admin');
  const isDashboard = location.pathname.startsWith('/dashboard') || isAdmin;

  return (
    <div className="app-wrapper">
      {!isAuthPage && !isDashboard && <TopBar toggleTheme={toggleTheme} />}
      {!isAuthPage && !isAdmin && <Navbar />}

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<History />} />
          <Route path="/events" element={<Events />} />
          <Route path="/sports-celebration" element={<AnnualSportsCelebration />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/results" element={<Results />} />
          <Route path="/verify/:id" element={<VerifyCertificate />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verify" element={<OTPVerify />} />
          <Route path="/sports-dashboard" element={<ProtectedRoute roles={["admin", "superadmin"]}><SportsDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/superadmin-dashboard" element={<Navigate to="/admin/super-admin-dashboard" replace />} />
          <Route path="/admin/super-admin-dashboard" element={<ProtectedRoute role="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/creator-dashboard" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><CreatorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/coach" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><CoachDashboard /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><Media /></ProtectedRoute>} />
          <Route path="/admin/add-media" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><AddMedia /></ProtectedRoute>} />
          <Route path="/admin/manage-home" element={<ProtectedRoute role="admin"><ManageHome /></ProtectedRoute>} />
          <Route path="/admin/manage-about" element={<ProtectedRoute role="admin"><ManageAbout /></ProtectedRoute>} />
          <Route path="/admin/manage-history" element={<ProtectedRoute role="admin"><ManageHistory /></ProtectedRoute>} />
          <Route path="/admin/manage-events" element={<ProtectedRoute role="admin"><ManageEvents /></ProtectedRoute>} />
          <Route path="/admin/manage-gallery" element={<ProtectedRoute role="admin"><ManageGallery /></ProtectedRoute>} />
          <Route path="/admin/manage-results" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><ManageResults /></ProtectedRoute>} />
          <Route path="/admin/sports-meet-registrations" element={<ProtectedRoute roles={["creator", "admin", "superadmin"]}><SportsMeetRegistrations /></ProtectedRoute>} />
          <Route path="/admin/update-pages" element={<ProtectedRoute role="admin"><UpdatePages /></ProtectedRoute>} />
          <Route path="/admin/update-details/:pageName" element={<ProtectedRoute role="admin"><UpdateDetails /></ProtectedRoute>} />
          <Route path="/admin/iam/users" element={<ProtectedRoute role="superadmin"><IAMUsers /></ProtectedRoute>} />
          <Route path="/admin/users-manage" element={<ProtectedRoute exactRoles={["superadmin", "admin", "creator"]}><UsersManage /></ProtectedRoute>} />
          <Route path="/admin/iam/create" element={<ProtectedRoute role="superadmin"><CreateUser /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute role="superadmin"><AuditLogs /></ProtectedRoute>} />
          <Route path="/admin/errors" element={<ProtectedRoute role="superadmin"><ErrorDashboard /></ProtectedRoute>} />
          <Route path="/admin/media-stats" element={<ProtectedRoute roles={["admin", "superadmin"]}><MediaStats /></ProtectedRoute>} />
          <Route path="/admin/login-activity" element={<ProtectedRoute role="superadmin"><LoginActivityPage /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute role="superadmin"><Approvals /></ProtectedRoute>} />
          <Route path="/admin/abuse-logs" element={<ProtectedRoute role="superadmin"><AbuseLogs /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAuthPage && !isAdmin && <Footer />}
    </div>
  );
};

export default AppRoutes;


