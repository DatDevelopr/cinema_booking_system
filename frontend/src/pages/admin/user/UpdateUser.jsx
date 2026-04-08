import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userApi } from "../../../api/user.api";
import DEFAULT_AVATAR from "../../../assets/images/avatar.jpg";
import {
  ArrowLeft,
  Save,
  Key,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Shield,
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Camera,
  XCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUserById(id);
      setForm(res.data.data);
    } catch (error) {
      console.error(error);
      alert("Không thể tải thông tin người dùng");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "full_name":
        if (!value?.trim()) return "Họ tên không được để trống";
        if (value.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
        if (value.length > 100) return "Họ tên không được quá 100 ký tự";
        return "";
      case "email":
        if (!value?.trim()) return "Email không được để trống";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email không hợp lệ";
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

  const handleUpdate = async () => {
    // Mark all fields as touched
    const allFields = ["full_name", "email", "phone", "date_of_birth"];
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
      setUpdating(true);
      await userApi.updateUser(id, form);
      alert("Cập nhật thành công!");
      fetchUser(); // Refresh data
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || "Cập nhật thất bại!";
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    setShowResetConfirm(false);
    try {
      setResetting(true);
      await userApi.resetPassword(id);
      alert("Đã reset mật khẩu thành công! Mật khẩu mới đã được gửi đến email.");
    } catch (error) {
      console.error(error);
      alert("Reset mật khẩu thất bại!");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (form.status === 1) {
      return { text: "Đang hoạt động", color: "bg-green-100 text-green-700", icon: CheckCircle };
    }
    return { text: "Vô hiệu", color: "bg-red-100 text-red-600", icon: XCircle };
  };

  const StatusIcon = getStatusBadge().icon;

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
                <User size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
            </div>
            <p className="text-gray-600 ml-13">Cập nhật thông tin chi tiết của người dùng</p>
          </div>
        </div>

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
                  value={form.full_name || ""}
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
                    value={form.email || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email}
                    placeholder="example@email.com"
                    required
                  />

                  <Input
                    label="Số điện thoại"
                    icon={<Phone size={16} />}
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && errors.phone}
                    placeholder="0912345678"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ngày sinh"
                    icon={<Calendar size={16} />}
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth?.slice(0, 10) || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.date_of_birth && errors.date_of_birth}
                    helperText="Phải từ 18 tuổi trở lên"
                  />

                  <Select
                    label="Giới tính"
                    icon={<Users size={16} />}
                    name="gender"
                    value={form.gender || ""}
                    onChange={handleChange}
                    options={[
                      { value: "male", label: "Nam" },
                      { value: "female", label: "Nữ" },
                      { value: "other", label: "Khác" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900">Ảnh đại diện</h2>
                <p className="text-sm text-gray-500">Hình ảnh của người dùng</p>
              </div>
              
              <div className="p-6">
                <div className="relative group mx-auto w-32">
                  <img
                    src={form.avatar || DEFAULT_AVATAR}
                    alt={form.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:border-blue-500 transition-all"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Tính năng đang phát triển
                </p>
              </div>
            </div>

            {/* Role & Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900">Phân quyền & Trạng thái</h2>
                <p className="text-sm text-gray-500">Cài đặt quyền và trạng thái tài khoản</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Quyền hiện tại</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    form.role_id === 1 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {form.role_id === 1 ? "Quản trị viên" : "Người dùng"}
                  </span>
                </div>

                <Select
                  label="Thay đổi quyền"
                  icon={<Shield size={16} />}
                  name="role_id"
                  value={form.role_id || ""}
                  onChange={handleChange}
                  options={[
                    { value: 1, label: "Quản trị viên (ADMIN)" },
                    { value: 2, label: "Người dùng (USER)" },
                  ]}
                />

                <div className="pt-2">
                  <Select
                    label="Trạng thái"
                    icon={<Activity size={16} />}
                    name="status"
                    value={form.status || ""}
                    onChange={handleChange}
                    options={[
                      { value: 1, label: "Kích hoạt", color: "green" },
                      { value: 0, label: "Vô hiệu", color: "red" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-3">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Cập nhật thông tin
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  disabled={resetting}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      Reset mật khẩu
                    </>
                  )}
                </button>

                <button
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
      </div>

      {/* Reset Password Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Key size={20} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận reset mật khẩu</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn reset mật khẩu cho người dùng <strong>{form.full_name}</strong>?
              <br />
              <span className="text-sm text-gray-500">Mật khẩu mới sẽ được gửi đến email đăng ký.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
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
  ...props 
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
      }`}
    />
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
      <option value="">Chọn {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default UpdateUser;