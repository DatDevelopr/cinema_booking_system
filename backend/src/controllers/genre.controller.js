const { Op } = require("sequelize");
const { Genre } = require("../models");

/**
 * GET /genre
 * Query:
 *   - page (default: 1)
 *   - search (optional)
 */
exports.getAllGenres = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField,
      sortOrder,
    } = req.query;

    const offset = (page - 1) * limit;

    /* ===== WHERE ===== */
    const where = {};

    if (search) {
      where.genre_name = {
        [Op.like]: `%${search}%`,
      };
    }

    /* ===== ORDER ===== */
    let order = [];

    if (sortField && sortOrder) {
      order.push([sortField, sortOrder.toUpperCase()]);
    } else {
      // mặc định sort theo id
      order.push(["genre_id", "DESC"]);
    }

    /* ===== QUERY ===== */
    const { count, rows } = await Genre.findAndCountAll({
      where,
      order,
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
    res.status(500).json({ message: "Server error" });
  }
};

exports.createGenre = async (req, res) => {
  try {
    const { genre_name } = req.body;

    if (!genre_name?.trim()) {
      return res.status(400).json({
        message: "Tên thể loại là bắt buộc",
      });
    }

    const name = genre_name.trim();

    // kiểm tra trùng (không phân biệt hoa thường)
    const exists = await Genre.findOne({
      where: {
        genre_name: {
          [Op.eq]: name,
        },
      },
    });

    if (exists) {
      return res.status(409).json({
        message: "Thể loại đã tồn tại",
      });
    }

    const genre = await Genre.create({
      genre_name: name,
    });

    res.status(201).json({
      message: "Tạo thành công",
      data: genre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { genre_name } = req.body;

    if (!genre_name?.trim()) {
      return res.status(400).json({
        message: "Tên thể loại là bắt buộc",
      });
    }

    const name = genre_name.trim();

    const genre = await Genre.findByPk(id);

    if (!genre) {
      return res.status(404).json({
        message: "Không tìm thấy thể loại",
      });
    }

    // kiểm tra trùng tên nhưng loại trừ chính nó
    const exists = await Genre.findOne({
      where: {
        genre_name: name,
        genre_id: {
          [Op.ne]: id, // khác id hiện tại
        },
      },
    });

    if (exists) {
      return res.status(409).json({
        message: "Tên thể loại đã tồn tại",
      });
    }

    await genre.update({
      genre_name: name,
    });

    res.json({
      message: "Cập nhật thành công",
      data: genre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    const genre = await Genre.findByPk(id);

    if (!genre) {
      return res.status(404).json({
        message: "Không tìm thấy thể loại",
      });
    }

    await genre.destroy();

    res.json({
      message: "Xoá thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * GET /genre/:id
 */
exports.getGenreById = async (req, res) => {
  try {
    const { id } = req.params;

    const genre = await Genre.findOne({
      attributes: ["genre_id", "genre_name"], // chỉ lấy 2 cột
      where: { genre_id: id },
    });

    if (!genre) {
      return res.status(404).json({
        message: "Không tìm thấy thể loại",
      });
    }

    res.json({
      data: genre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};