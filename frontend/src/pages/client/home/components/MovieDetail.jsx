import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import movieApi from "../../../../api/movie.api";
import { useCinemaStore } from "../../../../store/cinema.store";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MovieDetail() {
  const { idSlug } = useParams();
  const { cinemaId } = useCinemaStore();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [loading, setLoading] = useState(true);

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

        // Group cinemas by date
        const cinemasByDate = {};
        data.Showtimes.forEach((showtime) => {
          const date = formatDate(showtime.start_time);
          if (!cinemasByDate[date]) cinemasByDate[date] = new Set();
          cinemasByDate[date].add(
            showtime.Room?.Cinema?.cinema_name || showtime.cinema_name,
          );
        });
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

  // Group showtimes by cinema
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Film size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy thông tin phim</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${movie.poster_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/60 to-black/80" />

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition"
        >
          <ChevronLeft size={18} />
          Quay lại
        </button>

        {/* Movie Info Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-40 h-52 object-cover rounded-xl shadow-2xl border-2 border-white/20"
              />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {movie.rating > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <span>{movie.rating}/10</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Clock size={14} />
                    <span>{movie.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Calendar size={14} />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>
                </div>
                <p className="text-gray-200 line-clamp-2 max-w-2xl">
                  {movie.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movie Details Grid */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Film size={20} className="text-orange-500" />
            Thông tin phim
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User size={18} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Đạo diễn</p>
                <p className="font-medium text-gray-900">
                  {movie.director || "Đang cập nhật"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Users size={18} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Diễn viên</p>
                <p className="font-medium text-gray-900">
                  {movie.actors || "Đang cập nhật"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Tag size={18} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Thể loại</p>
                <p className="font-medium text-gray-900">
                  {movie.Genres?.map((g) => g.genre_name).join(", ") ||
                    "Đang cập nhật"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Globe size={18} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Quốc gia</p>
                <p className="font-medium text-gray-900">
                  {movie.country || "Đang cập nhật"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock size={18} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Thời lượng</p>
                <p className="font-medium text-gray-900">
                  {movie.duration} phút
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar size={18} className="text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Khởi chiếu</p>
                <p className="font-medium text-gray-900">
                  {formatDate(movie.release_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Showtime Section */}
        {movie.hasShowtime && dates.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Date Tabs */}
            <div className="border-b border-gray-100 px-6 pt-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((d) => {
                  const { day, month, weekday } = formatDisplayDate(d);
                  const isActive = selectedDate === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`flex-shrink-0 px-5 py-3 rounded-xl text-center transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <p className="text-xs font-medium">{weekday}</p>
                      <p className="text-xl font-bold">{day}</p>
                      <p className="text-xs">Thg {month}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Showtime List */}
            <div className="p-6">
              {Object.keys(showtimesByCinema).length === 0 ? (
                <div className="text-center py-12">
                  <Ticket size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Không có suất chiếu trong ngày này
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(showtimesByCinema).map(
                    ([cinemaName, showtimes]) => (
                      <div
                        key={cinemaName}
                        className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={16} className="text-orange-500" />
                          <h3 className="font-semibold text-gray-900">
                            {cinemaName}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {showtimes.map((showtime) => (
                            <button
                              key={showtime.showtime_id}
                              onClick={() =>
                                navigate(`/booking/${showtime.showtime_id}`)
                              }
                              className="group relative min-w-[100px] px-4 py-3 bg-gray-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 rounded-xl text-center transition-all duration-200"
                            >
                              <p className="font-bold text-gray-800 group-hover:text-white">
                                {formatTime(showtime.start_time)}
                              </p>
                              <p className="text-xs text-gray-400 group-hover:text-orange-100">
                                {showtime.format || "2D"}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Ticket size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có suất chiếu
            </h3>
            <p className="text-gray-500">
              Vui lòng quay lại sau để cập nhật lịch chiếu mới nhất
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
