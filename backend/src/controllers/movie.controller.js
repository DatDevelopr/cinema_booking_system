const { Movie, Genre } = require("../models");
const { Op } = require("sequelize");

/* ================= HELPER ================= */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
};

/* =====================================================
   USER + ADMIN - LẤY DANH SÁCH PHIM (PAGINATION + SORT + SEARCH)
===================================================== */
exports.getAllMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Movie.findAndCountAll({
      where: {
        status: 1,
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { director: { [Op.like]: `%${search}%` } },
        ],
      },
      include: {
        model: Genre,
        through: { attributes: [] },
      },
      order: [[sortField, sortOrder.toUpperCase()]],
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   CHI TIẾT PHIM
===================================================== */
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: {
        model: Genre,
        through: { attributes: [] },
      },
    });

    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại" });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   TẠO PHIM
===================================================== */
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      director,
      actors,
      description,
      duration,
      release_date,
      poster_url,
      trailer_url,
      country,
      status,
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const slug = generateSlug(title);

    // kiểm tra trùng title
    const titleExists = await Movie.findOne({ where: { title } });
    if (titleExists) {
      return res.status(409).json({ message: "Tên phim đã tồn tại" });
    }

    // kiểm tra trùng slug
    const slugExists = await Movie.findOne({ where: { slug } });
    if (slugExists) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }

    const movie = await Movie.create({
      title,
      slug,
      director,
      actors,
      description,
      duration,
      release_date,
      poster_url,
      trailer_url,
      country,
      status: status ?? 1,
    });

    res.status(201).json({
      message: "Tạo phim thành công",
      data: movie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   CẬP NHẬT PHIM
===================================================== */
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại" });
    }

    const { title } = req.body;

    // Nếu đổi title → kiểm tra trùng + cập nhật slug
    if (title && title !== movie.title) {
      const exists = await Movie.findOne({
        where: {
          title,
          movie_id: { [Op.ne]: movie.movie_id },
        },
      });

      if (exists) {
        return res.status(409).json({ message: "Tên phim đã tồn tại" });
      }

      const newSlug = generateSlug(title);

      const slugExists = await Movie.findOne({
        where: {
          slug: newSlug,
          movie_id: { [Op.ne]: movie.movie_id },
        },
      });

      if (slugExists) {
        return res.status(409).json({ message: "Slug đã tồn tại" });
      }

      req.body.slug = newSlug;
    }

    await movie.update(req.body);

    res.json({ message: "Cập nhật phim thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   XOÁ PHIM (SOFT DELETE)
===================================================== */
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại" });
    }

    await movie.update({ status: 0 });

    res.json({ message: "Xoá phim thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};