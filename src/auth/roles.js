export const ROLE_LEVEL = {
  viewer: 1,
  creator: 2,
  admin: 3,
  superadmin: 4,
};

const ROLE_ALIASES = {
  super_admin: "superadmin",
  superadmin: "superadmin",
  admin: "admin",
  creator: "creator",
  viewer: "viewer",
  // Legacy aliases for backward compatibility
  coach: "creator",
  student: "viewer",
  participant: "viewer",
  user: "viewer",
};

export const normalizeRole = (role) => {
  if (!role) return "viewer";
  const safeRole = String(role).trim().toLowerCase();
  return ROLE_ALIASES[safeRole] || safeRole;
};

export const hasRequiredRole = (userRole, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const userLevel = ROLE_LEVEL[normalizeRole(userRole)] || 0;
  return allowedRoles.some((role) => userLevel >= (ROLE_LEVEL[normalizeRole(role)] || 0));
};

