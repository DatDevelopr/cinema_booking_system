import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../../api/user.api";
import DEFAULT_AVATAR from "../../../assets/images/avatar.jpg";
import {
  Search,
  Plus,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal
} from "lucide-react";

const roleMap = {
  1: { name: "ADMIN", color: "bg-purple-100 text-purple-700", icon: Shield },
  2: { name: "USER", color: "bg-blue-100 text-blue-700", icon: UserIcon },
};

const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ================= Fetch Users =================
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getUserAll();
      const data = res?.data?.data || res?.data || [];
      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ================= Format Date =================
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // ================= Filter Users =================
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search filter
    if (keyword) {
      result = result.filter((user) =>
        Object.keys(user)
          .filter((key) => key !== "avatar")
          .some((key) =>
            String(user[key] || "")
              .toLowerCase()
              .includes(keyword.toLowerCase())
          )
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role_id === parseInt(roleFilter));
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === parseInt(statusFilter));
    }

    return result;
  }, [users, keyword, roleFilter, statusFilter]);

  // ================= Pagination =================
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // ================= Stats =================
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 1).length,
    inactive: users.filter(u => u.status === 0).length,
    admins: users.filter(u => u.role_id === 1).length,
  }), [users]);

  // ================= Loading Skeleton =================
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-48" />
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // ================= Empty State =================
  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có người dùng</h3>
      <p className="text-gray-500 mb-6">
        {keyword || roleFilter !== "all" || statusFilter !== "all" 
          ? "Không tìm thấy người dùng phù hợp" 
          : "Chưa có người dùng nào trong hệ thống"}
      </p>
      {(keyword || roleFilter !== "all" || statusFilter !== "all") ? (
        <button
          onClick={() => {
            setKeyword("");
            setRoleFilter("all");
            setStatusFilter("all");
          }}
          className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          Xóa bộ lọc
        </button>
      ) : (
        <button
          onClick={() => navigate("/admin/users/create")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Tạo người dùng mới
        </button>
      )}
    </div>
  );

  // ================= Pagination Component =================
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
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
          Hiển thị <span className="font-medium text-gray-700">{paginatedUsers.length}</span> trên{' '}
          <span className="font-medium text-gray-700">{filteredUsers.length}</span> người dùng
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
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
              onClick={() => goToPage(p)}
              className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                currentPage === p
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
                onClick={() => goToPage(totalPages)}
                className="min-w-[40px] h-10 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  // ================= User Card Component =================
  const UserCard = ({ user }) => {
    const RoleIcon = roleMap[user.role_id]?.icon || UserIcon;
    
    return (
      <div
        onClick={() => navigate(`/admin/users/${user.user_id}`)}
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt={user.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-all"
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                user.status === 1 ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {user.full_name || "Chưa có tên"}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${roleMap[user.role_id]?.color || 'bg-gray-100 text-gray-600'}`}>
                    <RoleIcon size={12} />
                    {roleMap[user.role_id]?.name || "USER"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Mail size={14} />
                <span className="truncate">{user.email || "N/A"}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.date_of_birth && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{formatDate(user.date_of_birth)}</span>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserIcon size={14} className="text-gray-400" />
                    <span>
                      {user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Khác"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Users size={20} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
              </div>
              <p className="text-gray-600 ml-13">
                Quản lý tài khoản, phân quyền và trạng thái người dùng
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-all"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Làm mới
              </button>
              <button
                onClick={() => navigate("/admin/users/create")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
              >
                <Plus size={20} />
                Tạo người dùng
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngưng hoạt động</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserX size={20} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Quản trị viên</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Search size={14} className="inline mr-1" />
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="w-full lg:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter size={14} className="inline mr-1" />
                Lọc theo quyền
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="1">Quản trị viên</option>
                <option value="2">Người dùng</option>
              </select>
            </div>

            <div className="w-full lg:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter size={14} className="inline mr-1" />
                Lọc theo trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="1">Đang hoạt động</option>
                <option value="0">Ngưng hoạt động</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(keyword || roleFilter !== "all" || statusFilter !== "all") && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setKeyword("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
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
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {paginatedUsers.map((user) => (
                <UserCard key={user.user_id} user={user} />
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

export default UserManagement;