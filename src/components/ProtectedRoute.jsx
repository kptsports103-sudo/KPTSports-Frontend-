import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasRequiredRole, normalizeRole } from '../auth/roles';

export default function ProtectedRoute({ role, roles, exactRoles, children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const allowedRoles = Array.isArray(roles)
    ? roles
    : role
    ? [role]
    : [];
  const strictlyAllowedRoles = Array.isArray(exactRoles) ? exactRoles : [];

  if (!user) return <Navigate to="/login" replace />;
  if (strictlyAllowedRoles.length > 0) {
    const currentRole = normalizeRole(user.role);
    const normalizedExactRoles = strictlyAllowedRoles.map(normalizeRole);
    if (!normalizedExactRoles.includes(currentRole)) {
      return <Navigate to="/login" replace />;
    }
  }
  if (allowedRoles.length > 0 && !hasRequiredRole(user.role, allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
