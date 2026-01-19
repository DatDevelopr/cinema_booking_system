const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Seat = sequelize.define("Seat", {
    seat_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    seat_row: DataTypes.CHAR(1),
    seat_number: DataTypes.INTEGER,
    seat_type: DataTypes.STRING(20),
  }, { tableName: "seats", timestamps: false });

  Seat.associate = (models) => {
    Seat.belongsTo(models.Room, { foreignKey: "room_id" });
    Seat.hasMany(models.Ticket, { foreignKey: "seat_id" });
  };

  return Seat;
};
