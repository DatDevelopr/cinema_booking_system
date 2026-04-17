const router = require("express").Router();
const bookingController = require("../controllers/booking.controller");
const { verifyToken } = require("../middlewares");

