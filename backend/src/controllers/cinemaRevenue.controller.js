const ExcelJS = require("exceljs");
const { Op, fn, col, literal } = require("sequelize");

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
API 1
GET /api/cinema-revenue/summary
==================================================
*/
exports.getCinemaRevenueSummary = async (req, res) => {
  try {
    const { cinema_id, from, to } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    BASE ORDER FILTER
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    /*
    ==================================================
    STEP 1: LẤY DANH SÁCH ORDER_ID THUỘC CINEMA
    ==================================================

    Vì Order không có cinema_id
    nên phải đi qua:

    Order
    -> OrderTicket
    -> Ticket
    -> ShowtimeSeat
    -> Showtime
    -> Room
    -> cinema_id
    */

    const orderIdRows = await OrderTicket.findAll({
      attributes: [
        [col("Order.order_id"), "order_id"],
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
                      where: {
                        cinema_id,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      raw: true,
      subQuery: false,
    });

    const orderIds = [
      ...new Set(
        orderIdRows.map((item) => item.order_id)
      ),
    ];

    /*
    Nếu chưa có đơn nào
    */

    if (!orderIds.length) {
      return res.json({
        success: true,
        data: {
          total_revenue: 0,
          ticket_revenue: 0,
          service_revenue: 0,
          total_orders: 0,
          total_tickets: 0,
        },
      });
    }

    /*
    ==================================================
    STEP 2: TICKET REVENUE
    ==================================================
    */

    const ticketRows = await OrderTicket.findAll({
      attributes: [
        [
          fn(
            "COUNT",
            col("OrderTicket.ticket_id")
          ),
          "total_tickets",
        ],
        [
          fn(
            "SUM",
            col("Ticket.ShowtimeSeat.price")
          ),
          "ticket_revenue",
        ],
      ],
      where: {
        order_id: {
          [Op.in]: orderIds,
        },
      },
      include: [
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
      subQuery: false,
    });

    /*
    ==================================================
    STEP 3: SERVICE REVENUE
    ==================================================
    */

    const serviceRows = await OrderService.findAll({
      attributes: [
        [
          fn(
            "SUM",
            literal(
              "OrderService.price * OrderService.quantity"
            )
          ),
          "service_revenue",
        ],
      ],
      where: {
        order_id: {
          [Op.in]: orderIds,
        },
      },
      raw: true,
    });

    /*
    ==================================================
    STEP 4: TOTAL ORDERS
    ==================================================
    */

    const totalOrders = orderIds.length;

    /*
    ==================================================
    RESULT
    ==================================================
    */

    const ticketRevenue = Number(
      ticketRows[0]?.ticket_revenue || 0
    );

    const totalTickets = Number(
      ticketRows[0]?.total_tickets || 0
    );

    const serviceRevenue = Number(
      serviceRows[0]?.service_revenue || 0
    );

    const totalRevenue =
      ticketRevenue + serviceRevenue;

    return res.json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        ticket_revenue: ticketRevenue,
        service_revenue: serviceRevenue,
        total_orders: totalOrders,
        total_tickets: totalTickets,
      },
    });
  } catch (error) {
    console.error(
      "GET CINEMA REVENUE SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get summary failed",
      error: error.message,
    });
  }
};

/*
==================================================
API 2
GET /api/cinema-revenue/chart
==================================================
*/
exports.getCinemaRevenueChart = async (req, res) => {
  try {
    const {
      cinema_id,
      from,
      to,
      group_by = "day",
    } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    BASE ORDER FILTER
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    /*
    ==================================================
    FORMAT GROUP BY
    ==================================================
    */

    let format = "%Y-%m-%d";

    if (group_by === "month") {
      format = "%Y-%m";
    }

    if (group_by === "year") {
      format = "%Y";
    }

    /*
    ==================================================
    LẤY CHART THEO CINEMA

    Không query trực tiếp từ Order
    vì Order không có cinema_id

    Phải đi qua:

    Order
    -> OrderTicket
    -> Ticket
    -> ShowtimeSeat
    -> Showtime
    -> Room
    -> cinema_id
    ==================================================
    */

    const rows = await OrderTicket.findAll({
      attributes: [
        [
          fn(
            "DATE_FORMAT",
            col("Order.created_at"),
            format
          ),
          "label",
        ],
        [
          fn(
            "COUNT",
            fn(
              "DISTINCT",
              col("Order.order_id")
            )
          ),
          "total_orders",
        ],
        [
          fn(
            "SUM",
            col("Ticket.ShowtimeSeat.price")
          ),
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
                  include: [
                    {
                      model: Room,
                      required: true,
                      attributes: [],
                      where: {
                        cinema_id,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      group: [
        fn(
          "DATE_FORMAT",
          col("Order.created_at"),
          format
        ),
      ],
      order: [
        [
          fn(
            "DATE_FORMAT",
            col("Order.created_at"),
            format
          ),
          "ASC",
        ],
      ],
      raw: true,
      subQuery: false,
    });

    return res.json({
      success: true,
      groupBy: group_by,
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET CINEMA REVENUE CHART ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get chart failed",
      error: error.message,
    });
  }
};


/*
==================================================
API 3
GET /api/cinema-revenue/top-movies
==================================================
*/
exports.getTopMoviesByCinema = async (req, res) => {
  try {
    const {
      cinema_id,
      from,
      to,
      limit = 10,
    } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    BASE ORDER FILTER
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    /*
    ==================================================
    TOP MOVIES BY CINEMA

    Logic hiện tại gần như đúng rồi.
    Chỉ tối ưu:
    - ép kiểu limit an toàn
    - order bằng alias rõ ràng hơn
    - giữ subQuery false để tránh lỗi group
    ==================================================
    */

    const safeLimit = Math.max(
      1,
      Number(limit) || 10
    );

    const rows = await OrderTicket.findAll({
      attributes: [
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.movie_id"
          ),
          "movie_id",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.title"
          ),
          "movie_name",
        ],
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.poster_url"
          ),
          "poster",
        ],
        [
          fn(
            "COUNT",
            col("OrderTicket.ticket_id")
          ),
          "tickets_sold",
        ],
        [
          fn(
            "SUM",
            col("Ticket.ShowtimeSeat.price")
          ),
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
                      where: {
                        cinema_id,
                      },
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
        "Ticket.ShowtimeSeat.Showtime.Movie.poster_url",
      ],

      order: [
        [literal("revenue"), "DESC"],
      ],

      limit: safeLimit,

      raw: true,
      subQuery: false,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET TOP MOVIES BY CINEMA ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get top movies failed",
      error: error.message,
    });
  }
};

/*
==================================================
API 4
GET /api/cinema-revenue/export-excel
==================================================
*/
exports.exportCinemaRevenueExcel = async (
  req,
  res
) => {
  try {
    const { cinema_id, from, to } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    LẤY THÔNG TIN SUMMARY

    Không nên gọi trực tiếp controller khác kiểu:
    exports.getCinemaRevenueSummary(...)

    vì:
    - khó kiểm soát response
    - dễ lỗi res.status / res.json
    - khó debug

    Nhưng để giữ code hiện tại,
    ta vẫn dùng cách này với mock res an toàn hơn
    ==================================================
    */

    let summaryData = {};

    const mockRes = {
      status: () => mockRes,
      json: (payload) => {
        summaryData = payload?.data || {};
        return payload;
      },
    };

    await exports.getCinemaRevenueSummary(
      {
        query: {
          cinema_id,
          from,
          to,
        },
      },
      mockRes
    );

    /*
    ==================================================
    EXCEL WORKBOOK
    ==================================================
    */

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Cinema Booking System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(
      "Cinema Revenue Report"
    );

    /*
    ==================================================
    COLUMN CONFIG
    ==================================================
    */

    sheet.columns = [
      {
        header: "Thông tin",
        key: "label",
        width: 40,
      },
      {
        header: "Giá trị",
        key: "value",
        width: 35,
      },
    ];

    /*
    ==================================================
    HEADER STYLE
    ==================================================
    */

    sheet.getRow(1).font = {
      bold: true,
      size: 12,
    };

    sheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    /*
    ==================================================
    DATA ROWS
    ==================================================
    */

    const rows = [
      {
        label: "Cinema ID",
        value: cinema_id,
      },
      {
        label: "Từ ngày",
        value: from || "Từ trước đến nay",
      },
      {
        label: "Đến ngày",
        value: to || "Hiện tại",
      },
      {
        label: "Tổng doanh thu",
        value:
          summaryData.total_revenue || 0,
      },
      {
        label: "Doanh thu vé",
        value:
          summaryData.ticket_revenue || 0,
      },
      {
        label: "Doanh thu dịch vụ",
        value:
          summaryData.service_revenue || 0,
      },
      {
        label: "Tổng đơn hàng",
        value:
          summaryData.total_orders || 0,
      },
      {
        label: "Tổng vé đã bán",
        value:
          summaryData.total_tickets || 0,
      },
      {
        label: "Ngày xuất báo cáo",
        value: new Date().toLocaleString(
          "vi-VN"
        ),
      },
    ];

    rows.forEach((row) => {
      sheet.addRow(row);
    });

    /*
    ==================================================
    BORDER + ALIGNMENT
    ==================================================
    */

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      });
    });

    /*
    ==================================================
    FILE RESPONSE
    ==================================================
    */

    const fileName = `cinema-revenue-${cinema_id}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(
      "EXPORT CINEMA REVENUE EXCEL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Export excel failed",
      error: error.message,
    });
  }
};

/*
==================================================
API 5
GET /api/cinema-revenue/breakdown
==================================================
*/
exports.getCinemaRevenueBreakdown = async (req, res) => {
  try {
    const { cinema_id, from, to } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    LƯU Ý BUG CŨ:
    ==================================================
    service_revenue trước đó đang bị tính toàn hệ thống
    vì OrderService chỉ join với Order mà không lọc theo cinema.

    FIX:
    OrderService -> Order -> OrderTicket -> Ticket
    -> ShowtimeSeat -> Showtime -> Room(where cinema_id)

    để chỉ lấy dịch vụ của đơn hàng phát sinh tại rạp đó.
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    /*
    =========================
    TICKET REVENUE
    =========================
    */

    const ticketRows = await OrderTicket.findAll({
      attributes: [
        [
          fn(
            "COALESCE",
            fn("SUM", col("Ticket.ShowtimeSeat.price")),
            0
          ),
          "ticket_revenue",
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
                  include: [
                    {
                      model: Room,
                      required: true,
                      attributes: [],
                      where: {
                        cinema_id,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      raw: true,
      subQuery: false,
    });

    /*
    =========================
    SERVICE REVENUE
    =========================
    */

    const serviceRows = await OrderService.findAll({
      attributes: [
        [
          fn(
            "COALESCE",
            fn(
              "SUM",
              literal(
                "`OrderService`.`price` * `OrderService`.`quantity`"
              )
            ),
            0
          ),
          "service_revenue",
        ],
      ],
      include: [
        {
          model: Order,
          where: orderWhere,
          required: true,
          attributes: [],
          include: [
            {
              model: OrderTicket,
              required: true,
              attributes: [],
              include: [
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
                              where: {
                                cinema_id,
                              },
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
        },
      ],
      raw: true,
      subQuery: false,
      distinct: true,
    });

    const ticketRevenue = Number(
      ticketRows[0]?.ticket_revenue || 0
    );

    const serviceRevenue = Number(
      serviceRows[0]?.service_revenue || 0
    );

    const totalRevenue =
      ticketRevenue + serviceRevenue;

    const ticketPercent =
      totalRevenue > 0
        ? Number(
            (
              (ticketRevenue / totalRevenue) *
              100
            ).toFixed(2)
          )
        : 0;

    const servicePercent =
      totalRevenue > 0
        ? Number(
            (
              (serviceRevenue / totalRevenue) *
              100
            ).toFixed(2)
          )
        : 0;

    return res.json({
      success: true,
      data: {
        ticket_revenue: ticketRevenue,
        service_revenue: serviceRevenue,
        total_revenue: totalRevenue,
        ticket_percent: ticketPercent,
        service_percent: servicePercent,
      },
    });
  } catch (error) {
    console.error(
      "GET CINEMA REVENUE BREAKDOWN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get breakdown failed",
      error: error.message,
    });
  }
};


/*
==================================================
API 6
GET /api/cinema-revenue/top-services
==================================================
*/
exports.getTopServicesByCinema = async (req, res) => {
  try {
    const {
      cinema_id,
      from,
      to,
      limit = 10,
    } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    BUG CŨ:
    ==================================================
    API cũ chỉ:
    OrderService -> Order

    nên service của toàn hệ thống đều bị tính chung,
    không lọc theo cinema.

    FIX:
    OrderService
      -> Order
      -> OrderTicket
      -> Ticket
      -> ShowtimeSeat
      -> Showtime
      -> Room(where cinema_id)

    để chỉ lấy dịch vụ thuộc đơn hàng phát sinh
    tại đúng rạp đang chọn.
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    const rows = await OrderService.findAll({
      attributes: [
        [col("Service.service_id"), "service_id"],

        [col("Service.name"), "service_name"],

        [
          fn(
            "COALESCE",
            fn(
              "SUM",
              col("OrderService.quantity")
            ),
            0
          ),
          "quantity_sold",
        ],

        [
          fn(
            "COALESCE",
            fn(
              "SUM",
              literal(
                "`OrderService`.`price` * `OrderService`.`quantity`"
              )
            ),
            0
          ),
          "revenue",
        ],
      ],

      include: [
        {
          model: Order,
          where: orderWhere,
          required: true,
          attributes: [],

          include: [
            {
              model: OrderTicket,
              required: true,
              attributes: [],

              include: [
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
                              where: {
                                cinema_id,
                              },
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
        },

        {
          model: Service,
          required: true,
          attributes: [],
        },
      ],

      group: [
        "Service.service_id",
        "Service.name",
      ],

      order: [
        [literal("revenue"), "DESC"],
      ],

      limit: Number(limit),
      raw: true,
      subQuery: false,
      distinct: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET TOP SERVICES BY CINEMA ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get top services failed",
      error: error.message,
    });
  }
};


/*
==================================================
API 7
GET /api/cinema-revenue/payment-methods
==================================================
*/
exports.getCinemaPaymentMethods = async (req, res) => {
  try {
    const { cinema_id, from, to } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    BUG CŨ:
    ==================================================
    Payment chỉ join với Order:

    Payment -> Order

    nên đang lấy phương thức thanh toán của
    toàn hệ thống, không lọc theo cinema.

    FIX:
    Payment
      -> Order
      -> OrderTicket
      -> Ticket
      -> ShowtimeSeat
      -> Showtime
      -> Room(where cinema_id)

    để chỉ lấy payment của đơn hàng thuộc rạp đó.
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    const rows = await Payment.findAll({
      attributes: [
        "payment_method",

        [
          fn(
            "COUNT",
            fn(
              "DISTINCT",
              col("Payment.payment_id")
            )
          ),
          "total_transactions",
        ],

        [
          fn(
            "COALESCE",
            fn(
              "SUM",
              col("Payment.amount")
            ),
            0
          ),
          "total_amount",
        ],
      ],

      include: [
        {
          model: Order,
          where: orderWhere,
          required: true,
          attributes: [],

          include: [
            {
              model: OrderTicket,
              required: true,
              attributes: [],

              include: [
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
                              where: {
                                cinema_id,
                              },
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
        },
      ],

      group: ["payment_method"],

      order: [
        [literal("total_amount"), "DESC"],
      ],

      raw: true,
      subQuery: false,
      distinct: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET CINEMA PAYMENT METHODS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get payment methods failed",
      error: error.message,
    });
  }
};


/*
==================================================
API 8
GET /api/cinema-revenue/showtime-details
==================================================
*/
exports.getCinemaShowtimeDetails = async (req, res) => {
  try {
    const {
      cinema_id,
      from,
      to,
      movie_id,
    } = req.query;

    if (!cinema_id) {
      return res.status(400).json({
        success: false,
        message: "cinema_id is required",
      });
    }

    /*
    ==================================================
    REVIEW:
    ==================================================
    API này thực tế đã lọc theo cinema khá đúng
    vì đã đi theo luồng:

    OrderTicket
      -> Ticket
      -> ShowtimeSeat
      -> Showtime
      -> Room(where cinema_id)

    nên doanh thu + vé bán đã thuộc đúng rạp.

    Tuy nhiên có 2 điểm nên sửa:

    1. movie_id đang viết chưa tối ưu
       dễ gây lỗi kiểu dữ liệu/string

    2. SUM(price) nên dùng COALESCE để tránh null

    3. COUNT nên dùng DISTINCT an toàn hơn

    4. ép kiểu movie_id rõ ràng hơn
    ==================================================
    */

    let orderWhere = {
      order_status: "PAID",
    };

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      orderWhere.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    const showtimeWhere = {};

    if (movie_id) {
      showtimeWhere.movie_id = Number(movie_id);
    }

    const rows = await OrderTicket.findAll({
      attributes: [
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.showtime_id"
          ),
          "showtime_id",
        ],

        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Movie.title"
          ),
          "movie_name",
        ],

        [
          col(
            "Ticket.ShowtimeSeat.Showtime.start_time"
          ),
          "start_time",
        ],

        [
          col(
            "Ticket.ShowtimeSeat.Showtime.Room.room_name"
          ),
          "room_name",
        ],

        [
          fn(
            "COUNT",
            fn(
              "DISTINCT",
              col("OrderTicket.ticket_id")
            )
          ),
          "tickets_sold",
        ],

        [
          fn(
            "COALESCE",
            fn(
              "SUM",
              col("Ticket.ShowtimeSeat.price")
            ),
            0
          ),
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
                  where: showtimeWhere,
                  attributes: [],

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
                      where: {
                        cinema_id,
                      },
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
      ],

      order: [
        [
          col(
            "Ticket.ShowtimeSeat.Showtime.start_time"
          ),
          "DESC",
        ],
      ],

      raw: true,
      subQuery: false,
      distinct: true,
    });

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "GET CINEMA SHOWTIME DETAILS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Get showtime details failed",
      error: error.message,
    });
  }
};