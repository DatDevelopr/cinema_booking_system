const { Cinema, Region, Room, Showtime } = require("../models");
const { Op, fn, col } = require("sequelize");

/**
 * GET /api/cinemas
 * Lấy danh sách rạp (pagination + filter)
 */
exports.getAllCinemas = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      region,
      search,
      sortBy = "cinema_name",
      sortOrder = "ASC",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const offset = (pageNumber - 1) * limitNumber;

    const where = {};

    if (region && region !== "") {
      where.region_id = Number(region);
    }

    if (search) {
      where.cinema_name = {
        [Op.like]: `%${search}%`,
      };
    }

    let order = [["cinema_name", "ASC"]];

    if (sortBy === "region_name") {
      order = [[Region, "region_name", sortOrder]];
    } else {
      order = [[sortBy, sortOrder]];
    }

    const { rows, count } = await Cinema.findAndCountAll({
      where,

      attributes: {
        include: [[fn("COUNT", col("Rooms.room_id")), "room_count"]],
      },

      include: [
        {
          model: Region,
          attributes: ["region_id", "region_name"],
        },
        {
          model: Room,
          attributes: [],
        },
      ],

      group: ["Cinema.cinema_id", "Region.region_id"],

      order,

      limit: limitNumber,
      offset,

      subQuery: false,
    });

    res.json({
      data: rows,
      pagination: {
        total: count.length,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(count.length / limitNumber),
      },
    });

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
      include: [
        {
          model: Region,
          attributes: ["region_id", "region_name"],
        },
        {
          model: Room,
        },
      ],
    });

    if (!cinema) {
      return res.status(404).json({
        message: "Rạp không tồn tại",
      });
    }

    res.json(cinema);
  } catch (error) {
    console.error("GET CINEMA ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * POST /api/cinemas
 */
exports.createCinema = async (req, res) => {
  try {
    const {
      cinema_name,
      address,
      region_id,
      image,
      description,
      latitude,
      longitude
    } = req.body;

    if (!cinema_name || !address || !region_id) {
      return res.status(400).json({
        message: "Tên rạp, địa chỉ và khu vực là bắt buộc",
      });
    }

    const region = await Region.findByPk(region_id);

    if (!region) {
      return res.status(400).json({
        message: "Khu vực không tồn tại",
      });
    }

    const exists = await Cinema.findOne({
      where: {
        cinema_name: cinema_name.trim(),
        region_id
      },
    });

    if (exists) {
      return res.status(409).json({
        message: "Rạp đã tồn tại trong khu vực này",
      });
    }

    const cinema = await Cinema.create({
      cinema_name: cinema_name.trim(),
      address: address.trim(),
      region_id: Number(region_id),
      image: image || null,
      description: description || null,
      latitude: latitude || null,
      longitude: longitude || null,
      status: 1,
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
 * PUT /api/cinemas/:id
 */
exports.updateCinema = async (req, res) => {
  try {
    const { id } = req.params;

    const cinema = await Cinema.findByPk(id);

    if (!cinema) {
      return res.status(404).json({
        message: "Rạp không tồn tại",
      });
    }

    const {
      cinema_name,
      address,
      region_id,
      image,
      description,
      latitude,
      longitude, 
      status,
    } = req.body;

    if (region_id) {
      const region = await Region.findByPk(region_id);

      if (!region) {
        return res.status(400).json({
          message: "Khu vực không tồn tại",
        });
      }
    }

    if (cinema_name) {
      const exists = await Cinema.findOne({
        where: {
          cinema_name: cinema_name.trim(),
          cinema_id: { [Op.ne]: id },
        },
      });

      if (exists) {
        return res.status(409).json({
          message: "Tên rạp đã tồn tại",
        });
      }
    }

    // Nếu tắt rạp
    if (status === 0) {
      const now = new Date();

      // kiểm tra suất chiếu chưa diễn ra
      const showtimes = await Showtime.count({
        include: [
          {
            model: Room,
            where: {
              cinema_id: id,
            },
            attributes: [],
          },
        ],
        where: {
          status: 1,
          start_time: {
            [Op.gt]: now,
          },
        },
      });

      if (showtimes > 0) {
        return res.status(400).json({
          message:
            "Không thể ngừng hoạt động rạp vì còn suất chiếu chưa diễn ra",
        });
      }

      // tắt toàn bộ phòng
      await Room.update(
        { status: 0 },
        {
          where: { cinema_id: id },
        },
      );

      // lấy danh sách phòng của rạp
      const rooms = await Room.findAll({
        where: { cinema_id: id },
        attributes: ["room_id"],
      });

      const roomIds = rooms.map((r) => r.room_id);

      // tắt toàn bộ suất chiếu của các phòng đó
      if (roomIds.length > 0) {
        await Showtime.update(
          { status: 0 },
          {
            where: {
              room_id: {
                [Op.in]: roomIds,
              },
            },
          },
        );
      }
    }

    await cinema.update({
      cinema_name: cinema_name ?? cinema.cinema_name,
      address: address ?? cinema.address,
      status: status ?? cinema.status,
      region_id: region_id ?? cinema.region_id,
      image: image ?? cinema.image,
      description: description ?? cinema.description,
      latitude: latitude ?? cinema.latitude,
      longitude: longitude ?? cinema.longitude,
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
 * DELETE /api/cinemas/:id
 */
exports.deleteCinema = async (req, res) => {
  try {
    const { id } = req.params;

    const cinema = await Cinema.findByPk(id);

    if (!cinema) {
      return res.status(404).json({
        message: "Rạp không tồn tại",
      });
    }

    const rooms = await Room.count({
      where: { cinema_id: id },
    });

    // Nếu có phòng → không cho xoá
    if (rooms > 0) {
      return res.status(400).json({
        message: "Không thể xoá rạp vì vẫn còn phòng",
      });
    }

    // Nếu không có phòng → soft delete
    await cinema.destroy();

    res.json({
      message: "Đã xóa rạp thành công",
    });
  } catch (error) {
    console.error("DELETE CINEMA ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

