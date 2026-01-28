const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Movie = require("./Movie")(sequelize, DataTypes);
const Genre = require("./Genre")(sequelize, DataTypes);
const MovieGenre = require("./MovieGenre")(sequelize, DataTypes);
const Cinema = require("./Cinema")(sequelize, DataTypes);
const Room = require("./Room")(sequelize, DataTypes);
const Seat = require("./Seat")(sequelize, DataTypes);
const Showtime = require("./ShowTime")(sequelize, DataTypes);
const Ticket = require("./Ticket")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);
const Payment = require("./Payment")(sequelize, DataTypes);

// Quan hệ
Movie.belongsToMany(Genre, { through: MovieGenre, foreignKey: "movie_id" });
Genre.belongsToMany(Movie, { through: MovieGenre, foreignKey: "genre_id" });

Cinema.hasMany(Room, { foreignKey: "cinema_id" });
Room.belongsTo(Cinema);

Room.hasMany(Seat, { foreignKey: "room_id" });

Movie.hasMany(Showtime, { foreignKey: "movie_id" });
Room.hasMany(Showtime, { foreignKey: "room_id" });

Showtime.hasMany(Ticket, { foreignKey: "showtime_id" });
User.hasMany(Ticket, { foreignKey: "user_id" });

Ticket.hasOne(Payment, { foreignKey: "ticket_id" });

module.exports = {
  sequelize,
  Movie,
  Genre,
  Cinema,
  Room,
  Seat,
  Showtime,
  Ticket,
  User,
  Payment
};
