const express = require("express");
const router = express.Router();

const movieGenreController = require("../controllers/movieGenre.controller");

const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

// ADMIN gán thể loại cho phim
router.post(
  "/movies/:movieId/genres",
  verifyToken,
  isAdmin,
  movieGenreController.addGenresToMovie
);

// ADMIN xoá thể loại khỏi phim
router.delete(
  "/movies/:movieId/genres/:genreId",
  verifyToken,
  isAdmin,
  movieGenreController.removeGenreFromMovie
);

// Lấy thể loại của phim
router.get("/movies/:movieId/genres", movieGenreController.getGenresByMovie);

// Lọc phim theo thể loại
router.get("/filter", movieGenreController.getMoviesByGenre);

module.exports = router;
