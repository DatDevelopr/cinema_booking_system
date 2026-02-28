const { Region } = require("../models");

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

exports.createRegion = async (req, res) => {
  try {
    const { region_name } = req.body;

    if (!region_name) {
      return res.status(400).json({
        message: "region_name là bắt buộc",
      });
    }

    const exists = await Region.findOne({ where: { region_name } });


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
    const { id } = req.params;
    const { region_name } = req.body;

    const region = await Region.findByPk(id);

    if (!region) {
      return res.status(404).json({ message: "Khu vực không tồn tại" });
    }

    region.region_name = region_name || region.region_name;
    await region.save();

    res.json({
      message: "Cập nhật khu vực thành công",
      data: region,
    });
  } catch (error) {
    console.error("UPDATE REGION ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;

    const region = await Region.findByPk(id);

    if (!region) {
      return res.status(404).json({ message: "Khu vực không tồn tại" });
    }

    await region.destroy();

    res.json({ message: "Xoá khu vực thành công" });
  } catch (error) {
    console.error("DELETE REGION ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};