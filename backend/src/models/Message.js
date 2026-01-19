const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define("Message", {
    message_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: DataTypes.TEXT,
    sent_at: DataTypes.DATE,
  }, { tableName: "messages", timestamps: false });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { as: "sender", foreignKey: "sender_id" });
    Message.belongsTo(models.User, { as: "receiver", foreignKey: "receiver_id" });
  };

  return Message;
};
