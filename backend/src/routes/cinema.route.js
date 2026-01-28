const router = require("express").Router();
const cinemaController = require("../controllers/cinema.controller");
const {verifyToken} = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

router.get("/", cinemaController.getAllCinemas);
router.get("/by-region", cinemaController.getCinemaByRegion);

router.post("/", verifyToken, isAdmin, cinemaController.createCinema);

module.exports = router;
