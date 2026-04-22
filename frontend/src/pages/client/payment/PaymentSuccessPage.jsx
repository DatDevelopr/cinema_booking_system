import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Home,
  Ticket,
  Download,
  Share2,
  Calendar,
  Clock,
  Film,
  MapPin,
  CreditCard,
  ArrowRight,
  X,
  QrCode,
  Printer,
  Smartphone,
  Coffee,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import orderApi from "../../../api/order.api";
import { QRCodeCanvas } from "qrcode.react";
import useToast from "../../../hooks/useToastSimple";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(60);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const timerRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const toast = useToast();
  
  // ✅ Tách riêng ref cho PDF (không dùng chung với UI)
  const pdfRef = useRef(null);

  const orderId = params.get("order_id");

  useEffect(() => {
    if (!orderId) {
      toast.warning("Không tìm thấy mã đơn hàng!", 3000);
      setLoading(false);
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchOrderDetails = async () => {
      try {
        const response = await orderApi.getById(Number(orderId));
        if (response.data.success) {
          setOrderData(response.data.data);
          toast.success("Đã tải thông tin đơn hàng thành công!", 2000);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không thể tải thông tin đơn hàng!", 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, toast]);

  useEffect(() => {
    if (!autoRedirect) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.info("Chuyển hướng về trang chủ...", 1500);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoRedirect, navigate, toast]);

  const stopAutoRedirect = () => {
    setAutoRedirect(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    toast.info("Đã dừng tự động chuyển trang", 2000);
  };

  // ✅ Sửa lại hàm download - dùng pdfRef riêng
  const handleDownloadTicket = async () => {
    try {
      toast.info("Đang tạo vé PDF...", 1500);

      if (!pdfRef.current) {
        toast.error("Không tìm thấy nội dung vé!");
        return;
      }

      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      pdf.save(`ve_xem_phim_${orderId}.pdf`);

      toast.success("Tải vé thành công!", 2000);
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Có lỗi khi tạo PDF! Vui lòng thử lại.", 3000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Vé xem phim",
          text: `Đặt vé thành công! Mã đơn: #${orderId}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Đã chia sẻ thành công!", 2000);
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Đã sao chép link chia sẻ!", 2000);
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link chia sẻ!", 2000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      VNPAY: "VNPay",
      MOMO: "MoMo",
      CASH: "Tiền mặt",
      BANKING: "Chuyển khoản",
    };
    return methods[method] || method;
  };

  const getSeatsList = () => {
    if (!orderData?.OrderTickets) return "";
    return orderData.OrderTickets.map(
      (ticket) => ticket.Ticket?.ShowtimeSeat?.Seat?.seat_code
    )
      .filter(Boolean)
      .join(", ");
  };

  const getTotalTickets = () => {
    if (!orderData?.OrderTickets) return 0;
    return orderData.OrderTickets.length;
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs} giây`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-500 mb-6">
            Vui lòng kiểm tra lại mã đơn hàng
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all"
          >
            <Home size={16} className="inline mr-2" />
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const firstTicket = orderData.OrderTickets?.[0]?.Ticket?.ShowtimeSeat;
  const movie = firstTicket?.Showtime?.Movie;
  const cinema = firstTicket?.Showtime?.Room?.Cinema;
  const showtime = firstTicket?.Showtime;
  const room = firstTicket?.Showtime?.Room;

  const qrValue = JSON.stringify({
    orderId: orderData.order_id,
    seats: getSeatsList(),
    movie: movie?.title,
    cinema: cinema?.cinema_name,
    showtime: showtime?.start_time,
    checkCode: orderData.Payment?.transaction_code,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">QR Code Vé</h3>
              <button
                onClick={() => setShowQR(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={qrValue} size={200} level="H" />
            </div>
            <p className="text-center text-sm text-gray-600">
              Quét mã này tại rạp để nhận vé
            </p>
            <p className="text-center text-xs text-gray-400 mt-2">
              Mã đơn: #{orderData.order_id}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Card - ✅ KHÔNG có ref ở đây */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 translate-x-full animate-shine"></div>
            <div className="inline-flex p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center animate-bounce">
                <CheckCircle size={48} className="text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Đặt vé thành công
            </h1>
            <p className="text-green-100">
              Cảm ơn {orderData.User?.full_name} đã tin tưởng
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Order ID & Status */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Mã đơn hàng
                </p>
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  #{orderData.order_id}
                </p>
              </div>
              <div className="px-4 py-2 bg-green-50 rounded-full">
                <span className="text-sm font-semibold text-green-600">
                  Đã thanh toán
                </span>
              </div>
            </div>

            {/* Movie Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mb-6">
              <div className="flex gap-4">
                {movie?.poster_url && (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    {movie?.title}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Film size={14} className="text-purple-500" />
                      <span>
                        {showtime?.format} •{" "}
                        {showtime?.language === "SUB" ? "Phụ đề" : "Lồng tiếng"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-purple-500" />
                      <span>
                        {cinema?.cinema_name} - {room?.room_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-purple-500" />
                      <span>{formatDate(showtime?.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-purple-500" />
                      <span>
                        {formatTime(showtime?.start_time)} -{" "}
                        {formatTime(showtime?.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ticket size={18} className="text-emerald-600" />
                  <h3 className="font-semibold text-gray-800">Thông tin vé</h3>
                </div>
                <button
                  onClick={() => {
                    setShowQR(true);
                    toast.info("Mở QR Code để quét tại rạp", 2000);
                  }}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition flex items-center gap-1"
                >
                  <QrCode size={14} />
                  Hiện QR
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Số lượng vé</span>
                  <span className="font-semibold text-gray-800">
                    {getTotalTickets()} vé
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Ghế ngồi</span>
                  <span className="font-semibold text-emerald-600 text-lg">
                    {getSeatsList()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Tổng tiền</span>
                  <span className="font-bold text-gray-800 text-xl">
                    {formatCurrency(orderData.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {orderData.Payment && (
              <div className="bg-blue-50 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">
                    Thông tin thanh toán
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức</span>
                    <span className="font-medium text-gray-800">
                      {getPaymentMethodName(orderData.Payment.payment_method)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch</span>
                    <span className="font-mono text-xs text-gray-700">
                      {orderData.Payment.transaction_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian</span>
                    <span className="text-gray-700">
                      {formatDateTime(orderData.Payment.payment_time)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleDownloadTicket}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-medium transition-all duration-200"
              >
                <Printer size={18} />
                <span>In/Tải vé</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-medium transition-all duration-200"
              >
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
            </div>

            <button
              onClick={() => {
                navigate("/my-tickets");
                toast.success("Chuyển đến trang vé của tôi", 1500);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-3 group"
            >
              <Smartphone size={18} />
              Xem vé của tôi
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => {
                navigate("/");
                toast.info("Về trang chủ", 1500);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
            >
              <Home size={18} />
              Về trang chủ
            </button>

            {/* Auto redirect */}
            {autoRedirect && countdown > 0 && (
              <div className="text-center mt-5 p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coffee size={16} className="text-amber-600" />
                  <p className="text-sm text-amber-800 font-medium">
                    Đang thư giãn?
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Tự động chuyển về trang chủ sau{" "}
                  <span className="font-bold text-emerald-600">
                    {formatCountdown(countdown)}
                  </span>
                </p>
                <button
                  onClick={stopAutoRedirect}
                  className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 underline font-medium"
                >
                  Dừng tự động chuyển
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-white/80">
            Email xác nhận đã được gửi đến{" "}
            <span className="font-medium">{orderData.User?.email}</span>
          </p>
          <p className="text-xs text-white/60">
            Hotline hỗ trợ: 1900 1234 (8:00 - 22:00 hàng ngày)
          </p>
        </div>
      </div>

      {/* ===== PDF TICKET (Ẩn - Dùng inline style, không Tailwind) ===== */}
      <div
        ref={pdfRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "600px",
          background: "#ffffff",
          padding: "24px",
          color: "#000000",
          fontFamily: "Arial, sans-serif",
          borderRadius: "16px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#10b981", marginBottom: "8px" }}>🎬 VÉ XEM PHIM</h2>
          <div
            style={{
              width: "60px",
              height: "3px",
              background: "#10b981",
              margin: "0 auto",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "8px 0" }}>
            <strong>Mã đơn hàng:</strong> #{orderData.order_id}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Khách hàng:</strong> {orderData.User?.full_name}
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "8px 0" }}>
            <strong>Phim:</strong> {movie?.title}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Rạp:</strong> {cinema?.cinema_name}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Phòng:</strong> {room?.room_name}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Ghế ngồi:</strong> {getSeatsList()}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Suất chiếu:</strong> {formatDateTime(showtime?.start_time)}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Định dạng:</strong> {showtime?.format} •{" "}
            {showtime?.language === "SUB" ? "Phụ đề" : "Lồng tiếng"}
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "8px 0" }}>
            <strong>Số lượng vé:</strong> {getTotalTickets()} vé
          </p>
          <p style={{ margin: "8px 0", fontSize: "18px" }}>
            <strong>Tổng tiền:</strong>{" "}
            <span style={{ color: "#10b981", fontWeight: "bold" }}>
              {formatCurrency(orderData.total_amount)}
            </span>
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <QRCodeCanvas value={qrValue} size={140} />
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#6b7280" }}>
            Quét mã QR tại rạp để nhận vé
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb",
            fontSize: "11px",
            color: "#9ca3af",
          }}
        >
          <p>Vui lòng xuất trình vé này (bản in hoặc điện tử) khi vào rạp</p>
          <p>Hotline hỗ trợ: 1900 1234</p>
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