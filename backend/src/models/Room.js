module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Room",
    {
      room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      cinema_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      room_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      rows: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      seats_per_row: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "rooms",
      timestamps: false,
    }
  );
};
