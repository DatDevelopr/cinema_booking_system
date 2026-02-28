module.exports = (sequelize, DataTypes) => {
  return sequelize.define("PaymentTicket", {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    tableName: "payment_tickets",
    timestamps: false,
  });
};