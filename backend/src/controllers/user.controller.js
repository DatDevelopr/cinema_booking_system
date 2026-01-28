const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * ĐĂNG KÝ NGƯỜI DÙNG
 */
exports.register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      confirm_password,
      phone,
      gender,
      date_of_birth,
    } = req.body;

    /* ================== VALIDATE ================== */

    if (!full_name || !email || !password || !confirm_password || !phone) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        message: "Mật khẩu nhập lại không khớp",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải ít nhất 6 ký tự",
      });
    }

    /* ================== CHECK EMAIL ================== */
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        message: "Email đã được sử dụng",
      });
    }

    /* ================== CHECK PHONE ================== */
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({
        message: "Số điện thoại đã được sử dụng",
      });
    }

    /* ================== HASH PASSWORD ================== */
    const password_hash = await bcrypt.hash(password, 10);

    /* ================== CREATE USER ================== */
    const newUser = await User.create({
      full_name,
      email,
      password_hash,
      phone,
      gender: gender || "other",
      date_of_birth: date_of_birth || null,
      role_id: 2,        // USER
      status: 1,         // active
      created_at: new Date(),
    });

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công",
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};


/**
 * ĐĂNG NHẬP
 * POST /api/users/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Thiếu email hoặc mật khẩu",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


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
    const {
      full_name,
      phone,
      role_id,
      gender,
      date_of_birth,
      status,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    await user.update({
      full_name,
      phone,
      role_id,
      gender,
      date_of_birth,
      status,
    });

    res.json({
      message: "Cập nhật user thành công",
    });
  } catch (error) {
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
