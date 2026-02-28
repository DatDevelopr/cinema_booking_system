const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.get("/vnpay/callback", paymentController.vnpayCallback);

// tạo payment (PENDING)
router.post("/create", paymentController.createPayment);

// callback từ VNPay / MoMo
router.post("/callback", paymentController.paymentCallback);

module.exports = router;