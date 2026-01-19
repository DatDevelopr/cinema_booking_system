const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Movie = sequelize.define("Movie", {
    movie_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: DataTypes.TEXT,
    duration: DataTypes.INTEGER,
    release_date: DataTypes.DATE,
    poster_url: DataTypes.STRING(255),
    status: DataTypes.STRING(20),
  }, { tableName: "movies", timestamps: true });

  Movie.associate = (models) => {
    Movie.belongsToMany(models.Genre, { through: models.MovieGenre, foreignKey: "movie_id" });
    Movie.hasMany(models.Showtime, { foreignKey: "movie_id" });
    Movie.hasMany(models.UserMovieHistory, { foreignKey: "movie_id" });
  };

  return Movie;
};
