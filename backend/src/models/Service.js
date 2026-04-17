module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define("Service", {
    service_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING(255),
    },

    category: {
      type: DataTypes.ENUM("FOOD", "DRINK", "COMBO"),
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN, // 0 = inactive, 1 = active
      defaultValue: true,
    },

    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: "services",
    timestamps: false,
  });

  Service.associate = (models) => {
    Service.hasMany(models.OrderService, {
      foreignKey: "service_id",
    });
  };

  return Service;
};