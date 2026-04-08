// Header.jsx - Component chính
import Logo from "./Logo";
import CinemaDropdown from "./CinemaDropdown";
import MainNav from "./MainNav";
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Logo />
              <CinemaDropdown />
            </div>
            <MainNav />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo />
          <div className="flex items-center gap-2">
            <CinemaDropdown />
            <UserMenu />
          </div>
        </div>
        {/* Mobile Bottom Navigation - sẽ hiển thị ở dưới cùng */}
      </header>
    </>
  );
};

export default Header;