const { Cinema, Region } = require("../models");

/**
 * GET /api/cinemas
 * Lấy danh sách rạp
 */
exports.getAllCinemasByRegion = async (req, res) => {
   try {
    const { region } = req.query;

    const where = {};

    if (region) {
      where.region_id = region;
    }

    const cinemas = await Cinema.findAll({
      where,
      include: {
        model: Region,
        attributes: ["region_id", "region_name"],
      },
      order: [["cinema_name", "ASC"]],
    });

    res.json(cinemas);

  } catch (error) {
    console.error("GET CINEMAS ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * GET /api/cinemas/:id
 */
exports.getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findByPk(req.params.id, {
      include: {
        model: Region,
        attributes: ["region_name"],
      },
    });

    if (!cinema) {
      return res.status(404).json({ message: "Rạp không tồn tại" });
    }

    res.json(cinema);
  } catch (error) {
    console.error("GET CINEMA ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * POST /api/cinemas (ADMIN)
 */
exports.createCinema = async (req, res) => {
  try {
    const { cinema_name, address, region_id } = req.body;

    if (!cinema_name || !address || !region_id) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const region = await Region.findByPk(region_id);
    if (!region) {
      return res.status(400).json({
        message: "Region không tồn tại",
      });
    }

    const cinema = await Cinema.create({
      cinema_name,
      address,
      region_id,
    });

    res.status(201).json({
      message: "Tạo rạp thành công",
      data: cinema,
    });
  } catch (error) {
    console.error("CREATE CINEMA ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * PUT /api/cinemas/:id (ADMIN)
 */
exports.updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByPk(req.params.id);
    if (!cinema) {
      return res.status(404).json({ message: "Rạp không tồn tại" });
    }

    const { cinema_name, address, status, region_id } = req.body;

    if (region_id) {
      const region = await Region.findByPk(region_id);
      if (!region) {
        return res.status(400).json({
          message: "Region không tồn tại",
        });
      }
    }

    await cinema.update({
      cinema_name: cinema_name ?? cinema.cinema_name,
      address: address ?? cinema.address,
      status: status ?? cinema.status,
      region_id: region_id ?? cinema.region_id,
    });

    res.json({
      message: "Cập nhật rạp thành công",
      data: cinema,
    });
  } catch (error) {
    console.error("UPDATE CINEMA ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * DELETE /api/cinemas/:id (ADMIN)
 */
exports.deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByPk(req.params.id);
    if (!cinema) {
      return res.status(404).json({ message: "Rạp không tồn tại" });
    }

    await cinema.destroy();
    res.json({ message: "Xoá rạp thành công" });
  } catch (error) {
    console.error("DELETE CINEMA ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
