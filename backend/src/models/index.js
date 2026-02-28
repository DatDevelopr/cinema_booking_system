const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Movie = require("./Movie")(sequelize, DataTypes);
const Genre = require("./Genre")(sequelize, DataTypes);
const Region = require("./Region")(sequelize, DataTypes);
const MovieGenre = require("./MovieGenre")(sequelize, DataTypes);
const Cinema = require("./Cinema")(sequelize, DataTypes);
const Room = require("./Room")(sequelize, DataTypes);
const Seat = require("./Seat")(sequelize, DataTypes);
const Showtime = require("./ShowTime")(sequelize, DataTypes);
const Ticket = require("./Ticket")(sequelize, DataTypes);
const Payment = require("./Payment")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);
const ShowtimeSeat = require("./ShowtimeSeat")(sequelize, DataTypes);
const Otp = require("./Otp")(sequelize, DataTypes);

// Movie - Genre
Movie.belongsToMany(Genre, { through: MovieGenre, foreignKey: "movie_id" });
Genre.belongsToMany(Movie, { through: MovieGenre, foreignKey: "genre_id" });

// Region - Cinema
Region.hasMany(Cinema, { foreignKey: "region_id" });
Cinema.belongsTo(Region, { foreignKey: "region_id" });


// Cinema - Room
Cinema.hasMany(Room, { foreignKey: "cinema_id" });
Room.belongsTo(Cinema, { foreignKey: "cinema_id" });

// Room - Seat
Room.hasMany(Seat, { foreignKey: "room_id", onDelete: "CASCADE" });
Seat.belongsTo(Room, { foreignKey: "room_id" });

// Movie - Showtime
Movie.hasMany(Showtime, { foreignKey: "movie_id" });
Showtime.belongsTo(Movie, { foreignKey: "movie_id" });

// Room - Showtime
Room.hasMany(Showtime, { foreignKey: "room_id" });
Showtime.belongsTo(Room, { foreignKey: "room_id" });

// Showtime - Ticket
Showtime.hasMany(Ticket, { foreignKey: "showtime_id" });
Ticket.belongsTo(Showtime, { foreignKey: "showtime_id" });

// User - Ticket
User.hasMany(Ticket, { foreignKey: "user_id" });
Ticket.belongsTo(User, { foreignKey: "user_id" });


Showtime.hasMany(ShowtimeSeat, { foreignKey: "showtime_id" });
Seat.hasMany(ShowtimeSeat, { foreignKey: "seat_id" });

ShowtimeSeat.belongsTo(Seat, { foreignKey: "seat_id" });
ShowtimeSeat.belongsTo(Showtime, { foreignKey: "showtime_id" });

// Ticket - Payment
Payment.belongsToMany(Ticket, {
  through: "payment_tickets",
  foreignKey: "payment_id",
});

Ticket.belongsToMany(Payment, {
  through: "payment_tickets",
  foreignKey: "ticket_id",
});

// User - Payment
User.hasMany(Payment, { foreignKey: "user_id" });
Payment.belongsTo(User, { foreignKey: "user_id" });


module.exports = {
  sequelize,
  Otp,
  Region,
  Movie,
  Genre,
  Cinema,
  Room,
  Seat,
  Showtime,
  Ticket,
  Payment,
  User,
  ShowtimeSeat
};
