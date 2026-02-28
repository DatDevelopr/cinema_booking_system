import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function ProtectedAdmin({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role_id !== 1) {
    return <Navigate to="/" />;
  }

  return children;
}