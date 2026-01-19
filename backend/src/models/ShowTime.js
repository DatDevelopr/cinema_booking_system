const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Showtime = sequelize.define("Showtime", {
    showtime_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    start_time: DataTypes.DATE,
    price: DataTypes.DECIMAL(10,2),
    status: DataTypes.STRING(20),
  }, { tableName: "showtimes", timestamps: false });

  Showtime.associate = (models) => {
    Showtime.belongsTo(models.Movie, { foreignKey: "movie_id" });
    Showtime.belongsTo(models.Room, { foreignKey: "room_id" });
    Showtime.hasMany(models.Ticket, { foreignKey: "showtime_id" });
  };

  return Showtime;
};
