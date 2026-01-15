export const PERMISSIONS = {
  USER_CREATE: ["superadmin", "admin", "creator"],
  USER_EDIT: ["superadmin", "admin", "creator"],
  USER_DISABLE: ["superadmin", "admin", "creator"],
  USER_VIEW: ["superadmin", "admin", "creator", "coach"]
};

export const can = (user, permission) =>
  user && PERMISSIONS[permission]?.includes(user.role);