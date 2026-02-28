import { useState } from "react";
import { authApi } from "../../../api/auth.api";
import OTPModal from "../../../components/OTPModal";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const initialForm = {
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    password: "",
    confirm_password: "",
  };

  const [form, setForm] = useState(initialForm);
  const [showOTP, setShowOTP] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===== VALIDATE FORM ===== */
  const validateForm = () => {
    if (!form.full_name.trim())
      return "Vui lòng nhập Họ và tên";

    if (!form.email.trim())
      return "Vui lòng nhập Email";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email))
      return "Email không hợp lệ";

    if (!form.phone.trim())
      return "Vui lòng nhập Số điện thoại";

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(form.phone))
      return "Số điện thoại không hợp lệ";

    if (!form.gender)
      return "Vui lòng chọn Giới tính";

    if (!form.date_of_birth)
      return "Vui lòng chọn Ngày sinh";

    const age =
      new Date().getFullYear() -
      new Date(form.date_of_birth).getFullYear();

    if (age < 13)
      return "Bạn chưa đủ tuổi đăng ký";

    if (!form.password)
      return "Vui lòng nhập Mật khẩu";

    if (!form.confirm_password)
      return "Vui lòng nhập lại Mật khẩu";

    if (form.password !== form.confirm_password)
      return "Mật khẩu nhập lại không khớp";

    if (!agree)
      return "Bạn phải đồng ý Điều khoản dịch vụ";

    return null;
  };

  /* ===== SEND OTP ===== */
  const handleRegister = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);
      await authApi.sendOTP(form.email);
      setShowOTP(true);
    } catch {
      alert("Không gửi được OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ===== VERIFY OTP ===== */
  const handleVerifyOTP = async (otp) => {
    try {
      setLoading(true);

      const res = await authApi.register({
        ...form,
        otp,
      });

      alert(res.data.message);

      // reset form
      setForm(initialForm);
      setAgree(false);
      setShowOTP(false);

      navigate("/auth");
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== RESEND OTP ===== */
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await authApi.sendOTP(form.email);
      alert("Đã gửi lại OTP");
    } catch {
      alert("Không gửi lại được OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <form
          onSubmit={handleRegister}
          className="w-[380px] bg-white p-6 rounded-lg"
        >
          <h2 className="text-center text-lg font-semibold mb-5">
            Đăng Ký Tài Khoản
          </h2>

          {/* Họ tên */}
          <div className="mb-3">
            <label className="text-sm">Họ và tên</label>
            <input
              name="full_name"
              value={form.full_name}
              className="input-auth"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="text-sm">Email</label>
            <input
              name="email"
              value={form.email}
              className="input-auth"
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="text-sm">Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              className="input-auth"
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <div className="mb-3">
            <label className="text-sm block mb-1">Giới tính</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={form.gender === "male"}
                  onChange={handleChange}
                />
                Nam
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={form.gender === "female"}
                  onChange={handleChange}
                />
                Nữ
              </label>
            </div>
          </div>

          {/* Date of birth */}
          <div className="mb-3">
            <label className="text-sm">Ngày sinh</label>
            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              className="input-auth"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-3 relative">
            <label className="text-sm">Mật khẩu</label>
            <input
              name="password"
              value={form.password}
              type={showPass ? "text" : "password"}
              className="input-auth pr-10"
              onChange={handleChange}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="eye-icon"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Confirm password */}
          <div className="mb-3 relative">
            <label className="text-sm">Nhập lại mật khẩu</label>
            <input
              name="confirm_password"
              value={form.confirm_password}
              type={showConfirm ? "text" : "password"}
              className="input-auth pr-10"
              onChange={handleChange}
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="eye-icon"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <p>
              Bằng việc đăng ký tài khoản, tôi đồng ý với{" "}
              <span className="text-blue-600">Điều khoản dịch vụ</span>
            </p>
          </div>

          {/* Submit */}
          <button className="btn-auth" disabled={loading}>
            {loading ? "Đang xử lý..." : "HOÀN THÀNH"}
          </button>
        </form>
      </div>

      <OTPModal
        open={showOTP}
        email={form.email}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onClose={() => setShowOTP(false)}
      />
    </>
  );
}
