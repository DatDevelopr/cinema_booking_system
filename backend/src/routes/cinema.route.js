const express = require("express");
const router = express.Router();

const cinemaController = require("../controllers/cinema.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

// Public
router.get("/", cinemaController.getAllCinemasByRegion);
router.get("/:id", cinemaController.getCinemaById);

// Admin
router.post("/", verifyToken, isAdmin, cinemaController.createCinema);
router.put("/:id", verifyToken, isAdmin, cinemaController.updateCinema);
router.delete("/:id", verifyToken, isAdmin, cinemaController.deleteCinema);

module.exports = router;
