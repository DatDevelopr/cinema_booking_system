const { Service } = require("../models");
const { Op } = require("sequelize");

/* =====================================================
   GET ALL SERVICES (có phân trang + search + filter)
===================================================== */
exports.getAllServices = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      category,
      status,
      sortField = "created_at",
      sortOrder = "DESC",
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const where = {};

    // search
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // filter category
    if (category) {
      where.category = category;
    }

    // filter status
    if (status !== undefined) {
      where.status = status;
    }

    // sort whitelist
    const allowedSortFields = ["name", "price", "stock"];
    const allowedSortOrder = ["ASC", "DESC"];

    const finalSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "service_id";

    const finalSortOrder = allowedSortOrder.includes(
      sortOrder.toUpperCase()
    )
      ? sortOrder.toUpperCase()
      : "DESC";

    const { count, rows } = await Service.findAndCountAll({
      where,
      order: [[finalSortField, finalSortOrder]],
      limit,
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      stock,
      status,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      image,
      category,
      stock: stock ?? 0,
      status: status ?? 1,
    });

    res.status(201).json({
      message: "Tạo dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }

    await service.update(req.body);

    res.json({
      message: "Cập nhật dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Không tìm thấy dịch vụ",
      });
    }

    await service.update({ status: 0 });

    res.json({
      message: "Xoá dịch vụ thành công",
    });
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Không tồn tại",
      });
    }

    service.status = service.status ? 0 : 1;
    await service.save();

    res.json({
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { status: 1 },
      order: [["category", "ASC"]],
    });

    res.json({ data: services });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};