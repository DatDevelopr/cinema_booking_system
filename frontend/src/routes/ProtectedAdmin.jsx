import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function ProtectedAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  // đợi auth load xong
  if (isAuthLoading) {
    return null;
  }

  if (!user || user.role_id !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
}