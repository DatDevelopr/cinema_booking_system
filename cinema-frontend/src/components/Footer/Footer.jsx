import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CINEMA</h3>
          <p>Đặt vé phim dễ dàng và nhanh chóng. Trải nghiệm điện ảnh tuyệt vời tại các rạp của chúng tôi.</p>
        </div>
        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li><a href="/about">Về chúng tôi</a></li>
            <li><a href="/contact">Liên hệ</a></li>
            <li><a href="/privacy">Chính sách bảo mật</a></li>
            <li><a href="/terms">Điều khoản sử dụng</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Theo dõi chúng tôi</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>Email: support@cinema.com</p>
          <p>Điện thoại: 0123-456-789</p>
          <p>Địa chỉ: 123 Đường Phim, Thành phố Điện Ảnh</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 CINEMA. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}
