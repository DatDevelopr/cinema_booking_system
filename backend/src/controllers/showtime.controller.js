const {
  Showtime,
  Seat,
  ShowtimeSeat,
  Movie,
  Room,
  Cinema,
  Ticket,
  Payment,
  PaymentTicket,
  MovieGenre,
  Genre,
  sequelize
} = require("../models");
const { Op } = require("sequelize");
const socket = require("../socket");

const SEAT_PRICE = {
  NORMAL: 60000,
  VIP: 80000,
  COUPLE: 110000,
};

// Tạo suất chiếu
exports.createShowtime = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      movie_id,
      room_id,
      start_time,
      format = "2D",
      language = "SUB",
    } = req.body;

    /* ================= VALIDATE INPUT ================= */
    if (!movie_id || !room_id || !start_time) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const movie = await Movie.findByPk(movie_id);
    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại" });
    }

    const start = new Date(start_time);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Thời gian không hợp lệ" });
    }

    const now = new Date();
    if (start < now) {
      return res.status(400).json({
        message: "Không thể tạo suất chiếu trong quá khứ",
      });
    }

    const releaseDate = new Date(movie.release_date);
    releaseDate.setHours(0, 0, 0, 0);

    if (start < releaseDate) {
      return res.status(400).json({
        message: "Không thể tạo trước ngày khởi chiếu",
      });
    }

    /* ================= TÍNH END TIME ================= */
    const end = new Date(start.getTime() + movie.duration * 60000);

    /* ================= CHECK OVERLAP ================= */
    const conflict = await Showtime.findOne({
      where: {
        room_id,
        [Op.and]: [
          { start_time: { [Op.lt]: end } },
          { end_time: { [Op.gt]: start } },
        ],
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (conflict) {
      await t.rollback();
      return res.status(400).json({
        message: "Suất chiếu bị trùng lịch trong phòng này",
      });
    }

    /* ================= CREATE SHOWTIME ================= */
    const showtime = await Showtime.create(
      {
        movie_id,
        room_id,
        start_time: start,
        end_time: end,
        format,
        language,
        status: "UPCOMING",
      },
      { transaction: t }
    );

    /* ================= CREATE SHOWTIME SEATS ================= */
    const seats = await Seat.findAll({
      where: { room_id },
      transaction: t,
    });

    const showtimeSeats = seats.map((seat) => ({
      showtime_id: showtime.showtime_id,
      seat_id: seat.seat_id,
      price: SEAT_PRICE[seat.seat_type] || SEAT_PRICE.NORMAL,
      status: "AVAILABLE",
    }));

    await ShowtimeSeat.bulkCreate(showtimeSeats, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: "Tạo suất chiếu thành công",
      data: showtime,
    });

  } catch (err) {
    await t.rollback();
    console.error("CREATE SHOWTIME ERROR:", err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// lấy tất cả suất chiếu (dành cho admin)
exports.getAllShowtimes = async (req, res) => {
  try {
    const { movie_id, cinema_id, date } = req.query;

    /* ================= WHERE ================= */
    const where = {
      status: "UPCOMING", // ✅ chỉ lấy UPCOMING
    };

    if (movie_id) where.movie_id = movie_id;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      where.start_time = {
        [Op.between]: [start, end],
      };
    }

    /* ================= QUERY ================= */
    const data = await Showtime.findAll({
      where,
      include: [
        {
          model: Movie,
          attributes: ["movie_id", "title", "duration"],
        },
        {
          model: Room,
          required: true,
          attributes: ["room_id", "room_name"],
          where: cinema_id ? { cinema_id: Number(cinema_id) } : {},
          include: [
            {
              model: Cinema,
              attributes: ["cinema_id", "cinema_name"],
            },
          ],
        },
      ],
      order: [["start_time", "ASC"]],
    });

    return res.json({ data });
  } catch (err) {
    console.error("GET SHOWTIME ERROR:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// lấy chi tiết suất chiếu
exports.getShowtimeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const showtime = await Showtime.findByPk(id, {
      attributes: [
        "showtime_id",
        "movie_id",
        "room_id",
        "start_time",
        "end_time",
        "format",
        "language",
        "status",
      ],
      include: [
        {
          model: Movie,
          attributes: [
            "movie_id",
            "title",
            "duration",
            "release_date",
            "poster_url",
            "director",
            "actors"
          ],
          include: [
            {
              model: Genre,
              attributes: ["genre_id", "genre_name"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: Room,
          attributes: ["room_id", "room_name", "cinema_id"],
          include: [
            {
              model: Cinema,
              attributes: ["cinema_id", "cinema_name"],
            },
          ],
        },
      ],
    });

    if (!showtime) {
      return res.status(404).json({
        message: "Suất chiếu không tồn tại",
      });
    }

    return res.json({
      data: showtime,
    });
  } catch (err) {
    console.error("GET SHOWTIME DETAIL ERROR:", err);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// cập nhật suất chiếu.
exports.updateShowtime = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { start_time, format, language, status } = req.body;

    const showtime = await Showtime.findByPk(id, { transaction: t });
    if (!showtime) {
      await t.rollback();
      return res.status(404).json({ message: "Không tồn tại" });
    }

    // ❗ Không cho sửa nếu đã kết thúc / hủy
    if (["ENDED", "CANCELLED"].includes(showtime.status)) {
      await t.rollback();
      return res.status(400).json({
        message: "Không thể chỉnh sửa suất chiếu này",
      });
    }

    // ❗ Check đã đặt vé
    const booked = await ShowtimeSeat.findOne({
      where: { showtime_id: id, status: "BOOKED" },
      transaction: t,
    });

    if (booked) {
      await t.rollback();
      return res.status(400).json({
        message: "Đã có người đặt, không thể sửa",
      });
    }

    let newStart = showtime.start_time;
    let newEnd = showtime.end_time;

    if (start_time) {
      const movie = await Movie.findByPk(showtime.movie_id, {
        transaction: t,
      });

      // ✅ parse time chuẩn
      newStart = new Date(start_time);
      if (isNaN(newStart.getTime())) {
        await t.rollback();
        return res.status(400).json({
          message: "Thời gian không hợp lệ",
        });
      }

      newEnd = new Date(newStart.getTime() + movie.duration * 60000);

      const now = new Date();

      // ❗ Không cho chọn quá khứ
      if (newStart < now) {
        await t.rollback();
        return res.status(400).json({
          message: "Không thể chọn thời gian trong quá khứ",
        });
      }

      // ❗ Check release_date
      if (movie.release_date) {
        const releaseDate = new Date(movie.release_date);
        releaseDate.setHours(0, 0, 0, 0);

        if (newStart < releaseDate) {
          await t.rollback();
          return res.status(400).json({
            message: "Phim chưa đến ngày khởi chiếu",
          });
        }
      }

      // 🔥 FIX QUAN TRỌNG: đúng field + transaction + lock
      const conflict = await Showtime.findOne({
        where: {
          room_id: showtime.room_id,
          showtime_id: { [Op.ne]: id },
          start_time: { [Op.lt]: newEnd },
          end_time: { [Op.gt]: newStart },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (conflict) {
        await t.rollback();
        return res.status(400).json({
          message: "Trùng lịch phòng",
        });
      }
    }

    await showtime.update(
      {
        start_time: newStart,
        end_time: newEnd,
        format: format || showtime.format,
        language: language || showtime.language,
        status: status || showtime.status,
      },
      { transaction: t },
    );

    await t.commit();

    return res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    await t.rollback();
    console.error("UPDATE SHOWTIME ERROR:", err);

    return res.status(500).json({
      message: err.message || "Lỗi server",
    });
  }
};

// xóa mềm suất chiếu.
exports.deleteShowtime = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const showtime = await Showtime.findByPk(id, { transaction: t });

    if (!showtime) {
      await t.rollback();
      return res.status(404).json({ message: "Suất chiếu không tồn tại" });
    }

    if (showtime.status === "CANCELLED") {
      await t.rollback();
      return res.status(400).json({ message: "Suất chiếu đã bị hủy trước đó" });
    }

    // =============================
    // 1. Lấy danh sách vé
    // =============================
    const tickets = await Ticket.findAll({
      where: { showtime_id: id },
      transaction: t,
    });

    // =============================
    // 2. Nếu chưa có vé
    // =============================
    if (tickets.length === 0) {
      await showtime.update({ status: "CANCELLED" }, { transaction: t });

      await t.commit();
      return res.json({ message: "Đã hủy suất chiếu (chưa có người đặt)" });
    }

    const ticketIds = tickets.map((t) => t.ticket_id);

    // =============================
    // 3. Lấy payment liên quan
    // =============================
    const paymentTickets = await PaymentTicket.findAll({
      where: {
        ticket_id: ticketIds,
      },
      transaction: t,
    });

    const paymentIds = [...new Set(paymentTickets.map((pt) => pt.payment_id))];

    // =============================
    // 4. Update Ticket -> CANCELLED
    // =============================
    await Ticket.update(
      { ticket_status: "CANCELLED" },
      {
        where: { showtime_id: id },
        transaction: t,
      },
    );

    // =============================
    // 5. Update Payment -> REFUNDED
    // =============================
    if (paymentIds.length > 0) {
      await Payment.update(
        { payment_status: "REFUNDED" },
        {
          where: { payment_id: paymentIds },
          transaction: t,
        },
      );
    }

    // =============================
    // 6. Update Showtime
    // =============================
    await showtime.update({ status: "CANCELLED" }, { transaction: t });

    await t.commit();

    return res.json({
      message: "Đã hủy suất chiếu và hoàn tiền cho khách",
    });
  } catch (error) {
    await t.rollback();
    console.error("Delete showtime error:", error);

    return res.status(500).json({
      message: "Lỗi server khi hủy suất chiếu",
    });
  }
};

exports.getShowtimesByCinema = async (req, res) => {
  try {
    const { cinema_id, room_id, date, sort = "ASC" } = req.query;

    if (!cinema_id) {
      return res.status(400).json({ message: "Thiếu cinema_id" });
    }

    /* ================= VALIDATE ================= */
    const sortOrder = ["ASC", "DESC"].includes(sort.toUpperCase())
      ? sort.toUpperCase()
      : "ASC";

    /* ================= FILTER ================= */
    const showtimeWhere = {};

    if (date) {
      const start = new Date(date + "T00:00");
      const end = new Date(date + "T23:59");
      end.setHours(23, 59, 59, 999);

      showtimeWhere.start_time = {
        [Op.between]: [start, end],
      };
    }

    const roomWhere = {
      cinema_id: Number(cinema_id),
    };

    if (room_id) {
      roomWhere.room_id = Number(room_id);
    }

    /* ================= QUERY ================= */
    const rows = await Showtime.findAll({
      where: showtimeWhere,
      include: [
        {
          model: Room,
          required: true,
          attributes: ["room_id", "room_name", "cinema_id"],
          where: roomWhere,
          include: [
            {
              model: Cinema,
              attributes: ["cinema_id", "cinema_name"],
            },
          ],
        },
        {
          model: Movie,
          attributes: ["movie_id", "title", "duration"],
        },
      ],
      order: [
        [{ model: Room }, "room_name", "ASC"],
        ["start_time", sortOrder],
      ],
    });

    /* ================= GROUP ================= */
    const cinemaMap = {};

    rows.forEach((s) => {
      const room = s.Room;
      const cinema = room?.Cinema;

      if (!cinema) return;

      if (!cinemaMap[cinema.cinema_id]) {
        cinemaMap[cinema.cinema_id] = {
          cinema_id: cinema.cinema_id,
          cinema_name: cinema.cinema_name,
          rooms: {},
        };
      }

      const cinemaGroup = cinemaMap[cinema.cinema_id];

      if (!cinemaGroup.rooms[room.room_id]) {
        cinemaGroup.rooms[room.room_id] = {
          room_id: room.room_id,
          room_name: room.room_name,
          showtimes: [],
        };
      }

      cinemaGroup.rooms[room.room_id].showtimes.push({
        showtime_id: s.showtime_id,
        movie_id: s.Movie?.movie_id,
        movie_title: s.Movie?.title,
        start_time: s.start_time,
        end_time: s.end_time,
        format: s.format,
        language: s.language,
        status: s.status,
      });
    });

    const result = Object.values(cinemaMap).map((cinema) => ({
      cinema_id: cinema.cinema_id,
      cinema_name: cinema.cinema_name,
      rooms: Object.values(cinema.rooms),
    }));

    return res.json({
      data: result,
    });
  } catch (err) {
    console.error("GET SHOWTIME BY CINEMA ERROR:", err);
    return res.status(500).json({
      message: err.message || "Lỗi server",
    });
  }
};

exports.getSeatMapByShowtime = async (req, res) => {
  try {
    const { id } = req.params;

    const showtime = await Showtime.findByPk(id, {
      include: {
        model: Room,
        attributes: ["room_id", "room_name"]
      }
    });

    if (!showtime) {
      return res.status(404).json({ message: "Không tồn tại" });
    }

    const seats = await ShowtimeSeat.findAll({
      where: { showtime_id: id },
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


// giữ ghế 
exports.holdSeats = async (req, res) => {
  const { showtime_id, seat_ids } = req.body;
  const HOLD_TIME = 5 * 60 * 1000;

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
        hold_at: new Date(Date.now() + HOLD_TIME),
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

// nhả ghế.
exports.releaseSeats = async (req, res) => {
  const { showtime_id, seat_ids } = req.body;

  try {
    await ShowtimeSeat.update(
      {
        status: "AVAILABLE",
        hold_at: null,
      },
      {
        where: {
          showtime_id,
          seat_id: seat_ids,
          status: "HOLD",
        },
      }
    );

    socket.emitSeatUpdate(showtime_id, {
      seat_ids,
      status: "AVAILABLE",
    });

    res.json({ message: "Đã nhả ghế" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};