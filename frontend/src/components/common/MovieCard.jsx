import PropTypes from "prop-types";
import "../../assets/styles/movieCard.css";

const MovieCard = ({ movie, onBookTicket, onViewSchedule }) => {
  if (!movie) return null;

  const handleBookTicket = () => {
    if (onBookTicket) onBookTicket(movie);
  };

  const handleViewSchedule = () => {
    if (onViewSchedule) onViewSchedule(movie);
  };

  return (
    <div className="movie-card" role="article" aria-labelledby={`movie-title-${movie.id}`}>
      <div className="poster-wrapper">
        <img
          src={movie.poster || "/images/default-movie.jpg"}
          alt={`Poster của phim ${movie.title}`}
          loading="lazy"
        />

        <div className="overlay">
          <button
            className="btn-primary"
            onClick={handleBookTicket}
            aria-label={`Đặt vé cho phim ${movie.title}`}
          >
            Đặt vé
          </button>
          <button
            className="btn-outline"
            onClick={handleViewSchedule}
            aria-label={`Xem lịch chiếu của phim ${movie.title}`}
          >
            Xem lịch
          </button>
        </div>

        {movie.age && (
          <span className={`age age-${movie.age}`} aria-label={`Độ tuổi ${movie.age}+`}>
            {movie.age}+
          </span>
        )}
      </div>

      <div className="movie-info">
        <h4 id={`movie-title-${movie.id}`} className="title">
          {movie.title}
        </h4>

        <p className="genre" aria-label="Thể loại">
          {movie.genres?.length > 0 ? movie.genres.map(g => g.name).join(", ") : "Không xác định"}
        </p>

        <div className="meta">
          <span aria-label={`Thời lượng ${movie.duration} phút`}>
            ⏱ {movie.duration || "N/A"} phút
          </span>
          {movie.hot && (
            <span className="hot" aria-label="Phim hot">
              🔥 Hot
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    poster: PropTypes.string,
    age: PropTypes.number,
    genres: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string
      })
    ),
    duration: PropTypes.number,
    hot: PropTypes.bool
  }),
  onBookTicket: PropTypes.func,
  onViewSchedule: PropTypes.func
};

export default MovieCard;