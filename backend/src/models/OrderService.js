module.exports = (sequelize, DataTypes) => {
  const OrderService = sequelize.define("OrderService", {
    order_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    name_snapshot: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: "order_services",
    timestamps: false,
  });

  OrderService.associate = (models) => {
    OrderService.belongsTo(models.Order, {
      foreignKey: "order_id",
    });

    OrderService.belongsTo(models.Service, {
      foreignKey: "service_id",
    });
  };

  return OrderService;
};