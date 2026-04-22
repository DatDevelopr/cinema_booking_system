// src/app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// middleware
app.use(cors({
    origin: "http://localhost:5173", // ⭐ FRONTEND URL
    credentials: true, // ⭐ cho phép cookie
  }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use("/api/user", require("./routes/user.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/movies", require("./routes/movie.route"));
app.use("/api/genres", require("./routes/genre.route"));
app.use("/api/movie-genres", require("./routes/movieGenre.route"));
app.use("/api/regions", require("./routes/region.route"));
app.use("/api/cinemas", require("./routes/cinema.route"));
app.use("/api/rooms", require("./routes/room.route"));
app.use("/api/showtimes", require("./routes/showtime.route"));
app.use("/api/payments", require("./routes/payment.route"));
app.use("/api/otp", require("./routes/otp.route"));
app.use("/api/upload", require("./routes/upload.route"));
app.use("/api/seats", require("./routes/seat.route"));
app.use("/api/services", require("./routes/services.route"));
app.use("/api/tickets", require("./routes/ticket.route"));
app.use("/api/payment", require("./routes/payment.route"));
app.use("/api/orders", require("./routes/order.route"));


module.exports = app;
