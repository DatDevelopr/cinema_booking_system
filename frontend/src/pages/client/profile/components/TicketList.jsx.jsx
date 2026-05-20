import { useEffect, useState } from "react";
import ticketApi from "../../../../api/ticket.api";
import {
  Ticket,
  Clock,
  Calendar,
  MapPin,
  Film,
  Users,
  QrCode,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import useToast from "../../../../hooks/useToastSimple";

export default function MyTicketsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await ticketApi.getMyTickets();
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  // Lọc vé đã thanh toán và sắp chiếu
  const paidOrders = data.filter((o) => o.status === "PAID");
  
  const upcomingTickets = paidOrders
    .flatMap((order) => 
      order.tickets.map((ticket) => ({
        ...ticket,
        order_id: order.order_id,
        total_amount: order.total_amount,
        payment: order.payment,
      }))
    )
    .filter((t) => new Date(t.showtime.start_time) > now)
    .sort((a, b) => new Date(a.showtime.start_time) - new Date(b.showtime.start_time));

  // Lọc theo tìm kiếm
  const filteredTickets = upcomingTickets.filter((ticket) =>
    ticket.movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.seat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.cinema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (dateString) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(dateString);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  const getDateLabel = (dateString) => {
    if (isToday(dateString)) return "Hôm nay";
    if (isTomorrow(dateString)) return "Ngày mai";
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải vé của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-4">
            <Ticket size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vé của tôi</h1>
          <p className="text-gray-500">Quản lý tất cả vé xem phim của bạn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{upcomingTickets.length}</p>
                <p className="text-xs text-gray-500">Vé sắp chiếu</p>
              </div>
              <Ticket size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {upcomingTickets.filter((t) => isToday(t.showtime.start_time)).length}
                </p>
                <p className="text-xs text-gray-500">Hôm nay</p>
              </div>
              <Calendar size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {upcomingTickets.length}
                </p>
                <p className="text-xs text-gray-500">Rạp chiếu</p>
              </div>
              <MapPin size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(upcomingTickets.map((t) => t.movie.title)).size}
                </p>
                <p className="text-xs text-gray-500">Phim khác nhau</p>
              </div>
              <Film size={24} className="text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phim, ghế hoặc rạp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không có vé nào
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? `Không tìm thấy vé nào phù hợp với "${searchTerm}"`
                : "Bạn chưa có vé xem phim nào sắp chiếu"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Đặt vé ngay
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Ticket Card */}
                <div className="relative">
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md">
                      {getDateLabel(ticket.showtime.start_time)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Poster */}
                      <div className="flex-shrink-0">
                        <img
                          src={ticket.movie.poster}
                          alt={ticket.movie.title}
                          className="w-24 h-32 object-cover rounded-xl shadow-md"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                          {ticket.movie.title}
                        </h3>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} className="text-orange-500" />
                            <span>{ticket.cinema} - {ticket.room}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-orange-500" />
                            <span>{formatDate(ticket.showtime.start_time)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} className="text-orange-500" />
                            <span>
                              {formatTime(ticket.showtime.start_time)} - {formatTime(ticket.showtime.end_time)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Users size={14} className="text-orange-500" />
                            <span>
                              Ghế:{" "}
                              <span className="font-semibold text-orange-600">
                                {ticket.seat}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            <CheckCircle size={12} />
                            Đã thanh toán
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="border-t border-dashed border-gray-200"></div>
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <Ticket size={14} className="text-orange-400" />
                      </div>
                    </div>

                    {/* QR Code & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-xl">
                          <QRCodeCanvas
                            value={JSON.stringify({
                              ticket_id: ticket.ticket_id,
                              movie: ticket.movie.title,
                              seat: ticket.seat,
                              cinema: ticket.cinema,
                            })}
                            size={50}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>Quét mã QR</p>
                          <p>khi vào rạp</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex items-center gap-1 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-sm font-medium transition-all"
                      >
                        Chi tiết
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center sticky top-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ticket size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Chi tiết vé</h2>
              <p className="text-orange-100 text-sm">Mã vé: #{selectedTicket.ticket_id}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <img
                  src={selectedTicket.movie.poster}
                  alt={selectedTicket.movie.title}
                  className="w-28 h-36 object-cover rounded-xl shadow-md"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {selectedTicket.movie.title}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Rạp:</span> {selectedTicket.cinema}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Phòng:</span> {selectedTicket.room}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Ghế:</span>{" "}
                      <span className="text-orange-600 font-semibold">{selectedTicket.seat}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Thông tin suất chiếu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày chiếu:</span>
                    <span className="font-medium">{formatDate(selectedTicket.showtime.start_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giờ chiếu:</span>
                    <span className="font-medium">
                      {formatTime(selectedTicket.showtime.start_time)} - {formatTime(selectedTicket.showtime.end_time)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">QR Code vé</h4>
                  <QrCode size={18} className="text-orange-500" />
                </div>
                <div className="flex justify-center">
                  <QRCodeCanvas
                    value={JSON.stringify({
                      ticket_id: selectedTicket.ticket_id,
                      movie: selectedTicket.movie.title,
                      seat: selectedTicket.seat,
                      cinema: selectedTicket.cinema,
                      showtime: selectedTicket.showtime.start_time,
                    })}
                    size={180}
                    level="H"
                  />
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Vui lòng xuất trình mã QR này tại quầy vé
                </p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}