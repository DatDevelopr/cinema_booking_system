const express = require("express");
const router = express.Router();

const {
  /*
  =========================
  API 1
  =========================
  */
  getCinemaRevenueSummary,

  /*
  =========================
  API 2
  =========================
  */
  getCinemaRevenueChart,

  /*
  =========================
  API 3
  =========================
  */
  getTopMoviesByCinema,

  /*
  =========================
  API 4
  =========================
  */
  exportCinemaRevenueExcel,

  /*
  =========================
  API 5
  =========================
  */
  getCinemaRevenueBreakdown,

  /*
  =========================
  API 6
  =========================
  */
  getTopServicesByCinema,

  /*
  =========================
  API 7
  =========================
  */
  getCinemaPaymentMethods,

  /*
  =========================
  API 8
  =========================
  */
  getCinemaShowtimeDetails,
} = require("../controllers/cinemaRevenue.controller");


/*
==================================================
CINEMA REVENUE ROUTES
PREFIX:
/api/cinema-revenue
==================================================
*/


/*
==================================================
API 1
GET /api/cinema-revenue/summary
==================================================
*/
router.get(
  "/summary",
  getCinemaRevenueSummary
);


/*
==================================================
API 2
GET /api/cinema-revenue/chart
==================================================
*/
router.get(
  "/chart",
  getCinemaRevenueChart
);


/*
==================================================
API 3
GET /api/cinema-revenue/top-movies
==================================================
*/
router.get(
  "/top-movies",
  getTopMoviesByCinema
);


/*
==================================================
API 4
GET /api/cinema-revenue/export-excel
==================================================
*/
router.get(
  "/export-excel",
  exportCinemaRevenueExcel
);


/*
==================================================
API 5
GET /api/cinema-revenue/breakdown
==================================================
*/
router.get(
  "/breakdown",
  getCinemaRevenueBreakdown
);


/*
==================================================
API 6
GET /api/cinema-revenue/top-services
==================================================
*/
router.get(
  "/top-services",
  getTopServicesByCinema
);


/*
==================================================
API 7
GET /api/cinema-revenue/payment-methods
==================================================
*/
router.get(
  "/payment-methods",
  getCinemaPaymentMethods
);


/*
==================================================
API 8
GET /api/cinema-revenue/showtime-details
==================================================
*/
router.get(
  "/showtime-details",
  getCinemaShowtimeDetails
);


module.exports = router;