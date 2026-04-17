module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define(
    "Ticket",
    {
      ticket_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      showtime_seat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      booking_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      ticket_status: {
        type: DataTypes.ENUM(
          "PENDING", // ✅ mới thêm
          "BOOKED",
          "CANCELLED",
          "USED",
        ),
        defaultValue: "PENDING",
      },
    },
    {
      tableName: "tickets",
      timestamps: false,
    },
  );

  Ticket.associate = (models) => {
    // liên kết ghế theo suất chiếu
    Ticket.belongsTo(models.ShowtimeSeat, {
      foreignKey: "showtime_seat_id",
    });

    // liên kết order (qua bảng trung gian)
    Ticket.hasMany(models.OrderTicket, {
      foreignKey: "ticket_id",
    });
  };

  return Ticket;
};
