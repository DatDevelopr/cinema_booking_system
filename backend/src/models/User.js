const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    phone: DataTypes.STRING(20),
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
  }, { tableName: "users", timestamps: true });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: "role_id" });
    User.hasMany(models.Ticket, { foreignKey: "user_id" });
    User.hasMany(models.Message, { as: "sentMessages", foreignKey: "sender_id" });
    User.hasMany(models.Message, { as: "receivedMessages", foreignKey: "receiver_id" });
    User.hasMany(models.UserMovieHistory, { foreignKey: "user_id" });
  };

  return User;
};
