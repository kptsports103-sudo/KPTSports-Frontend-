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
       // Direct login for coach/student
       if (role === 'coach') navigate('/dashboard/coach');
       else if (role === 'student') navigate('/dashboard/student');
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
          <label>Email ID *</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email ID" required />

          <label>Password *</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />

          <label>Login Type</label>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
          </select>

          <button disabled={loading} type="submit">
            {loading ? 'Sending OTP...' : 'Login'}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Or</p>
            <SignInButton mode="modal">
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#4285f4',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Sign in with Google
              </button>
            </SignInButton>
          </div>
        </form>
      </div>
    </div>
  );
}
