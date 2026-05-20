// routes/movieRevenue.routes.js

const express = require("express");
const router = express.Router();

const {
  getMovieRevenueSummary,
  getTopMoviesRevenue,
  getMovieRevenueDetail,
  getMovieRevenueChart,
  exportMovieRevenueExcel
} = require("../controllers/movieRevenue.controller");

/*
==================================================
MOVIE REVENUE ROUTES
Base URL: /api/movie-revenue
==================================================
*/

/*
1. DOANH THU TỔNG THEO PHIM
GET /api/movie-revenue/summary

Query:
- from (optional)
- to (optional)
- movie_id (optional)
*/

router.get("/export", exportMovieRevenueExcel);

router.get(
  "/summary",
  getMovieRevenueSummary
);

/*
2. TOP PHIM DOANH THU CAO NHẤT
GET /api/movie-revenue/top

Query:
- limit (default = 5)
- from (optional)
- to (optional)
*/
router.get(
  "/top",
  getTopMoviesRevenue
);

/*
3. BIỂU ĐỒ DOANH THU THEO PHIM
GET /api/movie-revenue/chart

Query:
- movie_id (optional)
- type = day | month | year
- from (optional)
- to (optional)
*/
router.get(
  "/chart",
  getMovieRevenueChart
);

/*
4. CHI TIẾT DOANH THU 1 PHIM
GET /api/movie-revenue/:movieId

Params:
- movieId

Query:
- from (optional)
- to (optional)
*/
router.get(
  "/:movieId",
  getMovieRevenueDetail
);


module.exports = router;
