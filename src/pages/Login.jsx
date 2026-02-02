import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [loginData, setLoginData] = useState(null);

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const result = await login(email, password, role);
      
      if (result.requiresOTP) {
        setShowOTP(true);
        setLoginData({ email: result.email, role: result.role });
        setErr('OTP sent to your email');
      } else {
        handleLoginSuccess(result.user?.role || role);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const submitOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const result = await verifyOTP(loginData.email, otp);
      handleLoginSuccess(result.user?.role || loginData.role);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userRole) => {
    switch (userRole) {
      case 'creator':
        navigate('/admin/creator-dashboard');
        break;
      case 'superadmin':
        navigate('/admin/super-admin-dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT LOGIN PANEL */}
        <div className="login-left">
          <h2>Sign in</h2>
          
          <p className="back-home">
            <a href="/">← Back to Home</a>
          </p>

          {err && <p className="error-text">{err}</p>}

          {!showOTP ? (
            <form onSubmit={submitLogin}>
              <label>Email ID *</label>
              <input
                type="email"
                placeholder="Enter Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <label>Login Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="creator">Creator</option>
                <option value="superadmin">Super Admin</option>
              </select>

              <button disabled={loading}>
                {loading ? 'Signing in...' : 'Submit'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitOTP}>
              <label>OTP *</label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />

              <button disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT INFO PANEL */}
        <div className="login-right">
          <img src="/KPT 1.png" alt="Government Emblem" className="login-emblem" />
          <h1>Welcome to</h1>
          <h2>Karnataka (Govt.) Polytechnic, Mangalore</h2>
          <p>
            KPT is a leading Government Polytechnic college in Mangaluru,
            dedicated to excellence in technical education and sports.
          </p>

         
        </div>

      </div>
    </div>
  );
}
