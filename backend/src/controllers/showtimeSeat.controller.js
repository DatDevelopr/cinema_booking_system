const { Showtime, ShowtimeSeat, Seat, Room } = require("../models");

exports.getSeatMapByShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findByPk(showtimeId, {
      include: {
        model: Room,
        attributes: ["room_id", "room_name"]
      }
    });

    if (!showtime) {
      return res.status(404).json({ message: "Không tồn tại" });
    }

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

    const seatMap = seats.map(item => ({
      seat_id: item.seat_id,
      row: item.Seat.seat_row,
      number: item.Seat.seat_number,
      type: item.Seat.seat_type,
      price: item.price,          // ✅ FIX
      status: item.status
    }));

    res.json({
      showtime_id: showtime.showtime_id,
      room: showtime.Room,
      seats: seatMap
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};