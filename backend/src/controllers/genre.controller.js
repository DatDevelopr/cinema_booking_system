const { Genre } = require("../models");

/**
 * USER + ADMIN - LẤY DANH SÁCH GENRE
 */
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll({
      where: { status: 1 },
      order: [["name", "ASC"]],
    });

    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - TẠO GENRE
 */
exports.createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Tên thể loại là bắt buộc",
      });
    }

    const exists = await Genre.findOne({ where: { name } });
    if (exists) {
      return res.status(409).json({
        message: "Thể loại đã tồn tại",
      });
    }

    const genre = await Genre.create({
      name,
      description,
    });

    res.status(201).json({
      message: "Tạo thể loại thành công",
      genre_id: genre.genre_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - CẬP NHẬT GENRE
 */
exports.updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
      return res.status(404).json({
        message: "Thể loại không tồn tại",
      });
    }

    await genre.update(req.body);

    res.json({
      message: "Cập nhật thể loại thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - XOÁ GENRE (SOFT DELETE)
 */
exports.deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
      return res.status(404).json({
        message: "Thể loại không tồn tại",
      });
    }

    await genre.update({ status: 0 });

    res.json({
      message: "Xoá thể loại thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
``
