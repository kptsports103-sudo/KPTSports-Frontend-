import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SignInButton, useUser } from '@clerk/clerk-react';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitLogin = async (e) => {
   e.preventDefault();
   setLoading(true);
   setErr(null);
   try {
     const result = await login(email, password, role);
     if (result.directLogin) {
       // Direct login for coach/creator
       if (role === 'coach') navigate('/dashboard/coach');
       else if (role === 'creator') navigate('/admin/creator-dashboard');
       else navigate('/');
     } else {
       // OTP for admin
       navigate('/otp-verify', { state: { email, role } });
     }
   } catch (e) {
     setErr(e?.response?.data?.message || 'Login failed');
   } finally { setLoading(false); }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2>Sign in</h2>
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
        <form onSubmit={submitLogin}>
          <label htmlFor="email">Email ID *</label>
          <input type="email" id="email" name="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email ID" required />

          <label htmlFor="password">Password *</label>
          <input type="password" id="password" name="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />

          <label htmlFor="role">Login Type</label>
          <select id="role" name="role" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
          </select>

          <button disabled={loading} type="submit">
            {loading ? 'Sending OTP...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
