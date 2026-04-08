module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Showtime", {
    showtime_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (this.start_time && value <= this.start_time) {
            throw new Error("end_time phải lớn hơn start_time");
          }
        }
      }
    },

    /* FORMAT */
    format: {
      type: DataTypes.ENUM("2D", "3D", "IMAX", "4DX"),
      defaultValue: "2D"
    },

    /* NGÔN NGỮ */
    language: {
      type: DataTypes.ENUM("SUB", "DUB"),
      defaultValue: "SUB"
    },

    /* TRẠNG THÁI */
    status: {
      type: DataTypes.ENUM(
        "UPCOMING",     // sắp chiếu
        "NOW_SHOWING",  // đang chiếu
        "COMPLETED",    // đã chiếu xong
        "CANCELLED"     // huỷ
      ),
      defaultValue: "UPCOMING"
    },

    /* THỐNG KÊ */
    sold_tickets: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    revenue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    }

  }, {
    tableName: "showtimes",
    timestamps: true,

    indexes: [
      {
        fields: ["movie_id"]
      },
      {
        fields: ["room_id"]
      },
      {
        fields: ["start_time"]
      },
      {
        // tránh trùng suất chiếu cùng phòng
        unique: true,
        fields: ["room_id", "start_time"]
      }
    ]
  });
};