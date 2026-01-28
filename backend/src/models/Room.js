// models/Room.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Room", {
    room_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cinema_id: DataTypes.INTEGER,
    room_name: DataTypes.STRING(50),
    total_seats: DataTypes.INTEGER
  }, {
    tableName: "rooms",
    timestamps: false
  });
};
