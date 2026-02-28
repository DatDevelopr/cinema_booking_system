import { useEffect, useState } from "react";
import OTPInput from "./OTPInput";

export default function OTPModal({
  email,
  open,
  onVerify,
  onResend,
  onClose,
}) {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  /* ===== RESET ===== */
  useEffect(() => {
    if (!open) return;
    setOtp("");
    setCountdown(60);
  }, [open]);

  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    if (!open || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [open, countdown]);

  /* ===== AUTO VERIFY ===== */
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  if (!open) return null;

  /* ===== VERIFY ===== */
  const handleVerify = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await onVerify(otp);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== RESEND ===== */
  const handleResend = async () => {
    try {
      setResendLoading(true);
      setOtp("");
      setCountdown(60);
      await onResend();
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[380px] space-y-5 shadow-xl relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
        >
          ×
        </button>

        <h3 className="text-xl font-bold text-center">
          Xác thực OTP
        </h3>

        <p className="text-sm text-gray-500 text-center">
          Mã OTP đã gửi đến <b>{email}</b>
        </p>

        <OTPInput
          value={otp}
          onChange={setOtp}
          disabled={loading}
        />

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="
            w-full py-3 rounded-lg
            bg-blue-700 text-white font-medium
            hover:bg-blue-800
            disabled:opacity-50
          "
        >
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>

        {/* RESEND */}
        {countdown > 0 ? (
          <p className="text-center text-sm text-gray-400">
            Gửi lại sau {countdown}s
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="
              block mx-auto
              text-sm font-medium
              text-blue-700 hover:underline
              disabled:opacity-50
            "
          >
            {resendLoading ? "Đang gửi..." : "Gửi lại OTP"}
          </button>
        )}
      </div>
    </div>
  );
}
