import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const GuestRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  if (isAuthLoading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
