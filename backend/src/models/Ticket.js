// models/Ticket.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Ticket", {
    ticket_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    showtime_id: DataTypes.INTEGER,
    seat_id: DataTypes.INTEGER,
    booking_time: DataTypes.DATE,
    ticket_status: DataTypes.STRING(20)
  }, {
    tableName: "tickets",
    timestamps: false
  });
};
