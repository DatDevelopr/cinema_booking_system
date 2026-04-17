const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/services.controller");

// ================= PUBLIC =================

// lấy danh sách dịch vụ (user)
router.get("/active", serviceController.getActiveServices);

// lấy tất cả (có filter, pagination)
router.get("/", serviceController.getAllServices);

// lấy chi tiết
router.get("/:id", serviceController.getServiceById);


// ================= ADMIN =================

// tạo mới
router.post("/", serviceController.createService);

// cập nhật
router.put("/:id", serviceController.updateService);

// xoá (soft delete)
router.delete("/:id", serviceController.deleteService);

// toggle trạng thái
router.patch("/:id/toggle", serviceController.toggleStatus);


module.exports = router;