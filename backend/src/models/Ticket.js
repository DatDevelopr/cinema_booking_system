module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Ticket", {
    ticket_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    showtime_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    booking_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    ticket_status: {
      type: DataTypes.STRING(20), // BOOKED | CANCELLED
      defaultValue: "BOOKED",
    },
  }, {
    tableName: "tickets",
    timestamps: false,
  });
};