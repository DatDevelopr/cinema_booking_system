const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ticket = sequelize.define("Ticket", {
    ticket_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    booking_time: DataTypes.DATE,
    ticket_status: DataTypes.STRING(20),
  }, { tableName: "tickets", timestamps: false });

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, { foreignKey: "user_id" });
    Ticket.belongsTo(models.Showtime, { foreignKey: "showtime_id" });
    Ticket.belongsTo(models.Seat, { foreignKey: "seat_id" });
  };

  return Ticket;
};
