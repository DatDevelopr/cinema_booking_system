// controllers/payment.controller.js
const crypto = require("crypto");
const qs = require("qs");
const { sequelize, Payment, ShowtimeSeat, Ticket } = require("../models");
const socket = require("../socket");

exports.createPayment = async (req, res) => {
  const { user_id, amount, payment_method } = req.body;

  const payment = await Payment.create({
    user_id,
    amount,
    payment_method,          // VNPAY | MOMO
    payment_status: "PENDING",
    transaction_code: Date.now().toString(),
    payment_time: new Date(),
  });

  res.json({
    payment_id: payment.payment_id,
    transaction_code: payment.transaction_code,
  });
};

exports.paymentCallback = async (req, res) => {
  const {
    transaction_code,
    resultCode, // VNPay: "00" | MoMo: 0
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    /**
     * 1️⃣ LOCK payment
     */
    const payment = await Payment.findOne({
      where: { transaction_code },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment || payment.payment_status !== "PENDING") {
      await transaction.rollback();
      return res.json({ message: "Payment invalid" });
    }

    /**
     * ======================
     * ===== SUCCESS ========
     * ======================
     */
    if (resultCode === "00" || resultCode === 0) {
      /**
       * 2️⃣ LOCK ghế user đang HOLD
       */
      const seats = await ShowtimeSeat.findAll({
        where: {
          user_id: payment.user_id,
          status: "HOLD",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!seats.length) {
        await transaction.rollback();
        return res.json({ message: "No seats to book" });
      }

      const seatIds = seats.map(s => s.seat_id);
      const showtimeId = seats[0].showtime_id;

      /**
       * 3️⃣ BOOK ghế
       */
      await ShowtimeSeat.update(
        { status: "BOOKED", hold_at: null },
        { where: { seat_id: seatIds }, transaction }
      );

      /**
       * 4️⃣ Tạo ticket
       */
      const tickets = await Promise.all(
        seats.map(seat =>
          Ticket.create(
            {
              user_id: payment.user_id,
              showtime_id: seat.showtime_id,
              seat_id: seat.seat_id,
              booking_time: new Date(),
              ticket_status: "BOOKED",
            },
            { transaction }
          )
        )
      );

      /**
       * 5️⃣ Gán ticket ↔ payment (payment_tickets)
       */
      await payment.addTickets(tickets, { transaction });

      /**
       * 6️⃣ Update payment
       */
      await payment.update(
        { payment_status: "SUCCESS" },
        { transaction }
      );

      await transaction.commit();

      socket.emitSeatUpdate(showtimeId, {
        seat_ids: seatIds,
        status: "BOOKED",
      });

      return res.json({ message: "Payment SUCCESS" });
    }

    /**
     * ======================
     * ===== FAILED ========
     * ======================
     */
    await payment.update(
      { payment_status: "FAILED" },
      { transaction }
    );

    const seats = await ShowtimeSeat.findAll({
      where: {
        user_id: payment.user_id,
        status: "HOLD",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const seatIds = seats.map(s => s.seat_id);
    const showtimeId = seats[0]?.showtime_id;

    if (seatIds.length) {
      await ShowtimeSeat.update(
        { status: "AVAILABLE", hold_at: null, user_id: null },
        { where: { seat_id: seatIds }, transaction }
      );
    }

    await transaction.commit();

    if (showtimeId) {
      socket.emitSeatUpdate(showtimeId, {
        seat_ids: seatIds,
        status: "AVAILABLE",
      });
    }

    return res.json({ message: "Payment FAILED" });

  } catch (err) {
    await transaction.rollback();
    console.error("PAYMENT CALLBACK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.vnpayCallback = async (req, res) => {
  const vnpParams = { ...req.query };
  const secureHash = vnpParams.vnp_SecureHash;

  // ❌ bỏ hash trước khi verify
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  /**
   * 1️⃣ VERIFY CHỮ KÝ
   */
  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
  const checkHash = hmac.update(signData).digest("hex");

  if (secureHash !== checkHash) {
    return res.status(400).send("Invalid VNPay signature");
  }

  const transaction = await sequelize.transaction();

  try {
    /**
     * 2️⃣ LOCK PAYMENT
     */
    const payment = await Payment.findOne({
      where: { transaction_code: vnpParams.vnp_TxnRef },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment || payment.payment_status !== "PENDING") {
      await transaction.rollback();
      return res.redirect("/payment-result?status=invalid");
    }

    /**
     * ======================
     * ===== SUCCESS ========
     * ======================
     */
    if (vnpParams.vnp_ResponseCode === "00") {
      /**
       * 3️⃣ LOCK GHẾ HOLD
       */
      const seats = await ShowtimeSeat.findAll({
        where: {
          user_id: payment.user_id,
          status: "HOLD",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!seats.length) {
        await transaction.rollback();
        return res.redirect("/payment-result?status=empty");
      }

      const seatIds = seats.map(s => s.seat_id);
      const showtimeId = seats[0].showtime_id;

      /**
       * 4️⃣ BOOK GHẾ
       */
      await ShowtimeSeat.update(
        { status: "BOOKED", hold_at: null },
        { where: { seat_id: seatIds }, transaction }
      );

      /**
       * 5️⃣ CREATE TICKET
       */
      const tickets = await Promise.all(
        seats.map(seat =>
          Ticket.create(
            {
              user_id: payment.user_id,
              showtime_id: seat.showtime_id,
              seat_id: seat.seat_id,
              booking_time: new Date(),
              ticket_status: "BOOKED",
            },
            { transaction }
          )
        )
      );

      /**
       * 6️⃣ LINK PAYMENT ↔ TICKETS
       */
      await payment.addTickets(tickets, { transaction });

      /**
       * 7️⃣ UPDATE PAYMENT
       */
      await payment.update(
        {
          payment_status: "SUCCESS",
          provider_txn_id: vnpParams.vnp_TransactionNo,
        },
        { transaction }
      );

      await transaction.commit();

      socket.emitSeatUpdate(showtimeId, {
        seat_ids: seatIds,
        status: "BOOKED",
      });

      return res.redirect("/payment-result?status=success");
    }

    /**
     * ======================
     * ===== FAILED ========
     * ======================
     */
    await payment.update(
      { payment_status: "FAILED" },
      { transaction }
    );

    const seats = await ShowtimeSeat.findAll({
      where: {
        user_id: payment.user_id,
        status: "HOLD",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const seatIds = seats.map(s => s.seat_id);
    const showtimeId = seats[0]?.showtime_id;

    if (seatIds.length) {
      await ShowtimeSeat.update(
        { status: "AVAILABLE", hold_at: null, user_id: null },
        { where: { seat_id: seatIds }, transaction }
      );
    }

    await transaction.commit();

    if (showtimeId) {
      socket.emitSeatUpdate(showtimeId, {
        seat_ids: seatIds,
        status: "AVAILABLE",
      });
    }

    return res.redirect("/payment-result?status=failed");

  } catch (err) {
    await transaction.rollback();
    console.error("VNPAY CALLBACK ERROR:", err);
    res.redirect("/payment-result?status=error");
  }
};