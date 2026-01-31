import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

import Home from '../pages/Home';

import About from '../pages/About';

import History from '../pages/History';

import Events from '../pages/Events';

import Gallery from '../pages/Gallery';


import Results from '../pages/Results';

import Login from '../pages/Login';

import OTPVerify from '../pages/OTPVerify';

import AdminDashboard from '../pages/Dashboard/AdminDashboard';


import CoachDashboard from '../pages/Dashboard/CoachDashboard';

import CreatorDashboard from '../pages/Dashboard/CreatorDashboard';

import ManageEvents from '../pages/Dashboard/ManageEvents';

import ManageGallery from '../pages/Dashboard/ManageGallery';


import ManageResults from '../pages/Dashboard/ManageResults';

import ManageHome from '../pages/Dashboard/ManageHome';

import UpdatePages from '../pages/UpdatePages';

import ManageAbout from '../pages/Dashboard/ManageAbout';

import ManageHistory from '../pages/Dashboard/ManageHistory';

import Media from '../pages/Dashboard/Media';
import AddMedia from '../pages/Dashboard/AddMedia';

import IAMUsers from '../pages/admin/IAMUsers';
import UsersManage from '../pages/admin/UsersManage';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import CreateUser from '../pages/admin/CreateUser';
import AuditLogs from '../pages/admin/AuditLogs';
import ErrorDashboard from '../pages/admin/ErrorDashboard';
import MediaStats from '../pages/admin/MediaStats';
import LoginActivityPage from '../pages/admin/LoginActivityPage';
import Approvals from '../pages/admin/Approvals';
import AbuseLogs from '../pages/admin/AbuseLogs';

import SportsDashboard from '../pages/SportsDashboard';

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
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/results" element={<Results />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verify" element={<OTPVerify />} />
          <Route path="/sports-dashboard" element={<ProtectedRoute role="admin"><SportsDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/superadmin-dashboard" element={<Navigate to="/admin/super-admin-dashboard" replace />} />
          <Route path="/admin/super-admin-dashboard" element={<ProtectedRoute role="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/creator-dashboard" element={<ProtectedRoute role="creator"><CreatorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/coach" element={<ProtectedRoute role="coach"><CoachDashboard /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute role="admin"><Media /></ProtectedRoute>} />
          <Route path="/admin/add-media" element={<ProtectedRoute role="admin"><AddMedia /></ProtectedRoute>} />
          <Route path="/admin/manage-home" element={<ProtectedRoute role="admin"><ManageHome /></ProtectedRoute>} />
          <Route path="/admin/manage-about" element={<ProtectedRoute role="admin"><ManageAbout /></ProtectedRoute>} />
          <Route path="/admin/manage-history" element={<ProtectedRoute role="admin"><ManageHistory /></ProtectedRoute>} />
          <Route path="/admin/manage-events" element={<ProtectedRoute role="admin"><ManageEvents /></ProtectedRoute>} />
          <Route path="/admin/manage-gallery" element={<ProtectedRoute role="admin"><ManageGallery /></ProtectedRoute>} />
          <Route path="/admin/manage-results" element={<ProtectedRoute role="admin"><ManageResults /></ProtectedRoute>} />
          <Route path="/admin/update-pages" element={<ProtectedRoute role="admin"><UpdatePages /></ProtectedRoute>} />
          <Route path="/admin/iam/users" element={<ProtectedRoute role="admin"><IAMUsers /></ProtectedRoute>} />
          <Route path="/admin/users-manage" element={<ProtectedRoute role="admin"><UsersManage /></ProtectedRoute>} />
          <Route path="/admin/iam/create" element={<ProtectedRoute role="admin"><CreateUser /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute role="admin"><AuditLogs /></ProtectedRoute>} />
          <Route path="/admin/errors" element={<ProtectedRoute role="admin"><ErrorDashboard /></ProtectedRoute>} />
          <Route path="/admin/media-stats" element={<ProtectedRoute role="admin"><MediaStats /></ProtectedRoute>} />
          <Route path="/admin/login-activity" element={<ProtectedRoute role="admin"><LoginActivityPage /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><Approvals /></ProtectedRoute>} />
          <Route path="/admin/abuse-logs" element={<ProtectedRoute role="admin"><AbuseLogs /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAuthPage && !isAdmin && <Footer />}
    </div>
  );
};

export default AppRoutes;