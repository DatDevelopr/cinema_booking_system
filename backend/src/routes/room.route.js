const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

router.get("/", roomController.getAllRooms);
router.get("/cinema/:cinemaId", roomController.getRoomsByCinema);

router.post("/", verifyToken, isAdmin, roomController.createRoom);
router.put("/:id", verifyToken, isAdmin, roomController.updateRoom);
router.delete("/:id", verifyToken, isAdmin, roomController.deleteRoom);

module.exports = router;
