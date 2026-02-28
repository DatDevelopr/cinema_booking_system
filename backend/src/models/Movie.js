module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define(
    "Movie",
    {
      movie_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      director: {
        type: DataTypes.STRING(255),
      },

      actors: {
        type: DataTypes.TEXT,
      },

      description: {
        type: DataTypes.TEXT,
      },

      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      release_date: {
        type: DataTypes.DATE,
      },

      poster_url: {
        type: DataTypes.STRING(255),
      },

      trailer_url: {
        type: DataTypes.STRING(255),
      },

      country: {
        type: DataTypes.STRING(100),
      },

      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "movies",
      timestamps: false, // vì bạn đang dùng created_at thủ công
    }
  );

  /* ================= ASSOCIATION ================= */
  Movie.associate = (models) => {
    Movie.belongsToMany(models.Genre, {
      through: "movie_genres",
      foreignKey: "movie_id",
      otherKey: "genre_id",
    });
  };

  return Movie;
};