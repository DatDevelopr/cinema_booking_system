import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import movieApi from "../../../../api/movie.api";
import { useCinemaStore } from "../../../../store/cinema.store";
import TrailerModal from "./TrailerModal";
import {
  Calendar,
  Clock,
  User,
  Users,
  Tag,
  Globe,
  Film,
  Star,
  Ticket,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Play,
  Heart,
  Share2,
  Bookmark,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MovieDetail() {
  const { idSlug } = useParams();
  const { cinemaId } = useCinemaStore();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    if (!idSlug) return;
    const slug = idSlug.split("-").slice(1).join("-");
    fetchMovie(slug);
  }, [idSlug, cinemaId]);

  const fetchMovie = async (slug) => {
    try {
      setLoading(true);
      const res = await movieApi.getBySlug(slug, cinemaId);
      const data = res.data.data;
      setMovie(data);

      if (data.Showtimes?.length > 0) {
        const firstDate = formatDate(data.Showtimes[0].start_time);
        setSelectedDate(firstDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr.split("/").reverse().join("-"));
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      weekday: days[date.getDay()],
    };
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const grouped = useMemo(() => {
    if (!movie?.Showtimes) return {};
    return movie.Showtimes.reduce((acc, s) => {
      const d = formatDate(s.start_time);
      if (!acc[d]) acc[d] = [];
      acc[d].push(s);
      return acc;
    }, {});
  }, [movie]);

  const dates = Object.keys(grouped);
  const currentShowtimes = grouped[selectedDate] || [];

  const showtimesByCinema = useMemo(() => {
    const result = {};
    currentShowtimes.forEach((showtime) => {
      const cinemaName =
        showtime.Room?.Cinema?.cinema_name ||
        showtime.cinema_name ||
        "Rạp chiếu";
      if (!result[cinemaName]) result[cinemaName] = [];
      result[cinemaName].push(showtime);
    });
    return result;
  }, [currentShowtimes]);

  const openTrailer = () => {
    if (movie?.trailer_url) {
      setShowTrailer(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 animate-pulse" size={24} />
          </div>
          <p className="text-gray-500 mt-4">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-500">Không tìm thấy thông tin phim</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const description = movie.description || "Chưa có mô tả cho phim này.";
  const shouldTruncate = description.length > 300;
  const displayDescription = expandedDescription || !shouldTruncate
    ? description
    : description.slice(0, 300) + "...";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ backgroundImage: `url(${movie.poster_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Quay lại</span>
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
          </button>
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20">
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20">
            <Bookmark size={18} />
          </button>
        </div>

        {/* Movie Info Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-36 h-48 md:w-48 md:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20 transform -translate-y-8 md:-translate-y-12"
              />
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                    {movie.hasShowtime ? "Đang chiếu" : "Sắp chiếu"}
                  </span>
                  {movie.rating > 0 && (
                    <span className="px-3 py-1 bg-yellow-500/20 backdrop-blur-sm text-yellow-300 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {movie.rating}/10
                    </span>
                  )}
                  {movie.trailer_url && (
                    <button
                      onClick={openTrailer}
                      className="px-3 py-1 bg-red-500/20 backdrop-blur-sm text-red-300 text-xs font-semibold rounded-full flex items-center gap-1 hover:bg-red-500/30 transition"
                    >
                      <Play size={12} />
                      Trailer
                    </button>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-2xl">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-200">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{movie.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={14} />
                    <span>{movie.country || "Quốc tế"}</span>
                  </div>
                </div>
                {/* Mô tả với expand/collapse */}
                <div className="max-w-2xl">
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                    {displayDescription}
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => setExpandedDescription(!expandedDescription)}
                      className="mt-2 text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1 transition"
                    >
                      {expandedDescription ? (
                        <>
                          Thu gọn <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          Xem thêm <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movie Details Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Thông tin phim</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="group p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition">
                <User size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500">Đạo diễn</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {movie.director || "Đang cập nhật"}
              </p>
            </div>
            <div className="group p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition">
                <Users size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500">Diễn viên</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {movie.actors || "Đang cập nhật"}
              </p>
            </div>
            <div className="group p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition">
                <Tag size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500">Thể loại</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {movie.Genres?.map((g) => g.genre_name).join(", ") || "Đang cập nhật"}
              </p>
            </div>
            <div className="group p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition">
                <Globe size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500">Quốc gia</p>
              <p className="text-sm font-medium text-gray-900">
                {movie.country || "Đang cập nhật"}
              </p>
            </div>
            <div className="group p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition">
                <Clock size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500">Thời lượng</p>
              <p className="text-sm font-medium text-gray-900">{movie.duration} phút</p>
            </div>
            <div className="group p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-200 transition">
                <Calendar size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500">Khởi chiếu</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(movie.release_date)}</p>
            </div>
          </div>
        </div>

        {/* Showtime Section */}
        {movie.hasShowtime && dates.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 pt-5 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">Chọn ngày chiếu</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                {dates.map((d) => {
                  const { day, month, weekday } = formatDisplayDate(d);
                  const isActive = selectedDate === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`flex-shrink-0 px-5 py-3 rounded-xl text-center transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                      }`}
                    >
                      <p className="text-xs font-medium">{weekday}</p>
                      <p className="text-2xl font-bold">{day}</p>
                      <p className="text-xs opacity-80">Thg {month}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {Object.keys(showtimesByCinema).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">Không có suất chiếu trong ngày này</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(showtimesByCinema).map(([cinemaName, showtimes]) => (
                    <div
                      key={cinemaName}
                      className="group border-l-4 border-orange-500/30 pl-4 hover:border-orange-500 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <MapPin size={16} className="text-orange-500" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {cinemaName}
                        </h3>
                        <span className="text-xs text-gray-400 ml-2">
                          {showtimes.length} suất
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {showtimes.map((showtime) => (
                          <button
                            key={showtime.showtime_id}
                            onClick={() =>
                              navigate(`/booking/${showtime.showtime_id}/seats`)
                            }
                            className="group/btn relative px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-500 hover:to-amber-500 rounded-xl text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                          >
                            <p className="font-bold text-gray-800 group-hover/btn:text-white text-lg">
                              {formatTime(showtime.start_time)}
                            </p>
                            <p className="text-xs text-gray-500 group-hover/btn:text-orange-100 mt-1">
                              {showtime.format || "2D"} • {showtime.language === "SUB" ? "Phụ đề" : "Lồng tiếng"}
                            </p>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity -z-10" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có suất chiếu
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Vui lòng quay lại sau để cập nhật lịch chiếu mới nhất
            </p>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailer_url && (
        <TrailerModal
          movie={movie}
          onClose={() => setShowTrailer(false)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}