const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin, isRole } = require("../middlewares/role.middleware");

/* ================= PROFILE ================= */

// Lấy profile của chính mình
router.get(
  "/profile",
  verifyToken,
  isRole([1, 2]), // admin + user
  userController.getProfile
);


router.get(
  "/:id",
  verifyToken,
  userController.getUserById
);

// Update profile của chính mình
router.put(
  "/profile",
  verifyToken,
  isRole([1, 2]),
  userController.updateProfile
);

/* ================= ADMIN ================= */

// Lấy danh sách người dùng
router.get(
  "/",
  verifyToken,
  userController.getAllUsers
);

// Tạo user mới
router.post(
  "/",
  verifyToken,
  userController.createUser
);

// Admin update user khác
router.put(
  "/:id",
  verifyToken,
  userController.updateUser
);

// Xoá user
router.delete(
  "/:id",
  verifyToken,
  userController.deleteUser
);

module.exports = router;
