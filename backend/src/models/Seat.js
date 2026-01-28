// models/Seat.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Seat", {
    seat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_id: DataTypes.INTEGER,
    seat_row: DataTypes.CHAR(1),
    seat_number: DataTypes.INTEGER,
    seat_type: DataTypes.STRING(20)
  }, {
    tableName: "seats",
    timestamps: false
  });
};
