import { useState } from "react";
import { useNavigate } from "react-router-dom";
import avatarDefault from "../../../assets/images/avatar.jpg";
import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = async () => {
    try {
      await authApi.logout(); // clear refresh token cookie
    } catch (err) {
      console.warn("Logout API error:", err);
    } finally {
      logout();        // clear Zustand (user + accessToken)
      navigate("/auth");
    }
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Trigger */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src={user?.avatar || avatarDefault}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">
            {user?.full_name || "Admin"}
          </span>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg z-50">

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              <i class="fas fa-sign-out-alt"></i>  Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;