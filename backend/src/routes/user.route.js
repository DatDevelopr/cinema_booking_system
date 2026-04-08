const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isRole } = require("../middlewares/role.middleware");

router.get(
  "/profile",
  verifyToken,
  userController.getProfile,
);

router.put(
  "/profile",
  verifyToken,
  userController.updateProfile,
);

router.patch("/avatar", verifyToken, userController.updateAvatar);


router.get("/:id", verifyToken, userController.getUserById);
// Admin update user khác
router.put("/:id", verifyToken, userController.updateUser);

// Xoá user
router.delete("/:id", verifyToken, userController.deleteUser);
// Lấy danh sách người dùng
router.get("/", verifyToken, userController.getAllUsers);

// Tạo user mới
router.post("/", verifyToken, userController.createUser);


module.exports = router;
