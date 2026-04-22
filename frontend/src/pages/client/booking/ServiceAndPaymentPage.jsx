import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { serviceApi } from "../../../api/services.api";
import { ticketApi } from "../../../api/ticket.api";
import { showtimeApi } from "../../../api/showtime.api";
import { paymentApi } from "../../../api/payment.api";
import useToast from "../../../hooks/useToastSimple";
import Momo from "../../../assets/images/momo.png";
import Vnpay from "../../../assets/images/vnpay.png";
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  ArrowLeft,
  Trash2,
  Coffee,
  Pizza,
  Utensils,
  Sparkles,
  Ticket,
  Clock,
  Loader2,
  Film,
  MapPin,
  Monitor,
  Armchair,
  AlertTriangle,
  CheckCircle,
  Gift,
  Shield,
  Smartphone,
  Building2,
  QrCode,
} from "lucide-react";

export default function ServiceAndPaymentPage() {
  const { showtime_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    showtime,
    selectedSeats,
    totalPrice: ticketTotal,
  } = location.state || {};

  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isReleasing, setIsReleasing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");

  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const timerRef = useRef(null);

  /* ================= TIMER COUNTDOWN ================= */
  useEffect(() => {
    // Bắt đầu đếm ngược khi component mount
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Hết thời gian, quay lại trang chọn ghế
          clearInterval(timerRef.current);
          toast.warning("Hết thời gian giữ ghế, vui lòng chọn lại");

          // Release seats before redirect
          if (selectedSeats && selectedSeats.length > 0) {
            showtimeApi
              .releaseSeats({
                showtime_id,
                seat_ids: selectedSeats.map((s) => s.id),
              })
              .catch((err) => console.error(err));
          }

          // Redirect back to seat selection
          navigate(`/booking/${showtime_id}/seats`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval khi component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showtime_id, selectedSeats, navigate, toast]);

  // Format thời gian hiển thị (MM:SS)
  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset timer khi có hành động (thêm/xóa sản phẩm)
  const resetTimer = () => {
    setTimeLeft(300);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.warning("Hết thời gian giữ ghế, vui lòng chọn lại");
          if (selectedSeats && selectedSeats.length > 0) {
            showtimeApi
              .releaseSeats({
                showtime_id,
                seat_ids: selectedSeats.map((s) => s.id),
              })
              .catch((err) => console.error(err));
          }
          navigate(`/booking/${showtime_id}/seats`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ================= VALIDATE STATE ================= */
  useEffect(() => {
    if (!showtime || !selectedSeats || selectedSeats.length === 0) {
      toast.error("Không tìm thấy thông tin đặt vé, vui lòng chọn ghế lại");
      navigate(`/booking/${showtime_id}`);
    }
  }, [showtime, selectedSeats, showtime_id, navigate, toast]);

  /* ================= RELEASE SEATS WHEN EXIT ================= */
  const releaseSeats = async () => {
    if (!selectedSeats || selectedSeats.length === 0 || isReleasing) return;

    try {
      setIsReleasing(true);
      await showtimeApi.releaseSeats({
        showtime_id,
        seat_ids: selectedSeats.map((s) => s.id),
      });
    } catch (err) {
      console.error("Release seats error:", err);
    } finally {
      setIsReleasing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (!submitting) {
        releaseSeats();
      }
    };
  }, [selectedSeats, showtime_id]);

  const handleGoBack = async () => {
    await releaseSeats();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigate(-1);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (selectedSeats && selectedSeats.length > 0) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL}/showtimes/release`,
          JSON.stringify({
            showtime_id,
            seat_ids: selectedSeats.map((s) => s.id),
          }),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedSeats, showtime_id]);

  /* ================= FETCH SERVICES ================= */
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await serviceApi.getActive();
      setServices(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CART ================= */
  const addToCart = (service) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.service_id === service.service_id);
      if (exist) {
        return prev.map((item) =>
          item.service_id === service.service_id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
    toast.success(`Đã thêm ${service.name} vào giỏ hàng`);
    resetTimer(); // Reset timer khi thêm sản phẩm
  };

  const decreaseQty = (service) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.service_id === service.service_id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
    resetTimer(); // Reset timer khi giảm số lượng
  };

  const removeFromCart = (service) => {
    setCart((prev) =>
      prev.filter((item) => item.service_id !== service.service_id),
    );
    toast.info(`Đã xóa ${service.name} khỏi giỏ hàng`);
    resetTimer(); // Reset timer khi xóa sản phẩm
  };

  const serviceTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = promoApplied ? (ticketTotal + serviceTotal) * 0.1 : 0;
  const grandTotal = (ticketTotal || 0) + serviceTotal - discount;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "FOOD":
        return <Utensils size={16} />;
      case "DRINK":
        return <Coffee size={16} />;
      case "COMBO":
        return <Pizza size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "FOOD":
        return "from-orange-500 to-red-500";
      case "DRINK":
        return "from-blue-500 to-cyan-500";
      case "COMBO":
        return "from-purple-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  const categories = [
    { value: "all", label: "Tất cả", icon: Sparkles },
    { value: "FOOD", label: "Đồ ăn", icon: Utensils },
    { value: "DRINK", label: "Thức uống", icon: Coffee },
    { value: "COMBO", label: "Combo", icon: Pizza },
  ];

  const handleApplyPromo = () => {
    if (promoCode === "CINEMA10") {
      setPromoApplied(true);
      toast.success("Áp dụng mã giảm giá thành công!");
      resetTimer();
    } else {
      toast.error("Mã giảm giá không hợp lệ");
    }
  };

  const handlePayment = async () => {
    if (!selectedSeats || selectedSeats.length === 0) {
      toast.warning("Không có ghế nào được chọn");
      return;
    }

    try {
      setSubmitting(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // ✅ STEP 1: tạo order
      const res = await ticketApi.book({
        showtime_id,
        seat_ids: selectedSeats.map((s) => s.id),
        service_items: cart.map((c) => ({
          service_id: c.service_id,
          quantity: c.quantity,
        })),
      });
      console.log("Book response:", res);

      const order_id = res?.data?.data?.order_id;

      if (!order_id) {
        throw new Error("Không tạo được đơn hàng");
      }

      // ✅ STEP 2: gọi payment
      await paymentApi.pay({
        order_id,
        payment_method: paymentMethod,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Thanh toán thất bại");
      setSubmitting(false);
    }
  };

  if (!showtime || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-orange-500 mx-auto mb-4"
          />
          <p className="text-gray-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-orange-500 mx-auto mb-4"
          />
          <p className="text-gray-500">Đang tải dịch vụ...</p>
        </div>
      </div>
    );
  }

  // Tính phần trăm thời gian còn lại cho progress bar
  const timePercentage = (timeLeft / 300) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm border border-gray-200 group"
            >
              <ArrowLeft
                size={20}
                className="text-gray-600 group-hover:text-orange-500 transition-colors"
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Xác nhận & Thanh toán
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-3">
                Vui lòng kiểm tra thông tin trước khi thanh toán
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CheckCircle size={14} className="text-green-500" />
              <span>Thông tin phim</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CheckCircle size={14} className="text-green-500" />
              <span>Chọn ghế</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-1 text-sm text-orange-500 font-medium">
              <Ticket size={14} />
              <span>Thanh toán</span>
            </div>
          </div>
        </div>

        {/* Timer Countdown */}
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Thời gian giữ ghế còn lại:
              </span>
            </div>
            <span
              className={`font-mono text-xl font-bold ${timeLeft < 60 ? "text-red-600 animate-pulse" : "text-orange-600"}`}
            >
              {formatTimeLeft(timeLeft)}
            </span>
          </div>
          <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
              style={{ width: `${timePercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {timeLeft < 60
              ? "⚠️ Sắp hết thời gian! Vui lòng thanh toán nhanh chóng."
              : "Ghế sẽ được giữ trong thời gian này. Hãy hoàn tất thanh toán."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Giữ nguyên như cũ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Film size={18} />
                  <h2 className="font-semibold">Thông tin phim</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-5">
                  <div className="relative">
                    <img
                      src={
                        showtime?.Movie?.poster_url ||
                        "https://via.placeholder.com/100x140"
                      }
                      alt={showtime?.Movie?.title}
                      className="w-24 h-32 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100x140";
                      }}
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <Film size={10} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {showtime?.Movie?.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Clock size={14} className="text-orange-500" />
                        <span>{showtime?.Movie?.duration} phút</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Film size={14} className="text-orange-500" />
                        <span>
                          {showtime?.format || "2D"}{" "}
                          {showtime?.language === "SUB"
                            ? "Phụ đề"
                            : "Lồng tiếng"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <MapPin size={14} className="text-orange-500" />
                        <span className="truncate">
                          {showtime?.Room?.Cinema?.cinema_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Monitor size={14} className="text-orange-500" />
                        <span>Phòng {showtime?.Room?.room_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Armchair size={18} />
                  <h2 className="font-semibold">Thông tin ghế</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSeats.map((seat, idx) => (
                    <div key={idx} className="group relative">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all">
                        <Armchair size={12} />
                        Ghế {seat.row}
                        {seat.number}
                        {seat.type === "VIP" && " VIP"}
                        {seat.type === "COUPLE" && " Đôi"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-gray-600">Tổng tiền vé</span>
                  <span className="text-xl font-bold text-orange-600">
                    {(ticketTotal || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Shield size={10} />
                  Giá vé đã bao gồm VAT
                </p>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Gift size={18} />
                  <h2 className="font-semibold">Chọn thêm dịch vụ</h2>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredServices.map((service) => {
                    const gradientColor = getCategoryColor(service.category);
                    return (
                      <div
                        key={service.service_id}
                        className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200"
                      >
                        <div
                          className={`h-1 bg-gradient-to-r ${gradientColor}`}
                        />
                        <div className="p-3">
                          <div className="flex gap-3">
                            {service.image ? (
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-16 h-16 rounded-xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                {getCategoryIcon(service.category)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                {service.name}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                {service.description || "Món ăn thơm ngon"}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-base font-bold text-orange-600">
                                  {Number(service.price).toLocaleString(
                                    "vi-VN",
                                  )}
                                  đ
                                </span>
                                <button
                                  onClick={() => addToCart(service)}
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
                                >
                                  <Plus size={12} />
                                  Thêm
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500">Không có dịch vụ nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Cart & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
              {/* Cart Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <ShoppingCart size={20} />
                  <h2 className="font-semibold text-lg">Giỏ hàng</h2>
                  {cart.length > 0 && (
                    <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-sm">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} món
                    </span>
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-4 max-h-[250px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShoppingCart size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Chưa có dịch vụ</p>
                    <p className="text-xs text-gray-400">
                      Thêm đồ ăn, thức uống bạn nhé!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.service_id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-orange-600 font-semibold">
                            {Number(item.price).toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decreaseQty(item)}
                            className="w-6 h-6 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
                          >
                            <Minus size={12} className="text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
                          >
                            <Plus size={12} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item)}
                            className="w-6 h-6 hover:bg-red-50 rounded-lg flex items-center justify-center ml-1 transition-colors"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="px-4 pb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Đã áp dụng giảm 10%
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div className="px-4 pb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Phương thức thanh toán
                </h3>
                <div className="space-y-2">
                  {/* VNPAY */}
                  <div
                    onClick={() => setPaymentMethod("VNPAY")}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      paymentMethod === "VNPAY"
                        ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden p-1">
                      <img
                        src={Vnpay}
                        alt="VNPay"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">VNPay</p>
                      <p className="text-xs text-gray-500">
                        Thanh toán qua cổng VNPay
                      </p>
                    </div>
                    {paymentMethod === "VNPAY" && (
                      <CheckCircle size={16} className="text-orange-500" />
                    )}
                  </div>

                  {/* MoMo */}
                  <div
                    onClick={() => setPaymentMethod("MOMO")}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      paymentMethod === "MOMO"
                        ? "border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 shadow-md"
                        : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden p-1">
                      <img
                        src={Momo}
                        alt="MoMo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">MoMo</p>
                      <p className="text-xs text-gray-500">
                        Thanh toán qua ví MoMo
                      </p>
                    </div>
                    {paymentMethod === "MOMO" && (
                      <CheckCircle size={16} className="text-pink-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-100 p-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tiền vé</span>
                    <span className="text-gray-700">
                      {(ticketTotal || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tiền dịch vụ</span>
                    <span className="text-gray-700">
                      {serviceTotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Giảm giá</span>
                      <span className="text-green-600">
                        -{discount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Tổng cộng
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        {grandTotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Thanh toán với{" "}
                      {paymentMethod === "VNPAY" ? "VNPay" : "MoMo"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
