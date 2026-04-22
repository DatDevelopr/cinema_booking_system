const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.get("/:order_id", orderController.getOrderDetail);

module.exports = router;