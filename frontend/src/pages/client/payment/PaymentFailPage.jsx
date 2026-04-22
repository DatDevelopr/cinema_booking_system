import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw, Ticket, CreditCard, AlertCircle, HelpCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import useToast from "../../../hooks/useToastSimple";

export default function PaymentFailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const timerRef = useState(null);

  const orderId = params.get("order_id");
  const errorCode = params.get("error_code") || "UNKNOWN";
  const vnpResponseCode = params.get("vnp_ResponseCode");

  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, navigate]);

  const stopAutoRedirect = () => {
    setAutoRedirect(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const getErrorMessage = () => {
    const errors = {
      "24": "Khách hàng hủy giao dịch",
      "51": "Tài khoản không đủ số dư",
      "65": "Tài khoản vượt quá hạn mức",
      "75": "Ngân hàng bảo trì hệ thống",
      "79": "Nhập sai mật khẩu quá số lần quy định",
      "99": "Lỗi không xác định",
      "UNKNOWN": "Lỗi không xác định"
    };
    
    if (vnpResponseCode && errors[vnpResponseCode]) {
      return errors[vnpResponseCode];
    }
    return errors[errorCode] || "Giao dịch không thành công";
  };

  const getErrorAdvice = () => {
    const advice = {
      "24": "Vui lòng thực hiện lại giao dịch",
      "51": "Vui lòng kiểm tra số dư tài khoản",
      "65": "Vui lòng liên hệ ngân hàng để tăng hạn mức",
      "75": "Vui lòng thử lại sau ít phút",
      "79": "Vui lòng đợi 15 phút và thử lại",
      "99": "Vui lòng liên hệ hỗ trợ"
    };
    
    if (vnpResponseCode && advice[vnpResponseCode]) {
      return advice[vnpResponseCode];
    }
    return advice[errorCode] || "Vui lòng thử lại hoặc liên hệ hỗ trợ";
  };

  const handleRetry = () => {
    toast.info("Đang chuyển hướng đến trang thanh toán...", 1500);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleContactSupport = () => {
    toast.info("Hotline hỗ trợ: 1900 1234", 3000);
  };

  const formatCountdown = (seconds) => {
    return `${seconds} giây`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 via-orange-500 to-amber-600 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 translate-x-full animate-shine"></div>
            <div className="inline-flex p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center animate-shake">
                <XCircle size={48} className="text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thất bại</h1>
            <p className="text-orange-100">Giao dịch không thành công</p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Error Code & Status */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Mã đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">#{orderId || "N/A"}</p>
              </div>
              <div className="px-4 py-2 bg-red-50 rounded-full">
                <span className="text-sm font-semibold text-red-600">Thất bại</span>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 mb-6 border border-red-100">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Lỗi: {getErrorMessage()}</h3>
                  <p className="text-sm text-gray-600">{getErrorAdvice()}</p>
                </div>
              </div>
              
              {(vnpResponseCode || errorCode) && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mã lỗi:</span>
                    <span className="font-mono font-semibold text-red-600">{vnpResponseCode || errorCode}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Help Info */}
            <div className="bg-amber-50 rounded-2xl p-5 mb-6 border border-amber-100">
              <div className="flex items-start gap-3">
                <HelpCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Cần hỗ trợ?</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Nếu tiền đã bị trừ từ tài khoản của bạn, vui lòng liên hệ ngay với chúng tôi.
                  </p>
                  <button
                    onClick={handleContactSupport}
                    className="text-sm text-amber-700 font-medium hover:text-amber-800 underline"
                  >
                    Liên hệ hỗ trợ ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={18} />
                Thử lại thanh toán
              </button>

              <button
                onClick={() => navigate("/my-tickets")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 font-medium transition-all duration-200"
              >
                <Ticket size={18} />
                Xem vé của tôi
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
              >
                <ArrowLeft size={18} />
                Quay lại trang trước
              </button>
            </div>

            {/* Auto redirect */}
            {autoRedirect && countdown > 0 && (
              <div className="text-center mt-5 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Tự động quay lại sau {formatCountdown(countdown)}
                  </p>
                </div>
                <button
                  onClick={stopAutoRedirect}
                  className="text-xs text-orange-600 hover:text-orange-700 mt-1 underline"
                >
                  Dừng tự động chuyển
                </button>
              </div>
            )}

            {/* Payment Methods Note */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={14} className="text-gray-400" />
                <p className="text-xs text-gray-400 text-center">
                  Phương thức thanh toán hỗ trợ: VNPay, MoMo, Thẻ tín dụng
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-white/80">
            Mã giao dịch: <span className="font-mono">{vnpResponseCode || "N/A"}</span>
          </p>
          <p className="text-xs text-white/60">
            Hotline hỗ trợ: 1900 1234 (8:00 - 22:00 hàng ngày)
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(100%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}