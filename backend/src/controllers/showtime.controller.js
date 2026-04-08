const {
  Showtime,
  Seat,
  ShowtimeSeat,
  Movie,
  Room,
  Cinema,
} = require("../models");

const sequelize = require("../config/database");
const { Op } = require("sequelize");

/* ================= CREATE ================= */
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

    if (!movie_id || !room_id || !start_time) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const movie = await Movie.findByPk(movie_id);
    if (!movie) return res.status(404).json({ message: "Phim không tồn tại" });

    const start = new Date(start_time);
    const end = new Date(start.getTime() + movie.duration * 60000);

    /* 🔥 CHECK TRÙNG */
    const conflict = await Showtime.findOne({
      where: {
        room_id,
        [Op.or]: [
          { start_time: { [Op.between]: [start, end] } },
          { end_time: { [Op.between]: [start, end] } },
          {
            start_time: { [Op.lte]: start },
            end_time: { [Op.gte]: end },
          },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({ message: "Trùng lịch phòng" });
    }

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
      { transaction: t },
    );

    const seats = await Seat.findAll({ where: { room_id } });

    const getPrice = (seat) => {
      if (seat.seat_type === "VIP") return 120000;
      if (seat.seat_type === "COUPLE") return 150000;
      return 80000;
    };

    const data = seats.map((s) => ({
      showtime_id: showtime.showtime_id,
      seat_id: s.seat_id,
      price: getPrice(s),
      status: "AVAILABLE",
    }));

    await ShowtimeSeat.bulkCreate(data, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Tạo thành công",
      data: showtime,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL ================= */
exports.getAllShowtimes = async (req, res) => {
  try {
    const { movie_id, room_id, date, status } = req.query;

    const where = {};

    if (movie_id) where.movie_id = movie_id;
    if (room_id) where.room_id = room_id;
    if (status) where.status = status;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59);

      where.start_time = {
        [Op.between]: [start, end],
      };
    }

    const data = await Showtime.findAll({
      where,
      include: [
        { model: Movie, attributes: ["title"] },
        { model: Room, attributes: ["room_name"] },
      ],
      order: [["start_time", "DESC"]],
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DETAIL ================= */
exports.getShowtimeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const showtime = await Showtime.findByPk(id, {
      include: [{ model: Movie }, { model: Room }],
    });

    if (!showtime) {
      return res.status(404).json({ message: "Không tồn tại" });
    }

    res.json({ data: showtime });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= UPDATE ================= */
exports.updateShowtime = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { start_time, format, language, status } = req.body;

    const showtime = await Showtime.findByPk(id);
    if (!showtime) return res.status(404).json({ message: "Không tồn tại" });

    /* ❗ check đã đặt vé chưa */
    const booked = await ShowtimeSeat.findOne({
      where: { showtime_id: id, status: "BOOKED" },
    });

    if (booked) {
      return res.status(400).json({
        message: "Đã có người đặt, không thể sửa",
      });
    }

    let newStart = showtime.start_time;
    let newEnd = showtime.end_time;

    if (start_time) {
      const movie = await Movie.findByPk(showtime.movie_id);

      newStart = new Date(start_time);
      newEnd = new Date(newStart.getTime() + movie.duration * 60000);

      /* 🔥 CHECK TRÙNG */
      const conflict = await Showtime.findOne({
        where: {
          room_id: showtime.room_id,
          showtime_id: { [Op.ne]: id },
          [Op.or]: [
            { start_time: { [Op.between]: [newStart, newEnd] } },
            { end_time: { [Op.between]: [newStart, newEnd] } },
            {
              start_time: { [Op.lte]: newStart },
              end_time: { [Op.gte]: newEnd },
            },
          ],
        },
      });

      if (conflict) {
        return res.status(400).json({ message: "Trùng lịch phòng" });
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

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE ================= */
exports.deleteShowtime = async (req, res) => {
  try {
    const { id } = req.params;

    const showtime = await Showtime.findByPk(id);
    if (!showtime) return res.status(404).json({ message: "Không tồn tại" });

    await showtime.update({ status: "CANCELLED" });

    res.json({ message: "Đã huỷ suất chiếu" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getShowtimesByCinema = async (req, res) => {
  try {
    const {
      cinema_id,
      room_id,
      date,
      sort = "ASC",
      page = 1,
      limit = 10,
    } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        message: "Thiếu cinema_id",
      });
    }

    /* ================= PAGINATION ================= */
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    /* ================= FILTER SHOWTIME ================= */
    const showtimeWhere = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      showtimeWhere.start_time = {
        [Op.between]: [start, end],
      };
    }

    /* ================= FILTER ROOM ================= */
    const roomWhere = {
      cinema_id: Number(cinema_id),
    };

    if (room_id) {
      roomWhere.room_id = Number(room_id);
    }

    /* ================= QUERY ================= */
    const { count, rows } = await Showtime.findAndCountAll({
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
        ["start_time", sort.toUpperCase() === "DESC" ? "DESC" : "ASC"],
      ],

      limit: limitNum,
      offset,
      distinct: true, // 🔥 tránh count sai khi join
    });

    /* ================= GROUP DATA ================= */
    const cinemaMap = {};

    rows.forEach((s) => {
      const cinema = s.Room.Cinema;
      const room = s.Room;

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
        movie_id: s.Movie.movie_id,
        movie_title: s.Movie.title,
        start_time: s.start_time,
        end_time: s.end_time,
        format: s.format,
        language: s.language,
        status: s.status,
      });
    });

    /* ================= FORMAT OUTPUT ================= */
    const result = Object.values(cinemaMap).map((cinema) => ({
      cinema_id: cinema.cinema_id,
      cinema_name: cinema.cinema_name,
      rooms: Object.values(cinema.rooms),
    }));

    return res.json({
      data: result,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error("GET SHOWTIME BY CINEMA ERROR:", err);
    return res.status(500).json({
      message: err.message || "Lỗi server",
    });
  }
};