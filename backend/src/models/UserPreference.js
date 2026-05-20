

module.exports = (sequelize, DataTypes) => {
  const UserPreference = sequelize.define(
    "UserPreference",
    {
      preference_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      genre_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_preferences",
      timestamps: false,
    }
  );

  return UserPreference;
};