// AdminTickets.jsx - Phiên bản debug
import { useEffect, useState, useCallback } from "react";
import ticketApi from "../../../api/ticket.api";
import useToast from "../../../hooks/useToastSimple";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Ticket,
  MapPin,
  Armchair,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Volume2,
  Eye,
  DollarSign,
  User,
  Mail,
  Hash,
} from "lucide-react";

const STATUS_MAP = {
  BOOKED: { label: "Đã đặt", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200" },
  EXPIRED: { label: "Hết hạn", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const formatCurrency = (val) => Number(val || 0).toLocaleString("vi-VN") + " đ";
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");
const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";
const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function AdminTickets() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "", time: "", search: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ───── fetch ─────
  const fetchTickets = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      
      const params = { page: pageNum, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.time) params.time = filters.time;
      if (filters.search) params.search = filters.search;

      const res = await ticketApi.getAll(params);

      const responseData = res?.data || {};
      const ticketList = responseData?.data || [];
      const pagination = responseData?.pagination || {};

      setTickets(Array.isArray(ticketList) ? ticketList : []);
      setTotal(pagination?.total || 0);
      setTotalPages(pagination?.totalPages || Math.ceil((pagination?.total || 0) / 10));

    } catch (err) {
      toast.error("Không thể tải danh sách vé");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ✅ Chỉ gọi khi page thay đổi
  useEffect(() => {
    fetchTickets(page);
  }, [page]);

  // ───── handlers ─────
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets(1);
  };

  const handleResetFilter = () => {
    setFilters({ status: "", time: "", search: "" });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else {
      console.warn("⚠️ [PAGE] Invalid page number:", newPage);
    }
  };

  const getStatusBadge = (status) => {
    const config = STATUS_MAP[status] || STATUS_MAP.EXPIRED;
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTicketInfo = (ticket) => {
    
    const stSeat = ticket.ShowtimeSeat || {};
    const showtime = stSeat.Showtime || {};
    const movie = showtime.Movie || {};
    const room = showtime.Room || {};
    const cinema = room.Cinema || {};
    const seat = stSeat.Seat || {};
    const orderTickets = ticket.OrderTickets || [];
    const orderTicket = orderTickets[0] || {};
    const order = orderTicket.Order || {};
    const user = order.User || {};

    return {
      movieTitle: movie.title || "—",
      moviePoster: movie.poster_url || null,
      movieDuration: movie.duration || 0,
      cinemaName: cinema.cinema_name || "—",
      cinemaAddress: cinema.address || "",
      roomName: room.room_name || "—",
      seatInfo: `${seat.seat_row || ""}${seat.seat_number || ""}`.trim() || "—",
      seatType: seat.seat_type || "—",
      price: stSeat.price || 0,
      startTime: showtime.start_time,
      endTime: showtime.end_time,
      format: showtime.format || "2D",
      language: showtime.language || "VN",
      userName: user.full_name || "—",
      userEmail: user.email || "",
    };
  };

  const handleViewDetail = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  // 🔍 DEBUG: Log state changes
  useEffect(() => {
  }, [tickets]);

  useEffect(() => {
  }, [filters]);

  // ───── render ─────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Ticket size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý vé</h1>
                <p className="text-sm text-gray-500">Theo dõi và quản lý tất cả vé đã đặt</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  showFilters ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={16} />
                Bộ lọc
              </button>
              <button
                onClick={() => {
                  fetchTickets(page);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={16} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Trạng thái</label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, status: e.target.value }));
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="BOOKED">Đã đặt</option>
                    <option value="CHECKED_IN">Đã check-in</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="EXPIRED">Hết hạn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Thời gian đặt</label>
                  <select
                    value={filters.time}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, time: e.target.value }));
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tìm phim</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tên phim..."
                      value={filters.search}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, search: e.target.value }));
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Tìm kiếm
                </button>
                <button type="button" onClick={handleResetFilter} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors">
                  Reset
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng vé", value: total, icon: Ticket, color: "bg-blue-500" },
            { label: "Đã đặt", value: tickets.filter((t) => t.ticket_status === "BOOKED").length, icon: CheckCircle, color: "bg-indigo-500" },
            { label: "Đã hủy", value: tickets.filter((t) => t.ticket_status === "CANCELLED").length, icon: XCircle, color: "bg-red-500" },
            { label: "Hết hạn", value: tickets.filter((t) => t.ticket_status === "EXPIRED").length, icon: AlertTriangle, color: "bg-gray-500" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center`}>
                  <item.icon size={14} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Vé</th>
                  <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Phim</th>
                  <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Người đặt</th>
                  <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Ngày đặt</th>
                  <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Giá</th>
                  <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-500">
                      <Ticket size={40} className="mx-auto mb-3 text-gray-300" />
                      Không tìm thấy vé nào
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const info = getTicketInfo(ticket);
                    return (
                      <tr key={ticket.ticket_id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg whitespace-nowrap">
                            #{ticket.ticket_id}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={info.moviePoster || "/placeholder-poster.jpg"}
                              alt={info.movieTitle}
                              className="w-8 h-12 object-cover rounded flex-shrink-0"
                              onError={(e) => { e.target.src = "/placeholder-poster.jpg"; }}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 line-clamp-1" title={info.movieTitle}>{info.movieTitle}</p>
                              <p className="text-xs text-gray-500">{info.format} • {info.language} • {info.movieDuration}ph</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(info.userName || "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1" title={info.userName}>{info.userName}</p>
                              {info.userEmail && (
                                <p className="text-xs text-gray-500 line-clamp-1" title={info.userEmail}>{info.userEmail}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                          <div>{formatDate(ticket.booking_time)}</div>
                          <p className="text-xs text-gray-500 mt-0.5">{formatTime(ticket.booking_time)}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">{formatCurrency(info.price)}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(ticket.ticket_status)}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleViewDetail(ticket)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Eye size={14} /> Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Trang {page} / {totalPages} • Tổng {total} vé
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, page - 2);
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${page === p ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết vé */}
      {showDetailModal && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          info={getTicketInfo(selectedTicket)}
          onClose={() => {
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
}

// Component Modal Chi tiết vé
function TicketDetailModal({ ticket, info, onClose }) {
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={18} className="text-white" />
            <div>
              <h2 className="text-base font-bold text-white">Vé #{ticket.ticket_id}</h2>
              <p className="text-xs text-blue-100">{formatDateTime(ticket.booking_time)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <img
              src={info.moviePoster || "/placeholder-poster.jpg"}
              alt={info.movieTitle}
              className="w-14 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
              onError={(e) => { e.target.src = "/placeholder-poster.jpg"; }}
            />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{info.movieTitle}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" /> {info.movieDuration}ph</span>
                <span className="flex items-center gap-1"><Monitor size={12} className="text-blue-500" /> {info.format}</span>
                <span className="flex items-center gap-1"><Volume2 size={12} className="text-blue-500" /> {info.language}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1"><MapPin size={13} className="text-blue-500" /><span className="text-xs font-semibold text-gray-600">Rạp</span></div>
              <p className="text-xs text-gray-900 font-medium line-clamp-2">{info.cinemaName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">P.{info.roomName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1"><Clock size={13} className="text-blue-500" /><span className="text-xs font-semibold text-gray-600">Suất chiếu</span></div>
              <p className="text-xs text-gray-900 font-medium">{formatTime(info.startTime)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(info.startTime)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1"><Armchair size={13} className="text-blue-500" /><span className="text-xs font-semibold text-gray-600">Ghế</span></div>
              <p className="text-xs text-gray-900 font-medium">{info.seatInfo}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{info.seatType}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1"><DollarSign size={13} className="text-blue-500" /><span className="text-xs font-semibold text-gray-600">Giá</span></div>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(info.price)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl col-span-2">
              <div className="flex items-center gap-1.5 mb-1"><User size={13} className="text-blue-500" /><span className="text-xs font-semibold text-gray-600">Người đặt</span></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(info.userName || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">{info.userName}</p>
                  {info.userEmail && <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 line-clamp-1"><Mail size={10} /> {info.userEmail}</p>}
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl col-span-2">
              <div className="flex items-center gap-1.5 mb-1"><Hash size={13} className="text-blue-500" /><span className="text-xs font-semibold text-gray-600">Trạng thái</span></div>
              {(() => {
                const config = STATUS_MAP[ticket.ticket_status] || STATUS_MAP.EXPIRED;
                return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>{config.label}</span>;
              })()}
              <p className="text-[11px] text-gray-400 mt-1">Đặt lúc: {formatDateTime(ticket.booking_time)}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}