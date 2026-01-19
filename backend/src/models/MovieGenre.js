const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("MovieGenre", {}, { tableName: "movie_genres", timestamps: false });
};
