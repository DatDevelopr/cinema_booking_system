const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Role", {
    role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role_name: { type: DataTypes.STRING(50), allowNull: false },
    description: DataTypes.STRING(255),
  }, { tableName: "roles", timestamps: false });
};
