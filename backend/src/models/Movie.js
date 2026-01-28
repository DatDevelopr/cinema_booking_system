module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define(
    "Movie",
    {
      movie_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: DataTypes.TEXT,
      duration: DataTypes.INTEGER,
      release_date: DataTypes.DATE,
      poster_url: DataTypes.STRING(255),
      status: DataTypes.STRING(20),
      created_at: DataTypes.DATE
    },
    {
      tableName: "movies",
      timestamps: false
    }
  );

  return Movie;
};
