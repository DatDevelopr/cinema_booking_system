const {
  Order,
  User,
  Payment,
  OrderTicket,
  Ticket,
  ShowtimeSeat,
  Showtime,
  Movie,
  Room,
  Cinema,
  OrderService,
  Service,
  Seat
} = require("../models");

exports.getOrderDetail = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: Payment,
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
                    },
                    {
                      model: Showtime,
                      include: [
                        {
                          model: Movie,
                          attributes: ["title", "poster_url", "duration"],
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
        {
          model: OrderService,
          include: [
            {
              model: Service,
              attributes: ["name", "price", "image"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });

  } catch (err) {
    console.error("GET ORDER DETAIL ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const orders = await Order.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Payment,
          attributes: [
            "payment_method",
            "payment_status",
            "amount",
            "transaction_code",
            "payment_time",
          ],
        },
        {
          model: OrderTicket,
          include: [
            {
              model: Ticket,
              attributes: ["ticket_id", "ticket_status"],
              include: [
                {
                  model: ShowtimeSeat,
                  attributes: ["price"],
                  include: [
                    {
                      model: Seat,
                      attributes: ["seat_row", "seat_number"],
                    },
                    {
                      model: Showtime,
                      attributes: ["start_time", "end_time"],
                      include: [
                        {
                          model: Movie,
                          attributes: ["title", "poster_url"],
                        },
                        {
                          model: Room,
                          attributes: ["room_name"],
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
        {
          model: OrderService,
          attributes: ["quantity", "price", "name_snapshot"],
        },
      ],
    });

    /* ================= FORMAT DATA ================= */
    const result = orders.map((order) => {
      const tickets = order.OrderTickets.map((ot) => {
        const t = ot.Ticket;
        const sts = t.ShowtimeSeat;

        return {
          ticket_id: t.ticket_id,
          status: t.ticket_status,
          price: sts.price,
          seat: `${sts.Seat.seat_row}${sts.Seat.seat_number}`,
          movie: {
            title: sts.Showtime.Movie.title,
            poster: sts.Showtime.Movie.poster_url,
          },
          cinema: sts.Showtime.Room.Cinema.cinema_name,
          room: sts.Showtime.Room.room_name,
          showtime: {
            start_time: sts.Showtime.start_time,
            end_time: sts.Showtime.end_time,
          },
        };
      });

      return {
        order_id: order.order_id,
        order_status: order.order_status,
        total_amount: order.total_amount,
        created_at: order.created_at,

        payment: order.Payment
          ? {
              method: order.Payment.payment_method,
              status: order.Payment.payment_status,
              amount: order.Payment.amount,
              transaction_code: order.Payment.transaction_code,
              payment_time: order.Payment.payment_time,
            }
          : null,

        tickets,
        services: order.OrderServices?.map((s) => ({
          name: s.name_snapshot,
          quantity: s.quantity,
          price: s.price,
        })),
      };
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};