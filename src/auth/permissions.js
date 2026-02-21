export const PERMISSIONS = {
  USER_CREATE: ["superadmin"],
  USER_EDIT: ["superadmin"],
  USER_DISABLE: ["superadmin"],
  USER_VIEW: ["superadmin", "admin", "creator", "viewer"]
};

export const can = (user, permission) =>
  user && PERMISSIONS[permission]?.includes(user.role);
