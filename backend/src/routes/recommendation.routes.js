const express = require("express");
const router = express.Router();

const recommendationController = require(
  "../controllers/recommendation.controller"
);

const { verifyToken } = require(
  "../middlewares/auth.middleware"
);

/*
==================================================
PUBLIC ROUTE
==================================================
*/

/*
GET /api/recommendations/hot
Phim hot tuần này
Không cần đăng nhập
*/
router.get(
  "/hot",
  recommendationController.getHotMovies
);

/*
==================================================
PRIVATE ROUTE
Cần đăng nhập
==================================================
*/

/*
POST /api/recommendations/preferences

body:
{
  "genre_ids": [1,2,3]
}
*/
router.post(
  "/preferences",
  verifyToken,
  recommendationController.saveUserPreferences
);

/*
POST /api/recommendations/track-view

body:
{
  "movie_id": 12
}
*/
router.post(
  "/track-view",
  verifyToken,
  recommendationController.trackMovieView
);

/*
GET /api/recommendations/for-you
AI gợi ý phim cá nhân hóa
*/
router.get(
  "/for-you",
  verifyToken,
  recommendationController.getRecommendedMovies
);

router.get(
  "/ai/:user_id",
  verifyToken,
  recommendationController.getAIRecommendedMovies
);

module.exports = router;