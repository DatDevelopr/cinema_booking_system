const { Showtime, ShowtimeSeat, Seat, Room } = require("../models");

/**
 * GET /api/showtimes/:showtimeId/seats
 * Lấy sơ đồ ghế theo suất chiếu
 */
exports.getSeatMapByShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    // 1️⃣ Kiểm tra showtime tồn tại
    const showtime = await Showtime.findByPk(showtimeId, {
      include: {
        model: Room,
        attributes: ["room_id", "room_name"]
      }
    });

    if (!showtime) {
      return res.status(404).json({ message: "Suất chiếu không tồn tại" });
    }

    // 2️⃣ Lấy showtime_seats + seat info
    const seats = await ShowtimeSeat.findAll({
      where: { showtime_id: showtimeId },
      include: {
        model: Seat,
        attributes: ["seat_id", "seat_row", "seat_number", "seat_type"]
      },
      order: [
        [{ model: Seat }, "seat_row", "ASC"],
        [{ model: Seat }, "seat_number", "ASC"]
      ]
    });

    // 3️⃣ Format dữ liệu cho FE
    const seatMap = seats.map(item => ({
      seat_id: item.seat_id,
      seat_row: item.Seat.seat_row,
      seat_number: item.Seat.seat_number,
      seat_type: item.Seat.seat_type,
      status: item.status
    }));

    res.json({
      showtime_id: showtime.showtime_id,
      room: showtime.Room,
      seats: seatMap
    });

  } catch (error) {
    console.error("GET SEAT MAP ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
