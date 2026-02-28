const { Room, Cinema, Seat } = require("../models");

/**
 * GET ALL ROOMS
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: { model: Cinema, attributes: ["cinema_id", "cinema_name"] },
      order: [["room_name", "ASC"]],
    });

    res.json(rooms);
  } catch (err) {
    console.error(err);
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
  try {
    const { cinema_id, room_name, rows, seats_per_row } = req.body;

    if (!cinema_id || !room_name || !rows || !seats_per_row) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const cinema = await Cinema.findByPk(cinema_id);
    if (!cinema) {
      return res.status(404).json({ message: "Rạp không tồn tại" });
    }

    const total_seats = rows * seats_per_row;

    const room = await Room.create({
      cinema_id,
      room_name,
      rows,
      seats_per_row,
      total_seats,
    });

    // 🔥 AUTO CREATE SEATS
    const seats = [];
    for (let i = 0; i < rows; i++) {
      const rowChar = String.fromCharCode(65 + i); // A, B, C

      for (let j = 1; j <= seats_per_row; j++) {
        seats.push({
          room_id: room.room_id,
          seat_row: rowChar,
          seat_number: j,
          seat_code: `${rowChar}${j}`,
        });
      }
    }

    await Seat.bulkCreate(seats);

    res.status(201).json({
      message: "Tạo phòng & ghế thành công",
      room,
      total_seats,
    });
  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);
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
