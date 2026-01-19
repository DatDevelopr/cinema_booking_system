const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", authController.logout);

// Current session info
router.get("/me", authController.me);

module.exports = router;
