// ShowtimeByMovie.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showtimeApi } from "../../../api/showtime.api";
import {
  Clock,
  MapPin,
  Ticket,
  Calendar,
  Film,
  ChevronLeft,
  Play,
} from "lucide-react";

function formatTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ShowtimeByMovie() {
  const { idSlug } = useParams();
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Lấy movie_id từ idSlug (vd: "1-ten-phim" -> "1")
    const movieId = idSlug?.split("-")[0];
    if (movieId) {
      fetchShowtimes(movieId);
    }
  }, [idSlug]);

  const fetchShowtimes = async (movieId) => {
    try {
      setLoading(true);
      const res = await showtimeApi.getByMovie(movieId);
      const data = res?.data || [];
      setShowtimes(data);

      if (data.length > 0) {
        // Lấy thông tin phim từ showtime đầu tiên
        const first = data[0];
        setMovie({
          movie_id: first.Movie?.movie_id,
          title: first.Movie?.title,
          duration: first.Movie?.duration,
          poster_url: first.Movie?.poster_url,
        });

        // Lấy ngày đầu tiên từ danh sách suất chiếu
        const dates = [
          ...new Set(
            data.map((s) => s.start_time?.split("T")[0])
          ),
        ].sort();
        if (dates.length) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (error) {
      console.error("Fetch showtimes by movie error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc suất chiếu theo ngày đã chọn
  const filteredShowtimes = selectedDate
    ? showtimes.filter(
        (s) => s.start_time?.startsWith(selectedDate)
      )
    : [];

  // Gom nhóm theo rạp
  const groupedByCinema = filteredShowtimes.reduce((acc, s) => {
    const cinema = s.Room?.Cinema;
    const cinemaName =
      cinema?.cinema_name || "Chưa rõ rạp";
    const cinemaId = cinema?.cinema_id || "unknown";
    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        cinema_name: cinemaName,
        address: cinema?.address || "",
        showtimes: [],
      };
    }
    acc[cinemaId].showtimes.push(s);
    return acc;
  }, {});

  // Lấy danh sách ngày có suất chiếu để chọn
  const availableDates = [
    ...new Set(
      showtimes.map((s) => s.start_time?.split("T")[0])
    ),
  ].sort();

  const handleBook = (showtimeId) => {
    navigate(`/booking/${showtimeId}/seats`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-6"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Quay lại</span>
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">
              Đang tải suất chiếu...
            </p>
          </div>
        ) : showtimes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có suất chiếu cho phim này
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Hiện tại chưa có lịch chiếu. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div>
            {/* Hero phim */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[200px] shrink-0">
                  <img
                    src={movie?.poster_url || null}
                    alt={movie?.title}
                    className="w-full h-[280px] md:h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-poster.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {movie?.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {movie?.duration || 0} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket size={16} />
                      {showtimes.length} suất chiếu
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chọn ngày */}
            {availableDates.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-orange-500" />
                  <h2 className="font-semibold text-gray-900">Chọn ngày</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableDates.map((date) => {
                    const isActive = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {formatDate(date)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danh sách rạp */}
            <div className="space-y-6">
              {Object.values(groupedByCinema).map(
                (cinema) => (
                  <div
                    key={cinema.cinema_name}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={18} className="text-orange-500" />
                      <h3 className="font-semibold text-lg text-gray-900">
                        {cinema.cinema_name}
                      </h3>
                      {cinema.address && (
                        <span className="text-xs text-gray-400 ml-2">
                          {cinema.address}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {cinema.showtimes.map((show) => (
                        <button
                          key={show.showtime_id}
                          onClick={() => handleBook(show.showtime_id)}
                          className="group relative min-w-[100px] px-4 py-3 bg-gray-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 border border-gray-100 hover:border-transparent"
                        >
                          <p className="font-bold text-gray-800 group-hover:text-white text-base transition-colors">
                            {formatTime(show.start_time)}
                          </p>
                          <p className="text-xs text-gray-500 group-hover:text-orange-100 mt-0.5 transition-colors line-clamp-1">
                            {show.Room?.room_name || ""}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}