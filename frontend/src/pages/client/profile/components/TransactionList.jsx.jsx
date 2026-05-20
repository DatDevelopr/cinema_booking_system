import { useEffect, useState } from "react";
import orderApi from "../../../../api/order.api";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  Banknote,
  Ticket,
  Package,
  ArrowLeft,
  X,
} from "lucide-react";
import useToast from "../../../../hooks/useToastSimple";

export default function PaymentHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_id.toString().includes(search) ||
      o.payment?.transaction_code?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "ALL" ||
      o.payment?.status === filter ||
      o.order_status === filter;

    return matchSearch && matchFilter;
  });

  /* ================= FORMAT ================= */
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
            <CheckCircle size={12} />
            Thành công
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
            <XCircle size={12} />
            Thất bại
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
            <AlertCircle size={12} />
            Đang xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
            {status || "Không xác định"}
          </span>
        );
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (method === "VNPAY") return <CreditCard size={18} className="text-orange-500" />;
    if (method === "MOMO") return <Banknote size={18} className="text-purple-500" />;
    return <CreditCard size={18} className="text-gray-500" />;
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      VNPAY: "VNPay",
      MOMO: "MoMo",
      CASH: "Tiền mặt",
      BANKING: "Chuyển khoản",
    };
    return methods[method] || method || "N/A";
  };

  // Thống kê
  const stats = {
    total: orders.length,
    success: orders.filter((o) => o.payment?.status === "SUCCESS" || o.order_status === "PAID").length,
    failed: orders.filter((o) => o.payment?.status === "FAILED" || o.order_status === "FAILED").length,
    pending: orders.filter((o) => o.payment?.status === "PENDING" || o.order_status === "PENDING").length,
    totalAmount: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải lịch sử thanh toán...</p>
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
            <CreditCard size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Lịch sử thanh toán</h1>
          <p className="text-gray-500">Theo dõi tất cả giao dịch của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
                <p className="text-xs text-gray-500">Tổng giao dịch</p>
              </div>
              <CreditCard size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                <p className="text-xs text-gray-500">Thành công</p>
              </div>
              <CheckCircle size={24} className="text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-xs text-gray-500">Thất bại</p>
              </div>
              <XCircle size={24} className="text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-orange-600 truncate">
                  {formatCurrency(stats.totalAmount)}
                </p>
                <p className="text-xs text-gray-500">Tổng chi tiêu</p>
              </div>
              <Banknote size={24} className="text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn hoặc mã giao dịch..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all outline-none appearance-none bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="PENDING">Đang xử lý</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={40} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không có giao dịch nào
            </h3>
            <p className="text-gray-500 mb-4">
              {search
                ? `Không tìm thấy giao dịch phù hợp với "${search}"`
                : "Bạn chưa có giao dịch thanh toán nào"}
            </p>
            {!search && (
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Đặt vé ngay
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Mã đơn hàng</p>
                      <p className="font-bold text-xl text-gray-900 font-mono">#{order.order_id}</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(order.payment?.status || order.order_status)}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="text-orange-500" />
                      <span>{formatDateTime(order.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      {getPaymentMethodIcon(order.payment?.method)}
                      <span>{getPaymentMethodName(order.payment?.method)}</span>
                    </div>

                    {order.payment?.transaction_code && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard size={14} className="text-orange-500" />
                        <span className="font-mono text-xs">
                          {order.payment.transaction_code}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tickets Summary */}
                  {order.tickets && order.tickets.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket size={14} className="text-orange-500" />
                        <span className="text-xs font-medium text-gray-600">Vé đã đặt</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.tickets.map((ticket, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border"
                          >
                            <Ticket size={10} />
                            {ticket.movie.title.substring(0, 20)} - {ticket.seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services Summary */}
                  {order.services && order.services.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={14} className="text-orange-500" />
                        <span className="text-xs font-medium text-gray-600">Dịch vụ kèm theo</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border"
                          >
                            {service.name} x{service.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total & Actions */}
                  <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Tổng thanh toán</p>
                      <p className="font-bold text-2xl text-orange-600">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-sm font-medium transition-all"
                    >
                      Chi tiết
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 sticky top-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-orange-100 text-sm">Chi tiết đơn hàng</p>
                  <h2 className="text-2xl font-bold text-white">#{selectedOrder.order_id}</h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Status */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Trạng thái</p>
                  {getStatusBadge(selectedOrder.payment?.status || selectedOrder.order_status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ngày đặt</p>
                  <p className="font-medium text-gray-700">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Tickets */}
              {selectedOrder.tickets && selectedOrder.tickets.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Ticket size={18} className="text-orange-500" />
                    Thông tin vé
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.tickets.map((ticket, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex gap-3">
                          <img
                            src={ticket.movie.poster}
                            alt={ticket.movie.title}
                            className="w-16 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{ticket.movie.title}</p>
                            <p className="text-sm text-gray-600">
                              {ticket.cinema} - {ticket.room}
                            </p>
                            <p className="text-sm text-gray-600">
                              Ghế: <span className="font-semibold text-orange-600">{ticket.seat}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(ticket.showtime.start_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {selectedOrder.services && selectedOrder.services.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package size={18} className="text-orange-500" />
                    Dịch vụ kèm theo
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600">Tên dịch vụ</th>
                          <th className="text-center py-2 text-gray-600">Số lượng</th>
                          <th className="text-right py-2 text-gray-600">Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.services.map((service, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2">{service.name}</td>
                            <td className="text-center py-2">x{service.quantity}</td>
                            <td className="text-right py-2">{formatCurrency(service.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {selectedOrder.payment && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-orange-500" />
                    Thông tin thanh toán
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Phương thức</p>
                        <p className="font-medium">{getPaymentMethodName(selectedOrder.payment.method)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mã giao dịch</p>
                        <p className="font-mono text-xs">{selectedOrder.payment.transaction_code || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Thời gian thanh toán</p>
                        <p className="font-medium">{selectedOrder.payment.payment_time ? formatDateTime(selectedOrder.payment.payment_time) : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Số tiền</p>
                        <p className="font-bold text-orange-600">{formatCurrency(selectedOrder.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
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
      `}</style>
    </div>
  );
}