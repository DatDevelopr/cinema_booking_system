const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Genre = sequelize.define("Genre", {
    genre_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    genre_name: { type: DataTypes.STRING(50), allowNull: false },
  }, { tableName: "genres", timestamps: false });

  Genre.associate = (models) => {
    Genre.belongsToMany(models.Movie, { through: models.MovieGenre, foreignKey: "genre_id" });
  };

  return Genre;
};
