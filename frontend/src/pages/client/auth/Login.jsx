import { useForm } from "react-hook-form";
import { useState } from "react";
import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();

  const { login } = useAuthStore();

  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    setApiError("");

    try {
      const res = await authApi.login(formData);
      const result = res.data;
      login(result);
      navigate("/admin");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại, vui lòng thử lại";
      setApiError(errorMsg);
      console.error("Login error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-6"
      noValidate
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
        <p className="text-sm text-gray-500">Đăng nhập để tiếp tục trải nghiệm</p>
      </div>

      {/* ERROR MESSAGE */}
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-600 text-sm font-medium">{apiError}</p>
          </div>
        </div>
      )}

      {/* EMAIL FIELD */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Mail size={16} className="text-[#fc8905]" />
          Email
        </label>
        <div className="relative group">
          <input
            type="email"
            placeholder="example@email.com"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all duration-200 ${
              errors.email 
                ? "border-red-500 bg-red-50" 
                : "border-gray-200 hover:border-[#fc8905]"
            }`}
            {...register("email", {
              required: "Email không được bỏ trống",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Email không hợp lệ",
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* PASSWORD FIELD */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lock size={16} className="text-[#fc8905]" />
          Mật khẩu
        </label>
        <div className="relative group">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Nhập mật khẩu của bạn"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fc8905] focus:border-transparent transition-all duration-200 pr-12 ${
              errors.password 
                ? "border-red-500 bg-red-50" 
                : "border-gray-200 hover:border-[#fc8905]"
            }`}
            {...register("password", {
              required: "Mật khẩu không được bỏ trống",
              minLength: {
                value: 6,
                message: "Mật khẩu tối thiểu 6 ký tự",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#fc8905] transition-colors"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* OPTIONS */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-[#fc8905] focus:ring-[#fc8905] cursor-pointer"
          />
          <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
        </label>
        
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-[#fc8905] hover:text-[#e07a04] font-medium transition-colors"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full bg-gradient-to-r from-[#fc8905] to-[#fda43a] hover:from-[#e07a04] hover:to-[#fc8905] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
      >
        <span className="flex items-center justify-center gap-2">
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
      </button>

      

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </form>
  );
}