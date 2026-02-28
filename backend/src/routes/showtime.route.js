const router = require("express").Router();
const showtimeController = require("../controllers/showtime.controller");
const { verifyToken, isAdmin } = require("../middlewares");

const showtimeSeatController = require("../controllers/showtimeSeat.controller");

router.post(
  "/",
  verifyToken,
  isAdmin,
  showtimeController.createShowtime
);

router.get(
  "/:showtimeId/seats",
  showtimeSeatController.getSeatMapByShowtime
);


module.exports = router;
