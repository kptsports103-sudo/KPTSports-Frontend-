import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../admin.css';

const SuperAdminLayout = ({ children }) => {
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Super Admin Sidebar */}
      <div className="sidebar" style={{ 
        width: isSidebarOpen ? '350px' : '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Profile Section */}
        <div className="profile">
          <img
            src={user?.profileImage || "/avatar.png"}
            alt="Profile"
            style={{ 
              width: '150px', 
              height: '150px', 
              imageRendering: 'auto', 
              borderRadius: '12px', 
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.3)'
            }}
          />
          {/* User Info Table */}
          <div style={{ marginTop: '16px' }}>
            <table style={{ width: '100%', fontSize: '14px', color: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: 'rgba(255,255,255,0.8)', width: '80px' }}>Name:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600 }}>{user?.name || 'Super Admin'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Email:</td>
                  <td style={{ padding: '4px 0', fontSize: '13px' }}>{user?.email}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Role:</td>
                  <td style={{ padding: '4px 0' }}>
                    <span style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: '#ffd700',
                      color: '#000',
                      textTransform: 'uppercase'
                    }}>
                      {user?.role || 'SuperAdmin'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* System Status */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <small style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>System Status</small>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '8px' }}></span>
                <small style={{ color: 'rgba(255,255,255,0.9)' }}>MongoDB Connected</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '8px' }}></span>
                <small style={{ color: 'rgba(255,255,255,0.9)' }}>Cloudinary Connected</small>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Logout
        </button>

        {/* Menu */}
        <div className="menu">
          {superAdminMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.9)',
                padding: '12px 20px',
                borderRadius: '8px',
                margin: '4px 10px',
                transition: 'all 0.3s ease',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '18px' }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ background: '#f8f9fa' }}>
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
