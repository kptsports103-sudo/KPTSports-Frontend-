import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../admin.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isSuperAdmin = user?.role === 'superadmin';
  console.log('Sidebar user:', user);

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/media', label: 'Media Management', icon: '🖼️' },
    { path: '/admin/manage-home', label: 'Manage Home', icon: '🏠' },
    { path: '/admin/manage-about', label: 'Manage About', icon: 'ℹ️' },
    { path: '/admin/manage-history', label: 'Manage History', icon: '📜' },
    { path: '/admin/manage-events', label: 'Manage Events', icon: '📅' },
    { path: '/admin/manage-gallery', label: 'Manage Gallery', icon: '🖼️' },
    { path: '/admin/manage-results', label: 'Manage Results', icon: '🏆' },
  ];

  const superAdminMenuItems = [
    { path: '/admin/super-admin-dashboard', label: 'Super Admin Dashboard', icon: '👑' },
    { path: '/admin/iam/users', label: 'IAM Users', icon: '👥' },
    { path: '/admin/users-manage', label: 'Users Management', icon: '⚙️' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
    { path: '/admin/errors', label: 'Error Dashboard', icon: '🚨' },
    { path: '/admin/media-stats', label: 'Media Stats', icon: '📊' },
    { path: '/admin/login-activity', label: 'Login Activity', icon: '🔐' },
    { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
    { path: '/admin/abuse-logs', label: 'Abuse Logs', icon: '🚫' },
  ];

  const menuItems = isSuperAdmin ? superAdminMenuItems : adminMenuItems;

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: isSidebarOpen ? '350px' : '60px' }}>
        {/* Profile Section */}
        <div className="profile">
          <img
            src={user?.profileImage || "/avatar.png"}
            alt="Profile"
            style={{ width: '150px', height: '150px', imageRendering: 'auto', borderRadius: '12px', objectFit: 'cover' }}
          />
          <h3>{user?.name || 'Admin'}</h3>
          <span>{user?.role || 'Administrator'}</span>
          <p>KPT Sports</p>
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        {/* Menu */}
        <div className="menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <span style={{ marginRight: '10px' }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;