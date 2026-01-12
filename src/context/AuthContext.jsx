import { createContext, useContext, useMemo, useCallback, useState } from "react";
import { useUser, useClerk } from '@clerk/clerk-react';
import api from '../api/axios';
import { setAccessToken } from './tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const [customUser, setCustomUser] = useState(null);

  const user = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    role: "admin" // Default role, can be customized based on metadata
  } : customUser;

  const login = useCallback(async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    const data = response.data;
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
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const data = response.data;
    setAccessToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCustomUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    if (clerkUser) {
      await signOut();
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setCustomUser(null);
    }
  }, [clerkUser, signOut]);

  const value = useMemo(() => ({ user, login, logout, verifyOTP, isLoaded: clerkLoaded }), [user, login, logout, verifyOTP, clerkLoaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export { AuthContext };

export default AuthProvider;
