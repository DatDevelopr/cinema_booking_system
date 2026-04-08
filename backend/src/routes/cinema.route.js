const express = require("express");
const router = express.Router();

const cinemaController = require("../controllers/cinema.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// ================= PUBLIC =================

// danh sách rạp (pagination + filter)
router.get("/", cinemaController.getAllCinemas);

// chi tiết rạp
router.get("/:id", cinemaController.getCinemaById);


// ================= ADMIN =================

// tạo rạp
router.post("/", verifyToken, cinemaController.createCinema);

// cập nhật rạp
router.put("/:id", verifyToken, cinemaController.updateCinema);

// xoá / ngừng hoạt động rạp
router.delete("/:id", verifyToken, cinemaController.deleteCinema);


module.exports = router;