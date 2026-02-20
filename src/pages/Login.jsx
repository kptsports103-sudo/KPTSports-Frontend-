import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const result = await login(email, password);
      
      if (result.requiresOTP) {
        setShowOTP(true);
        setLoginData({ email: result.email, role: result.role });
        setErr('OTP sent to your email');
      } else {
        handleLoginSuccess(result.user?.role);
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
      handleLoginSuccess(result.role || loginData?.role);
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
          <img src="/KPT 1.png" alt="KPT Logo" className="login-left-logo" />
          <h2>Sign in</h2>
          
          <p className="back-home">
            <a href="/">← Back to Home</a>
          </p>

          {err && <p className="error-text">{err}</p>}

          {!showOTP ? (
            <form onSubmit={submitLogin}>
              <label htmlFor="login-email">Email Address *</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="login-password">Password *</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <p className="otp-hint">We'll send a 6-digit code to your email for verification</p>

              <button disabled={loading}>
                {loading ? 'Signing in...' : 'Submit'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitOTP}>
              <label htmlFor="login-otp">OTP *</label>
              <input
                id="login-otp"
                name="otp"
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
