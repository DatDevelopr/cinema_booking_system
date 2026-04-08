import { useForm } from "react-hook-form";
import { useState } from "react";
import { authApi } from "../../../api/auth.api";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setMessage("");
    setError("");

    try {
      const res = await authApi.forgotPassword(data.email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Không gửi được email");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-[380px] space-y-4"
      >
        <h2 className="text-xl font-bold text-center">
          Quên mật khẩu
        </h2>

        {message && (
          <p className="text-green-600 text-sm text-center">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <input
          placeholder="Nhập email"
          className="input"
          {...register("email", {
            required: "Email không được bỏ trống",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Email không hợp lệ",
            },
          })}
        />

        {errors.email && (
          <p className="error">{errors.email.message}</p>
        )}

        <button
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi link reset"}
        </button>
      </form>
    </div>
  );
}
