const { Seat } = require("../models");
const { Op } = require("sequelize");

/**
 * GET SEATS BY ROOM
 */
exports.getSeatsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const seats = await Seat.findAll({
      where: { room_id: roomId },
      order: [
        ["seat_row", "ASC"],
        ["seat_number", "ASC"],
      ],
    });

    res.json(seats);
  } catch (err) {
    console.error("GET SEATS ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * UPDATE SINGLE SEAT TYPE
 */
exports.updateSeatType = async (req, res) => {
  try {
    const { id } = req.params;
    const { seat_type } = req.body;

    if (!["NORMAL", "VIP", "COUPLE"].includes(seat_type)) {
      return res.status(400).json({
        message: "Loại ghế không hợp lệ",
      });
    }

    const seat = await Seat.findByPk(id);

    if (!seat) {
      return res.status(404).json({
        message: "Ghế không tồn tại",
      });
    }

    await seat.update({ seat_type });

    res.json({
      message: "Cập nhật ghế thành công",
      seat,
    });
  } catch (err) {
    console.error("UPDATE SEAT ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * UPDATE MULTIPLE SEATS (BULK)
 * body: { seat_ids: [], seat_type }
 */
exports.updateMultipleSeats = async (req, res) => {
  try {
    const { seat_ids, seat_type } = req.body;

    if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
      return res.status(400).json({
        message: "Danh sách ghế không hợp lệ",
      });
    }

    if (!["NORMAL", "VIP", "COUPLE"].includes(seat_type)) {
      return res.status(400).json({
        message: "Loại ghế không hợp lệ",
      });
    }

    await Seat.update(
      { seat_type },
      {
        where: {
          seat_id: {
            [Op.in]: seat_ids,
          },
        },
      }
    );

    res.json({
      message: "Cập nhật nhiều ghế thành công",
    });
  } catch (err) {
    console.error("BULK UPDATE SEATS ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * RESET ALL SEATS IN ROOM → NORMAL
 */
exports.resetSeatsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    await Seat.update(
      { seat_type: "NORMAL" },
      {
        where: { room_id: roomId },
      }
    );

    res.json({
      message: "Reset ghế về NORMAL thành công",
    });
  } catch (err) {
    console.error("RESET SEATS ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * GET SEAT STATISTICS (optional - đẹp cho dashboard)
 */
exports.getSeatStats = async (req, res) => {
  try {
    const { roomId } = req.params;

    const total = await Seat.count({
      where: { room_id: roomId },
    });

    const vip = await Seat.count({
      where: { room_id: roomId, seat_type: "VIP" },
    });

    const couple = await Seat.count({
      where: { room_id: roomId, seat_type: "COUPLE" },
    });

    const normal = total - vip - couple;

    res.json({
      total,
      normal,
      vip,
      couple,
    });
  } catch (err) {
    console.error("SEAT STATS ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};