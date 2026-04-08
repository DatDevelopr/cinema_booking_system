import { useEffect, useState, useCallback } from "react";
import { roomApi } from "../../../api/room.api";
import { cinemaApi } from "../../../api/cinema.api";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Building2,
  Plus,
  Edit,
  Users,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Film,
  Monitor,
  Settings,
} from "lucide-react";

const RoomManagement = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState("room_name");
  const [sortOrder, setSortOrder] = useState("ASC");

  const limit = 10;

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      };

      if (cinemaFilter) {
        params.cinema_id = cinemaFilter;
      }

      const [roomRes, cinemaRes] = await Promise.all([
        roomApi.getAll(params),
        cinemaApi.getAll({ limit: 1000 }),
      ]);

      setRooms(roomRes.data?.data || []);
      setTotalPages(roomRes.data?.pagination?.totalPages || 1);
      setCinemas(cinemaRes.data?.data || cinemaRes.data || []);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, cinemaFilter, sortBy, sortOrder]);

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

  const goToEdit = (id) => {
    navigate(`/admin/rooms/${id}/edit`);
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
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
        <Monitor size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có phòng chiếu</h3>
      <p className="text-gray-500 mb-6">
        {search || cinemaFilter ? "Không tìm thấy phòng chiếu phù hợp" : "Chưa có phòng chiếu nào được thêm"}
      </p>
      {(search || cinemaFilter) ? (
        <button
          onClick={() => {
            setSearch("");
            setCinemaFilter("");
          }}
          className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          Xóa bộ lọc
        </button>
      ) : (
        <button
          onClick={() => navigate("/admin/rooms/create")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Thêm phòng mới
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
          Hiển thị <span className="font-medium text-gray-700">{rooms.length}</span> trên{' '}
          <span className="font-medium text-gray-700">{limit * (page - 1) + rooms.length}</span> kết quả
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý phòng chiếu</h1>
              <p className="text-gray-600">Quản lý hệ thống phòng chiếu và cấu hình ghế ngồi</p>
            </div>
            
            <button
              onClick={() => navigate("/admin/rooms/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus size={20} />
              Thêm phòng mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số phòng</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Monitor size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số rạp</p>
                <p className="text-2xl font-bold text-gray-900">{cinemas.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số ghế</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.reduce((sum, room) => sum + (room.total_seats || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-green-600" />
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
                  placeholder="Tìm theo tên phòng..."
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Cinema Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Lọc theo rạp
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={cinemaFilter}
                  onChange={(e) => {
                    setPage(1);
                    setCinemaFilter(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all cursor-pointer"
                >
                  <option value="">Tất cả rạp</option>
                  {cinemas.map((c) => (
                    <option key={c.cinema_id} value={c.cinema_id}>
                      {c.cinema_name}
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

            {/* Clear Filters */}
            {(search || cinemaFilter) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch("");
                    setCinemaFilter("");
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
        ) : rooms.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Rooms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rooms.map((room, index) => (
                <div
                  key={room.room_id}
                  onClick={() => goToEdit(room.room_id)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Monitor size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {room.room_name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Building2 size={14} />
                            {room.Cinema?.cinema_name || "Chưa có rạp"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToEdit(room.room_id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Edit size={18} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <LayoutGrid size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Số hàng</p>
                          <p className="text-sm font-semibold text-gray-900">{room.rows} hàng</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Ghế / hàng</p>
                          <p className="text-sm font-semibold text-gray-900">{room.seats_per_row} ghế</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Settings size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tổng số ghế</p>
                          <p className="text-sm font-semibold text-gray-900">{room.total_seats} ghế</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Film size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">STT</p>
                          <p className="text-sm font-semibold text-gray-900">#{index + 1}</p>
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

export default RoomManagement;