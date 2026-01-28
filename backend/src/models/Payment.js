// models/Payment.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Payment", {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10,2),
    payment_method: DataTypes.STRING(20),
    payment_status: DataTypes.STRING(20),
    transaction_code: DataTypes.STRING(100),
    payment_time: DataTypes.DATE
  }, {
    tableName: "payments",
    timestamps: false
  });
};
