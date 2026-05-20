// controllers/movieRevenue.controller.js

const { Op, fn, col, literal } = require("sequelize");
const ExcelJS = require("exceljs");
const {
  Movie,
  Showtime,
  ShowtimeSeat,
  Ticket,
  Order,
  OrderTicket,
  Room,
  Cinema,
  sequelize,
} = require("../models");

/*
==================================================
HELPER: GENERATE DATE LABELS
==================================================
*/

const generateDateLabels = (startDate, endDate, type = "day") => {
  const labels = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (type === "day") {
      labels.push(current.toISOString().split("T")[0]);

      current.setDate(current.getDate() + 1);
    } else if (type === "month") {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");

      labels.push(`${year}-${month}`);

      current.setMonth(current.getMonth() + 1);
    } else if (type === "year") {
      labels.push(String(current.getFullYear()));

      current.setFullYear(current.getFullYear() + 1);
    }
  }

  return labels;
};
/*
==================================================
1. DOANH THU TỔNG THEO PHIM
GET /api/movie-revenue/summary
==================================================
*/

exports.getMovieRevenueSummary = async (req, res) => {
  try {
    const { from, to, movie_id } = req.query;

    let whereOrder = {
      order_status: "PAID",
    };

    if (from && to) {
      whereOrder.created_at = {
        [Op.between]: [
          new Date(from + " 00:00:00"),
          new Date(to + " 23:59:59"),
        ],
      };
    }

    let whereMovie = {};
    if (movie_id) {
      whereMovie.movie_id = movie_id;
    }

    const rows = await OrderTicket.findAll({
      include: [
        {
          model: Ticket,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              attributes: ["price"],
              include: [
                {
                  model: Showtime,
                  attributes: [],
                  where: whereMovie,
                  include: [
                    {
                      model: Movie,
                      attributes: ["movie_id", "title", "poster_url"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Order,
          attributes: [],
          where: whereOrder,
        },
      ],

      attributes: [
        [col("Ticket.ShowtimeSeat.Showtime.Movie.movie_id"), "movie_id"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.title"), "title"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.poster_url"), "poster_url"],
        [fn("COUNT", col("OrderTicket.ticket_id")), "tickets_sold"],
        [fn("SUM", col("Ticket.ShowtimeSeat.price")), "ticket_revenue"],
      ],

      group: ["Ticket.ShowtimeSeat.Showtime.Movie.movie_id"],

      order: [[literal("ticket_revenue"), "DESC"]],

      raw: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET MOVIE REVENUE SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
==================================================
2. TOP PHIM DOANH THU CAO NHẤT
GET /api/movie-revenue/top
==================================================
*/

exports.getTopMoviesRevenue = async (req, res) => {
  try {
    const { limit = 5, from, to } = req.query;

    let whereOrder = {
      order_status: "PAID",
    };

    if (from && to) {
      whereOrder.created_at = {
        [Op.between]: [
          new Date(from + " 00:00:00"),
          new Date(to + " 23:59:59"),
        ],
      };
    }

    const rows = await OrderTicket.findAll({
      include: [
        {
          model: Ticket,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              attributes: ["price"],
              include: [
                {
                  model: Showtime,
                  attributes: [],
                  include: [
                    {
                      model: Movie,
                      attributes: ["movie_id", "title", "poster_url"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Order,
          attributes: [],
          where: whereOrder,
        },
      ],

      attributes: [
        [col("Ticket.ShowtimeSeat.Showtime.Movie.movie_id"), "movie_id"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.title"), "title"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.poster_url"), "poster_url"],
        [fn("COUNT", col("OrderTicket.ticket_id")), "tickets_sold"],
        [fn("SUM", col("Ticket.ShowtimeSeat.price")), "revenue"],
      ],

      group: ["Ticket.ShowtimeSeat.Showtime.Movie.movie_id"],

      order: [[literal("revenue"), "DESC"]],

      limit: Number(limit),
      raw: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET TOP MOVIES REVENUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
==================================================
3. CHI TIẾT DOANH THU 1 PHIM
GET /api/movie-revenue/:movieId
==================================================
*/

exports.getMovieRevenueDetail = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { from, to } = req.query;

    let whereOrder = {
      order_status: "PAID",
    };

    if (from && to) {
      whereOrder.created_at = {
        [Op.between]: [
          new Date(from + " 00:00:00"),
          new Date(to + " 23:59:59"),
        ],
      };
    }

    const rows = await OrderTicket.findAll({
      include: [
        {
          model: Ticket,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              attributes: ["price"],
              include: [
                {
                  model: Showtime,
                  attributes: ["showtime_id", "start_time"],
                  where: {
                    movie_id: movieId,
                  },
                  include: [
                    {
                      model: Room,
                      attributes: ["room_id", "room_name"],
                      include: [
                        {
                          model: Cinema,
                          attributes: ["cinema_id", "cinema_name"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Order,
          attributes: [],
          where: whereOrder,
        },
      ],

      attributes: [
        [col("Ticket.ShowtimeSeat.Showtime.showtime_id"), "showtime_id"],
        [col("Ticket.ShowtimeSeat.Showtime.start_time"), "start_time"],
        [col("Ticket.ShowtimeSeat.Showtime.Room.room_name"), "room_name"],
        [
          col("Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_name"),
          "cinema_name",
        ],
        [fn("COUNT", col("OrderTicket.ticket_id")), "tickets_sold"],
        [fn("SUM", col("Ticket.ShowtimeSeat.price")), "revenue"],
      ],

      group: ["Ticket.ShowtimeSeat.Showtime.showtime_id"],

      order: [[col("Ticket.ShowtimeSeat.Showtime.start_time"), "DESC"]],

      raw: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET MOVIE REVENUE DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
==================================================
4. BIỂU ĐỒ DOANH THU THEO PHIM
GET /api/movie-revenue/chart
==================================================

Ví dụ:
GET /api/movie-revenue/chart?from=2026-01-01&to=2026-01-31&limit=10
*/

exports.getMovieRevenueChart = async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;

    /*
    ==================================================
    FILTER ORDER
    ==================================================
    */

    let whereOrder = {
      order_status: "PAID",
    };

    if (from && to) {
      whereOrder.created_at = {
        [Op.between]: [
          new Date(from + " 00:00:00"),
          new Date(to + " 23:59:59"),
        ],
      };
    }

    /*
    ==================================================
    QUERY DB
    ==================================================
    */

    const rows = await OrderTicket.findAll({
      include: [
        {
          model: Order,
          attributes: [],
          where: whereOrder,
        },
        {
          model: Ticket,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              attributes: [],
              include: [
                {
                  model: Showtime,
                  attributes: [],
                  include: [
                    {
                      model: Movie,
                      attributes: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      attributes: [
        [col("Ticket.ShowtimeSeat.Showtime.Movie.movie_id"), "movie_id"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.title"), "label"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.poster_url"), "poster"],
        [fn("COUNT", col("OrderTicket.ticket_id")), "tickets_sold"],
        [fn("SUM", col("Ticket.ShowtimeSeat.price")), "revenue"],
      ],

      group: [
        "Ticket.ShowtimeSeat.Showtime.Movie.movie_id",
        "Ticket.ShowtimeSeat.Showtime.Movie.title",
        "Ticket.ShowtimeSeat.Showtime.Movie.poster_url",
      ],

      order: [[literal("tickets_sold"), "DESC"]],

      limit: Number(limit),

      raw: true,
      subQuery: false,
    });

    /*
    ==================================================
    FORMAT RESPONSE
    ==================================================
    */

    const chartData = rows.map((item) => ({
      movie_id: item.movie_id,
      label: item.label,
      poster: item.poster_url,
      tickets_sold: Number(item.tickets_sold || 0),
      revenue: Number(item.revenue || 0),
    }));

    /*
    ==================================================
    RESPONSE
    ==================================================
    */

    return res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("GET MOVIE REVENUE CHART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// EXPORT MOVIE REVENUE EXCEL (Production-level)
exports.exportMovieRevenueExcel = async (req, res) => {
  try {
    console.log("========== EXPORT MOVIE REVENUE EXCEL START ==========");
    console.log("REQ QUERY:", req.query);

    let { from, to, movie_id } = req.query;

    /*
    ==================================================
    DATE FILTER
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    let reportFrom = "Từ trước đến nay";
    let reportTo = "Hiện tại";

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };

      reportFrom = from;
      reportTo = to;

      console.log("DATE FILTER APPLIED:", {
        startDate,
        endDate,
      });
    } else {
      console.log("NO DATE FILTER -> EXPORT ALL SYSTEM");
    }

    /*
    ==================================================
    FILTER MOVIE
    ==================================================
    */

    const showtimeWhere = {};

    if (movie_id) {
      showtimeWhere.movie_id = movie_id;
      console.log("MOVIE FILTER:", showtimeWhere);
    } else {
      console.log("NO MOVIE FILTER");
    }

    /*
    ==================================================
    QUERY 1: MOVIE REVENUE
    ==================================================
    */

    console.log("QUERY movieRows START...");

    const movieRows = await OrderTicket.findAll({
      attributes: [
        [
          col("Ticket.ShowtimeSeat.Showtime.Movie.movie_id"),
          "movie_id",
        ],
        [
          col("Ticket.ShowtimeSeat.Showtime.Movie.title"),
          "movie_name",
        ],
        [
          fn("COUNT", col("OrderTicket.ticket_id")),
          "tickets_sold",
        ],
        [
          fn("SUM", col("Ticket.ShowtimeSeat.price")),
          "revenue",
        ],
      ],

      include: [
        {
          model: Order,
          where: orderWhere,
          required: true,
          attributes: [],
        },
        {
          model: Ticket,
          required: true,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              required: true,
              attributes: [],
              include: [
                {
                  model: Showtime,
                  required: true,
                  attributes: [],
                  where:
                    Object.keys(showtimeWhere).length > 0
                      ? showtimeWhere
                      : undefined,
                  include: [
                    {
                      model: Movie,
                      required: true,
                      attributes: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      group: [
        "Ticket.ShowtimeSeat.Showtime.Movie.movie_id",
        "Ticket.ShowtimeSeat.Showtime.Movie.title",
      ],

      order: [[literal("revenue"), "DESC"]],
      raw: true,
      subQuery: false,
    });

    console.log("movieRows LENGTH:", movieRows.length);
    console.log("movieRows SAMPLE:", movieRows.slice(0, 3));

    /*
    ==================================================
    QUERY 2: SHOWTIME DETAILS
    ==================================================
    */

    console.log("QUERY showtimeRows START...");

    const showtimeRows = await OrderTicket.findAll({
      attributes: [
        [
          col("Ticket.ShowtimeSeat.Showtime.Movie.title"),
          "movie_name",
        ],
        [
          col("Ticket.ShowtimeSeat.Showtime.showtime_id"),
          "showtime_id",
        ],
        [
          col("Ticket.ShowtimeSeat.Showtime.start_time"),
          "start_time",
        ],
        [
          col("Ticket.ShowtimeSeat.Showtime.Room.room_name"),
          "room_name",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_name"
          ),
          "cinema_name",
        ],
        [
          fn("COUNT", col("OrderTicket.ticket_id")),
          "tickets_sold",
        ],
        [
          fn("SUM", col("Ticket.ShowtimeSeat.price")),
          "revenue",
        ],
      ],

      include: [
        {
          model: Order,
          where: orderWhere,
          required: true,
          attributes: [],
        },
        {
          model: Ticket,
          required: true,
          attributes: [],
          include: [
            {
              model: ShowtimeSeat,
              required: true,
              attributes: [],
              include: [
                {
                  model: Showtime,
                  required: true,
                  attributes: [],
                  where:
                    Object.keys(showtimeWhere).length > 0
                      ? showtimeWhere
                      : undefined,
                  include: [
                    {
                      model: Movie,
                      required: true,
                      attributes: [],
                    },
                    {
                      model: Room,
                      required: true,
                      attributes: [],
                      include: [
                        {
                          model: Cinema,
                          required: true,
                          attributes: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      group: [
        "Ticket.ShowtimeSeat.Showtime.showtime_id",
        "Ticket.ShowtimeSeat.Showtime.Movie.title",
        "Ticket.ShowtimeSeat.Showtime.start_time",
        "Ticket.ShowtimeSeat.Showtime.Room.room_name",
        "Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_name",
      ],

      raw: true,
      subQuery: false,
    });

    console.log("showtimeRows LENGTH:", showtimeRows.length);
    console.log("showtimeRows SAMPLE:", showtimeRows.slice(0, 3));

    /*
    ==================================================
    SUMMARY
    ==================================================
    */

    const totalMovies = movieRows.length;

    const totalTickets = movieRows.reduce(
      (sum, item) =>
        sum + Number(item.tickets_sold || 0),
      0
    );

    const totalRevenue = movieRows.reduce(
      (sum, item) =>
        sum + Number(item.revenue || 0),
      0
    );

    const topMovie =
      movieRows.length > 0
        ? movieRows[0].movie_name
        : "N/A";

    console.log("SUMMARY:", {
      totalMovies,
      totalTickets,
      totalRevenue,
      topMovie,
    });

    /*
    ==================================================
    CREATE WORKBOOK
    ==================================================
    */

    console.log("CREATE WORKBOOK START...");

    const workbook = new ExcelJS.Workbook();

    const createSheet = (name, columns, rows) => {
      console.log(`CREATE SHEET -> ${name}`);
      console.log(`ROWS COUNT -> ${rows.length}`);

      const sheet = workbook.addWorksheet(name);

      sheet.columns = columns;

      const headerRow = sheet.getRow(1);
      headerRow.font = {
        bold: true,
        size: 12,
      };

      rows.forEach((row) => {
        sheet.addRow(row);
      });

      console.log(`SHEET ${name} DONE`);

      return sheet;
    };

    /*
    ==================================================
    SHEET 1
    ==================================================
    */

    createSheet(
      "Executive Summary",
      [
        {
          header: "Thông tin",
          key: "label",
          width: 35,
        },
        {
          header: "Giá trị",
          key: "value",
          width: 40,
        },
      ],
      [
        {
          label: "Từ ngày",
          value: reportFrom,
        },
        {
          label: "Đến ngày",
          value: reportTo,
        },
        {
          label: "Tổng số phim",
          value: totalMovies,
        },
        {
          label: "Tổng vé",
          value: totalTickets,
        },
        {
          label: "Tổng doanh thu",
          value: totalRevenue,
        },
        {
          label: "Top phim",
          value: topMovie,
        },
      ]
    );

    /*
    ==================================================
    SHEET 2
    ==================================================
    */

    createSheet(
      "Top Movies Revenue",
      [
        {
          header: "STT",
          key: "stt",
          width: 10,
        },
        {
          header: "Tên phim",
          key: "movie_name",
          width: 40,
        },
        {
          header: "Vé bán",
          key: "tickets_sold",
          width: 20,
        },
        {
          header: "Doanh thu",
          key: "revenue",
          width: 25,
        },
      ],
      movieRows.map((item, index) => ({
        stt: index + 1,
        movie_name: item.movie_name || "",
        tickets_sold: Number(item.tickets_sold || 0),
        revenue: Number(item.revenue || 0),
      }))
    );

    console.log("WORKBOOK SHEETS:", workbook.worksheets.length);

    /*
    ==================================================
    RESPONSE
    ==================================================
    */

    const fileName = "movie-revenue-report.xlsx";

    console.log("WRITE RESPONSE START...");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    await workbook.xlsx.write(res);

    console.log("WRITE RESPONSE DONE");
    console.log("========== EXPORT SUCCESS ==========");

    res.end();
  } catch (error) {
    console.error(
      "EXPORT MOVIE REVENUE EXCEL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Export movie revenue excel failed",
      error: error.message,
    });
  }
};
