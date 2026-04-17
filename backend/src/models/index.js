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
const ShowtimeSeat = require("./ShowtimeSeat")(sequelize, DataTypes);

const Ticket = require("./Ticket")(sequelize, DataTypes);
const Order = require("./Order")(sequelize, DataTypes);
const OrderTicket = require("./OrderTicket")(sequelize, DataTypes);
const OrderService = require("./OrderService")(sequelize, DataTypes);
const Service = require("./Service")(sequelize, DataTypes);
const Payment = require("./Payment")(sequelize, DataTypes);

const User = require("./User")(sequelize, DataTypes);
const Otp = require("./Otp")(sequelize, DataTypes);


// ================= RELATION =================

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

// Showtime - ShowtimeSeat
Showtime.hasMany(ShowtimeSeat, { foreignKey: "showtime_id" });
ShowtimeSeat.belongsTo(Showtime, { foreignKey: "showtime_id" });

// Seat - ShowtimeSeat
Seat.hasMany(ShowtimeSeat, { foreignKey: "seat_id" });
ShowtimeSeat.belongsTo(Seat, { foreignKey: "seat_id" });

// ShowtimeSeat - Ticket
ShowtimeSeat.hasOne(Ticket, { foreignKey: "showtime_seat_id" });
Ticket.belongsTo(ShowtimeSeat, { foreignKey: "showtime_seat_id" });


// ================= ORDER FLOW =================

// User - Order
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

// Order - Ticket (qua OrderTicket)
Order.hasMany(OrderTicket, { foreignKey: "order_id" });
OrderTicket.belongsTo(Order, { foreignKey: "order_id" });

Ticket.hasMany(OrderTicket, { foreignKey: "ticket_id" });
OrderTicket.belongsTo(Ticket, { foreignKey: "ticket_id" });

// Order - Service
Order.hasMany(OrderService, { foreignKey: "order_id" });
OrderService.belongsTo(Order, { foreignKey: "order_id" });

Service.hasMany(OrderService, { foreignKey: "service_id" });
OrderService.belongsTo(Service, { foreignKey: "service_id" });

// Order - Payment
Order.hasOne(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });


// ================= EXPORT =================

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
  ShowtimeSeat,
  Ticket,
  Order,
  OrderTicket,
  OrderService,
  Service,
  Payment,
  User
};