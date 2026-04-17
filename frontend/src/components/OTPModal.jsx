// OTPModal.jsx
import { useEffect, useState } from "react";
import OTPInput from "./OTPInput";
import { Mail, Clock, Shield, X, CheckCircle, AlertCircle } from "lucide-react";

export default function OTPModal({ email, open, onVerify, onResend, onClose }) {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ===== RESET ===== */
  useEffect(() => {
    if (!open) return;
    setOtp("");
    setCountdown(60);
    setError("");
    setSuccess(false);
  }, [open]);

  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    if (!open || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [open, countdown]);

  if (!open) return null;

  /* ===== VERIFY ===== */
  const handleVerify = async () => {
    if (loading || otp.length !== 6) return;

    try {
      setLoading(true);
      setError("");
      await onVerify(otp);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Mã OTP không chính xác");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  /* ===== RESEND ===== */
  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      setResendLoading(true);
      setError("");
      await onResend();
      setCountdown(60);
    } catch (err) {
      setError("Không thể gửi lại OTP, vui lòng thử lại");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-[420px] max-w-[90%] shadow-2xl animate-slideUp overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#fc8905] to-[#fda43a] p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Xác thực OTP</h3>
            <p className="text-orange-100 text-sm mt-1">
              Nhập mã xác thực để tiếp tục
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Email info */}
          <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
            <Mail size={18} className="text-[#fc8905]" />
            <div>
              <p className="text-xs text-gray-500">Mã OTP đã gửi đến</p>
              <p className="text-sm font-semibold text-gray-800">{email}</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-green-600 text-sm">Xác thực thành công!</p>
              </div>
            </div>
          )}

          {/* OTP Input */}
          <div className="py-2">
            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={loading || success}
              error={!!error}
            />
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6 || success}
            className="
              w-full py-3 rounded-xl
              bg-gradient-to-r from-[#fc8905] to-[#fda43a]
              hover:from-[#e07a04] hover:to-[#fc8905]
              text-white font-semibold
              transition-all duration-200
              shadow-md hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xác thực...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                Đã xác thực
              </>
            ) : (
              "Xác nhận"
            )}
          </button>

          {/* Resend section */}
          <div className="text-center pt-2">
            {countdown > 0 ? (
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Clock size={14} />
                <span className="text-sm">
                  Gửi lại sau{" "}
                  <span className="font-semibold text-[#fc8905]">
                    {countdown}
                  </span>{" "}
                  giây
                </span>
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="
                  text-sm font-medium
                  text-[#fc8905] hover:text-[#e07a04]
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-1 mx-auto
                "
              >
                {resendLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  "Gửi lại mã OTP"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-6">
          <p className="text-center text-xs text-gray-400">
            Mã OTP có hiệu lực trong 5 phút
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
