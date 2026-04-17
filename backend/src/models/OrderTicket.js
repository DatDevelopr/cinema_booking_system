module.exports = (sequelize, DataTypes) => {
  const OrderTicket = sequelize.define("OrderTicket", {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },

    ticket_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    tableName: "order_tickets",
    timestamps: false,
  });

  OrderTicket.associate = (models) => {
    OrderTicket.belongsTo(models.Order, {
      foreignKey: "order_id",
    });

    OrderTicket.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
    });
  };

  return OrderTicket;
};