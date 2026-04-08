module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ShowtimeSeat", {
    showtime_seat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    showtime_id: DataTypes.INTEGER,
    seat_id: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10, 2),
    hold_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("AVAILABLE", "HOLD", "BOOKED"),
      defaultValue: "AVAILABLE"
    }
  }, {
    tableName: "showtime_seats",
    timestamps: false
  });
};
