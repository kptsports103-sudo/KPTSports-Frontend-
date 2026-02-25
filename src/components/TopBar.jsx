import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="top-bar">
      <div className="left">
        {user ? (
          <button onClick={handleLogout} className="logout-link">👤 LOGOUT</button>
        ) : (
          <Link to="/login" className="login-link">👤 LOGIN</Link>
        )}
      </div>

      <div className="right">
        <button onClick={toggleTheme}>🌙 / ☀️</button>
        <button>A-</button>
        <button>A</button>
        <button>A+</button>
      </div>
    </div>
  );
};

export default TopBar;