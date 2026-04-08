module.exports = (sequelize, DataTypes) => {
  const Region = sequelize.define(
    "Region",
    {
      region_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      region_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Tên khu vực không được để trống",
          },
        },
      },

      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // 1 = hoạt động, 0 = đã xoá
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "regions",
      timestamps: false, 
    }
  );

  return Region;
};