// MainNav.jsx - Phiên bản chữ đậm, sang trọng
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navItems = [
    { path: "/", label: "TRANG CHỦ" },
    { path: "/showtimes", label: "SUẤT CHIẾU" },
    { path: "/movies", label: "PHIM" },
    { path: "/cinema", label: "RẠP" },
    { path: "/pricing", label: "GIÁ VÉ" },
  ];

  return (
    <>
      {/* Desktop Navigation - Chữ to, in hoa */}
      <nav className="hidden md:flex items-center gap-8 lg:gap-12">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative text-[16px] lg:text-[18px] font-bold tracking-wider transition-all duration-300 ${
                isActive
                  ? 'text-[#fc8905]'
                  : 'text-gray-700 hover:text-[#fc8905]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                
                {/* Active indicator - bottom bar */}
                {isActive && (
                  <span 
                    className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[#fc8905] rounded-full"
                    style={{ animation: 'slideIn 0.3s ease-out' }}
                  />
                )}
                
                {/* Active indicator - top dot */}
                {isActive && (
                  <span 
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#fc8905] rounded-full"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-xl z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 text-center py-3 mx-1 text-[14px] font-bold rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#fc8905] text-white shadow-lg'
                    : 'text-gray-500 hover:text-[#fc8905] hover:bg-orange-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <style>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;