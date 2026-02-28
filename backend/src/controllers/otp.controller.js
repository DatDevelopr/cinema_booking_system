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

    console.log("TYPE input OTP:", typeof otp);
    console.log("TYPE db OTP:", typeof record?.otp);

    console.log("INPUT OTP:", `[${otp}]`, otp.length);
    console.log("DB OTP:", `[${record?.otp}]`, String(record?.otp).length);

    const inputOtp = String(otp).trim();
    const dbOtp = String(record.otp).trim();

    console.log("COMPARE:", inputOtp === dbOtp);

    if (inputOtp !== dbOtp) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    res.json({ message: "OTP hợp lệ" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi" });
  }
};




