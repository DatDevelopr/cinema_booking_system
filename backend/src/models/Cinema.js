// models/Cinema.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Cinema",
    {
      cinema_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      cinema_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },

      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },

      status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },

      region_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "cinemas",

      timestamps: true,

      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};