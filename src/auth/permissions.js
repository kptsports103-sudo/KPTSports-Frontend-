export const PERMISSIONS = {
  USER_CREATE: ["admin"],
  USER_EDIT: ["admin"],
  USER_DISABLE: ["admin"],
  USER_VIEW: ["admin", "coach"]
};

export const can = (user, permission) =>
  user && PERMISSIONS[permission]?.includes(user.role);