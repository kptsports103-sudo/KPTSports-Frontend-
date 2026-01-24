import { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { useUser, useClerk } from '@clerk/clerk-react';
import api from '../api/axios';
import { setAccessToken } from './tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const [customUser, setCustomUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCustomUser(JSON.parse(savedUser));
    }
  }, []);

  const user = customUser || (clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    role: "admin" // Default role, can be customized based on metadata
  } : null);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/me');
      const userData = response.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setCustomUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (email, password, role) => {
    console.log('=== FRONTEND LOGIN DEBUG ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);
    console.log('Role:', role);
    console.log('Request data:', { email, password, role });
    
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const data = response.data;
      console.log('Response:', data);
      console.log('Response status:', response.status);
      
      if (data.token) {
        // Direct login
        setAccessToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCustomUser(data.user);
        return { directLogin: true };
      } else {
        // OTP
        return { directLogin: false };
      }
    } catch (error) {
      console.error('=== FRONTEND LOGIN ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle 503 (cold start) gracefully
      if (error.response?.status === 503) {
        const retryAfter = error.response.data?.retryAfter || 5;
        throw new Error(`Server is waking up. Retrying in ${retryAfter} seconds...`);
      }
      
      throw error;
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const data = response.data;
    setAccessToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCustomUser(data.user);
    return data.user;
  }, []);

  const autoLoginFromToken = useCallback((token, user) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCustomUser(user);
  }, []);

  const logout = useCallback(async () => {
    if (clerkUser) {
      await signOut();
    } else {
      localStorage.removeItem('user');
      setCustomUser(null);
    }
  }, [clerkUser, signOut]);

  const value = useMemo(() => ({ user, login, logout, verifyOTP, autoLoginFromToken, refreshUser, isLoaded: clerkLoaded }), [user, login, logout, verifyOTP, autoLoginFromToken, refreshUser, clerkLoaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export { AuthContext };

export default AuthProvider;
