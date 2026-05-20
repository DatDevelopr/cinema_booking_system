

module.exports = (sequelize, DataTypes) => {
  const UserMovieView = sequelize.define(
    "UserMovieView",
    {
      view_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_movie_views",
      timestamps: false,
    }
  );

  return UserMovieView;
};