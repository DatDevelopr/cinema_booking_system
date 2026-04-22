import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { showtimeApi } from "../../../api/showtime.api";
import { io } from "socket.io-client";
import useToast from "../../../hooks/useToastSimple";
import {
  Clock,
  Ticket,
  Film,
  Calendar,
  MapPin,
  Crown,
  Heart,
  Armchair,
  CreditCard,
  X,
  Timer,
  Info,
  ChevronLeft,
  Star,
  Users,
  Monitor,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Shield,
  CheckCircle
} from "lucide-react";

const socket = io(`http://localhost:${import.meta.env.VITE_POST_SERVER}`);

export default function BookingPage() {
  const { showtime_id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [activeTab, setActiveTab] = useState("seats");
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /* ================= FETCH SHOWTIME & SEATS ================= */
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (selectedSeats.length > 0 && !isHolding) {
        releaseAllSeats();
      }
      socket.emit("leave_showtime", showtime_id);
    };
  }, [showtime_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showtimeRes, seatsRes] = await Promise.all([
        showtimeApi.getById(showtime_id),
        showtimeApi.getSeats(showtime_id),
      ]);

      const showtimeData = showtimeRes?.data?.data || showtimeRes?.data || showtimeRes;
      const seatsData = seatsRes?.data?.seats || seatsRes?.seats || seatsRes?.data || [];

      setShowtime(showtimeData);

      const mappedSeats = seatsData.map((s) => ({
        id: s.seat_id,
        row: s.row,
        number: s.number,
        type: s.type,
        price: parseFloat(s.price),
        status: mapStatus(s.status),
      }));

      setSeats(mappedSeats);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.emit("join_showtime", showtime_id);

    socket.on("seat_update", (data) => {
      const { seat_ids, status } = data;

      setSeats((prev) =>
        prev.map((seat) =>
          seat_ids.includes(seat.id)
            ? { ...seat, status: mapStatus(status) }
            : seat
        )
      );

      const lostSeats = selectedSeats.filter((s) => seat_ids.includes(s.id));
      if (lostSeats.length > 0) {
        setSelectedSeats((prev) => prev.filter((s) => !seat_ids.includes(s.id)));
        toast.info(`${lostSeats.map(s => `${s.row}${s.number}`).join(", ")} hủy giữ ghế`);
      }
    });

    return () => {
      socket.emit("leave_showtime", showtime_id);
      socket.off("seat_update");
    };
  }, [showtime_id, selectedSeats]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (selectedSeats.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeLeft(300);
      return;
    }

    setTimeLeft(300);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          releaseAllSeats();
          toast.warning("Hết thời gian giữ ghế, vui lòng chọn lại");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedSeats.length]);

  /* ================= HELPERS ================= */
  const mapStatus = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "empty";
      case "HOLD":
        return "holding";
      case "BOOKED":
        return "booked";
      default:
        return "empty";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const releaseAllSeats = useCallback(async () => {
    if (selectedSeats.length === 0 || isHolding) return;

    try {
      setIsHolding(true);
      await showtimeApi.releaseSeats({
        showtime_id,
        seat_ids: selectedSeats.map((s) => s.id),
      });
      setSelectedSeats([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHolding(false);
    }
  }, [selectedSeats, showtime_id, isHolding]);

  /* ================= SEAT ACTIONS ================= */
  const removeSelectedSeat = useCallback(
    async (seat) => {
      try {
        await showtimeApi.releaseSeats({
          showtime_id,
          seat_ids: [seat.id],
        });

        setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
        setSeats((prev) =>
          prev.map((s) => (s.id === seat.id ? { ...s, status: "empty" } : s))
        );
      } catch (err) {
        console.error(err);
        toast.error("Không thể bỏ chọn ghế");
      }
    },
    [showtime_id, toast]
  );

  const toggleSeat = useCallback(
    async (seat) => {
      const isSelected = selectedSeats.find((s) => s.id === seat.id);

      if (isSelected) {
        return removeSelectedSeat(seat);
      }

      if (seat.status !== "empty") {
        if (seat.status === "holding") {
          toast.warning("Ghế đang được người khác giữ");
        } else if (seat.status === "booked") {
          toast.warning("Ghế đã được đặt");
        }
        return;
      }

      try {
        await showtimeApi.holdSeats({
          showtime_id,
          seat_ids: [seat.id],
        });

        setSelectedSeats((prev) => [...prev, seat]);
        setSeats((prev) =>
          prev.map((s) => (s.id === seat.id ? { ...s, status: "holding" } : s))
        );
      } catch (err) {
        toast.error(err.response?.data?.message || "Ghế đã bị chọn");
      }
    },
    [selectedSeats, showtime_id, removeSelectedSeat, toast]
  );

  const handleGoBack = useCallback(async () => {
    if (selectedSeats.length > 0) {
      try {
        await showtimeApi.releaseSeats({
          showtime_id,
          seat_ids: selectedSeats.map((s) => s.id),
        });
      } catch (err) {
        console.error(err);
      }
    }
    navigate(-1);
  }, [selectedSeats, showtime_id, navigate]);

  const getSeatClass = (seat) => {
    if (seat.status === "booked")
      return "bg-gradient-to-br from-red-400 to-red-500 text-white cursor-not-allowed opacity-60";
    if (seat.status === "holding") {
      const isSelectedByMe = selectedSeats.find((s) => s.id === seat.id);
      return isSelectedByMe
        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg ring-2 ring-orange-300 scale-105"
        : "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md ring-2 ring-amber-300";
    }
    if (selectedSeats.find((s) => s.id === seat.id))
      return "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg ring-2 ring-orange-300 scale-105";

    switch (seat.type) {
      case "VIP":
        return "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600";
      case "COUPLE":
        return "bg-gradient-to-br from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600";
    }
  };

  const getSeatIcon = (seat) => {
    if (seat.type === "VIP") return <Crown size={12} />;
    if (seat.type === "COUPLE") return <Heart size={12} />;
    return <Armchair size={12} />;
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const finalTotal = totalPrice;

  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });
    return Object.keys(grouped)
      .sort((a, b) => {
        if (a.length === b.length) {
          return a.localeCompare(b);
        }
        return a.length === 1 ? -1 : 1;
      })
      .map((row) => ({
        row,
        seats: grouped[row].sort((a, b) => a.number - b.number),
      }));
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      toast.warning("Vui lòng chọn ghế trước khi thanh toán");
      return;
    }

    setSubmitting(true);

    navigate(`/booking/${showtime_id}/services`, {
      state: {
        showtime,
        selectedSeats,
        totalPrice,
      },
    });

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 animate-pulse" size={20} />
          </div>
          <p className="text-gray-500 mt-4">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  const rows = groupSeatsByRow();
  const maxSeatsPerRow = Math.max(...rows.map((r) => r.seats.length), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleGoBack}
            className="p-2 -ml-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-semibold text-gray-900">Chọn ghế</h1>
          {selectedSeats.length > 0 && (
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full shadow-md"
            >
              {selectedSeats.length} ghế
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Desktop Back Button */}
        <button
          onClick={handleGoBack}
          className="hidden lg:flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors mb-6 group"
        >
          <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
            <ChevronLeft size={16} className="group-hover:text-orange-500" />
          </div>
          <span className="text-sm">Quay lại</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ==================== LEFT - SEAT MAP ==================== */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 pb-3 border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("seats")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "seats"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                      : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
                  }`}
                >
                  <Ticket size={14} className="inline mr-1" />
                  Sơ đồ ghế
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "info"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                      : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
                  }`}
                >
                  <Info size={14} className="inline mr-1" />
                  Thông tin phim
                </button>
              </div>

              {activeTab === "seats" ? (
                <>
                  {/* Timer Card */}
                  {selectedSeats.length > 0 && (
                    <div className="lg:hidden mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Timer size={14} className="text-orange-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Thời gian giữ ghế:
                          </span>
                        </div>
                        <span className="font-mono text-xl font-bold text-orange-600">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-100 rounded-md border border-gray-200" />
                      <span className="text-xs text-gray-600">Ghế trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-md shadow-sm" />
                      <span className="text-xs text-gray-600">Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-md" />
                      <span className="text-xs text-gray-600">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-red-400 to-red-500 rounded-md" />
                      <span className="text-xs text-gray-600">Đã bán</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md" />
                      <span className="text-xs text-gray-600">VIP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-rose-400 to-pink-500 rounded-md" />
                      <span className="text-xs text-gray-600">Couple</span>
                    </div>
                  </div>

                  {/* Screen */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="w-64 h-1.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                        <Monitor size={10} />
                        MÀN HÌNH CHIẾU
                      </div>
                    </div>
                  </div>

                  {/* Seats Grid */}
                  <div className="flex justify-center overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="space-y-2 min-w-max">
                      {rows.map((row) => (
                        <div key={row.row} className="flex items-center gap-3">
                          <div className="w-8 text-center">
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                              {row.row}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <div style={{ width: `${(maxSeatsPerRow - row.seats.length) * 36}px` }} />
                            {row.seats.map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => toggleSeat(seat)}
                                disabled={seat.status === "booked"}
                                className={`
                                  relative w-9 h-9 rounded-xl flex flex-col items-center justify-center
                                  text-xs font-medium transition-all duration-200
                                  hover:scale-105 cursor-pointer shadow-sm
                                  ${getSeatClass(seat)}
                                  ${seat.status === "booked" ? "cursor-not-allowed" : ""}
                                `}
                              >
                                {getSeatIcon(seat)}
                                <span className="text-[10px] mt-0.5">{seat.number}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Seats Bar - Desktop */}
                  {selectedSeats.length > 0 && (
                    <div className="hidden lg:block mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Ghế đã chọn:
                          </span>
                          {selectedSeats.map((seat) => (
                            <div
                              key={seat.id}
                              className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-sm"
                            >
                              <span className="text-sm font-semibold text-orange-600">
                                {seat.row}{seat.number}
                              </span>
                              <button
                                onClick={() => removeSelectedSeat(seat)}
                                className="text-gray-400 hover:text-red-500 transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Tạm tính:</span>
                          <span className="font-bold text-orange-600 ml-2">
                            {totalPrice.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Tab Info */
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Film size={14} className="text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Thể loại</p>
                      <p className="text-sm font-medium text-gray-700">
                        {showtime?.Movie?.Genres?.length > 0
                          ? showtime.Movie.Genres.map((g) => g.genre_name).join(", ")
                          : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users size={14} className="text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Đạo diễn</p>
                      <p className="text-sm font-medium text-gray-700">
                        {showtime?.Movie?.director || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star size={14} className="text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Diễn viên</p>
                      <p className="text-sm font-medium text-gray-700 line-clamp-2">
                        {showtime?.Movie?.actors || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Thời lượng</p>
                      <p className="text-sm font-medium text-gray-700">
                        {showtime?.Movie?.duration} phút
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== RIGHT - MOVIE INFO & PAYMENT ==================== */}
          <div className="w-full lg:w-80 xl:w-96">
            {/* Mobile Summary Drawer */}
            {showMobileSummary && selectedSeats.length > 0 && (
              <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden animate-slideUp">
                <div className="bg-white rounded-t-2xl shadow-xl border-t border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">Ghế đã chọn</h3>
                    <button
                      onClick={() => setShowMobileSummary(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSeats.map((seat) => (
                      <span
                        key={seat.id}
                        className="px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 text-sm font-medium rounded-lg"
                      >
                        {seat.row}{seat.number}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Tổng tiền</p>
                      <p className="text-xl font-bold text-orange-600">
                        {finalTotal.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-md"
                    >
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Payment Card */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              {/* Poster */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={showtime?.Movie?.poster_url || "https://via.placeholder.com/300x400"}
                  alt={showtime?.Movie?.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x400"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-lg shadow-md">
                      {showtime?.format || "2D"} {showtime?.language === "SUB" ? "Phụ đề" : "Lồng tiếng"}
                    </span>
                    {showtime?.Movie?.rating > 0 && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-md">
                        <Star size={10} fill="white" />
                        {showtime.Movie.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="font-bold text-xl text-gray-900 line-clamp-2">
                  {showtime?.Movie?.title}
                </h2>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-orange-500" />
                    <span className="text-gray-600">{showtime?.Room?.Cinema?.cinema_name || "Đang cập nhật"}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 text-xs">Phòng {showtime?.Room?.room_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-orange-500" />
                    <span className="text-gray-600">
                      {showtime?.start_time
                        ? new Date(showtime.start_time).toLocaleDateString("vi-VN", { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: '2-digit' 
                          })
                        : "Đang cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-orange-500" />
                    <span className="text-gray-600">
                      {showtime?.start_time
                        ? new Date(showtime.start_time).toLocaleTimeString("vi-VN", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : "Đang cập nhật"}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500">Tiền vé ({selectedSeats.length} ghế)</span>
                    <span className="text-gray-800 font-medium">{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                    <span className="font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {finalTotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                {/* Selected Seats Summary */}
                {selectedSeats.length > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">Ghế đã chọn</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span key={seat.id} className="px-2 py-1 bg-white text-orange-600 text-sm font-medium rounded-lg shadow-sm">
                          {seat.row}{seat.number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timer Desktop */}
                {selectedSeats.length > 0 && (
                  <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <Timer size={12} className="text-orange-500" />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">Thời gian giữ ghế:</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-orange-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0 || submitting}
                  className="w-full mt-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard size={18} />
                      TIẾP TỤC THANH TOÁN
                    </span>
                  )}
                </button>

                {/* Security Note */}
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <Shield size={10} />
                  Thanh toán an toàn, bảo mật tuyệt đối
                </p>
              </div>
            </div>

            {/* Mobile Bottom Button */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 z-20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Tổng tiền</p>
                  <p className="text-lg font-bold text-orange-600">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0 || submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-md disabled:opacity-50"
                >
                  {selectedSeats.length === 0 ? "Chọn ghế" : "Thanh toán"}
                </button>
              </div>
              {selectedSeats.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSeats.slice(0, 4).map((seat) => (
                    <span key={seat.id} className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Ghế {seat.row}{seat.number}
                    </span>
                  ))}
                  {selectedSeats.length > 4 && (
                    <span className="text-xs text-gray-400">+{selectedSeats.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}