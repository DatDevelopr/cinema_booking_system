const crypto = require("crypto");
const axios = require("axios");
const { VNPay, ignoreLogger } = require("vnpay"); 

const {
  sequelize,
  Order,
  Payment,
  ShowtimeSeat,
  Ticket,
  OrderTicket,
} = require("../models");

const socket = require("../socket");

/* ================= VNPay CONFIG ================= */
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

/* ================= HELPER ================= */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip
  );
}

/* =========================================================
   CREATE PAYMENT (VNPay + MoMo)
========================================================= */
exports.createPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { order_id, payment_method } = req.body;
    const method = payment_method?.toUpperCase();

    if (!order_id || !["VNPAY", "MOMO"].includes(method)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const order = await Order.findByPk(order_id, {
      include: [Payment],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order || order.order_status !== "PENDING") {
      await t.rollback();
      return res.status(400).json({ message: "Order invalid" });
    }

    if (order.Payment) {
      await t.rollback();
      return res.status(400).json({ message: "Order already has payment" });
    }

    const amount = Math.round(order.total_amount);
    const transactionCode = `${method}_${order_id}_${Date.now()}`;
    let paymentUrl = "";

    /* ================= VNPAY ================= */
    if (method === "VNPAY") {
      paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: getClientIp(req),
        vnp_TxnRef: transactionCode,
        vnp_OrderInfo: `Thanh toan don hang ${order_id}`,
        vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      });
    }

    /* ================= MOMO ================= */
    if (method === "MOMO") {
      const requestId = Date.now().toString();

      const raw = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${process.env.MOMO_NOTIFY_URL}&orderId=${transactionCode}&orderInfo=Thanh toán đơn ${order_id}&partnerCode=${process.env.MOMO_PARTNER_CODE}&redirectUrl=${process.env.MOMO_RETURN_URL}&requestId=${requestId}&requestType=captureWallet`;

      const signature = crypto
        .createHmac("sha256", process.env.MOMO_SECRET_KEY)
        .update(raw)
        .digest("hex");

      const momoRes = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        {
          partnerCode: process.env.MOMO_PARTNER_CODE,
          requestId,
          amount,
          orderId: transactionCode,
          orderInfo: "Thanh toán vé phim",
          redirectUrl: process.env.MOMO_RETURN_URL,
          ipnUrl: process.env.MOMO_NOTIFY_URL,
          requestType: "captureWallet",
          signature,
        }
      );

      if (momoRes.data.resultCode !== 0) {
        throw new Error(momoRes.data.message);
      }

      paymentUrl = momoRes.data.payUrl;
    }

    /* SAVE PAYMENT */
    await Payment.create(
      {
        order_id,
        amount,
        payment_method: method,
        transaction_code: transactionCode,
        payment_status: "PENDING",
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({ paymentUrl });

  } catch (err) {
    await t.rollback();
    console.error("CREATE PAYMENT ERROR:", err);
    res.status(500).json({ message: "Create payment error" });
  }
};

/* =========================================================
   CONFIRM BOOKING
========================================================= */
const confirmBooking = async (order_id, provider_txn_id) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(order_id, {
      include: {
        model: OrderTicket,
        include: [Ticket],
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order || order.order_status !== "PENDING") {
      await t.rollback();
      return;
    }

    await order.update({ order_status: "PAID" }, { transaction: t });

    await Payment.update(
      {
        payment_status: "SUCCESS",
        provider_txn_id,
        payment_time: new Date(),
      },
      { where: { order_id }, transaction: t }
    );

    const seatIds = [];
    let showtimeId = null;

    for (const ot of order.OrderTickets) {
      const ticket = ot.Ticket;

      await ticket.update({ ticket_status: "BOOKED" }, { transaction: t });

      const seat = await ShowtimeSeat.findByPk(
        ticket.showtime_seat_id,
        { transaction: t }
      );

      await seat.update(
        { status: "BOOKED", hold_at: null },
        { transaction: t }
      );

      seatIds.push(seat.seat_id);
      showtimeId = seat.showtime_id;
    }

    await t.commit();

    if (showtimeId) {
      socket.emitSeatUpdate(showtimeId, {
        seat_ids: seatIds,
        status: "BOOKED",
      });
    }

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* =========================================================
   FAIL BOOKING
========================================================= */
const failBooking = async (order_id) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(order_id, {
      include: {
        model: OrderTicket,
        include: [Ticket],
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) return;

    await order.update({ order_status: "FAILED" }, { transaction: t });

    await Payment.update(
      { payment_status: "FAILED" },
      { where: { order_id }, transaction: t }
    );

    const seatIds = [];
    let showtimeId = null;

    for (const ot of order.OrderTickets) {
      const ticket = ot.Ticket;

      await ticket.update(
        { ticket_status: "CANCELLED" },
        { transaction: t }
      );

      const seat = await ShowtimeSeat.findByPk(
        ticket.showtime_seat_id,
        { transaction: t }
      );

      await seat.update(
        { status: "AVAILABLE", hold_at: null },
        { transaction: t }
      );

      seatIds.push(seat.seat_id);
      showtimeId = seat.showtime_id;
    }

    await t.commit();

    if (showtimeId) {
      socket.emitSeatUpdate(showtimeId, {
        seat_ids: seatIds,
        status: "AVAILABLE",
      });
    }

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* =========================================================
   VNPAY RETURN
========================================================= */
exports.vnpayReturn = async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);

    if (!verify.isVerified) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-fail`);
    }

    const txnRef = verify.vnp_TxnRef;
    const order_id = txnRef.split("_")[1];

    if (verify.vnp_ResponseCode === "00") {
      await confirmBooking(order_id, verify.vnp_TransactionNo);

      return res.redirect(
        `${process.env.CLIENT_URL}/payment-success?order_id=${order_id}`
      );
    }

    await failBooking(order_id);

    return res.redirect(
      `${process.env.CLIENT_URL}/payment-fail?order_id=${order_id}`
    );

  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL}/payment-fail`);
  }
};

/* =========================================================
   MOMO NOTIFY (IPN)
========================================================= */
exports.momoNotify = async (req, res) => {
  try {
    const data = req.body;

    const raw =
      `accessKey=${process.env.MOMO_ACCESS_KEY}` +
      `&amount=${data.amount}` +
      `&extraData=${data.extraData}` +
      `&message=${data.message}` +
      `&orderId=${data.orderId}` +
      `&orderInfo=${data.orderInfo}` +
      `&orderType=${data.orderType}` +
      `&partnerCode=${data.partnerCode}` +
      `&payType=${data.payType}` +
      `&requestId=${data.requestId}` +
      `&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}` +
      `&transId=${data.transId}`;

    const signature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY)
      .update(raw)
      .digest("hex");

    if (signature !== data.signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order_id = data.orderId.split("_")[1];

    if (data.resultCode === 0) {
      await confirmBooking(order_id, data.transId);
    } else {
      await failBooking(order_id);
    }

    return res.json({ message: "OK" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};