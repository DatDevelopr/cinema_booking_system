// src/app.js
const express = require("express");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/users", require("./routes/user.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/movies", require("./routes/movie.route"));
app.use("/api/genres", require("./routes/genre.route"));
app.use("/api/movie-genres", require("./routes/movieGenre.route"));
app.use("/api/regions", require("./routes/region.route"));
app.use("/api/cinemas", require("./routes/cinema.route"));


module.exports = app;
