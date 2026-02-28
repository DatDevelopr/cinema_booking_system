const { Showtime, Seat, ShowtimeSeat, Room } = require("../models");
const sequelize = require("../config/database");

/**
 * POST /api/showtimes (ADMIN)
 */
exports.createShowtime = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      movie_id,
      room_id,
      start_time,
      price
    } = req.body;

    if (!movie_id || !room_id || !start_time || !price) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    // 1️⃣ Tạo showtime
    const showtime = await Showtime.create({
      movie_id,
      room_id,
      start_time,
      price,
      status: "ACTIVE"
    }, { transaction: t });

    // 2️⃣ Lấy tất cả seat của room
    const seats = await Seat.findAll({
      where: { room_id }
    });

    if (!seats.length) {
      throw new Error("Phòng chưa có ghế");
    }

    // 3️⃣ Sinh showtime_seats
    const showtimeSeats = seats.map(seat => ({
      showtime_id: showtime.showtime_id,
      seat_id: seat.seat_id,
      status: "AVAILABLE"
    }));

    await ShowtimeSeat.bulkCreate(showtimeSeats, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Tạo suất chiếu thành công",
      data: showtime
    });

  } catch (error) {
    await t.rollback();
    console.error("CREATE SHOWTIME ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
