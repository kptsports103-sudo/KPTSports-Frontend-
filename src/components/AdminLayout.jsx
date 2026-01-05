import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../admin.css'; // Import the CSS

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load the CSS dynamically if needed
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/admin.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="topbar">
        <h2>KPT Sports</h2>
        <div className="admin-info">
          <span>{user?.name} (Admin)</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '256px',
          background: 'url("/sidebar.png") no-repeat center center',
          backgroundSize: 'cover',
          color: '#fff',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <img src="/logodb.png" alt="KPT Logo" style={{ width: '64px', height: '64px', marginBottom: '16px' }} />
            <img src="/img.jpg" alt="Admin Avatar" style={{ width: '96px', height: '96px', borderRadius: '50%', marginBottom: '16px', objectFit: 'cover' }} />
            <h6 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>KPT</h6>
            <p style={{ marginBottom: '8px', fontSize: '18px' }}>admin (role)</p>
            <p style={{ fontSize: '16px', color: '#d1d5db', marginBottom: '24px', wordBreak: 'break-all' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-800 transition duration-200 mb-8">
            Logout
          </button>
          <div style={{ flex: 1 }}>
            {[
              { to: '/admin/dashboard', label: 'Dashboard' },
              { to: '/admin/manage-home', label: 'Manage Home' },
              { to: '/admin/manage-about', label: 'Manage About' },
              { to: '/admin/manage-history', label: 'Manage History' },
              { to: '/admin/manage-events', label: 'Manage Events' },
              { to: '/admin/manage-gallery', label: 'Manage Gallery' },
              { to: '/admin/manage-results', label: 'Manage Results' },
              { to: '/admin/media', label: 'Media' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block mt-4 pb-1 border-b border-gray-600 cursor-pointer transition duration-200 text-lg ${
                  location.pathname === item.to ? 'text-white' : 'text-blue-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '20px',
          background: 'url("/db.png") no-repeat center center',
          backgroundSize: 'cover',
          color: 'white'
        }}>
          {children}
        </main>
      </div>

      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#32b009',
        color: 'white',
        textAlign: 'center',
        padding: '10px'
      }}>
        © 2023 KPT Sports. All rights reserved.
      </footer>
    </>
  );
};

export default AdminLayout;