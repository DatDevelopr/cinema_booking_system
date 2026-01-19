const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Payment = sequelize.define("Payment", {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "vnpay", "momo", "paypal"),
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending"
    },
    transaction_code: DataTypes.STRING,
    payment_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "payments",
    timestamps: false
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Ticket, { foreignKey: "ticket_id" });
    Payment.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Payment;
};
