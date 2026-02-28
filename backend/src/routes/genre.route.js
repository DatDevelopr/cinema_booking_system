const express = require("express");
const router = express.Router();

const genreController = require("../controllers/genre.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

/**
 * USER + ADMIN
 */
router.get("/", genreController.getAllGenres);
router.get("/:id", genreController.getGenreById);

/**
 * ADMIN
 */
router.post(
  "/",
  verifyToken,
  genreController.createGenre
);

router.put(
  "/:id",
  verifyToken,
  genreController.updateGenre
);

router.delete(
  "/:id",
  verifyToken,
  genreController.deleteGenre
);

module.exports = router;
