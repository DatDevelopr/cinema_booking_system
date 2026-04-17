const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movie.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

/* ================= USER ================= */
router.get("/movie-showtimes/:slug", movieController.getMovieAndShowtimeBySlug);
router.get("/user", movieController.getMoviesWithShowtimeByCinema);

/* ================= ADMIN ================= */
router.post("/", verifyToken, movieController.createMovie);
router.put("/:id", verifyToken, movieController.updateMovie);
router.delete("/:id", verifyToken, movieController.deleteMovie);
router.post("/:id/toggle-status", verifyToken, movieController.toggleStatus);

/* ================= COMMON ================= */
router.get("/:id", movieController.getMovieById);
router.get("/", movieController.getAllMovies);

module.exports = router;