import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import banner1 from "../../../../assets/images/banners/banner1.jpg";
import banner2 from "../../../../assets/images/banners/banner2.jpg";
import banner3 from "../../../../assets/images/banners/banner3.jpg";

const banners = [
  { src: banner1, alt: "Banner 1", title: "Trải Nghiệm Điện Ảnh Đỉnh Cao", subtitle: "Hệ thống âm thanh vòm, hình ảnh sắc nét" },
  { src: banner2, alt: "Banner 2", title: "Ưu Đãi Đặc Biệt", subtitle: "Giảm giá 30% cho thành viên mới" },
  { src: banner3, alt: "Banner 3", title: "Phim Mới Mỗi Ngày", subtitle: "Cập nhật liên tục các bom tấn" }
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Auto play
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      // Swipe left - next
      nextSlide();
    }
    if (diff < -50) {
      // Swipe right - prev
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Images */}
      <div className="relative w-full h-full overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 translate-x-full"
            }`}
            style={{
              transform: `translateX(${100 * (index - currentIndex)}%)`,
            }}
          >
            <img
              src={banner.src}
              alt={banner.alt}
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white px-4 animate-fadeInUp">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            {banners[currentIndex].title}
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8">
            {banners[currentIndex].subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
              Đặt vé ngay
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300 border border-white/30">
              Xem phim
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Auto Play Toggle */}
      <button
        onClick={toggleAutoPlay}
        className="absolute bottom-20 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Toggle auto play"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/30">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-r-full"
            style={{
              width: "100%",
              animation: "progressBar 5s linear infinite",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}