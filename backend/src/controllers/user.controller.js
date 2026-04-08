const bcrypt = require("bcrypt");
const { User } = require("../models");

/**
 * ADMIN - LẤY DANH SÁCH USER
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { user_id: id },
      attributes: {
        exclude: ["password_hash"], // không trả password
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

/**
 * ADMIN - TẠO USER
 */
exports.createUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      role_id,
      gender,
      date_of_birth,
      status,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email và password là bắt buộc",
      });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({
        message: "Email đã tồn tại",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash,
      phone,
      role_id: role_id || 2,
      gender,
      date_of_birth,
      status: status ?? 1,
    });

    res.status(201).json({
      message: "Tạo user thành công",
      user_id: user.user_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * ADMIN - CẬP NHẬT USER
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    // Lấy dữ liệu từ body
    const {
      full_name,
      phone,
      role_id,
      gender,
      date_of_birth,
      status,
      avatar
    } = req.body;

    // Object chứa field cần update
    const updateData = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (gender !== undefined) updateData.gender = gender;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
    if (status !== undefined) updateData.status = status;
    if (avatar !== undefined) updateData.avatar = avatar;

    await user.update(updateData);

    return res.json({
      message: "Cập nhật user thành công",
      data: user,
    });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {

    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.user.user_id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    const updateData = {};

    if (req.body.full_name !== undefined)
      updateData.full_name = req.body.full_name;

    if (req.body.phone !== undefined)
      updateData.phone = req.body.phone;

    if (req.body.gender !== undefined)
      updateData.gender = req.body.gender;

    if (req.body.date_of_birth !== undefined)
      updateData.date_of_birth = req.body.date_of_birth;

    await user.update(updateData);

    return res.json({
      message: "Cập nhật thành công",
      user,
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);

    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { avatar } = req.body;
    console.log("Updating avatar for user:", userId, "with avatar URL:", avatar);

    const user = await User.findByPk(userId);
    console.log("User found:", user);

    if (!user)
      return res.status(404).json({ message: "User không tồn tại" });

    await user.update({ avatar });

    res.json({
      message: "Cập nhật avatar thành công",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};



/**
 * ADMIN - XOÁ USER
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.user_id) {
      return res.status(400).json({
        message: "Không thể tự xoá chính mình",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    await user.destroy();

    res.json({
      message: "Xoá user thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * USER - LẤY PROFILE CỦA CHÍNH MÌNH
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
