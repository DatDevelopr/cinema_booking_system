module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Payment", {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.STRING(20), // VNPAY | MOMO
      allowNull: false,
    },

    payment_status: {
      type: DataTypes.STRING(20), // PENDING | SUCCESS | FAILED
      allowNull: false,
    },

    transaction_code: {
      type: DataTypes.STRING(100), // mã gửi sang gateway
      unique: true,
    },

    provider_txn_id: {
      type: DataTypes.STRING(100), // mã VNPay/MoMo trả về
    },

    payment_time: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: "payments",
    timestamps: false,
  });
};