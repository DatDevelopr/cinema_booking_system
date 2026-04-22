// controllers/ticket.controller.js
const sequelize = require("../config/database");
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
          include: [{ model: Cinema, attributes: ["cinema_id", "cinema_name"] }],
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
      (s) => !["AVAILABLE", "HOLD"].includes(s.status)
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
      0
    );

    let serviceTotal = 0;
    const orderServiceData = [];

    if (service_items.length > 0) {
      const serviceIds = service_items.map((i) => i.service_id);

      const services = await Service.findAll({
        where: { service_id: { [Op.in]: serviceIds } },
        transaction: t,
      });

      for (const item of service_items) {
        const service = services.find((s) => s.service_id === item.service_id);
        if (!service) continue;

        const amount = parseFloat(service.price) * (item.quantity || 1);
        serviceTotal += amount;

        orderServiceData.push({
          service_id: service.service_id,
          quantity: item.quantity || 1,
          price: service.price,
          name_snapshot: service.name,
        });
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
      { transaction: t }
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
        { transaction: t }
      );

      await OrderTicket.create(
        {
          order_id: order.order_id,
          ticket_id: ticket.ticket_id,
        },
        { transaction: t }
      );

      await s.update(
        {
          status: "HOLD",
          hold_at: new Date(), // ✅ cực kỳ quan trọng
        },
        { transaction: t }
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
        { transaction: t }
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
    const tickets = await Ticket.findAll({
      where: { ticket_status: { [Op.in]: ["BOOKED", "USED"] } },
      include: [
        {
          model: OrderTicket,
          include: [{ model: Order, where: { user_id: req.user.user_id } }],
        },
        {
          model: ShowtimeSeat,
          include: [
            { model: Seat, attributes: ["seat_row", "seat_number", "seat_type"] },
            {
              model: Showtime,
              include: [
                { model: Movie, attributes: ["title", "poster_url"] },
                { model: Room, include: [{ model: Cinema, attributes: ["cinema_name"] }] },
              ],
            },
          ],
        },
      ],
      order: [["booking_time", "DESC"]],
    });

    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    console.error("GET MY TICKETS ERROR:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
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
            { model: Showtime, include: [{ model: Movie }, { model: Room, include: [Cinema] }] },
          ],
        },
      ],
    });

    if (!ticket) return res.status(404).json({ success: false, message: "Không tìm thấy vé" });

    if (ticket.OrderTickets?.[0]?.Order?.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: "Không có quyền xem vé này" });
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
      return res.status(404).json({ success: false, message: "Không tìm thấy vé" });
    }

    if (ticket.ticket_status !== "BOOKED") {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Chỉ hủy được vé đang BOOKED" });
    }

    const showtime = ticket.ShowtimeSeat?.Showtime;
    if (new Date(showtime.start_time) <= new Date()) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Không thể hủy vé đã chiếu" });
    }

    await ticket.update({ ticket_status: "CANCELLED" }, { transaction: t });

    await ShowtimeSeat.update(
      { status: "AVAILABLE", hold_at: null },
      { where: { showtime_seat_id: ticket.showtime_seat_id }, transaction: t }
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
