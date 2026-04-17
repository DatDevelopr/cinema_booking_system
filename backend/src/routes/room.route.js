const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/cinema/:cinemaId", roomController.getRoomsByCinema);
router.get("/:id", roomController.getRoomById);
router.get("/", roomController.getAllRooms);

router.post("/", verifyToken, roomController.createRoom);
router.put("/:id", verifyToken, roomController.updateRoom);
router.delete("/:id", verifyToken, roomController.deleteRoom);

module.exports = router;
