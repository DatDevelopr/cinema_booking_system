const cron = require("node-cron");
const { ShowtimeSeat } = require("../models");
const socket = require("../socket");
const { Op } = require("sequelize");

module.exports = () => {
  // chạy mỗi 1 phút
  cron.schedule("* * * * *", async () => {
    const expireTime = new Date(Date.now() - 5 * 60 * 1000);

    const expiredSeats = await ShowtimeSeat.findAll({
      where: {
        status: "HOLD",
        hold_at: { [Op.lte]: expireTime },
      },
    });

    if (!expiredSeats.length) return;

    const seatIds = expiredSeats.map(s => s.seat_id);
    const showtimeId = expiredSeats[0].showtime_id;

    await ShowtimeSeat.update(
      {
        status: "AVAILABLE",
        hold_at: null,
      },
      {
        where: {
          status: "HOLD",
          hold_at: { [Op.lte]: expireTime },
        },
      }
    );

    // realtime notify
    socket.emitSeatUpdate(showtimeId, {
      seat_ids: seatIds,
      status: "AVAILABLE",
    });

    console.log(`♻️ Released ${seatIds.length} seats`);
  });
};
