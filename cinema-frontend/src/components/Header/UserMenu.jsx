import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import avatarDefault from "../../assets/images/avatar.jpg";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import "./style/user_menu.css";
import "./style/mobile_responsive.css";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // ⭐ Zustand
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = async () => {
    try {
      await authApi.logout(); // clear refreshToken cookie
    } catch (err) {
      console.warn("Logout API error:", err);
    } finally {
      logout();               // clear Zustand
      navigate("/auth");      // redirect
    }
  };

  /* ======================
     CHƯA LOGIN
  ====================== */
  if (!user) {
    return (
      <NavLink to="/auth" className="login-btn">
        <i className="fas fa-user"></i>
        <span>Đăng nhập</span>
      </NavLink>
    );
  }

  /* ======================
     ĐÃ LOGIN
  ====================== */
  return (
    <div
      className="user-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <div className="user-trigger">
        <img
          src={user.avatar || avatarDefault}
          alt="avatar"
        />
        <span>{user.full_name}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="user-dropdown animate-fade">
          {/* User info */}
          <div className="user-info">
            <img
              src={user.avatar || avatarDefault}
              alt="avatar"
            />
            <p className="name">{user.full_name}</p>
          </div>

          <ul>
            <li>
              <NavLink to="account/profile">
                <i className="fas fa-user"></i>
                <span> Thông tin của tôi</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="account/tickets">
                <i className="fas fa-ticket-alt"></i>
                <span> Vé của tôi</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="account/transactions">
                <i className="far fa-credit-card"></i>
                <span> Lịch sử thanh toán</span>
              </NavLink>
            </li>

            <li className="logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span> Đăng xuất</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
