import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const result = await login(email, password, role);

      // ✅ Login success → route by role
      switch (role) {
        case 'coach':
          navigate('/dashboard/coach');
          break;
        case 'creator':
          navigate('/admin/creator-dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (e) {
      setErr(e?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2>Sign in</h2>

        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

        <form onSubmit={submitLogin}>
          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password *</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <label>Login Type</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="coach">Coach</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>

          <button disabled={loading} type="submit">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
