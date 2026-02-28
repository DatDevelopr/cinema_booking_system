import { useForm } from "react-hook-form";
import { useState } from "react";
import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);

  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // =========================
  // SUBMIT LOGIN
  // =========================
  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);

      loginStore(res.data); // chỉ set Zustand

      navigate("/");
    } catch (err) {
      setApiError(err.response?.data?.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4"
    >
      {/* ================= ERROR ================= */}
      {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

      {/* ================= EMAIL ================= */}
      <div>
        <label className="text-sm text-gray-600">Email</label>

        <input
          placeholder="Nhập Email"
          className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          {...register("email", {
            required: "Email không được bỏ trống",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Email không hợp lệ",
            },
          })}
        />

        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* ================= PASSWORD ================= */}
      <div>
        <label className="text-sm text-gray-600">Mật khẩu</label>

        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Nhập Mật khẩu"
            className="w-full border rounded-lg px-3 py-2 mt-1 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            {...register("password", {
              required: "Mật khẩu không được bỏ trống",
              minLength: {
                value: 6,
                message: "Mật khẩu tối thiểu 6 ký tự",
              },
            })}
          />

          {/* icon mắt */}
          <span
            className="absolute right-3 top-3 cursor-pointer text-gray-400"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* ================= BUTTON ================= */}
      <button
        disabled={isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
      >
        {isSubmitting ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
      </button>

      {/* ================= FORGOT PASSWORD ================= */}
      <p
        onClick={() => navigate("/forgot-password")}
        className="text-sm text-gray-600 cursor-pointer hover:text-orange-500"
      >
        Quên mật khẩu?
      </p>
    </form>
  );
}
