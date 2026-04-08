import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Film,
  MapPin,
  Tags,
  Building2,
  DoorOpen,
  CalendarClock,
  Ticket,
} from "lucide-react";

/* ========================= */
/* MenuGroup Component       */
/* ========================= */
const MenuGroup = ({ title, icon: Icon, isOpen, onToggle, children }) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-3 py-2 rounded hover:bg-slate-700 transition"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} />}
          <span>{title}</span>
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`ml-6 space-y-1 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

/* ========================= */
/* MenuItem Component        */
/* ========================= */
const MenuItem = ({ to, children, onClick, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2 rounded text-sm transition ${
          isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-slate-700 text-gray-300"
        }`
      }
    >
      {children}
    </NavLink>
  );
};

/* ========================= */
/* Sidebar Component         */
/* ========================= */
const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobile = () => setIsMobileOpen(false);

  const isActiveGroup = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex justify-between bg-slate-900 text-white p-4">
        <button onClick={() => setIsMobileOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="font-bold">ADMIN</span>
      </div>

      {/* OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static z-50 top-0 left-0 h-full w-64
          bg-slate-900 text-white flex flex-col
          transform transition-transform duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="p-4 text-xl font-bold border-b border-slate-700 flex justify-between items-center">
          ADMIN
          <button className="md:hidden" onClick={closeMobile}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* DASHBOARD */}
          <MenuGroup
            title="Dashboard"
            icon={LayoutDashboard}
            isOpen={
              openMenu === "dashboard" || isActiveGroup("/admin/dashboard")
            }
            onToggle={() =>
              setOpenMenu(openMenu === "dashboard" ? null : "dashboard")
            }
          >
            <MenuItem to="/admin/dashboard" end onClick={closeMobile}>
              Tổng quan
            </MenuItem>

            <MenuItem to="/admin/dashboard/movie-revenue" onClick={closeMobile}>
              Doanh thu theo phim
            </MenuItem>

            <MenuItem
              to="/admin/dashboard/cinema-revenue"
              onClick={closeMobile}
            >
              Doanh thu theo rạp
            </MenuItem>
          </MenuGroup>

          {/* USERS */}
          <MenuGroup
            title="Quản lý người dùng"
            icon={Users}
            isOpen={openMenu === "users" || isActiveGroup("/admin/users")}
            onToggle={() => setOpenMenu(openMenu === "users" ? null : "users")}
          >
            <MenuItem to="/admin/users" end onClick={closeMobile}>
              Danh sách người dùng
            </MenuItem>

            <MenuItem to="/admin/users/create" onClick={closeMobile}>
              Tạo người dùng
            </MenuItem>
          </MenuGroup>

          {/* MOVIES */}
          <MenuGroup
            title="Quản lý phim"
            icon={Film}
            isOpen={openMenu === "movies" || isActiveGroup("/admin/movies")}
            onToggle={() =>
              setOpenMenu(openMenu === "movies" ? null : "movies")
            }
          >
            <MenuItem to="/admin/movies" end onClick={closeMobile}>
              Danh sách phim
            </MenuItem>

            <MenuItem to="/admin/movies/create" onClick={closeMobile}>
              Tạo phim
            </MenuItem>
          </MenuGroup>

          {/* GENRES */}
          <MenuGroup
            title="Quản lý thể loại"
            icon={Tags}
            isOpen={openMenu === "genres" || isActiveGroup("/admin/categories")}
            onToggle={() =>
              setOpenMenu(openMenu === "genres" ? null : "genres")
            }
          >
            <MenuItem to="/admin/genres" onClick={closeMobile}>
              Danh sách thể loại
            </MenuItem>
          </MenuGroup>
          {/* REGIONS */}
          <MenuGroup
            title="Quản lý khu vực"
            icon={MapPin}
            isOpen={openMenu === "regions" || isActiveGroup("/admin/regions")}
            onToggle={() =>
              setOpenMenu(openMenu === "regions" ? null : "regions")
            }
          >
            <MenuItem to="/admin/regions" end onClick={closeMobile}>
              Danh sách khu vực
            </MenuItem>
          </MenuGroup>
          {/* CINEMAS */}
          <MenuGroup
            title="Quản lý rạp"
            icon={Building2}
            isOpen={openMenu === "cinemas" || isActiveGroup("/admin/cinemas")}
            onToggle={() =>
              setOpenMenu(openMenu === "cinemas" ? null : "cinemas")
            }
          >
            <MenuItem to="/admin/cinemas" end onClick={closeMobile}>
              Danh sách rạp
            </MenuItem>

            <MenuItem to="/admin/cinemas/create" onClick={closeMobile}>
              Tạo rạp
            </MenuItem>
          </MenuGroup>

          {/* ROOMS */}
          <MenuGroup
            title="Quản lý phòng"
            icon={DoorOpen}
            isOpen={openMenu === "rooms" || isActiveGroup("/admin/rooms")}
            onToggle={() => setOpenMenu(openMenu === "rooms" ? null : "rooms")}
          >
            <MenuItem to="/admin/rooms" end onClick={closeMobile}>
              Danh sách phòng
            </MenuItem>

            <MenuItem to="/admin/rooms/create" onClick={closeMobile}>
              Tạo phòng
            </MenuItem>
          </MenuGroup>

          {/* SHOWTIMES */}
          <MenuGroup
            title="Quản lý suất chiếu"
            icon={CalendarClock}
            isOpen={
              openMenu === "showtimes" || isActiveGroup("/admin/showtimes")
            }
            onToggle={() =>
              setOpenMenu(openMenu === "showtimes" ? null : "showtimes")
            }
          >
            <MenuItem to="/admin/showtimes" end onClick={closeMobile}>
              Danh sách suất chiếu
            </MenuItem>

            <MenuItem to="/admin/showtimes/create" onClick={closeMobile}>
              Tạo suất chiếu
            </MenuItem>
          </MenuGroup>

          {/* TICKETS */}
          <MenuGroup
            title="Quản lý vé"
            icon={Ticket}
            isOpen={openMenu === "tickets" || isActiveGroup("/admin/tickets")}
            onToggle={() =>
              setOpenMenu(openMenu === "tickets" ? null : "tickets")
            }
          >
            <MenuItem to="/admin/tickets" onClick={closeMobile}>
              Danh sách vé
            </MenuItem>
          </MenuGroup>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
