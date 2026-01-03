// src/utils/auth.js
import { users } from "../data/users";

export function login(email, password) {
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return null;

  localStorage.setItem("user", JSON.stringify(user));
  return user;
}