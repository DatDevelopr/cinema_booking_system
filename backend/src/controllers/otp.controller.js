const otpGenerator = require("otp-generator");
const validator = require("validator");
const { sendOTPEmail } = require("../utils/sendMail");
const { Otp } = require("../models");

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await Otp.destroy({ where: { email } });

    await Otp.create({
      email,
      otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (mailError) {
      await Otp.destroy({ where: { email } });
      throw mailError;
    }

    res.json({ message: "Đã gửi OTP" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Lỗi gửi OTP" });
  }
};


/**
 * VERIFY OTP
 * POST /api/otp/verify
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ where: { email } });

    // ❗ 1. Không tồn tại
    if (!record) {
      return res.status(400).json({ message: "OTP không tồn tại" });
    }

    const inputOtp = String(otp).trim();
    const dbOtp = String(record.otp).trim();

    // ❗ 2. Sai OTP
    if (inputOtp !== dbOtp) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    // ❗ 3. Hết hạn
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    // ❗ 4. Xoá OTP sau khi dùng (QUAN TRỌNG)
    await Otp.destroy({ where: { email } });

    return res.json({ message: "OTP hợp lệ" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi" });
  }
};




