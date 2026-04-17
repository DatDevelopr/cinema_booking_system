const { ShowtimeSeat } = require("../models");
const { sequelize } = require("../models");
const socket = require("../socket");

exports.bookSeats = async (req, res) => {
  const { showtime_id, seat_ids } = req.body;
  const t = await sequelize.transaction();

  try {
    const seats = await ShowtimeSeat.findAll({
      where: {
        showtime_id,
        seat_id: seat_ids,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // ❗ check đủ ghế
    if (seats.length !== seat_ids.length) {
      throw new Error("Một số ghế không tồn tại");
    }

    const now = new Date();

    // ❗ check trạng thái + hết hạn
    for (let s of seats) {
      if (s.status !== "HOLD" || !s.hold_at || s.hold_at < now) {
        throw new Error("Ghế đã hết thời gian giữ hoặc không hợp lệ");
      }
    }

    // ✅ update
    await ShowtimeSeat.update(
      {
        status: "BOOKED",
        hold_at: null,
      },
      {
        where: {
          showtime_id,
          seat_id: seat_ids,
        },
        transaction: t,
      }
    );

    await t.commit();

    socket.emitSeatUpdate(showtime_id, {
      seat_ids,
      status: "BOOKED",
    });

    res.json({ message: "Đặt vé thành công" });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};