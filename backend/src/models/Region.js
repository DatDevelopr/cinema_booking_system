module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Region", {
    region_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    region_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: "regions",
    timestamps: false,
  });
};