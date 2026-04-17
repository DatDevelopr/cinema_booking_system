import { useForm } from "react-hook-form";
import { useState } from "react";
import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles, Shield } from "lucide-react";
import useToast from "../../../hooks/useToastSimple";

export default function LoginForm() {
  const navigate = useNavigate();
  const toast = useToast();

  const { login } = useAuthStore();

  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const res = await authApi.login(formData);
      const result = res.data;
      
      // Lưu remember me
      if (rememberMe) {
        localStorage.setItem("remember_email", formData.email);
      } else {
        localStorage.removeItem("remember_email");
      }
      
      login(result);
      toast.success("Đăng nhập thành công");
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại, vui lòng thử lại";
      toast.error(errorMsg);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header với Icon */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
        <p className="text-sm text-gray-500">Đăng nhập để tiếp tục trải nghiệm</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* EMAIL FIELD */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail size={16} className="text-orange-500" />
            Email
          </label>
          <div className="relative group">
            <input
              type="email"
              placeholder="example@email.com"
              className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                errors.email 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-200 hover:border-orange-400 bg-gray-50/50"
              }`}
              {...register("email", {
                required: "Email không được bỏ trống",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
            />
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD FIELD */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock size={16} className="text-orange-500" />
            Mật khẩu
          </label>
          <div className="relative group">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              className={`w-full px-4 py-3 pl-11 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                errors.password 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-200 hover:border-orange-400 bg-gray-50/50"
              }`}
              {...register("password", {
                required: "Mật khẩu không được bỏ trống",
                minLength: {
                  value: 6,
                  message: "Mật khẩu tối thiểu 6 ký tự",
                },
              })}
            />
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* OPTIONS */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Ghi nhớ đăng nhập
            </span>
          </label>
          
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn size={18} />
                ĐĂNG NHẬP
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}