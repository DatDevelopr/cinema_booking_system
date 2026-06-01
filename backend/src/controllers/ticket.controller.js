// controllers/ticket.controller.js
const { Op } = require("sequelize");
const socket = require("../socket");

const {
  Ticket,
  Order,
  OrderTicket,
  OrderService,
  ShowtimeSeat,
  Showtime,
  Movie,
  Room,
  Cinema,
  Seat,
  Service,
  Payment,
  User,
  sequelize,
} = require("../models");

/**
 * @desc    Đặt vé + dịch vụ (Tạo Order hoàn chỉnh)
 * @route   POST /api/tickets/book
 * @access  Private
 */
exports.bookTickets = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { showtime_id, seat_ids, service_items = [] } = req.body;

    if (!showtime_id || !seat_ids || seat_ids.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu showtime_id hoặc seat_ids",
      });
    }

    /* ================= 1. CHECK SHOWTIME ================= */
    const showtime = await Showtime.findByPk(showtime_id, {
      include: [
        { model: Movie, attributes: ["movie_id", "title", "poster_url"] },
        {
          model: Room,
          include: [
            { model: Cinema, attributes: ["cinema_id", "cinema_name"] },
          ],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!showtime || showtime.status !== "UPCOMING") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Suất chiếu không khả dụng",
      });
    }

    /* ================= 2. LOCK SEATS ================= */
    const showtimeSeats = await ShowtimeSeat.findAll({
      where: {
        showtime_id,
        seat_id: { [Op.in]: seat_ids },
      },
      include: [
        { model: Seat, attributes: ["seat_row", "seat_number", "seat_type"] },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (showtimeSeats.length !== seat_ids.length) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Một số ghế không tồn tại",
      });
    }

    const invalidSeats = showtimeSeats.filter(
      (s) => !["AVAILABLE", "HOLD"].includes(s.status),
    );

    if (invalidSeats.length > 0) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "Một số ghế đã được đặt",
        invalidSeats: invalidSeats.map((s) => s.seat_id),
      });
    }

    /* ================= 3. CALCULATE PRICE ================= */
    const ticketTotal = showtimeSeats.reduce(
      (sum, s) => sum + parseFloat(s.price || 0),
      0,
    );

    let serviceTotal = 0;
    const orderServiceData = [];

    if (service_items.length > 0) {
      const serviceIds = service_items.map((i) => i.service_id);

      const services = await Service.findAll({
        where: {
          service_id: {
            [Op.in]: serviceIds,
          },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      for (const item of service_items) {
        const service = services.find(
          (s) => s.service_id === item.service_id,
        );

        if (!service) {
          await t.rollback();

          return res.status(400).json({
            success: false,
            message: `Dịch vụ ${item.service_id} không tồn tại`,
          });
        }

        const quantity = Number(item.quantity) || 1;

        // kiểm tra tồn kho
        if (service.stock < quantity) {
          await t.rollback();

          return res.status(400).json({
            success: false,
            message: `${service.name} chỉ còn ${service.stock} sản phẩm`,
          });
        }

        const amount = parseFloat(service.price) * quantity;

        serviceTotal += amount;

        orderServiceData.push({
          service_id: service.service_id,
          quantity,
          price: service.price,
          name_snapshot: service.name,
        });

        // trừ tồn kho
        await service.update(
          {
            stock: service.stock - quantity,
          },
          {
            transaction: t,
          },
        );
      }
    }

    const finalAmount = ticketTotal + serviceTotal;

    /* ================= 4. CREATE ORDER ================= */
    const order = await Order.create(
      {
        user_id: req.user.user_id,
        total_amount: finalAmount,
        order_status: "PENDING",
      },
      { transaction: t },
    );

    const createdTickets = [];

    /* ================= 5. CREATE TICKET + HOLD SEAT ================= */
    for (const s of showtimeSeats) {
      const ticket = await Ticket.create(
        {
          booking_time: new Date(),
          ticket_status: "PENDING",
          showtime_seat_id: s.showtime_seat_id,
        },
        { transaction: t },
      );

      await OrderTicket.create(
        {
          order_id: order.order_id,
          ticket_id: ticket.ticket_id,
        },
        { transaction: t },
      );

      await s.update(
        {
          status: "HOLD",
          hold_at: new Date(), // ✅ cực kỳ quan trọng
        },
        { transaction: t },
      );

      createdTickets.push({
        ticket_id: ticket.ticket_id,
        seat_row: s.Seat.seat_row,
        seat_number: s.Seat.seat_number,
        price: s.price,
      });
    }

    /* ================= 6. CREATE ORDER SERVICE ================= */
    if (orderServiceData.length > 0) {
      await OrderService.bulkCreate(
        orderServiceData.map((d) => ({
          ...d,
          order_id: order.order_id,
        })),
        { transaction: t },
      );
    }

    await t.commit();

    /* ================= SOCKET ================= */
    socket.emitSeatUpdate(showtime_id, {
      seat_ids,
      status: "HOLD", // ✅ đúng
    });

    /* ================= RESPONSE ================= */
    return res.status(201).json({
      success: true,
      message: "Giữ ghế thành công, vui lòng thanh toán",
      data: {
        order_id: order.order_id,
        total_amount: finalAmount,
        tickets: createdTickets,
        expired_at: new Date(Date.now() + 5 * 60 * 1000), // ⏱ 5 phút
        showtime: {
          showtime_id: showtime.showtime_id,
          start_time: showtime.start_time,
          movie_title: showtime.Movie?.title,
          cinema_name: showtime.Room?.Cinema?.cinema_name,
          room_name: showtime.Room?.room_name,
        },
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("BOOK TICKETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt vé",
    });
  }
};

/**
 * @desc    Lấy vé của tôi
 */
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Payment,
        },
        {
          model: OrderService,
        },
        {
          model: OrderTicket,
          include: [
            {
              model: Ticket,
              include: [
                {
                  model: ShowtimeSeat,
                  include: [
                    {
                      model: Seat,
                      attributes: [
                        "seat_row",
                        "seat_number",
                        "seat_code",
                        "seat_type",
                      ],
                    },
                    {
                      model: Showtime,
                      include: [
                        {
                          model: Movie,
                          attributes: ["title", "poster_url"],
                        },
                        {
                          model: Room,
                          include: [
                            {
                              model: Cinema,
                              attributes: ["cinema_name"],
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
    });

    /* ================= FORMAT DATA ================= */
    const result = orders.map((order) => {
      const tickets = order.OrderTickets.map((ot) => {
        const t = ot.Ticket;
        const ss = t.ShowtimeSeat;
        const st = ss.Showtime;

        return {
          ticket_id: t.ticket_id,
          status: t.ticket_status,

          seat: `${ss.Seat.seat_row}${ss.Seat.seat_number}`,

          movie: {
            title: st.Movie.title,
            poster: st.Movie.poster_url,
          },

          cinema: st.Room.Cinema.cinema_name,
          room: st.Room.room_name,

          showtime: {
            start_time: st.start_time,
            end_time: st.end_time,
          },
        };
      });

      return {
        order_id: order.order_id,
        status: order.order_status,
        total_amount: order.total_amount,
        created_at: order.created_at,

        payment: order.Payment
          ? {
            method: order.Payment.payment_method,
            status: order.Payment.payment_status,
            transaction_code: order.Payment.transaction_code,
            payment_time: order.Payment.payment_time,
          }
          : null,

        services: order.OrderServices?.map((s) => ({
          name: s.name_snapshot,
          quantity: s.quantity,
          price: s.price,
        })),

        tickets,
      };
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET MY TICKETS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
/**
 * @desc    Chi tiết vé
 */
exports.getTicketDetail = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: { ticket_id: req.params.ticket_id },
      include: [
        { model: OrderTicket, include: [{ model: Order }] },
        {
          model: ShowtimeSeat,
          include: [
            { model: Seat },
            {
              model: Showtime,
              include: [{ model: Movie }, { model: Room, include: [Cinema] }],
            },
          ],
        },
      ],
    });

    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy vé" });

    if (ticket.OrderTickets?.[0]?.Order?.user_id !== req.user.user_id) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền xem vé này" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("GET TICKET DETAIL ERROR:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * @desc    Hủy vé
 */
exports.cancelTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const ticket = await Ticket.findByPk(req.params.ticket_id, {
      include: [{ model: ShowtimeSeat, include: [Showtime] }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!ticket) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy vé" });
    }

    if (ticket.ticket_status !== "BOOKED") {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Chỉ hủy được vé đang BOOKED" });
    }

    const showtime = ticket.ShowtimeSeat?.Showtime;
    if (new Date(showtime.start_time) <= new Date()) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Không thể hủy vé đã chiếu" });
    }

    await ticket.update({ ticket_status: "CANCELLED" }, { transaction: t });

    await ShowtimeSeat.update(
      { status: "AVAILABLE", hold_at: null },
      { where: { showtime_seat_id: ticket.showtime_seat_id }, transaction: t },
    );

    await t.commit();

    socket.emitSeatUpdate(showtime.showtime_id, {
      seat_ids: [ticket.ShowtimeSeat.seat_id],
      status: "AVAILABLE",
    });

    res.status(200).json({
      success: true,
      message: "Hủy vé thành công",
    });
  } catch (error) {
    await t.rollback();
    console.error("CANCEL TICKET ERROR:", error);
    res.status(500).json({ success: false, message: "Lỗi khi hủy vé" });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const { Op } = require("sequelize");

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { status, time, search } = req.query;

    const offset = (page - 1) * limit;
    const now = new Date();

    const ticketWhere = {};

    /* ================= STATUS FILTER ================= */
    if (status) {
      ticketWhere.ticket_status = status;
    }

    /* ================= TIME FILTER ================= */
    if (time) {
      let start;
      let end;

      if (time === "today") {
        start = new Date();
        start.setHours(0, 0, 0, 0);

        end = new Date();
        end.setHours(23, 59, 59, 999);
      }

      if (time === "week") {
        const day = now.getDay() || 7;

        start = new Date(now);
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      }

      if (time === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);

        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        ticketWhere.booking_time = {
          [Op.between]: [start, end],
        };
      }
    }

    /* ================= MOVIE SEARCH ================= */
    let movieWhere = {};

    if (search) {
      movieWhere.title = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows } = await Ticket.findAndCountAll({
      attributes: [
        "ticket_id",
        "showtime_seat_id",
        "booking_time",
        "ticket_status",
      ],

      where: ticketWhere,

      offset,
      limit,

      order: [["booking_time", "DESC"]],

      distinct: true,
      subQuery: false,

      include: [
        {
          model: OrderTicket,
          attributes: ["ticket_id"],

          include: [
            {
              model: Order,
              attributes: ["order_id"],

              include: [
                {
                  model: User,
                  attributes: [
                    "user_id",
                    "full_name",
                    "email",
                    "phone",
                  ],
                },
              ],
            },
          ],
        },

        {
          model: ShowtimeSeat,
          required: true,

          attributes: [
            "showtime_seat_id",
            "price",
            "status",
          ],

          include: [
            {
              model: Seat,
              attributes: [
                "seat_id",
                "seat_row",
                "seat_number",
                "seat_type",
              ],
            },

            {
              model: Showtime,
              required: true,

              attributes: [
                "showtime_id",
                "start_time",
                "end_time",
                "format",
                "language",
              ],

              include: [
                {
                  model: Movie,
                  required: !!search,
                  where: search ? movieWhere : undefined,

                  attributes: [
                    "movie_id",
                    "title",
                    "poster_url",
                    "duration",
                  ],
                },

                {
                  model: Room,

                  attributes: [
                    "room_id",
                    "room_name",
                  ],

                  include: [
                    {
                      model: Cinema,

                      attributes: [
                        "cinema_id",
                        "cinema_name",
                        "address",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("GET ALL TICKETS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
