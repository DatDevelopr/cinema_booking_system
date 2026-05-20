// routes/revenue.route.js

const express = require("express");
const router = express.Router();

const revenueController = require("../controllers/revenue.controller");

/*
1. Tổng quan doanh thu
GET /api/revenue/summary
*/
router.get(
  "/summary",
  revenueController.getDashboardSummary
);

/*
2. Biểu đồ doanh thu
GET /api/revenue/chart
- type (day | month | year)
*/
router.get(
  "/chart",
  revenueController.getRevenueChart
);

/*
3. Top phim doanh thu cao nhất
GET /api/revenue/top-movies
*/
router.get(
  "/top-movies",
  revenueController.getTopMoviesRevenue
);

/*
4. Top dịch vụ doanh thu cao nhất
GET /api/revenue/top-services
*/
router.get(
  "/top-services",
  revenueController.getTopServicesRevenue
);

/*
5. Danh sách giao dịch
GET /api/revenue/transactions
*/
router.get(
  "/transactions",
  revenueController.getRevenueTransactions
);

/*
6. Doanh thu theo rạp
GET /api/revenue/by-cinema
*/
router.get(
  "/by-cinema",
  revenueController.getRevenueByCinema
);

/*
7. Đơn hàng gần đây
GET /api/revenue/recent-orders
*/
router.get(
  "/recent-orders",
  revenueController.getRecentOrders
);

router.get(
  "/export",
  revenueController.exportRevenueExcel
);
module.exports = router;