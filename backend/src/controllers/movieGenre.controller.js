const { Movie, Genre } = require("../models");

/**
 * Gán nhiều genre cho movie
 * POST /movies/:movieId/genres
 * body: { genre_ids: [1,2,3] }
 */
exports.addGenresToMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { genre_ids } = req.body;

    if (!Array.isArray(genre_ids) || genre_ids.length === 0) {
      return res.status(400).json({ message: "Danh sách genre không hợp lệ" });
    }

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie không tồn tại" });
    }

    const genres = await Genre.findAll({
      where: { genre_id: genre_ids },
    });

    await movie.addGenres(genres);

    res.json({
      message: "Gán thể loại cho phim thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Xoá 1 genre khỏi movie
 * DELETE /movies/:movieId/genres/:genreId
 */
exports.removeGenreFromMovie = async (req, res) => {
  try {
    const { movieId, genreId } = req.params;

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie không tồn tại" });
    }

    await movie.removeGenre(genreId);

    res.json({
      message: "Xoá thể loại khỏi phim thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy genre của 1 movie
 * GET /movies/:movieId/genres
 */
exports.getGenresByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findByPk(movieId, {
      include: {
        model: Genre,
        through: { attributes: [] },
      },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie không tồn tại" });
    }

    res.json(movie.Genres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lọc movie theo genre
 * GET /movies?genre_id=1
 */
exports.getMoviesByGenre = async (req, res) => {
  try {
    const { genre_id } = req.query;

    if (!genre_id) {
      return res.status(400).json({ message: "Thiếu genre_id" });
    }

    const movies = await Movie.findAll({
      include: {
        model: Genre,
        where: { genre_id },
        through: { attributes: [] },
      },
    });

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
