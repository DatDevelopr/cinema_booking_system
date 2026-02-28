import { NavLink } from "react-router-dom";
import "./style/main_nav.css";
import "./style/mobile_responsive.css"

const Navbar = () => {
  return (
    <nav className="navbar">

      <NavLink to="/showtimes">Suất chiếu</NavLink>
      <NavLink to="/movies">Phim</NavLink>
      <NavLink to="/cinema">Rạp</NavLink>
      <NavLink to="/pricing">Giá Vé</NavLink>

    </nav>
  );
};

export default Navbar;