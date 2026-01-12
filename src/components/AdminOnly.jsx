import { useAuth } from "../context/AuthContext";

const RequireRole = ({ role, children }) => {
  const { user } = useAuth();
  if (user.role !== role) return null;
  return children;
};

export default RequireRole;