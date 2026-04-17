const express = require("express");
const router = express.Router();

const ticketController = require("../controllers/ticket.controller");

// middleware auth (bạn thay đúng path)
const { verifyToken } = require("../middlewares/auth.middleware");

/* =====================================================
   ĐẶT VÉ
===================================================== */
// POST /api/tickets/book
router.post("/book", verifyToken, ticketController.bookTickets);

/* =====================================================
   LẤY DANH SÁCH VÉ CỦA USER
===================================================== */
// GET /api/tickets/my
router.get("/my", verifyToken, ticketController.getMyTickets);

/* =====================================================
   CHI TIẾT VÉ
===================================================== */
// GET /api/tickets/:ticket_id
router.get("/:ticket_id", verifyToken, ticketController.getTicketDetail);

/* =====================================================
   HỦY VÉ
===================================================== */
// POST /api/tickets/:ticket_id/cancel
router.post("/:ticket_id/cancel", verifyToken, ticketController.cancelTicket);

module.exports = router;