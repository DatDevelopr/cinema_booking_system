import { useEffect, useState } from "react";
import { regionApi } from "../../../api/region.api";
import { 
  Pencil, 
  Plus, 
  X, 
  Check, 
  MapPin, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Search,
  Layers
} from "lucide-react";

const RegionManagement = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionName, setRegionName] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  // ===============================
  // GET LIST
  // ===============================
  const fetchRegions = async () => {
    try {
      setLoading(true);

      const res = await regionApi.getAllRegion({
        page,
        limit,
        search: searchTerm,
      });

      setRegions(res.data.data || res.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Lỗi lấy danh sách region:", error);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [page, searchTerm]);

  // ===============================
  // TOGGLE STATUS
  // ===============================
  const handleToggleStatus = async (region) => {
    try {
      const confirmChange = window.confirm(
        `Bạn có muốn ${
          region.status === 1 ? "ngừng hoạt động" : "kích hoạt"
        } khu vực "${region.region_name}" không?`
      );

      if (!confirmChange) return;

      setUpdatingId(region.region_id);

      const newStatus = region.status === 1 ? 0 : 1;

      await regionApi.update(region.region_id, {
        status: newStatus,
      });

      setRegions((prev) =>
        prev.map((item) =>
          item.region_id === region.region_id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setUpdatingId(null);
    }
  };

  // ===============================
  // OPEN CREATE FORM
  // ===============================
  const handleCreate = () => {
    setEditingRegion(null);
    setRegionName("");
    setShowForm(true);
  };

  // ===============================
  // OPEN EDIT FORM
  // ===============================
  const handleEdit = (region) => {
    setEditingRegion(region);
    setRegionName(region.region_name);
    setShowForm(true);
  };

  // ===============================
  // CLOSE FORM
  // ===============================
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRegion(null);
    setRegionName("");
  };

  // ===============================
  // SUBMIT FORM
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!regionName.trim()) {
      alert("Tên khu vực không được để trống");
      return;
    }

    try {
      if (editingRegion) {
        // UPDATE
        await regionApi.update(editingRegion.region_id, {
          region_name: regionName.trim(),
        });
      } else {
        // CREATE
        await regionApi.create({
          region_name: regionName.trim(),
          status: 1,
        });
      }

      handleCloseForm();
      setPage(1);
      fetchRegions();
    } catch (error) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Globe size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có khu vực</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm ? "Không tìm thấy khu vực phù hợp" : "Chưa có khu vực nào được thêm"}
      </p>
      {searchTerm ? (
        <button
          onClick={() => setSearchTerm("")}
          className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          Xóa tìm kiếm
        </button>
      ) : (
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Tạo khu vực mới
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
          Hiển thị <span className="font-medium text-gray-700">{regions.length}</span> khu vực
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

  // Modal Form Component
  const ModalForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              {editingRegion ? <Pencil size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingRegion ? "Chỉnh sửa khu vực" : "Tạo khu vực mới"}
            </h2>
          </div>
          <button
            onClick={handleCloseForm}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khu vực
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="VD: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Tên khu vực nên viết hoa chữ cái đầu
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
            >
              {editingRegion ? "Cập nhật" : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-all"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý khu vực</h1>
              <p className="text-gray-600">Quản lý các khu vực đặt rạp chiếu phim trên toàn quốc</p>
            </div>
            
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus size={20} />
              Tạo khu vực mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số khu vực</p>
                <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {regions.filter(r => r.status === 1).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tạm ngưng</p>
                <p className="text-2xl font-bold text-red-600">
                  {regions.filter(r => r.status === 0).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Layers size={20} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm khu vực..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : regions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Regions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regions.map((region, index) => (
                <div
                  key={region.region_id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <MapPin size={24} className="text-white" />
                      </div>
                      
                      <button
                        onClick={() => handleToggleStatus(region)}
                        disabled={updatingId === region.region_id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          region.status === 1 ? "bg-green-500" : "bg-gray-300"
                        } ${updatingId === region.region_id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            region.status === 1 ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {region.region_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Khu vực {region.region_name}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${region.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${region.status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {region.status === 1 ? "Đang hoạt động" : "Tạm ngưng"}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleEdit(region)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Pencil size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination />}
          </>
        )}
      </div>

      {/* Modal Form */}
      {showForm && <ModalForm />}
    </div>
  );
};

export default RegionManagement;

// Add these styles to your global CSS or tailwind.config.js
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
`;