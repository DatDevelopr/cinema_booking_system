const nodemailer = require("nodemailer");

exports.sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"NextGen Cinema 🎬" <${process.env.EMAIL_USER}>`,
    to,
    subject: "OTP xác thực",
    html: `<h3>Mã OTP của bạn là: ${otp}</h3>`
  });
};
