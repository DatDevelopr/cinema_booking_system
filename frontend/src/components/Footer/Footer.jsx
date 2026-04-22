// components/Footer.jsx
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Ticket,
  Popcorn,
  Film,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo_cinema.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Phim đang chiếu", path: "/movies" },
    { name: "Phim sắp chiếu", path: "/movies/upcoming" },
    { name: "Suất chiếu", path: "/showtimes" },
    { name: "Giá vé", path: "/pricing" },
    { name: "Khuyến mãi", path: "/promotions" },
  ];

  const supportLinks = [
    { name: "Hướng dẫn đặt vé", path: "/guide" },
    { name: "Chính sách bảo mật", path: "/privacy" },
    { name: "Điều khoản sử dụng", path: "/terms" },
    { name: "Câu hỏi thường gặp", path: "/faq" },
    { name: "Liên hệ", path: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", color: "hover:bg-[#1877f2]" },
    { icon: Instagram, href: "https://instagram.com", color: "hover:bg-gradient-to-tr from-[#f09433] to-[#bc1888]" },
    { icon: Twitter, href: "https://twitter.com", color: "hover:bg-[#1da1f2]" },
    { icon: Youtube, href: "https://youtube.com", color: "hover:bg-[#ff0000]" },
  ];

  const openingHours = [
    { day: "Thứ 2 - Thứ 6", hours: "09:00 - 22:00" },
    { day: "Thứ 7", hours: "08:00 - 23:00" },
    { day: "Chủ nhật", hours: "08:00 - 22:00" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1 - Brand & Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Cinema Logo" className="h-12 w-auto" />
              <span className="text-white text-xl font-bold">CINEMA</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Hệ thống rạp chiếu phim hàng đầu với chất lượng hình ảnh và âm thanh đỉnh cao, 
              mang đến trải nghiệm điện ảnh tuyệt vời nhất.
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`}
                  >
                    <Icon size={16} className="text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold flex items-center gap-2">
              <Film size={18} className="text-orange-500" />
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold flex items-center gap-2">
              <Ticket size={18} className="text-orange-500" />
              Hỗ trợ
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact & Hours */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Giờ mở cửa
            </h3>
            <ul className="space-y-2">
              {openingHours.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.day}</span>
                  <span className="text-gray-300">{item.hours}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4 space-y-2">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  123 Đường Điện Ảnh, Quận 1, TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-400">1900 1234</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-400">info@cinema.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Đăng ký nhận tin</h4>
                <p className="text-xs text-gray-500">Nhận ưu đãi và thông tin phim mới nhất</p>
              </div>
            </div>
            
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 md:w-80 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-r-lg transition-all duration-200">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>&copy; {currentYear} CINEMA. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <Link to="/privacy" className="hover:text-orange-500 transition-colors">Chính sách bảo mật</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-orange-500 transition-colors">Điều khoản</Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Popcorn size={14} className="text-orange-500" />
              <span>Trải nghiệm điện ảnh tuyệt vời</span>
              <Film size={14} className="text-orange-500 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient line at top */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
    </footer>
  );
};

export default Footer;