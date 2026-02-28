import Logo from "./Logo";
import CinemaDropdown from "./CinemaDropdown";
import MainNav from "./MainNav";
import UserMenu from "./UserMenu";
import "./style/header.css";
import "./style/mobile_responsive.css"

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">

        <div className="header-left">
          <Logo />
          <CinemaDropdown />
        </div>

        <MainNav />

        <UserMenu />

      </div>
    </header>
  );
};

export default Header;