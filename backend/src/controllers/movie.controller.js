const { Movie } = require("../models");

/**
 * USER + ADMIN - LẤY DANH SÁCH PHIM
 */
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      where: { status: 1 },
      order: [["created_at", "DESC"]],
    });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * USER + ADMIN - CHI TIẾT PHIM
 */
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Phim không tồn tại",
      });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - TẠO PHIM
 */
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      release_date,
      language,
      poster_url,
      trailer_url,
      status,
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const movie = await Movie.create({
      title,
      description,
      duration,
      release_date,
      language,
      poster_url,
      trailer_url,
      status: status ?? 1,
    });

    res.status(201).json({
      message: "Tạo phim thành công",
      movie_id: movie.movie_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - CẬP NHẬT PHIM
 */
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Phim không tồn tại",
      });
    }

    await movie.update(req.body);

    res.json({
      message: "Cập nhật phim thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - XOÁ PHIM (SOFT DELETE)
 */
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Phim không tồn tại",
      });
    }

    await movie.update({ status: 0 });

    res.json({
      message: "Xoá phim thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
