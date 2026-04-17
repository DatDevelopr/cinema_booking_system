import { useEffect, useState, useCallback } from "react";
import { serviceApi } from "../../../api/services.api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Tag,
  DollarSign,
  Layers,
  Utensils,
  Coffee,
  Pizza,
  Eye,
  EyeOff,
  Filter,
  X,
  Loader2,
  ShoppingBag,
  Image as ImageIcon,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToastSimple";

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 10;

  // Category icons and styles mapping
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case "FOOD":
        return { 
          icon: Utensils, 
          gradient: "from-orange-500 to-red-500",
          bgLight: "bg-orange-50",
          textLight: "text-orange-600",
          badge: "bg-orange-100 text-orange-700",
          border: "border-orange-200"
        };
      case "DRINK":
        return { 
          icon: Coffee, 
          gradient: "from-blue-500 to-cyan-500",
          bgLight: "bg-blue-50",
          textLight: "text-blue-600",
          badge: "bg-blue-100 text-blue-700",
          border: "border-blue-200"
        };
      case "COMBO":
        return { 
          icon: Pizza, 
          gradient: "from-purple-500 to-pink-500",
          bgLight: "bg-purple-50",
          textLight: "text-purple-600",
          badge: "bg-purple-100 text-purple-700",
          border: "border-purple-200"
        };
      default:
        return { 
          icon: Package, 
          gradient: "from-gray-500 to-gray-600",
          bgLight: "bg-gray-50",
          textLight: "text-gray-600",
          badge: "bg-gray-100 text-gray-700",
          border: "border-gray-200"
        };
    }
  };

  const handleImageError = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }));
  };

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      if (isFirstLoad) setLoading(true);

      const params = {
        page,
        limit,
        search: debouncedSearch,
        category,
        status: status === "" ? undefined : status,
      };

      const res = await serviceApi.getAll(params);

      setServices(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalItems(res.data?.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách dịch vụ");
      setServices([]);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, [page, debouncedSearch, category, status, isFirstLoad, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= ACTIONS ================= */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) return;

    try {
      setDeletingId(id);
      await serviceApi.delete(id);
      toast.success(`Đã xóa dịch vụ "${name}"`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xóa dịch vụ thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    try {
      setTogglingId(id);
      await serviceApi.toggleStatus(id);
      toast.success(`Đã ${currentStatus ? "tạm ngưng" : "bật"} dịch vụ "${name}"`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setTogglingId(null);
    }
  };

  // Stats
  const stats = {
    total: totalItems,
    active: services.filter(s => s.status == 1).length,
    inactive: services.filter(s => s.status == 0).length,
    food: services.filter(s => s.category == "FOOD").length,
    drink: services.filter(s => s.category == "DRINK").length,
    combo: services.filter(s => s.category == "COMBO").length,
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="flex p-5">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
            <div className="flex-1 ml-4">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có dịch vụ</h3>
      <p className="text-gray-500 mb-6">
        {search || category || status ? "Không tìm thấy dịch vụ phù hợp" : "Chưa có dịch vụ nào được thêm"}
      </p>
      {(search || category || status) ? (
        <button
          onClick={() => {
            setSearch("");
            setCategory("");
            setStatus("");
          }}
          className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <X size={20} />
          Xóa bộ lọc
        </button>
      ) : (
        <button
          onClick={() => navigate("/admin/services/create")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
        >
          <Plus size={20} />
          Thêm dịch vụ mới
        </button>
      )}
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Hiển thị <span className="font-medium text-gray-700">{services.length}</span> trên{' '}
          <span className="font-medium text-gray-700">{totalItems}</span> dịch vụ
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setPage(1)}
                className="min-w-[40px] h-10 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400 px-1">...</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                page === p
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-400 px-1">...</span>}
              <button
                onClick={() => setPage(totalPages)}
                className="min-w-[40px] h-10 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Package size={20} className="text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Quản lý dịch vụ
                </h1>
              </div>
              <p className="text-gray-500 ml-13">Quản lý đồ ăn, thức uống và combo tại rạp</p>
            </div>
            
            <button
              onClick={() => navigate("/admin/services/create")}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus size={20} />
                Thêm dịch vụ
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Tổng dịch vụ", value: stats.total, icon: Package, color: "blue" },
            { label: "Đang bán", value: stats.active, icon: CheckCircle, color: "green" },
            { label: "Tạm ngưng", value: stats.inactive, icon: XCircle, color: "gray" },
            { label: "Đồ ăn", value: stats.food, icon: Utensils, color: "orange" },
            { label: "Thức uống", value: stats.drink, icon: Coffee, color: "blue" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "from-blue-500 to-indigo-600",
              green: "from-green-500 to-emerald-600",
              gray: "from-gray-500 to-gray-600",
              orange: "from-orange-500 to-red-500",
            };
            return (
              <div key={idx} className="group bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[stat.color]} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Search size={14} className="inline mr-1" />
                Tìm kiếm
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên dịch vụ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-focus-within:border-blue-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter size={14} className="inline mr-1" />
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer hover:border-blue-400"
              >
                <option value="">Tất cả</option>
                <option value="FOOD">Đồ ăn</option>
                <option value="DRINK">Thức uống</option>
                <option value="COMBO">Combo</option>
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter size={14} className="inline mr-1" />
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer hover:border-blue-400"
              >
                <option value="">Tất cả</option>
                <option value="1">Đang bán</option>
                <option value="0">Tạm ngưng</option>
              </select>
            </div>

            {(search || category || status) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setStatus("");
                    setPage(1);
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading && isFirstLoad ? (
          <LoadingSkeleton />
        ) : services.length == 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const config = getCategoryConfig(service.category);
                const Icon = config.icon;
                const isActive = service.status == 1;
                const hasImage = service.image && !imageErrors[service.service_id];
                
                return (
                  <div
                    key={service.service_id}
                    className={`group bg-white rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
                      isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/30'
                    }`}
                  >
                    {/* Status Bar */}
                    <div className={`h-1 bg-gradient-to-r ${isActive ? config.gradient : 'from-gray-400 to-gray-500'}`} />
                    
                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          {hasImage ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-20 h-20 rounded-2xl object-cover shadow-md border border-gray-100"
                              onError={() => handleImageError(service.service_id)}
                            />
                          ) : (
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${config.bgLight} border ${config.border}`}>
                              <Icon size={28} className={config.textLight} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {service.name}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.badge} mt-1`}>
                                <Icon size={10} />
                                {service.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigate(`/admin/services/${service.service_id}/edit`)}
                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(service.service_id, service.name)}
                                disabled={deletingId === service.service_id}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Xóa"
                              >
                                {deletingId === service.service_id ? (
                                  <Loader2 size={16} className="animate-spin text-red-500" />
                                ) : (
                                  <Trash2 size={16} className="text-red-500" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {service.description || "Chưa có mô tả"}
                          </p>

                          {/* Price & Stock */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign size={12} className="text-blue-600" />
                              </div>
                              <span className="text-sm font-semibold text-blue-600">
                                {service.price.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Layers size={12} className="text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-600">
                                Kho: {service.stock}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(service.service_id, service.status, service.name)}
                            disabled={togglingId === service.service_id}
                            className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                              isActive
                                ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            {togglingId == service.service_id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              isActive ? <Eye size={14} /> : <EyeOff size={14} />
                            )}
                            {isActive ? "Đang bán" : "Tạm ngưng"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesManagement;