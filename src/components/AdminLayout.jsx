import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../admin.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/manage-home', label: 'Manage Home' },
    { path: '/admin/manage-about', label: 'Manage About' },
    { path: '/admin/manage-history', label: 'Manage History' },
    { path: '/admin/manage-events', label: 'Manage Events' },
    { path: '/admin/manage-gallery', label: 'Manage Gallery' },
    { path: '/admin/manage-results', label: 'Manage Results' },
    { path: '/admin/media', label: 'Media' },
  ];

  return (
    <>
      <aside className="sidebar">
        <div className="profile">
          <img src="/img.jpg" alt="Admin Avatar" />
          <h3>KPT</h3>
          <span>admin (role)</span>
          <p>{user?.email}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        <div className="menu">
          {menuItems.map(item => (
            <div
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <div className="dashboard-container">
          {children}
        </div>
      </main>

      <footer>
        © 2023 KPT Sports. All rights reserved.
      </footer>
    </>
  );
};

export default AdminLayout;