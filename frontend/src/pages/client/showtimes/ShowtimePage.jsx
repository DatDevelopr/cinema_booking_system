import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import showtimeApi from "../../../api/showtime.api";
import { useCinemaStore } from "../../../store/cinema.store";
import { Play } from "lucide-react";
import TrailerModal from "../home/components/TrailerModal"; // Đường dẫn tùy chỉnh

/* ================= FORMAT HELPERS ================= */
function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const weekday = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][date.getDay()];
  return {
    full: `${day}/${month}`,
    day,
    month,
    weekday,
    value: date.toISOString().split("T")[0],
  };
}

function formatTime(dateTime) {
  const date = new Date(dateTime);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getNextDays(total = 7) {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < total; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push(formatDateLabel(d));
  }
  return arr;
}

/* ================= MAIN COMPONENT ================= */
export default function ShowtimesPage() {
  const navigate = useNavigate();
  const { cinemaId } = useCinemaStore();

  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState([]);
  const [trailerMovie, setTrailerMovie] = useState(null); // movie đang xem trailer

  const dateTabs = useMemo(() => getNextDays(6), []);

  useEffect(() => {
    if (dateTabs.length && !selectedDate) {
      setSelectedDate(dateTabs[0].value);
    }
  }, [dateTabs, selectedDate]);

  useEffect(() => {
    if (cinemaId && selectedDate) {
      fetchShowtimes();
    }
  }, [cinemaId, selectedDate]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await showtimeApi.getAll({
        cinema_id: cinemaId,
        date: selectedDate,
      });
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
      setShowtimes(rows);
    } catch (error) {
      console.error("Fetch showtimes error:", error);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedMovies = useMemo(() => {
    const map = {};
    showtimes.forEach((item) => {
      const movie = item.Movie;
      const room = item.Room;
      if (!movie) return;

      if (!map[movie.movie_id]) {
        map[movie.movie_id] = {
          movie_id: movie.movie_id,
          title: movie.title,
          duration: movie.duration,
          poster_url: movie.poster_url || "",
          trailer_url: movie.trailer_url || "",   // lấy trailer từ API
          format: item.format || "2D",
          language: item.language || "PHỤ ĐỀ",
          showtimes: [],
        };
      }

      map[movie.movie_id].showtimes.push({
        showtime_id: item.showtime_id,
        start_time: item.start_time,
        room_name: room?.room_name || "",
      });
    });
    return Object.values(map);
  }, [showtimes]);

  const handleChooseShowtime = (showtimeId) => {
    navigate(`/booking/${showtimeId}/seats`);
  };

  const selectedDateObj = dateTabs.find(d => d.value === selectedDate);
  const formattedDate = selectedDateObj
    ? `${selectedDateObj.weekday}, ${selectedDateObj.day}/${selectedDateObj.month}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Lịch chiếu phim
          </h1>
          <p className="text-gray-500">Chọn ngày và suất chiếu phù hợp với bạn</p>
        </div>

        {/* Date Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {dateTabs.map((item) => {
              const isActive = selectedDate === item.value;
              const isToday = item.value === dateTabs[0]?.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setSelectedDate(item.value)}
                  className={`relative flex-shrink-0 px-5 py-3 rounded-xl text-center transition-all duration-300 min-w-[70px] ${
                    isActive
                      ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 scale-105"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide">{item.weekday}</p>
                  <p className="text-2xl font-bold leading-tight my-0.5">{item.day}</p>
                  <p className="text-[10px] opacity-80">Thg {item.month}</p>
                  {isToday && !isActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-900">
            Suất chiếu {formattedDate}
          </h2>
          {!loading && (
            <span className="text-sm text-gray-400">
              • {groupedMovies.length} phim đang chiếu
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 mt-4 font-medium">Đang tải suất chiếu...</p>
          </div>
        ) : groupedMovies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có suất chiếu</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Không có suất chiếu nào cho ngày {formattedDate}. Vui lòng chọn ngày khác.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedMovies.map((movie) => (
              <div
                key={movie.movie_id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Poster + Play Button */}
                  <div className="lg:w-[200px] shrink-0 relative overflow-hidden group cursor-pointer"
                       onClick={() => setTrailerMovie(movie)}
                  >
                    <img
                      src={movie.poster_url || "/placeholder-poster.jpg"}
                      alt={movie.title}
                      className="w-full lg:w-[200px] h-[200px] lg:h-full object-cover"
                    />
                    {/* Overlay Play */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="text-white w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{movie.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                            {movie.duration || 0} phút
                          </span>
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            {movie.format}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                            {movie.language}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-orange-200 via-gray-200 to-transparent mb-4" />

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Suất chiếu
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {movie.showtimes.map((show) => (
                          <button
                            key={show.showtime_id}
                            onClick={() => handleChooseShowtime(show.showtime_id)}
                            className="group relative min-w-[90px] px-4 py-3 bg-gray-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 border border-gray-100 hover:border-transparent"
                          >
                            <p className="font-bold text-gray-800 group-hover:text-white text-base transition-colors">
                              {formatTime(show.start_time)}
                            </p>
                            <p className="text-xs text-gray-500 group-hover:text-orange-100 mt-0.5 transition-colors line-clamp-1">
                              {show.room_name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}