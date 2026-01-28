const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin, isUser, isRole } = require("../middlewares/role.middleware");


router.post("/register", userController.register);
router.post("/login", userController.login);

router.get(
  "/profile",
  verifyToken,
  isRole([1, 2]),
  userController.getProfile
);


// Lấy danh sách người dùng
router.get(
  "/",
  verifyToken,
  isAdmin,
  userController.getAllUsers
);

// Tạo người dùng mới
router.post(
  "/",
  verifyToken,
  isAdmin,
  userController.createUser
);

// Cập nhật người dùng
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  userController.updateUser
);

// Xoá người dùng
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  userController.deleteUser
);
module.exports = router;
