const { sequelize, ShowtimeSeat } = require("../models");
const socket = require("../socket");

exports.holdSeats = async (req, res) => {
  const { showtime_id, seat_ids } = req.body;
  const now = new Date();

  const transaction = await sequelize.transaction();

  try {
    // 1️⃣ LOCK ghế
    const seats = await ShowtimeSeat.findAll({
      where: {
        showtime_id,
        seat_id: seat_ids,
      },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (seats.length !== seat_ids.length) {
      throw new Error("Ghế không tồn tại");
    }

    // 2️⃣ check trạng thái
    const invalid = seats.find(s => s.status !== "AVAILABLE");
    if (invalid) {
      throw new Error("Có ghế đã được giữ hoặc đặt");
    }

    // 3️⃣ HOLD
    await ShowtimeSeat.update(
      {
        status: "HOLD",
        hold_at: now,
      },
      {
        where: {
          showtime_id,
          seat_id: seat_ids,
        },
        transaction,
      }
    );

    await transaction.commit();

    // 4️⃣ realtime
    socket.emitSeatUpdate(showtime_id, {
      seat_ids,
      status: "HOLD",
    });

    res.json({ message: "Giữ ghế thành công" });
  } catch (err) {
    await transaction.rollback();
    res.status(409).json({ message: err.message });
  }
};