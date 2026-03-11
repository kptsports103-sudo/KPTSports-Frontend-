// src/utils/auth.js
import { users } from "../data/users";
import { setStoredUser } from "../context/tokenStorage";

export function login(email, password) {
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return null;

  setStoredUser(user);
  return user;
}
