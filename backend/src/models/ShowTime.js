// models/Showtime.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Showtime", {
    showtime_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    movie_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    start_time: DataTypes.DATE,
    price: DataTypes.DECIMAL(10, 2),
    status: DataTypes.STRING(20)
  }, {
    tableName: "showtimes",
    timestamps: false
  });
};
