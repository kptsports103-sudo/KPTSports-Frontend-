import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../admin.css';

const CreatorLayout = ({ children }) => {
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

  const creatorMenuItems = [
    { path: '/admin/creator-dashboard', label: 'Creator Dashboard', icon: '🎨' },
    { path: '/admin/creator-dashboard?tab=players', label: '👥 Players', icon: '👥' },
    { path: '/admin/creator-dashboard?tab=training', label: '📅 Training Schedule', icon: '📅' },
    { path: '/admin/creator-dashboard?tab=performance', label: '📊 Performance Reports', icon: '📊' },
    { path: '/admin/creator-dashboard?tab=attendance', label: '✅ Attendance', icon: '✅' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Creator Sidebar */}
      <div className="sidebar" style={{ 
        width: isSidebarOpen ? '350px' : '60px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
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
                  <td style={{ padding: '4px 0', fontWeight: 600 }}>{user?.name || 'Creator'}</td>
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
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      textTransform: 'uppercase'
                    }}>
                      {user?.role || 'Creator'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
          {creatorMenuItems.map((item) => (
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

export default CreatorLayout;
