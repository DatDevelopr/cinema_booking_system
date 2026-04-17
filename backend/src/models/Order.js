module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    order_status: {
      type: DataTypes.ENUM("PENDING", "PAID", "CANCELLED"),
      defaultValue: "PENDING",
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: "orders",
    timestamps: false,
  });

  Order.associate = (models) => {
    // user
    Order.belongsTo(models.User, {
      foreignKey: "user_id",
    });

    // tickets
    Order.hasMany(models.OrderTicket, {
      foreignKey: "order_id",
    });

    // services (combo, đồ ăn)
    Order.hasMany(models.OrderService, {
      foreignKey: "order_id",
    });

    // payment
    Order.hasOne(models.Payment, {
      foreignKey: "order_id",
    });
  };

  return Order;
};