import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function ProtectedUser({ children }) {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  // đợi auth load xong
  if (isAuthLoading) {
    return null;
  }

  // nếu là admin thì chuyển sang trang admin
  if (user && user.role_id === 1) {
    return <Navigate to="/admin" replace />;
  }

  // user thường hoặc chưa đăng nhập vẫn vào được
  return children;
}