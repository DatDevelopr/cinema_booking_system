import { useState, useEffect } from "react";
import "./style/banner.css";
import banner1 from "../../../../assets/images/banners/banner1.jpg";
import banner2 from "../../../../assets/images/banners/banner2.jpg";
import banner3 from "../../../../assets/images/banners/banner3.jpg";

const banners = [
  { src: banner1, alt: "Banner 1" },
  { src: banner2, alt: "Banner 2" },
  { src: banner3, alt: "Banner 3" }
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="banner">
      <div className="banner-container">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner.src}
            alt={banner.alt}
            className={`banner-img ${index === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>
      <div className="banner-overlay">
        <h2>Chào mừng đến với CINEMA</h2>
        <p>Đặt vé phim dễ dàng và nhanh chóng</p>
      </div>
      <div className="banner-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
