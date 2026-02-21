import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import activityLogService from '../services/activityLog.service';
import '../admin.css';

const AdminLayout = ({ children }) => {
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

  const isSuperAdmin = user?.role === 'superadmin';
  const isCreator = user?.role === 'creator';

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

  const creatorMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/media', label: 'Media Management', icon: '🖼️' },
    { path: '/admin/manage-results', label: 'Manage Results', icon: '🏆' },
  ];

  const menuItems = isSuperAdmin ? superAdminMenuItems : isCreator ? creatorMenuItems : adminMenuItems;

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
        <div 
          onClick={handleProfileClick}
          style={{
            padding: '20px',
            textAlign: 'center',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '20px',
            cursor: 'pointer',
            background: showActivityHistory ? '#f0f9ff' : 'transparent'
          }}
        >
          {/* Toggle indicator */}
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px'
          }}>
            {showActivityHistory ? '▼' : '▶'} {showActivityHistory ? 'Hide Activity' : 'View Activity'}
          </div>
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
                        user?.role === 'creator' ? '#fce7f3' :
                        user?.role === 'viewer' ? '#ecfeff' : '#f3f4f6',
                      color:
                        user?.role === 'admin' ? '#1e40af' :
                        user?.role === 'superadmin' ? '#92400e' :
                        user?.role === 'creator' ? '#9f1239' :
                        user?.role === 'viewer' ? '#155e75' : '#374151',
                      textTransform: 'uppercase'
                    }}>
                      {user?.role}
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
              borderTop: '1px solid #e5e7eb'
            }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '13px', 
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📋 Admin Activity History
              </h4>
              
              {loadingActivity ? (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Loading...</div>
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
                      background: '#f9fafb',
                      borderRadius: '4px',
                      borderLeft: '3px solid #3b82f6'
                    }}>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>
                        🔹 {log.action}
                      </div>
                      <div style={{ color: '#6b7280', marginTop: '2px' }}>
                        Page: {log.pageName}
                      </div>
                      {log.details ? (
                        <div style={{ color: '#4b5563', marginTop: '2px' }}>
                          Changes: {log.details}
                        </div>
                      ) : null}
                      <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                  No activity yet
                </div>
              )}
            </div>
          )}

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
