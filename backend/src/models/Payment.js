module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.ENUM("VNPAY", "MOMO"),
      allowNull: false,
    },

    payment_status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
      defaultValue: "PENDING",
    },

    transaction_code: {
      type: DataTypes.STRING(100),
      unique: true,
    },

    provider_txn_id: {
      type: DataTypes.STRING(100),
    },

    payment_time: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: "payments",
    timestamps: false,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, {
      foreignKey: "order_id",
    });
  };

  return Payment;
};