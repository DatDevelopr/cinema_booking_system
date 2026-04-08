const { Region, Cinema } = require("../models");
const { Op } = require("sequelize");

exports.getAllRegions = async (req, res) => {
  try {
    const regions = await Region.findAll({
      order: [["region_name", "ASC"]],
    });

    res.json(regions);
  } catch (error) {
    console.error("GET REGIONS ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ===========================================
   GET ALL (PAGINATION + SEARCH + SORT)
=========================================== */
exports.getAllRegions2 = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "region_name",
      sortOrder = "ASC",
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Region.findAndCountAll({
      where: {
        region_name: {
          [Op.like]: `%${search}%`,
        },
      },
      order: [[sortField, sortOrder.toUpperCase()]],
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error("GET REGIONS ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createRegion = async (req, res) => {
  try {
    let { region_name } = req.body;

    if (!region_name?.trim()) {
      return res.status(400).json({
        message: "region_name là bắt buộc",
      });
    }

    region_name = region_name.trim();

    const exists = await Region.findOne({
      where: {
        region_name: {
          [Op.eq]: region_name,
        },
      },
    });

    if (exists) {
      return res.status(409).json({
        message: "Khu vực đã tồn tại",
      });
    }

    const region = await Region.create({ region_name });

    res.status(201).json({
      message: "Tạo khu vực thành công",
      data: region,
    });
  } catch (error) {
    console.error("CREATE REGION ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


exports.updateRegion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    let { region_name, status } = req.body;

    const region = await Region.findByPk(id);

    if (!region) {
      return res.status(404).json({
        message: "Khu vực không tồn tại",
      });
    }

    // ===============================
    // 1️⃣ Cập nhật trạng thái
    // ===============================
    if (typeof status !== "undefined") {
      status = Number(status);

      // Nếu đang hoạt động và muốn tắt
      if (region.status === 1 && status === 0) {
        const activeCinemas = await Cinema.count({
          where: {
            region_id: id,
            status: 1,
          },
        });

        if (activeCinemas > 0) {
          return res.status(400).json({
            message: `Không thể ngừng hoạt động khu vực vì còn ${activeCinemas} rạp đang hoạt động`,
          });
        }
      }

      region.status = status;
    }

    // ===============================
    // 2️⃣ Cập nhật tên khu vực
    // ===============================
    if (region_name) {
      region_name = region_name.trim();

      const exists = await Region.findOne({
        where: {
          region_name,
          region_id: { [Op.ne]: id },
        },
      });

      if (exists) {
        return res.status(409).json({
          message: "Khu vực đã tồn tại",
        });
      }

      region.region_name = region_name;
    }

    await region.save();

    return res.json({
      message: "Cập nhật khu vực thành công",
      data: region,
    });
  } catch (error) {
    console.error("UPDATE REGION ERROR:", error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;

    const region = await Region.findByPk(id);

    if (!region) {
      return res.status(404).json({ message: "Khu vực không tồn tại" });
    }
    const cinemas = await Cinema.count({
      where: {
        region_id: id,
        status: 1,
      },
    });

    if (cinemas > 0) {
      return res.status(400).json({
        message:
          "Không thể ngừng hoạt động khu vực vì vẫn còn rạp đang hoạt động",
      });
    }

    await region.update({ status: 0 });

    res.json({ message: "Xoá khu vực thành công" });
  } catch (error) {
    console.error("DELETE REGION ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
