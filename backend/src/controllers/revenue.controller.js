// controllers/revenue.controller.js

const { Op, fn, col, literal } = require("sequelize");
const ExcelJS = require("exceljs");

const {
  Order,
  OrderTicket,
  OrderService,
  Payment,
  Ticket,
  ShowtimeSeat,
  Showtime,
  Movie,
  Room,
  Cinema,
  Service,
  User,
} = require("../models");

/*
==================================================
HELPERS
==================================================
*/

const getDateRange = (from, to) => {
  let startDate;
  let endDate;

  if (from && to) {
    startDate = new Date(from);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

const buildOrderWhere = ({ from, to, status }) => {
  const where = {};

  // chỉ tính đơn đã thanh toán
  where.order_status = status || "PAID";

  const { startDate, endDate } = getDateRange(from, to);

  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [startDate, endDate],
    };
  }

  return where;
};

/*
==================================================
1. SUMMARY DASHBOARD  Lấy tổng quan doanh thu
GET /api/revenue/summary
==================================================
*/

/*
==================================================
DASHBOARD SUMMARY
GET /api/revenue/dashboard-summary

Mục tiêu:
- Tổng doanh thu
- Doanh thu vé
- Doanh thu dịch vụ
- Tổng đơn hàng
- Tổng vé đã bán

Dùng để hiển thị dashboard admin
==================================================
*/
exports.getDashboardSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    /*
    ==================================================
    BUILD WHERE CLAUSE
    ==================================================
    */

    const orderWhere = {
      order_status: "PAID",
    };

    let startDate = null;
    let endDate = null;

    if (from && to) {
      startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    /*
    ==================================================
    QUERY SONG SONG
    ==================================================
    */

    const [
      totalOrders,
      totalRevenueRaw,
      totalTicketsSold,
      ticketRevenueRaw,
      serviceRevenueRaw,
    ] = await Promise.all([
      Order.count({
        where: orderWhere,
      }),

      Order.sum("total_amount", {
        where: orderWhere,
      }),

      OrderTicket.count({
        include: [
          {
            model: Order,
            where: orderWhere,
            required: true,
            attributes: [],
          },
        ],
      }),

      OrderTicket.findOne({
        attributes: [
          [fn("SUM", col("Ticket.ShowtimeSeat.price")), "ticketRevenue"],
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
              },
            ],
          },
        ],

        raw: true,
      }),

      OrderService.findOne({
        attributes: [
          [
            fn("SUM", literal("OrderService.price * OrderService.quantity")),
            "serviceRevenue",
          ],
        ],

        include: [
          {
            model: Order,
            where: orderWhere,
            required: true,
            attributes: [],
          },
        ],

        raw: true,
      }),
    ]);

    /*
    ==================================================
    FORMAT DATA
    ==================================================
    */

    const totalRevenue = Number(totalRevenueRaw || 0);

    const ticketRevenue = Number(ticketRevenueRaw?.ticketRevenue || 0);

    const serviceRevenue = Number(serviceRevenueRaw?.serviceRevenue || 0);

    const ordersCount = Number(totalOrders || 0);

    const ticketsCount = Number(totalTicketsSold || 0);

    const averageOrderValue =
      ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    /*
    ==================================================
    RESPONSE
    ==================================================
    */

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        ticketRevenue,
        serviceRevenue,
        totalOrders: ordersCount,
        totalTickets: ticketsCount,
        averageOrderValue,

        period:
          from && to
            ? {
                from: startDate,
                to: endDate,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get chart data
exports.getRevenueChart = async (req, res) => {
  try {
    const { type = "day", from, to } = req.query;
    const now = new Date();

    let startDate;
    let endDate;
    let groupFormat;
    let labels;
    let groupBy;

    /*
    ==================================================
    CUSTOM RANGE (ưu tiên cao nhất)
    ==================================================
    */

    if (from && to) {
      startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      console.log("CUSTOM RANGE:", startDate, endDate);
      /*
      RULE MỚI:
      - <= 31 ngày -> theo ngày
      - <= 12 tháng -> theo tháng
      - > 12 tháng -> theo năm
      */

      const diffDays1 =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const diffMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth()) +
        1;
      console.log("DIFF DAYS:", diffDays1, "DIFF MONTHS:", diffMonths);
      let groupBy = "day";
      if (diffDays1 <= 31) {
        // hiển thị theo ngày
        groupFormat = "%Y-%m-%d";
        groupBy = "day";
        labels = generateDateLabels(startDate, endDate, "day");
      } else if (diffMonths <= 12) {
        // hiển thị theo tháng
        groupFormat = "%Y-%m";
        groupBy = "month";
        labels = generateDateLabels(startDate, endDate, "month");
      } else {
        // hiển thị theo năm
        groupFormat = "%Y";
        groupBy = "year";
        labels = generateDateLabels(startDate, endDate, "year");
      }
    } else if (type === "month") {

    /*
    ==================================================
    AUTO RANGE BY TYPE
    ==================================================
    */
      // tháng này -> theo ngày
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      groupFormat = "%Y-%m-%d";
      labels = generateDateLabels(startDate, endDate, "day");
    } else if (type === "year") {
      // năm nay -> theo tháng
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      groupFormat = "%Y-%m";
      labels = generateDateLabels(startDate, endDate, "month");
    } else {
      // mặc định -> 7 ngày gần nhất
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      groupFormat = "%Y-%m-%d";
      labels = generateDateLabels(startDate, endDate, "day");
    }

    /*
    ==================================================
    QUERY DB
    ==================================================
    */

    const rows = await Order.findAll({
      where: {
        order_status: "PAID",
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), groupFormat),
          "label",
        ],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "revenue"],
      ],
      group: ["label"],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), groupFormat),
          "ASC",
        ],
      ],
      raw: true,
    });

    /*
    ==================================================
    FILL EMPTY LABELS = 0
    ==================================================
    */

    const chartData = labels.map((label) => {
      const found = rows.find((item) => item.label === label);

      return {
        label,
        revenue: found ? Number(found.revenue || 0) : 0,
      };
    });

    return res.json({
      success: true,
      groupBy,
      data: chartData,
    });
  } catch (error) {
    console.error("GET REVENUE CHART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 8, from, to } = req.query;

    const where = { order_status: "PAID" };

    if (from && to) {
      where.created_at = {
        [Op.between]: [
          new Date(from + "T00:00:00"),
          new Date(to + "T23:59:59"),
        ],
      };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: "User", attributes: ["full_name", "email"] },
        {
          model: Payment,
          as: "Payment",
          attributes: ["payment_method", "transaction_code"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("GET RECENT ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get top movies
exports.getTopMovies = async (req, res) => {
  try {
    const { limit = 5, from, to } = req.query;

    const where = { order_status: "PAID" };
    if (from && to) {
      where.created_at = {
        [Op.between]: [
          new Date(from + "T00:00:00"),
          new Date(to + "T23:59:59"),
        ],
      };
    }

    // This query depends on your database structure
    // Example using raw query or model associations
    const topMovies = await Movie.findAll({
      attributes: [
        "movie_id",
        "title",
        [sequelize.fn("SUM", sequelize.col("Tickets.price")), "revenue"],
        [
          sequelize.fn("COUNT", sequelize.col("Tickets.ticket_id")),
          "ticketsSold",
        ],
      ],
      include: [
        {
          model: Ticket,
          as: "Tickets",
          attributes: [],
          through: { attributes: [] },
          include: [
            {
              model: OrderItem,
              as: "OrderItems",
              attributes: [],
              include: [
                {
                  model: Order,
                  as: "Order",
                  attributes: [],
                  where,
                },
              ],
            },
          ],
        },
      ],
      group: ["Movie.movie_id"],
      order: [[sequelize.literal("revenue"), "DESC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      data: topMovies,
    });
  } catch (error) {
    console.error("GET TOP MOVIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get top services
exports.getTopServices = async (req, res) => {
  try {
    const { limit = 5, from, to } = req.query;

    const where = { order_status: "PAID" };
    if (from && to) {
      where.created_at = {
        [Op.between]: [
          new Date(from + "T00:00:00"),
          new Date(to + "T23:59:59"),
        ],
      };
    }

    const topServices = await Service.findAll({
      attributes: [
        "service_id",
        "service_name",
        [sequelize.fn("SUM", sequelize.col("OrderItems.price")), "revenue"],
        [sequelize.fn("SUM", sequelize.col("OrderItems.quantity")), "quantity"],
      ],
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          attributes: [],
          include: [
            {
              model: Order,
              as: "Order",
              attributes: [],
              where,
            },
          ],
        },
      ],
      group: ["Service.service_id"],
      order: [[sequelize.literal("revenue"), "DESC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      data: topServices,
    });
  } catch (error) {
    console.error("GET TOP SERVICES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Helper function to generate date labels
function generateDateLabels(start, end, format) {
  const labels = [];
  const current = new Date(start);

  while (current <= end) {
    let label;
    if (format === "year") {
      label = current.getFullYear().toString();
      current.setFullYear(current.getFullYear() + 1);
    } else if (format === "month") {
      label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      current.setMonth(current.getMonth() + 1);
    } else {
      label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      current.setDate(current.getDate() + 1);
    }
    labels.push(label);
  }

  return labels;
}

/*
==================================================
2. REVENUE CHART  Lấy doanh thu theo:
ngày
tuần
tháng
năm

GET /api/revenue/chart
==================================================
*/

exports.getRevenueChart = async (req, res) => {
  try {
    const {
      from,
      to,
      type = "day", // day | month | year
    } = req.query;

    const orderWhere = buildOrderWhere({
      from,
      to,
      status: "PAID",
    });

    let groupFormat = "%d/%m";
    let labelFormat = "%d/%m";

    if (type === "month") {
      groupFormat = "%m/%Y";
      labelFormat = "%m/%Y";
    }

    if (type === "year") {
      groupFormat = "%Y";
      labelFormat = "%Y";
    }

    const rows = await Order.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("created_at"), groupFormat), "label"],
        [fn("SUM", col("total_amount")), "revenue"],
      ],
      where: orderWhere,
      group: [fn("DATE_FORMAT", col("created_at"), groupFormat)],
      order: [[col("created_at"), "ASC"]],
      raw: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET REVENUE CHART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/*
==================================================
3. TOP MOVIES  Top phim bán chạy nhất theo doanh thu
GET /api/revenue/top-movies
==================================================
*/

exports.getTopMoviesRevenue = async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;

    const orderWhere = buildOrderWhere({
      from,
      to,
      status: "PAID",
    });

    const rows = await OrderTicket.findAll({
      attributes: [
        [col("Ticket.ShowtimeSeat.Showtime.Movie.movie_id"), "movie_id"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.title"), "title"],
        [col("Ticket.ShowtimeSeat.Showtime.Movie.poster_url"), "poster_url"],
        [fn("COUNT", col("OrderTicket.ticket_id")), "ticketsSold"],
        [fn("SUM", col("Ticket.ShowtimeSeat.price")), "revenue"],
      ],
      include: [
        {
          model: Order,
          where: orderWhere,
          attributes: [],
          required: true,
        },
        {
          model: Ticket,
          attributes: [],
          required: true,
          include: [
            {
              model: ShowtimeSeat,
              attributes: [],
              required: true,
              include: [
                {
                  model: Showtime,
                  attributes: [],
                  required: true,
                  include: [
                    {
                      model: Movie,
                      attributes: [],
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      group: ["Ticket.ShowtimeSeat.Showtime.Movie.movie_id"],
      order: [[literal("revenue"), "DESC"]],
      limit: Number(limit),
      raw: true,
      subQuery: false,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET TOP MOVIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/*
==================================================
4. TOP SERVICES
GET /api/revenue/top-services
==================================================
*/

exports.getTopServicesRevenue = async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;

    const orderWhere = buildOrderWhere({
      from,
      to,
      status: "PAID",
    });

    const rows = await OrderService.findAll({
      attributes: [
        [col("Service.service_id"), "service_id"],
        [col("Service.name"), "service_name"],
        [fn("SUM", col("quantity")), "quantity"],
        [
          fn("SUM", literal("OrderService.price * OrderService.quantity")),
          "revenue",
        ],
      ],
      include: [
        {
          model: Order,
          where: orderWhere,
          attributes: [],
          required: true,
        },
        {
          model: Service,
          attributes: [],
          required: true,
        },
      ],
      group: ["Service.service_id"],
      order: [[literal("revenue"), "DESC"]],
      limit: Number(limit),
      raw: true,
      subQuery: false,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET TOP SERVICES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/*
==================================================
5. TRANSACTION LIST
GET /api/revenue/transactions
==================================================
*/

exports.getRevenueTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      payment_method,
      from,
      to,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const orderWhere = buildOrderWhere({
      from,
      to,
      status: status || "PAID",
    });

    const userWhere = {};

    if (search) {
      userWhere.full_name = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where: orderWhere,
      offset,
      limit: Number(limit),
      order: [["created_at", "DESC"]],
      distinct: true,
      subQuery: false,

      include: [
        {
          model: User,
          where: search ? userWhere : undefined,
          required: !!search,
          attributes: ["user_id", "full_name", "email", "phone"],
        },
        {
          model: Payment,
          where: payment_method
            ? {
                payment_method,
              }
            : undefined,
          required: !!payment_method,
          attributes: [
            "payment_id",
            "amount",
            "payment_method",
            "payment_status",
            "transaction_code",
            "payment_time",
          ],
        },
      ],
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/*
==================================================
6. REVENUE BY CINEMA
GET /api/revenue/by-cinema
Doanh thu theo từng rạp chiếu phim
==================================================
*/

exports.getRevenueByCinema = async (req, res) => {
  try {
    const { from, to, limit = 20 } = req.query;

    const orderWhere = buildOrderWhere({
      from,
      to,
      status: "PAID",
    });

    const rows = await OrderTicket.findAll({
      attributes: [
        [
          col("Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_id"),
          "cinema_id",
        ],
        [
          col("Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_name"),
          "cinema_name",
        ],
        [fn("COUNT", col("OrderTicket.ticket_id")), "ticketsSold"],
        [fn("SUM", col("Ticket.ShowtimeSeat.price")), "ticketRevenue"],
      ],

      include: [
        {
          model: Order,
          where: orderWhere,
          attributes: [],
          required: true,
        },
        {
          model: Ticket,
          attributes: [],
          required: true,
          include: [
            {
              model: ShowtimeSeat,
              attributes: [],
              required: true,
              include: [
                {
                  model: Showtime,
                  attributes: [],
                  required: true,
                  include: [
                    {
                      model: Room,
                      attributes: [],
                      required: true,
                      include: [
                        {
                          model: Cinema,
                          attributes: [],
                          required: true,
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

      group: ["Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_id"],

      order: [[literal("ticketRevenue"), "DESC"]],

      limit: Number(limit),
      raw: true,
      subQuery: false,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET REVENUE BY CINEMA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/*
==================================================
7. RECENT ORDERS
GET /api/revenue/recent-orders
Lấy danh sách đơn hàng gần đây nhất
==================================================
*/

exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const rows = await Order.findAll({
      where: {
        order_status: "PAID",
      },

      order: [["created_at", "DESC"]],

      limit: Number(limit),

      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email", "phone"],
        },
        {
          model: Payment,
          attributes: [
            "payment_id",
            "amount",
            "payment_method",
            "payment_status",
            "transaction_code",
            "payment_time",
          ],
        },
      ],
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET RECENT ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/*
==================================================
8. EXPORT REVENUE REPORT EXCEL
GET /api/revenue/export-excel
Xuất báo cáo doanh thu ra file Excel

- nếu không truyền from + to => lấy ngày hôm nay
==================================================
*/
exports.exportRevenueExcel = async (req, res) => {
  try {
    let { from, to } = req.query;

    /*
    ==================================================
    DATE FILTER
    - Có from + to => lọc theo khoảng ngày
    - Không có => xuất toàn bộ doanh thu hệ thống
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
    }

    /*
    ==================================================
    QUERY DATA SONG SONG
    ==================================================
    */

    const [orders, movieRows, serviceRows, cinemaRows, paymentRows, dailyRows] =
      await Promise.all([
        /*
      =========================
      SHEET 2 - ORDER DETAILS
      =========================
      */
        Order.findAll({
          where: orderWhere,
          include: [
            {
              model: User,
              attributes: ["full_name", "email", "phone"],
            },
            {
              model: Payment,
              attributes: [
                "payment_method",
                "payment_status",
                "transaction_code",
                "payment_time",
              ],
            },
          ],
          order: [["created_at", "DESC"]],
        }),

        /*
      =========================
      SHEET 3 - TOP MOVIES
      =========================
      */
        OrderTicket.findAll({
          attributes: [
            [col("Ticket.ShowtimeSeat.Showtime.Movie.title"), "movie_name"],
            [fn("COUNT", col("OrderTicket.ticket_id")), "tickets_sold"],
            [fn("SUM", col("Ticket.ShowtimeSeat.price")), "revenue"],
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
        }),

        /*
      =========================
      SHEET 4 - TOP SERVICES
      =========================
      */
        OrderService.findAll({
          attributes: [
            [col("Service.name"), "service_name"],
            [fn("SUM", col("OrderService.quantity")), "quantity"],
            [
              fn("SUM", literal("OrderService.price * OrderService.quantity")),
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
              model: Service,
              required: true,
              attributes: [],
            },
          ],
          group: ["Service.service_id", "Service.name"],
          order: [[literal("revenue"), "DESC"]],
          raw: true,
          subQuery: false,
        }),

        /*
      =========================
      SHEET 5 - REVENUE BY CINEMA
      =========================
      */
        OrderTicket.findAll({
          attributes: [
            [
              col("Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_name"),
              "cinema_name",
            ],
            [fn("COUNT", col("OrderTicket.ticket_id")), "tickets_sold"],
            [fn("SUM", col("Ticket.ShowtimeSeat.price")), "revenue"],
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
                      include: [
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
            "Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_id",
            "Ticket.ShowtimeSeat.Showtime.Room.Cinema.cinema_name",
          ],
          order: [[literal("revenue"), "DESC"]],
          raw: true,
          subQuery: false,
        }),

        /*
      =========================
      SHEET 6 - PAYMENT METHOD
      =========================
      */
        Payment.findAll({
          attributes: [
            "payment_method",
            [fn("COUNT", col("Payment.payment_id")), "total_transactions"],
            [fn("SUM", col("Payment.amount")), "total_amount"],
          ],
          include: [
            {
              model: Order,
              where: orderWhere,
              required: true,
              attributes: [],
            },
          ],
          group: ["payment_method"],
          order: [[literal("total_amount"), "DESC"]],
          raw: true,
        }),

        /*
      =========================
      SHEET 7 - DAILY REVENUE
      =========================
      */
        Order.findAll({
          where: orderWhere,
          attributes: [
            [fn("DATE_FORMAT", col("created_at"), "%Y-%m-%d"), "date"],
            [fn("COUNT", col("order_id")), "total_orders"],
            [fn("SUM", col("total_amount")), "revenue"],
          ],
          group: [fn("DATE_FORMAT", col("created_at"), "%Y-%m-%d")],
          order: [["created_at", "ASC"]],
          raw: true,
        }),
      ]);

    /*
    ==================================================
    SUMMARY
    ==================================================
    */

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0,
    );

    const totalTicketRevenue = movieRows.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0,
    );

    const totalServiceRevenue = serviceRows.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0,
    );

    /*
    ==================================================
    CREATE WORKBOOK
    ==================================================
    */

    const workbook = new ExcelJS.Workbook();

    const createSheet = (name, columns, rows) => {
      const sheet = workbook.addWorksheet(name);

      sheet.columns = columns;

      const headerRow = sheet.getRow(1);
      headerRow.font = {
        bold: true,
        size: 12,
      };

      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      rows.forEach((row) => {
        sheet.addRow(row);
      });

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      return sheet;
    };

    /*
    ==================================================
    SHEET 1 - EXECUTIVE SUMMARY
    ==================================================
    */

    createSheet(
      "Executive Summary",
      [
        { header: "Thông tin", key: "label", width: 35 },
        { header: "Giá trị", key: "value", width: 35 },
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
          label: "Tổng số đơn hàng",
          value: totalOrders,
        },
        {
          label: "Tổng doanh thu",
          value: totalRevenue,
        },
        {
          label: "Doanh thu vé",
          value: totalTicketRevenue,
        },
        {
          label: "Doanh thu dịch vụ",
          value: totalServiceRevenue,
        },
        {
          label: "Ngày xuất báo cáo",
          value: new Date().toLocaleString("vi-VN"),
        },
      ],
    );

    /*
==================================================
SHEET 2 - ORDER DETAILS
==================================================
*/

    createSheet(
      "Order Details",
      [
        { header: "Mã đơn", key: "order_id", width: 15 },
        { header: "Khách hàng", key: "customer", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "SĐT", key: "phone", width: 20 },
        { header: "Tổng tiền", key: "total_amount", width: 20 },
        { header: "Phương thức TT", key: "payment_method", width: 20 },
        { header: "Mã giao dịch", key: "transaction_code", width: 30 },
        { header: "Ngày tạo", key: "created_at", width: 25 },
      ],
      orders.map((item) => ({
        order_id: item.order_id,
        customer: item.User?.full_name || "",
        email: item.User?.email || "",
        phone: item.User?.phone || "",
        total_amount: Number(item.total_amount || 0),
        payment_method: item.Payment?.payment_method || "",
        transaction_code: item.Payment?.transaction_code || "",
        created_at: new Date(item.created_at).toLocaleString("vi-VN"),
      })),
    );

    /*
==================================================
SHEET 3 - TOP MOVIES
==================================================
*/

    createSheet(
      "Top Movies",
      [
        { header: "Tên phim", key: "movie_name", width: 40 },
        { header: "Số vé", key: "tickets_sold", width: 20 },
        { header: "Doanh thu", key: "revenue", width: 20 },
      ],
      movieRows,
    );

    /*
==================================================
SHEET 4 - TOP SERVICES
==================================================
*/

    createSheet(
      "Top Services",
      [
        { header: "Dịch vụ", key: "service_name", width: 40 },
        { header: "Số lượng", key: "quantity", width: 20 },
        { header: "Doanh thu", key: "revenue", width: 20 },
      ],
      serviceRows,
    );

    /*
==================================================
SHEET 5 - REVENUE BY CINEMA
==================================================
*/

    createSheet(
      "Revenue By Cinema",
      [
        { header: "Rạp", key: "cinema_name", width: 40 },
        { header: "Số vé", key: "tickets_sold", width: 20 },
        { header: "Doanh thu", key: "revenue", width: 20 },
      ],
      cinemaRows,
    );

    /*
==================================================
SHEET 6 - PAYMENT METHOD REPORT
==================================================
*/

    createSheet(
      "Payment Method Report",
      [
        { header: "Phương thức", key: "payment_method", width: 30 },
        { header: "Số giao dịch", key: "total_transactions", width: 20 },
        { header: "Tổng tiền", key: "total_amount", width: 20 },
      ],
      paymentRows,
    );

    /*
==================================================
SHEET 7 - DAILY REVENUE
==================================================
*/

    createSheet(
      "Daily Revenue",
      [
        { header: "Ngày", key: "date", width: 20 },
        { header: "Số đơn", key: "total_orders", width: 20 },
        { header: "Doanh thu", key: "revenue", width: 20 },
      ],
      dailyRows,
    );

    /*
    ==================================================
    FILE NAME
    ==================================================
    */

    const fileName =
      from && to
        ? `bao-cao-doanh-thu-${from}-den-${to}.xlsx`
        : `bao-cao-toan-bo-doanh-thu-he-thong.xlsx`;

    /*
    ==================================================
    RESPONSE
    ==================================================
    */

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("EXPORT REVENUE EXCEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Export excel failed",
      error: error.message,
    });
  }
};
