const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seat.controller");

// lấy ghế theo phòng
router.get("/room/:roomId", seatController.getSeatsByRoom);

// update 1 ghế
router.put("/:id/type", seatController.updateSeatType);

// update nhiều ghế
router.put("/bulk", seatController.updateMultipleSeats);

// reset ghế
router.put("/room/:roomId/reset", seatController.resetSeatsByRoom);

// stats
router.get("/room/:roomId/stats", seatController.getSeatStats);

module.exports = router;