import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { movieApi } from "../../api/movie.api";
import MovieCard from "./MovieCard";
import "../../assets/styles/movieGrid.css";

const MovieGrid = ({ status, cinemaId, onBookTicket, onViewSchedule }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await movieApi.getAll({ status });
        setMovies(res.data || []);
      } catch (err) {
        setError("Không thể tải danh sách phim. Vui lòng thử lại.");
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status) {
      fetchMovies();
    }
  }, [status]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải phim...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="empty-container">
        <p>Không có phim nào trong danh mục này.</p>
      </div>
    );
  }

  return (
    <section className="movie-grid" aria-label={`Danh sách phim ${status}`}>
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onBookTicket={onBookTicket}
          onViewSchedule={onViewSchedule}
        />
      ))}
    </section>
  );
};

MovieGrid.propTypes = {
  status: PropTypes.string.isRequired,
  cinemaId: PropTypes.string,
  onBookTicket: PropTypes.func,
  onViewSchedule: PropTypes.func
};

export default MovieGrid;