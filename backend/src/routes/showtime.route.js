const router = require("express").Router();
const showtimeController = require("../controllers/showtime.controller");
const showtimeSeatController = require("../controllers/showtimeSeat.controller");
const { verifyToken } = require("../middlewares");

/* ================= PUBLIC ================= */

router.get("/by-cinema", showtimeController.getShowtimesByCinema);



// Lấy sơ đồ ghế
router.get("/:id/seats", showtimeSeatController.getSeatMapByShowtime);

// Lấy chi tiết
router.get("/:id", showtimeController.getShowtimeDetail);

// Lấy danh sách suất chiếu 
router.get("/", showtimeController.getAllShowtimes);


/* ================= ADMIN ================= */

// Tạo suất chiếu
router.post("/", verifyToken, showtimeController.createShowtime);

// Cập nhật
router.put("/:id", verifyToken, showtimeController.updateShowtime);

// Huỷ suất chiếu
router.delete("/:id", verifyToken, showtimeController.deleteShowtime);

// Toggle trạng thái
router.patch("/:id/status", verifyToken, showtimeController.deleteShowtime);

module.exports = router;