import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ role, children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log('ProtectedRoute user:', user, 'role:', role);

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
}
