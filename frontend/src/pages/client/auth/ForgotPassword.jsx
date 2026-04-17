import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import useToast from "../../../hooks/useToastSimple";
import { Mail, ArrowLeft, Send, Key, Shield } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await authApi.forgotPassword(data.email);
      toast.success(res.data.message || "Link khôi phục mật khẩu đã được gửi đến email của bạn");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể gửi email, vui lòng thử lại sau";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Key size={28} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
          <p className="text-sm text-gray-500">
            Nhập email đã đăng ký, chúng tôi sẽ gửi link khôi phục mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
          {/* Email Field */}
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

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Lưu ý:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Link khôi phục có hiệu lực trong 30 phút</li>
                  <li>• Kiểm tra cả hộp thư Spam nếu không nhận được email</li>
                  <li>• Liên hệ hỗ trợ nếu gặp vấn đề</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={18} />
                  GỬI LINK KHÔI PHỤC
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          {/* Back to Login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft size={14} />
              Quay lại đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}