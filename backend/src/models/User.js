// models/User.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: DataTypes.STRING(100),
    email: DataTypes.STRING(100),
    password_hash: DataTypes.STRING(255),
    phone: DataTypes.STRING(20),
    role_id: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    status: DataTypes.TINYINT
  }, {
    tableName: "users",
    timestamps: false
  });
};
