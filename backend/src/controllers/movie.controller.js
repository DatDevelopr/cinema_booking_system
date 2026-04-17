const { Movie, Genre, sequelize, Room, Showtime } = require("../models");
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

exports.getMovieAndShowtimeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { cinema_id } = req.query; // 👈 nhận từ FE

    const movie = await Movie.findOne({
      where: { slug },
      include: [
        {
          model: Genre,
          through: { attributes: [] },
        },
        {
          model: Showtime,
          required: false, // ✅ vẫn trả movie nếu không có suất
          where: {
            status: "UPCOMING",
            start_time: {
              [Op.gte]: new Date(),
            },
          },
          include: [
            {
              model: Room,
              required: true,
              ...(cinema_id && {
                where: { cinema_id }, // ✅ filter theo rạp
              }),
              attributes: ["room_id", "room_name", "cinema_id"],
            },
          ],
          attributes: ["showtime_id", "start_time", "end_time"],
        },
      ],
      order: [
        [{ model: Showtime }, "start_time", "ASC"], // 👈 sắp xếp giờ chiếu
      ],
    });

    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại" });
    }

    const data = movie.toJSON();

    // ✅ thêm flag cho FE dùng
    data.hasShowtime = data.Showtimes?.length > 0;

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


exports.getMoviesWithShowtimeByCinema = async (req, res) => {
  try {
    const { cinema_id } = req.query;

    const movies = await Movie.findAll({
      where: {
        status: 1,
      },
      include: [
        {
          model: Genre,
          through: { attributes: [] },
        },
        {
          model: Showtime,
          required: false,
          where: {
            status: "UPCOMING",
            start_time: {
              [Op.gte]: new Date(), // ✅ chỉ lấy suất tương lai
            },
          },
          include: [
            {
              model: Room,
              required: true, // ✅ quan trọng
              ...(cinema_id && {
                where: { cinema_id }, // chỉ filter khi có cinema_id
              }),
              attributes: [],
            },
          ],
          attributes: ["showtime_id"],
        },
      ],
    });

    const result = movies.map((m) => {
      const movie = m.toJSON();

      return {
        ...movie,
        hasShowtime: movie.Showtimes?.length > 0,
      };
    });

    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      sortField = "created_at",
      sortOrder = "DESC",
      genre_id,
      isAdmin = false,
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    /* ================= WHERE ================= */
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } },
      ];
    }

    /* ================= SORT (WHITELIST) ================= */
    const allowedSortFields = [
      "title",
      "duration",
      "release_date",
      "created_at",
    ];

    const allowedSortOrder = ["ASC", "DESC"];

    const finalSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "created_at";

    const finalSortOrder = allowedSortOrder.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    /* ================= INCLUDE ================= */
    const include = [
      {
        model: Genre,
        through: { attributes: [] },
        ...(genre_id && {
          where: { genre_id },
        }),
      },
    ];

    /* ================= QUERY ================= */
    const { count, rows } = await Movie.findAndCountAll({
      where,
      include,
      order: [[finalSortField, finalSortOrder]],
      limit,
      offset,
      distinct: true, 
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("GET MOVIES ERROR:", error);
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
  const t = await sequelize.transaction();

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
      genre_ids = [],
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const slug = generateSlug(title);

    // check trùng title
    const titleExists = await Movie.findOne({ where: { title } });
    if (titleExists) {
      return res.status(409).json({ message: "Tên phim đã tồn tại" });
    }

    // check trùng slug
    const slugExists = await Movie.findOne({ where: { slug } });
    if (slugExists) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }

    // validate genre
    if (genre_ids.length > 0) {
      const genres = await Genre.findAll({
        where: { genre_id: genre_ids },
      });

      if (genres.length !== genre_ids.length) {
        await t.rollback();
        return res.status(400).json({
          message: "Có thể loại không tồn tại",
        });
      }
    }

    // tạo movie
    const movie = await Movie.create(
      {
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
      },
      { transaction: t }
    );

    // gán genre
    if (genre_ids.length > 0) {
      await movie.setGenres(genre_ids, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: "Tạo phim thành công",
      data: movie,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   CẬP NHẬT PHIM
===================================================== */
exports.updateMovie = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Phim không tồn tại",
      });
    }

    const { title, genre_ids } = req.body;

    // update title → slug
    if (title && title !== movie.title) {
      const exists = await Movie.findOne({
        where: {
          title,
          movie_id: { [Op.ne]: movie.movie_id },
        },
      });

      if (exists) {
        await t.rollback();
        return res.status(409).json({
          message: "Tên phim đã tồn tại",
        });
      }

      const newSlug = generateSlug(title);

      const slugExists = await Movie.findOne({
        where: {
          slug: newSlug,
          movie_id: { [Op.ne]: movie.movie_id },
        },
      });

      if (slugExists) {
        await t.rollback();
        return res.status(409).json({
          message: "Slug đã tồn tại",
        });
      }

      req.body.slug = newSlug;
    }

    // validate genre
    if (genre_ids) {
      if (!Array.isArray(genre_ids)) {
        await t.rollback();
        return res.status(400).json({
          message: "genre_ids phải là mảng",
        });
      }

      const genres = await Genre.findAll({
        where: { genre_id: genre_ids },
      });

      if (genres.length !== genre_ids.length) {
        await t.rollback();
        return res.status(400).json({
          message: "Có thể loại không tồn tại",
        });
      }
    }

    // update movie
    await movie.update(req.body, { transaction: t });

    // update genre (replace)
    if (genre_ids) {
      await movie.setGenres(genre_ids, { transaction: t });
    }

    await t.commit();

    res.json({
      message: "Cập nhật phim thành công",
    });
  } catch (error) {
    await t.rollback();
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
exports.toggleStatus = async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);

  if (!movie) {
    return res.status(404).json({ message: "Không tồn tại" });
  }

  movie.status = movie.status == 1 ? 0 : 1;
  await movie.save();

  res.json({ message: "Cập nhật trạng thái thành công" });
};
