import { useEffect, useState, useCallback } from "react";
import { cinemaApi } from "../../../api/cinema.api";
import { useNavigate } from "react-router-dom";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  Search, 
  MapPin, 
  Plus, 
  Edit, 
  Building2, 
  Film,
  ChevronLeft,
  ChevronRight,
  Home,
  Phone,
  Mail,
  Clock
} from "lucide-react";

const CinemaManagement = () => {
  const navigate = useNavigate();

  const [cinemas, setCinemas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState("cinema_name");
  const [sortOrder, setSortOrder] = useState("ASC");

  const [updatingId, setUpdatingId] = useState(null);

  const limit = 10;

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [cinemaRes, regionRes] = await Promise.all([
        cinemaApi.getAll({
          page,
          limit,
          search: debouncedSearch,
          region: regionFilter,
          sortBy,
          sortOrder,
        }),
        cinemaApi.getRegions(),
      ]);

      setCinemas(cinemaRes.data || cinemaRes);
      setTotalPages(cinemaRes.pagination?.totalPages || 1);
      setRegions(regionRes.data || regionRes);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, regionFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SORT ================= */
  const handleSort = (field) => {
    setPage(1);

    if (sortBy === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }

    const Icon = sortOrder === "ASC" ? ArrowUp : ArrowDown;

    return <Icon size={14} className="text-blue-600" />;
  };

  /* ================= ACTION ================= */
  const handleToggleStatus = async (cinema, e) => {
    e.stopPropagation();

    const confirmChange = window.confirm(
      `Bạn có muốn ${
        cinema.status === 1 ? "ngừng hoạt động" : "kích hoạt"
      } rạp này không?`,
    );

    if (!confirmChange) return;

    try {
      setUpdatingId(cinema.cinema_id);

      const newStatus = cinema.status == 1 ? 0 : 1;

      await cinemaApi.toggleStatus(cinema.cinema_id, newStatus);

      setCinemas((prev) =>
        prev.map((item) =>
          item.cinema_id === cinema.cinema_id
            ? { ...item, status: newStatus }
            : item,
        ),
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setUpdatingId(null);
    }
  };

  const goToEdit = (id) => {
    navigate(`/admin/cinemas/${id}/edit`);
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building2 size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có rạp chiếu</h3>
      <p className="text-gray-500 mb-6">
        {search || regionFilter ? "Không tìm thấy rạp chiếu phù hợp" : "Chưa có rạp chiếu nào được thêm"}
      </p>
      {(search || regionFilter) ? (
        <button
          onClick={() => {
            setSearch("");
            setRegionFilter("");
          }}
          className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          Xóa bộ lọc
        </button>
      ) : (
        <button
          onClick={() => navigate("/admin/cinemas/create")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Thêm rạp mới
        </button>
      )}
    </div>
  );

  // Pagination Component
  const Pagination = () => {
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
          Hiển thị <span className="font-medium text-gray-700">{cinemas.length}</span> trên{' '}
          <span className="font-medium text-gray-700">{limit * (page - 1) + cinemas.length}</span> kết quả
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
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý rạp chiếu</h1>
              <p className="text-gray-600">Quản lý hệ thống các rạp chiếu phim trên toàn quốc</p>
            </div>
            
            <button
              onClick={() => navigate("/admin/cinemas/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus size={20} />
              Thêm rạp mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số rạp</p>
                <p className="text-2xl font-bold text-gray-900">{cinemas.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Khu vực</p>
                <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {cinemas.filter(c => c.status === 1).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tạm ngưng</p>
                <p className="text-2xl font-bold text-red-600">
                  {cinemas.filter(c => c.status === 0).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Home size={20} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  placeholder="Tìm theo tên rạp, địa chỉ..."
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Lọc theo khu vực
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={regionFilter}
                  onChange={(e) => {
                    setPage(1);
                    setRegionFilter(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all cursor-pointer"
                >
                  <option value="">Tất cả khu vực</option>
                  {regions.map((r) => (
                    <option key={r.region_id} value={r.region_id}>
                      {r.region_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => handleSort("cinema_name")}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  sortBy === "cinema_name" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Tên rạp
                {renderSortIcon("cinema_name")}
              </button>
              <button
                onClick={() => handleSort("address")}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  sortBy === "address" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Địa chỉ
                {renderSortIcon("address")}
              </button>
            </div>

            {/* Clear Filters */}
            {(search || regionFilter) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch("");
                    setRegionFilter("");
                    setPage(1);
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : cinemas.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Cinemas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cinemas.map((cinema, index) => (
                <div
                  key={cinema.cinema_id}
                  onClick={() => goToEdit(cinema.cinema_id)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Building2 size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {cinema.cinema_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {cinema.Region?.region_name || "Chưa có khu vực"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleStatus(cinema, e)}
                          disabled={updatingId === cinema.cinema_id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            cinema.status === 1 ? "bg-green-500" : "bg-gray-300"
                          } ${updatingId === cinema.cinema_id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              cinema.status === 1 ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToEdit(cinema.cinema_id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Edit size={18} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <Home size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">{cinema.address}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Film size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Số phòng</p>
                            <p className="text-sm font-semibold text-gray-900">{cinema.room_count || 0} phòng</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Trạng thái</p>
                            <p className={`text-sm font-semibold ${cinema.status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                              {cinema.status === 1 ? "Đang hoạt động" : "Tạm ngưng"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};

export default CinemaManagement;