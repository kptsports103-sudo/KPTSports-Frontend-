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
        setErr('OTP sent to your email. Please check your inbox.');
      } else {
        // Direct login success - use backend role
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
      // OTP verification successful - use backend role
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
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'superadmin':
        navigate('/admin/super-admin-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2>Sign in</h2>

        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

        {!showOTP ? (
          <form onSubmit={submitLogin}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <label htmlFor="role">Login Type</label>
            <select 
              id="role"
              name="role"
              value={role} 
              onChange={e => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="creator">Creator</option>
              <option value="superadmin">SuperAdmin</option>
            </select>

            <button disabled={loading} type="submit">
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOTP}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">OTP Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the OTP sent to: <strong>{loginData?.email}</strong>
              </p>
            </div>

            <label htmlFor="otp">OTP *</label>
            <input
              id="otp"
              name="otp"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              autoComplete="one-time-code"
              required
              className="mb-4"
            />

            <div className="flex gap-2">
              <button 
                disabled={loading} 
                type="submit"
                className="flex-1"
              >
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp('');
                  setErr(null);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
