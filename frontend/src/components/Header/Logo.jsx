// Logo.jsx
import logo from '../../assets/images/logo_cinema.png';

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <img 
        src={logo} 
        alt="NextGen Cinemas" 
        className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};

export default Logo;