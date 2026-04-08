const { Room, Cinema, Seat, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * GET ALL ROOMS
 */
exports.getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cinema_id,
      search,
      sortBy = "room_name",
      sortOrder = "ASC",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const where = {};

    if (cinema_id) {
      where.cinema_id = cinema_id;
    }

    if (search) {
      where.room_name = {
        [Op.like]: `%${search}%`,
      };
    }

    // ✅ whitelist sort
    const allowedSort = ["room_name", "total_seats", "rows"];
    let order = [["room_name", "ASC"]];

    if (allowedSort.includes(sortBy)) {
      order = [[sortBy, sortOrder]];
    }

    const { rows, count } = await Room.findAndCountAll({
      where,
      include: {
        model: Cinema,
        attributes: ["cinema_id", "cinema_name"],
      },
      order,
      limit: limitNumber,
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(count / limitNumber),
      },
    });

  } catch (err) {
    console.error("GET ROOMS ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * GET ROOMS BY CINEMA
 */
exports.getRoomsByCinema = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { cinema_id: req.params.cinemaId },
    });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * CREATE ROOM + AUTO CREATE SEATS
 */

exports.createRoom = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { cinema_id, room_name, rows, seats_per_row } = req.body;

    if (!cinema_id || !room_name || !rows || !seats_per_row) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const exists = await Room.findOne({
      where: { cinema_id, room_name },
    });

    if (exists) {
      return res.status(409).json({
        message: "Tên phòng đã tồn tại trong rạp",
      });
    }

    const total_seats = rows * seats_per_row;

    const room = await Room.create(
      {
        cinema_id,
        room_name,
        rows,
        seats_per_row,
        total_seats,
      },
      { transaction: t }
    );

    // create seats
    const seats = [];
    for (let i = 0; i < rows; i++) {
      const rowChar = String.fromCharCode(65 + i);

      for (let j = 1; j <= seats_per_row; j++) {
        seats.push({
          room_id: room.room_id,
          seat_row: rowChar,
          seat_number: j,
          seat_code: `${rowChar}${j}`,
        });
      }
    }

    await Seat.bulkCreate(seats, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Tạo phòng thành công",
      room,
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * UPDATE ROOM
 */
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Phòng không tồn tại" });
    }

    const { room_name } = req.body;
    await room.update({ room_name });

    res.json({ message: "Cập nhật thành công", room });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * DELETE ROOM
 */
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Phòng không tồn tại" });
    }

    await Seat.destroy({ where: { room_id: room.room_id } });
    await room.destroy();

    res.json({ message: "Xóa phòng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
