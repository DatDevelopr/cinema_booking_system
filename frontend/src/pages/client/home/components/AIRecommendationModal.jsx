// components/AIRecommendationModal.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Sparkles,
  Play,
  Clock,
  Star,
  Brain,
} from "lucide-react";

const AIRecommendationModal = ({
  open,
  onClose,
  movies = [],
  loading = false,
  intro = "",
  reason = "",
  closing = "",
}) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible && !open) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${
        open ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-[95%] max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-20 rounded-t-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-5 py-4 text-white shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <Brain size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Gợi Ý Phim</h2>
                <p className="text-xs text-orange-50">Dành riêng cho bạn</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
              <p className="text-sm font-semibold text-gray-700">
                AI đang phân tích sở thích của bạn...
              </p>
            </div>
          ) : movies.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                <Sparkles size={28} className="text-orange-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Chưa có đủ dữ liệu
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                Hãy xem thêm phim hoặc đặt vé để AI hiểu bạn hơn.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/movies");
                }}
                className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Khám phá phim ngay
              </button>
            </div>
          ) : (
            <>
              {/* INTRO */}
              <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <Sparkles size={16} className="text-orange-500" />
                  Lời gợi ý từ AI
                </h3>
                <p className="text-sm leading-6 text-gray-700">
                  {intro ||
                    "Dưới đây là những bộ phim AI đã lựa chọn riêng cho bạn dựa trên hành vi và sở thích xem phim gần đây."}
                </p>
              </div>

              {/* REASON */}
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <h3 className="mb-1.5 text-sm font-bold text-gray-800">
                  Vì sao AI gợi ý những phim này?
                </h3>
                <p className="text-sm leading-6 text-gray-700">
                  {reason ||
                    "Dựa trên lịch sử đặt vé, thói quen xem phim và hành vi của những người có sở thích tương tự bạn."}
                </p>
              </div>

              {/* MOVIES */}
              <div>
                <h3 className="mb-3 text-base font-bold text-gray-800">
                  Danh sách phim đề xuất
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {movies.slice(0, 9).map((movie) => (
                    <div
                      key={movie.movie_id}
                      onClick={() => {
                        navigate(
                          `/movies/${movie.movie_id}-${movie.slug || ""}/showtimes`
                        );
                        onClose();
                      }}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* POSTER */}
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                          src={movie.poster_url || "/placeholder-poster.jpg"}
                          alt={movie.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "/placeholder-poster.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100 flex items-center justify-center">
                          <Play size={24} className="text-white" />
                        </div>
                      </div>
                      {/* INFO */}
                      <div className="p-3">
                        <h4 className="line-clamp-2 text-sm font-semibold text-gray-800 transition group-hover:text-orange-500">
                          {movie.title}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-gray-500">
                          {movie.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {movie.duration} phút
                            </span>
                          )}
                          {movie.rating && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {movie.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLOSING */}
              <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
                <h3 className="mb-1.5 text-sm font-bold text-gray-800">
                  Lời nhắn từ hệ thống
                </h3>
                <p className="text-sm leading-6 text-gray-700">
                  {closing ||
                    "Chúc bạn có những trải nghiệm xem phim tuyệt vời!"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationModal;