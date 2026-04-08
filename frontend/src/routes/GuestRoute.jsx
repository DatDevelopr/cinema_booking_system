import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const GuestRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) return null;

  if (user) {
    if (user.role_id === 1) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;