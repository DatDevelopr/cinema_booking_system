const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

/**
 * =========================
 * CREATE PAYMENT
 * =========================
 * FE gọi để lấy link thanh toán (VNPay / MoMo)
 */
router.post("/create", paymentController.createPayment);

/**
 * =========================
 * VNPAY RETURN
 * =========================
 * VNPay redirect về sau khi user thanh toán
 */
router.get("/vnpay-return", paymentController.vnpayReturn);

/**
 * =========================
 * MOMO NOTIFY (IPN)
 * =========================
 * MoMo gọi server → server
 */
router.post("/momo-notify", paymentController.momoNotify);

/**
 * =========================
 * MOMO RETURN (OPTIONAL)
 * =========================
 * Redirect về FE sau khi thanh toán
 */
router.get("/momo-return", (req, res) => {
  return res.redirect(`${process.env.CLIENT_URL}/payment-result`);
});

module.exports = router;