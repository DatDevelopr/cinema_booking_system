import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../../api/user.api";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Users,
  Shield,
  Activity,
  Save,
  XCircle,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 2,
    gender: "male",
    date_of_birth: "",
    status: 1,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "full_name":
        if (!value.trim()) return "Họ tên không được để trống";
        if (value.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
        if (value.length > 100) return "Họ tên không được quá 100 ký tự";
        return "";
      case "email":
        if (!value.trim()) return "Email không được để trống";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email không hợp lệ";
        return "";
      case "password":
        if (!value) return "Mật khẩu không được để trống";
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
        if (value.length > 50) return "Mật khẩu không được quá 50 ký tự";
        return "";
      case "phone":
        if (value && !/^[0-9]{10,11}$/.test(value)) {
          return "Số điện thoại không hợp lệ (10-11 số)";
        }
        return "";
      case "date_of_birth":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) return "Người dùng phải từ 18 tuổi trở lên";
          if (age > 100) return "Tuổi không hợp lệ";
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.full_name = validateField("full_name", form.full_name);
    newErrors.email = validateField("email", form.email);
    newErrors.password = validateField("password", form.password);
    newErrors.phone = validateField("phone", form.phone);
    newErrors.date_of_birth = validateField("date_of_birth", form.date_of_birth);
    
    setErrors(newErrors);
    const isValid = !Object.values(newErrors).some(error => error && error !== "");
    
    if (!isValid) {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, form[name])
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ["full_name", "email", "password", "phone", "date_of_birth"];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await userApi.createUser(form);
      alert("Tạo người dùng thành công!");
      navigate("/admin/users");
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || "Tạo người dùng thất bại!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <UserPlus size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Thêm người dùng mới</h1>
            </div>
            <p className="text-gray-600 ml-13">Nhập thông tin chi tiết để tạo tài khoản người dùng</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
                  <p className="text-sm text-gray-500">Các thông tin chính của người dùng</p>
                </div>
                
                <div className="p-6 space-y-5">
                  <Input
                    label="Họ và tên *"
                    icon={<User size={16} />}
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.full_name && errors.full_name}
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email *"
                      icon={<Mail size={16} />}
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && errors.email}
                      placeholder="example@email.com"
                      required
                    />

                    <Input
                      label="Mật khẩu *"
                      icon={<Lock size={16} />}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && errors.password}
                      placeholder="••••••"
                      required
                      showPasswordToggle
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      showPassword={showPassword}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Số điện thoại"
                      icon={<Phone size={16} />}
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.phone && errors.phone}
                      placeholder="0912345678"
                    />

                    <Input
                      label="Ngày sinh"
                      icon={<Calendar size={16} />}
                      name="date_of_birth"
                      type="date"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.date_of_birth && errors.date_of_birth}
                      helperText="Phải từ 18 tuổi trở lên"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Role & Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-900">Phân quyền & Trạng thái</h2>
                  <p className="text-sm text-gray-500">Cài đặt quyền và trạng thái tài khoản</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <Select
                    label="Quyền"
                    icon={<Shield size={16} />}
                    name="role_id"
                    value={form.role_id}
                    onChange={handleChange}
                    options={[
                      { value: 1, label: "Quản trị viên (ADMIN)" },
                      { value: 2, label: "Người dùng (USER)" },
                    ]}
                  />

                  <Select
                    label="Trạng thái"
                    icon={<Activity size={16} />}
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={[
                      { value: 1, label: "Kích hoạt", color: "green" },
                      { value: 0, label: "Vô hiệu", color: "red" },
                    ]}
                  />
                </div>
              </div>

              {/* Gender Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin khác</h2>
                  <p className="text-sm text-gray-500">Giới tính của người dùng</p>
                </div>
                
                <div className="p-6">
                  <RadioGroup
                    label="Giới tính"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={[
                      { value: "male", label: "Nam", icon: "♂" },
                      { value: "female", label: "Nữ", icon: "♀" },
                      { value: "other", label: "Khác", icon: "⚧" },
                    ]}
                  />
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Tạo người dùng
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-all"
                  >
                    <XCircle size={18} />
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Input = ({ 
  label, 
  icon, 
  error, 
  helperText, 
  required, 
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  ...props 
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    <div className="relative">
      <input
        {...props}
        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
        } ${showPasswordToggle ? "pr-10" : ""}`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
    {helperText && !error && (
      <p className="text-xs text-gray-400 mt-1">{helperText}</p>
    )}
  </div>
);

const Select = ({ label, icon, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    <select
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const RadioGroup = ({ label, name, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-700">
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  </div>
);

export default CreateUser;