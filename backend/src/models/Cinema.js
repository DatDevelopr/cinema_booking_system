// models/Cinema.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Cinema", {
    cinema_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cinema_name: DataTypes.STRING(150),
    address: DataTypes.STRING(255),
    status: DataTypes.TINYINT,
    region_id: DataTypes.INTEGER
  }, {
    tableName: "cinemas",
    timestamps: false
  });
};
