const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movie.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

/**
 * USER + ADMIN
 */
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMovieById);

/**
 * ADMIN
 */
router.post(
  "/",
  verifyToken,
  movieController.createMovie
);

router.put(
  "/:id",
  verifyToken,
  movieController.updateMovie
);

router.delete(
  "/:id",
  verifyToken,
  movieController.deleteMovie
);

router.post(
  "/:id/toggle-status",
  verifyToken,
  movieController.toggleStatus
);

module.exports = router;
