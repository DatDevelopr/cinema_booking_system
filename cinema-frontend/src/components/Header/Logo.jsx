import logo from '../../assets/images/logo_cinema.png';
import "./style/logo.css";
import "./style/mobile_responsive.css"

const Logo = () => {
  return (
    <div className="logo">
      <img src={logo} alt="NextGen Cinemas" />
    </div>
  );
};

export default Logo;