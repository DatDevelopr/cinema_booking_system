const express = require("express");
const router = express.Router();

const genreController = require("../controllers/genre.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin, isUser, isRole } = require("../middlewares/role.middleware");

/**
 * USER + ADMIN
 */
router.get("/", genreController.getAllGenres);

/**
 * ADMIN
 */
router.post(
  "/",
  verifyToken,
  isAdmin,
  genreController.createGenre
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  genreController.updateGenre
);

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  genreController.deleteGenre
);

module.exports = router;
