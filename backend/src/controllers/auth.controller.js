const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User } = require("../models");
const transporter = require("../utils/mailer");

/**
 * GỬI LINK RESET PASSWORD
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại",
      });
    }

    // Token reset (15 phút)
    const resetToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Cinema Booking System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Đặt lại mật khẩu",
      html: `
        <p>Xin chào <b>${user.full_name}</b>,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
        <p>Vui lòng click vào link bên dưới (hiệu lực 15 phút):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `,
    });

    res.json({
      message: "Link đặt lại mật khẩu đã được gửi vào email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



/**
 * RESET PASSWORD
 * POST /api/auth/reset-password
 * body: { token, password, confirm_password }
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirm_password } = req.body;

    // 1. Validate input
    if (!token || !password || !confirm_password) {
      return res.status(400).json({
        message: "Thiếu token hoặc mật khẩu",
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

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      });
    }

    const userId = decoded.user_id;

    // 3. Tìm user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    // 4. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Cập nhật mật khẩu
    await user.update({
      password_hash: hashedPassword,
    });

    return res.json({
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};
