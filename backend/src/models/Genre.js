// models/Genre.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Genre", {
    genre_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    genre_name: DataTypes.STRING(50)
  }, {
    tableName: "genres",
    timestamps: false
  });
};
