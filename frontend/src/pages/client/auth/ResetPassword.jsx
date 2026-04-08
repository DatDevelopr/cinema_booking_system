import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authApi } from "../../../api/auth.api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  /* ⭐ nếu thiếu token → redirect */
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token]);

  const onSubmit = async (data) => {
    setApiError("");

    try {
      const res = await authApi.resetPassword({
        ...data,
        token,
      });

      setSuccess(res.data.message);

      setTimeout(() => {
        navigate("/auth");
      }, 2000);

    } catch (err) {
      setApiError(
        err.response?.data?.message || "Reset thất bại"
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-[380px] space-y-4"
      >
        <h2 className="text-xl font-bold text-center">
          Đặt lại mật khẩu
        </h2>

        {success && (
          <p className="text-green-600 text-center">
            {success}
          </p>
        )}

        {apiError && (
          <p className="text-red-500 text-center">
            {apiError}
          </p>
        )}

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="input"
          {...register("password", {
            required: "Nhập mật khẩu",
            minLength: {
              value: 6,
              message: "Tối thiểu 6 ký tự",
            },
          })}
        />

        {errors.password && (
          <p className="error">{errors.password.message}</p>
        )}

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="input"
          {...register("confirm_password", {
            required: "Nhập xác nhận mật khẩu",
            validate: (value) =>
              value === watch("password") ||
              "Mật khẩu không khớp",
          })}
        />

        {errors.confirm_password && (
          <p className="error">
            {errors.confirm_password.message}
          </p>
        )}

        <button
          disabled={isSubmitting || success}
          className="btn-primary w-full"
        >
          {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}
