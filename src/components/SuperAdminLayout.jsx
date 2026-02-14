import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import activityLogService from '../services/activityLog.service';
import '../admin.css';

const SuperAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch activity logs when profile is clicked
  const fetchActivityLogs = async () => {
    try {
      setLoadingActivity(true);
      const response = await activityLogService.getMyActivityLogs(10, 1);
      if (response.success) {
        setActivityLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleProfileClick = () => {
    if (!showActivityHistory) {
      fetchActivityLogs();
    }
    setShowActivityHistory(!showActivityHistory);
  };

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
        <div 
          className="profile"
          onClick={handleProfileClick}
          style={{ 
            cursor: 'pointer',
            background: showActivityHistory ? 'rgba(255,255,255,0.1)' : 'transparent'
          }}
        >
          {/* Toggle indicator */}
          <div style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px'
          }}>
            {showActivityHistory ? '▼' : '▶'} {showActivityHistory ? 'Hide Activity' : 'View Activity'}
          </div>
          
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

          {/* Activity History Section */}
          {showActivityHistory && (
            <div style={{
              marginTop: '15px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '13px', 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📋 Admin Activity History
              </h4>
              
              {loadingActivity ? (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Loading...</div>
              ) : activityLogs.length > 0 ? (
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  fontSize: '11px' 
                }}>
                  {activityLogs.map((log, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      marginBottom: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      borderLeft: '3px solid #ffd700'
                    }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        🔹 {log.action}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                        Page: {log.pageName}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '2px' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                  No activity yet
                </div>
              )}
            </div>
          )}

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
