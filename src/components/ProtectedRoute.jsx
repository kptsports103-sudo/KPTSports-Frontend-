import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasRequiredRole } from '../auth/roles';

export default function ProtectedRoute({ role, roles, children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const allowedRoles = Array.isArray(roles)
    ? roles
    : role
    ? [role]
    : [];

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !hasRequiredRole(user.role, allowedRoles)) {
    return <Navigate to="/login" />;
  }

  return children;
}
