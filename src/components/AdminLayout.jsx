import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../admin.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Refresh user data to get latest profileImage from Cloudinary
    if (user) {
      refreshUser();
    }
  }, []);

  const isSuperAdmin = user?.role === 'superadmin';

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users-manage', label: 'Users Management', icon: '⚙️' },
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '350px' }}>
        
        {/* Profile Section */}
        <div style={{
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          {/* Avatar */}
          <img
            src={user?.profileImage || '/avatar.png'}
            alt="Profile"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: '2px solid #e5e7eb',
              marginBottom: '15px'
            }}
          />

          {/* User Info Table */}
          <div style={{ textAlign: 'left', marginTop: '15px' }}>
            <table style={{ width: '100%', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: '#6b7280', width: '80px' }}>Name:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600 }}>{user?.name || 'Admin'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: '#6b7280' }}>Email:</td>
                  <td style={{ padding: '4px 0', fontSize: '13px' }}>{user?.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: '#6b7280' }}>Role:</td>
                  <td style={{ padding: '4px 0' }}>
                    <span style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background:
                        user?.role === 'admin' ? '#dbeafe' :
                        user?.role === 'superadmin' ? '#fef3c7' :
                        user?.role === 'creator' ? '#fce7f3' : '#f3f4f6',
                      color:
                        user?.role === 'admin' ? '#1e40af' :
                        user?.role === 'superadmin' ? '#92400e' :
                        user?.role === 'creator' ? '#9f1239' : '#374151',
                      textTransform: 'uppercase'
                    }}>
                      {user?.role}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* System Status */}
          <div style={{ textAlign: 'left', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <small style={{ color: '#6b7280', fontWeight: 500 }}>System Status</small>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '8px' }}></span>
                <small>MongoDB Connected</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '8px' }}></span>
                <small>Cloudinary Connected</small>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>

        {/* Menu */}
        <div className="menu">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span style={{ marginRight: 10 }}>{item.icon}</span>
              {isSidebarOpen && item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default AdminLayout;