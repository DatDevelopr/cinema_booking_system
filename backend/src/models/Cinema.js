const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cinema = sequelize.define("Cinema", {
    cinema_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cinema_name: { type: DataTypes.STRING(150), allowNull: false },
    address: DataTypes.STRING(255),
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
  }, { tableName: "cinemas", timestamps: false });

  Cinema.associate = (models) => {
    Cinema.hasMany(models.Room, { foreignKey: "cinema_id" });
  };

  return Cinema;
};
