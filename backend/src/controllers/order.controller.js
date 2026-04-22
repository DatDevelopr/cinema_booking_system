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