// UserMenu.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import avatarDefault from "../../assets/images/avatar.jpg";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { 
  User, 
  Ticket, 
  CreditCard, 
  LogOut, 
  ChevronDown,
  Menu,
  X
} from "lucide-react";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout API error:", err);
    } finally {
      logout();
      navigate("/auth");
    }
  };

  const menuItems = [
    { path: "account/profile", label: "Thông tin của tôi", icon: User },
    { path: "account/tickets", label: "Vé của tôi", icon: Ticket },
    { path: "account/transactions", label: "Lịch sử thanh toán", icon: CreditCard },
  ];

  if (!user) {
    return (
      <NavLink 
        to="/auth" 
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-orange-500 text-white hover:bg-orange-600"
      >
        <User size={16} />
        <span className="hidden sm:inline">Đăng nhập</span>
      </NavLink>
    );
  }

  return (
    <>
      {/* Desktop Dropdown */}
      <div 
        className="hidden md:block relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-orange-50 transition-all duration-200">
          <img
            src={user.avatar || avatarDefault}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
          />
          <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
            {user.full_name}
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || avatarDefault}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            <ul className="py-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
              <li className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden animate-slideRight overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || avatarDefault}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="py-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
              <li className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </li>
            </ul>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideRight { animation: slideRight 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default UserMenu;