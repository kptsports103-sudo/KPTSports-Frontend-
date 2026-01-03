import { createContext, useState, useEffect, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        // User signed in with Clerk (Google)
        handleClerkUser();
      } else {
        // Check for custom login
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      }
      setChecking(false);
    }
  }, [clerkUser, isLoaded]);

  const handleClerkUser = async () => {
    try {
      const token = await getToken();
      // Send token to backend to get or create user
      const response = await api.post('/auth/clerk-login', { token });
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Clerk login error:', error);
    }
  };

  const login = async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    const data = response.data;
    if (data.token) {
      // Direct login for coach/student
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { directLogin: true };
    } else {
      // OTP for admin
      return data; // { message: 'OTP sent...' }
    }
  };

  const verifyOTP = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOTP, logout, checking }}>
      {children}
    </AuthContext.Provider>
  );
}
