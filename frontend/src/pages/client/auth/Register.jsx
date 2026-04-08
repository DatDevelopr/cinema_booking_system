import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import OTPModal from "../../../components/OTPModal";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Users, Shield, ChevronRight } from "lucide-react";

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, form[name]);
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "full_name":
        if (!value.trim()) error = "Họ và tên không được để trống";
        else if (value.length < 2) error = "Họ và tên phải có ít nhất 2 ký tự";
        break;
      case "email":
        if (!value.trim()) error = "Email không được để trống";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Email không hợp lệ";
        break;
      case "phone":
        if (!value.trim()) error = "Số điện thoại không được để trống";
        else if (!/^[0-9]{9,11}$/.test(value)) error = "Số điện thoại không hợp lệ (9-11 số)";
        break;
      case "gender":
        if (!value) error = "Vui lòng chọn giới tính";
        break;
      case "date_of_birth":
        if (!value) error = "Vui lòng chọn ngày sinh";
        else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 13) error = "Bạn chưa đủ 13 tuổi để đăng ký";
          if (age > 100) error = "Ngày sinh không hợp lệ";
        }
        break;
      case "password":
        if (!value) error = "Mật khẩu không được để trống";
        else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự";
        else if (value.length > 50) error = "Mật khẩu không được quá 50 ký tự";
        break;
      case "confirm_password":
        if (!value) error = "Vui lòng nhập lại mật khẩu";
        else if (value !== form.password) error = "Mật khẩu nhập lại không khớp";
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const fields = ["full_name", "email", "phone", "gender", "date_of_birth", "password", "confirm_password"];
    const newTouched = {};
    let isValid = true;
    
    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, form[field]);
      if (error) isValid = false;
    });
    
    setTouched(newTouched);
    
    if (!agree) {
      alert("Bạn phải đồng ý với Điều khoản dịch vụ");
      return false;
    }
    
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await authApi.sendOTP(form.email);
      setShowOTP(true);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Không thể gửi OTP, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      setLoading(true);
      const res = await authApi.register({ ...form, otp });
      alert(res.data.message || "Đăng ký thành công!");
      setForm(initialForm);
      setAgree(false);
      setShowOTP(false);
      navigate("/auth");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await authApi.sendOTP(form.email);
      alert("Đã gửi lại OTP thành công");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Không thể gửi lại OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#fc8905] to-[#fda43a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
            <p className="text-sm text-gray-500">Điền thông tin để đăng ký thành viên</p>
          </div>

          <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            {/* Họ tên */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User size={16} className="text-[#fc8905]" />
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="VD: Nguyễn Văn A"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all ${
                  errors.full_name && touched.full_name ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#fc8905]"
                }`}
              />
              {errors.full_name && touched.full_name && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-[#fc8905]" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="example@email.com"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all ${
                  errors.email && touched.email ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#fc8905]"
                }`}
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone size={16} className="text-[#fc8905]" />
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0912345678"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all ${
                  errors.phone && touched.phone ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#fc8905]"
                }`}
              />
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users size={16} className="text-[#fc8905]" />
                Giới tính <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#fc8905] focus:ring-[#fc8905]"
                  />
                  <span className="text-sm text-gray-700">Nam</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#fc8905] focus:ring-[#fc8905]"
                  />
                  <span className="text-sm text-gray-700">Nữ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={form.gender === "other"}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#fc8905] focus:ring-[#fc8905]"
                  />
                  <span className="text-sm text-gray-700">Khác</span>
                </label>
              </div>
              {errors.gender && touched.gender && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-[#fc8905]" />
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all ${
                  errors.date_of_birth && touched.date_of_birth ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#fc8905]"
                }`}
              />
              {errors.date_of_birth && touched.date_of_birth && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock size={16} className="text-[#fc8905]" />
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  type={showPass ? "text" : "password"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all pr-12 ${
                    errors.password && touched.password ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#fc8905]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#fc8905] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock size={16} className="text-[#fc8905]" />
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="confirm_password"
                  value={form.confirm_password}
                  type={showConfirm ? "text" : "password"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all pr-12 ${
                    errors.confirm_password && touched.confirm_password ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#fc8905]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#fc8905] transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm_password && touched.confirm_password && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* Điều khoản */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#fc8905] focus:ring-[#fc8905] rounded border-gray-300 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                Tôi đồng ý với{" "}
                <button type="button" className="text-[#fc8905] hover:text-[#e07a04] font-medium transition-colors">
                  Điều khoản dịch vụ
                </button>{" "}
                và{" "}
                <button type="button" className="text-[#fc8905] hover:text-[#e07a04] font-medium transition-colors">
                  Chính sách bảo mật
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#fc8905] to-[#fda43a] hover:from-[#e07a04] hover:to-[#fc8905] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "ĐĂNG KÝ"
              )}
            </button>
          </form>
        </div>
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