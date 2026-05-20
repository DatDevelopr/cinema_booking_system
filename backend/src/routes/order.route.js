const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/my-orders", verifyToken, orderController.getMyOrders);
router.get("/:order_id", orderController.getOrderDetail);

module.exports = router;