module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Seat",
    {
      seat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      seat_row: {
        type: DataTypes.STRING(2), // A, B, C...
        allowNull: false,
      },

      seat_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      seat_code: {
        type: DataTypes.STRING(10), // A1, A2...
        allowNull: false,
      },

      seat_type: {
        type: DataTypes.ENUM("NORMAL", "VIP", "COUPLE"),
        defaultValue: "NORMAL",
      },
    },
    {
      tableName: "seats",
      timestamps: false,
    }
  );
};
