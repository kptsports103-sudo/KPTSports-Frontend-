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

import Achievements from '../pages/Achievements';

import Results from '../pages/Results';

import Login from '../pages/Login';

import OTPVerify from '../pages/OTPVerify';

import AdminDashboard from '../pages/Dashboard/AdminDashboard';

import StudentDashboard from '../pages/Dashboard/StudentDashboard';

import CoachDashboard from '../pages/Dashboard/CoachDashboard';

import ManageEvents from '../pages/Dashboard/ManageEvents';

import ManageGallery from '../pages/Dashboard/ManageGallery';

import ManageAchievements from '../pages/Dashboard/ManageAchievements';

import ManageResults from '../pages/Dashboard/ManageResults';

import ManageHome from '../pages/Dashboard/ManageHome';

import ManageAbout from '../pages/Dashboard/ManageAbout';

import ManageHistory from '../pages/Dashboard/ManageHistory';

import Media from '../pages/Dashboard/Media';
import AddMedia from '../pages/Dashboard/AddMedia';

import SportsDashboard from '../pages/SportsDashboard';

import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
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
    <>
      {!isAuthPage && !isDashboard && <TopBar toggleTheme={toggleTheme} />}
      {!isAuthPage && !isAdmin && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-verify" element={<OTPVerify />} />
        <Route path="/sports-dashboard" element={<ProtectedRoute role="admin"><SportsDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/coach" element={<ProtectedRoute role="coach"><CoachDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/admin/media" element={<ProtectedRoute role="admin"><Media /></ProtectedRoute>} />
        <Route path="/admin/add-media" element={<ProtectedRoute role="admin"><AddMedia /></ProtectedRoute>} />
        <Route path="/admin/manage-home" element={<ProtectedRoute role="admin"><ManageHome /></ProtectedRoute>} />
        <Route path="/admin/manage-about" element={<ProtectedRoute role="admin"><ManageAbout /></ProtectedRoute>} />
        <Route path="/admin/manage-history" element={<ProtectedRoute role="admin"><ManageHistory /></ProtectedRoute>} />
        <Route path="/admin/manage-events" element={<ProtectedRoute role="admin"><ManageEvents /></ProtectedRoute>} />
        <Route path="/admin/manage-gallery" element={<ProtectedRoute role="admin"><ManageGallery /></ProtectedRoute>} />
        <Route path="/admin/manage-achievements" element={<ProtectedRoute role="admin"><ManageAchievements /></ProtectedRoute>} />
        <Route path="/admin/manage-results" element={<ProtectedRoute role="admin"><ManageResults /></ProtectedRoute>} />
      </Routes>

      {!isAuthPage && <Footer />}
    </>
  );
};

export default AppRoutes;