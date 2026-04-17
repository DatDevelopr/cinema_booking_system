const cron = require("node-cron");
const { ShowtimeSeat } = require("../models");
const socket = require("../socket");
const { Op } = require("sequelize");

module.exports = () => {
  // chạy mỗi 1 phút
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredSeats = await ShowtimeSeat.findAll({
        where: {
          status: "HOLD",
          hold_at: { [Op.lte]: now },
        },
      });

      if (!expiredSeats.length) return;

      const grouped = {};

      expiredSeats.forEach((s) => {
        if (!grouped[s.showtime_id]) grouped[s.showtime_id] = [];
        grouped[s.showtime_id].push(s.seat_id);
      });

      await ShowtimeSeat.update(
        {
          status: "AVAILABLE",
          hold_at: null,
        },
        {
          where: {
            status: "HOLD",
            hold_at: { [Op.lte]: now },
          },
        },
      );

      for (const showtimeId in grouped) {
        socket.emitSeatUpdate(showtimeId, {
          seat_ids: grouped[showtimeId],
          status: "AVAILABLE",
        });
      }

      console.log(`♻️ Released ${expiredSeats.length} seats`);
    } catch (err) {
      console.error("CRON ERROR:", err);
    }
  });
};
