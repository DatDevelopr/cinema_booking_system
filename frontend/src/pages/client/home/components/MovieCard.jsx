import { Play, Star, Clock, Calendar, Ticket, AlertCircle, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TrailerModal from "./TrailerModal";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Logic HOT badge (có thể tùy chỉnh theo nhu cầu)
  const isHot = movie.is_hot ?? (movie.rating && movie.rating >= 8.5);
  
  const hasGenres = movie.Genres && movie.Genres.length > 0;
  const genreNames = hasGenres ? movie.Genres.map(g => g.genre_name).join(" • ") : "Đang cập nhật";
  const hasShowtime = movie.hasShowtime ?? false;

  const handleBooking = (e) => {
    e.stopPropagation();
    if (hasShowtime) {
      navigate(`/movies/${movie.movie_id}-${movie.slug}`);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (movie.trailer_url) {
      setShowTrailer(true);
    }
  };

  const handleCardClick = () => {
    navigate(`/movies/${movie.movie_id}-${movie.slug}`);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      >
        {/* Poster Container */}
        <div className="relative overflow-hidden">
          <img
            src={movie.poster_url || "/placeholder-poster.jpg"}
            alt={movie.title}
            className="w-full h-[340px] object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "/placeholder-poster.jpg";
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
            <button
              onClick={handlePlayClick}
              className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg hover:bg-orange-600"
            >
              <Play className="text-white w-6 h-6 ml-0.5" />
            </button>
          </div>

          {/* HOT Badge - Góc phải trên */}
          {isHot && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className="relative">
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-t-[60px] border-l-transparent border-t-red-500" />
                <div className="absolute top-1.5 right-1.5 transform rotate-45">
                  <div className="flex items-center gap-0.5">
                    <Flame size={10} className="text-white animate-pulse" />
                    <span className="text-white font-bold text-[10px] tracking-wide">HOT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rating Badge */}
          {movie.rating > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 z-10">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-bold">{movie.rating}</span>
            </div>
          )}
        </div>

        {/* Info Container */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors duration-300">
            {movie.title}
          </h3>

          {/* Genres */}
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <p className="text-sm text-gray-500 line-clamp-1">
              {genreNames}
            </p>
          </div>

          {/* Duration & Release Date */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{movie.duration} phút</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(movie.release_date)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Booking Button */}
          {hasShowtime ? (
            <button
              onClick={handleBooking}
              className="relative w-full mt-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-orange-200"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Ticket size={16} />
                MUA VÉ NGAY
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </button>
          ) : (
            <button
              disabled
              className="w-full mt-1 py-2.5 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <AlertCircle size={16} />
              Chưa có suất chiếu
            </button>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailer_url && (
        <TrailerModal
          movie={movie}
          onClose={closeTrailer}
        />
      )}
    </>
  );
}