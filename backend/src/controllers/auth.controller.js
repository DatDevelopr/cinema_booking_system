const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User, Otp, sequelize } = require("../models");
const transporter = require("../utils/mailer");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

/* =====================================================
   FORGOT PASSWORD
===================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Vui lòng nhập email" });

    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(404).json({ message: "Email không tồn tại" });

    const resetToken = jwt.sign(
      { user_id: user.user_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Cinema Booking" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Đặt lại mật khẩu",
      html: `
        <p>Xin chào <b>${user.full_name}</b></p>
        <p>Click link bên dưới để đặt lại mật khẩu (15 phút)</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "Đã gửi link reset password" });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   RESET PASSWORD
===================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirm_password } = req.body;

    if (!token || !password || !confirm_password)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    if (password !== confirm_password)
      return res.status(400).json({ message: "Mật khẩu không khớp" });

    if (password.length < 6)
      return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự" });

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findByPk(decoded.user_id);

    if (!user)
      return res.status(404).json({ message: "User không tồn tại" });

    const hash = await bcrypt.hash(password, 10);

    await user.update({ password_hash: hash });

    res.json({ message: "Đổi mật khẩu thành công" });

  } catch (error) {
    return res.status(400).json({
      message: "Token không hợp lệ hoặc hết hạn",
    });
  }
};

/* =====================================================
   REGISTER + OTP
===================================================== */
exports.register = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    let {
      full_name,
      email,
      password,
      confirm_password,
      phone,
      gender,
      date_of_birth,
      otp,
    } = req.body;

    email = email?.toLowerCase().trim();
    phone = phone?.trim();

    if (!full_name || !email || !password || !phone || !otp)
      return res.status(400).json({ message: "Thiếu thông tin" });

    if (password !== confirm_password)
      return res.status(400).json({ message: "Mật khẩu không khớp" });

    const existed = await User.findOne({ where: { email } });

    if (existed)
      return res.status(409).json({ message: "Email đã tồn tại" });

    const otpRecord = await Otp.findOne({
      where: { email, otp },
    });

    if (!otpRecord)
      return res.status(400).json({ message: "OTP không hợp lệ" });

    if (otpRecord.expires_at < new Date())
      return res.status(400).json({ message: "OTP hết hạn" });

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      {
        full_name,
        email,
        password_hash,
        phone,
        gender: gender || "other",
        date_of_birth: date_of_birth || null,
        role_id: 2,
        status: 1,
      },
      { transaction: t }
    );

    await otpRecord.destroy({ transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
      },
    });

  } catch (error) {
    await t.rollback();
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   LOGIN
===================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        role_id: user.role_id,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* =====================================================
   REFRESH TOKEN
===================================================== */
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user);

    res.json({ 
      accessToken,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        role_id: user.role_id,
      },
     });

  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};


/* =====================================================
   LOGOUT
===================================================== */
exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logout success" });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};