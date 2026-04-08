import { useEffect, useState } from "react";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  ArrowUpDown,
  Film,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle,
  Layers,
  Grid3x3
} from "lucide-react";
import { genreApi } from "../../../api/genre.api";

const GenreManagement = () => {
  /* ================= STATE ================= */
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortOrder, setSortOrder] = useState(null); // null | asc | desc

  const [isOpen, setIsOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formName, setFormName] = useState("");

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH DATA ================= */
  const fetchGenres = async () => {
    try {
      setLoading(true);

      const res = await genreApi.get10Genres({
        page,
        limit: 10,
        search: debouncedSearch,
        sortField: sortOrder ? "genre_name" : undefined,
        sortOrder: sortOrder || undefined,
      });

      const { data, pagination } = res.data;

      setGenres(data);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.total);
    } catch (error) {
      console.error("Fetch lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, [page, debouncedSearch, sortOrder]);

  /* ================= SORT ================= */
  const handleSort = () => {
    setPage(1);

    if (!sortOrder) setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder(null);
  };

  /* ================= MODAL ================= */
  const openCreateModal = () => {
    setEditingGenre(null);
    setFormName("");
    setIsOpen(true);
  };

  const openEditModal = (genre) => {
    setEditingGenre(genre);
    setFormName(genre.genre_name);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingGenre(null);
    setFormName("");
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert("Tên thể loại không được để trống");
      return;
    }

    try {
      setLoading(true);

      if (editingGenre) {
        await genreApi.updateGenre(editingGenre.genre_id, {
          genre_name: formName.trim(),
        });
        alert("Cập nhật thành công");
      } else {
        await genreApi.createGenre({
          genre_name: formName.trim(),
        });
        alert("Thêm thành công");
      }

      closeModal();
      fetchGenres();
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 409) {
          alert(message || "Tên thể loại đã tồn tại");
        } else if (status === 400) {
          alert(message || "Dữ liệu không hợp lệ");
        } else {
          alert("Có lỗi xảy ra");
        }
      } else {
        alert("Không kết nối được server");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id, genreName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thể loại "${genreName}"?`)) return;

    try {
      await genreApi.deleteGenre(id);

      if (genres.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchGenres();
      }
      alert("Xóa thành công");
    } catch (error) {
      console.error("Xoá lỗi:", error);
      alert(error?.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
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
        <Tag size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thể loại</h3>
      <p className="text-gray-500 mb-6">
        {search ? "Không tìm thấy thể loại phù hợp" : "Chưa có thể loại nào được thêm"}
      </p>
      {search ? (
        <button
          onClick={() => setSearch("")}
          className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <X size={20} />
          Xóa tìm kiếm
        </button>
      ) : (
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Thêm thể loại mới
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
          Hiển thị <span className="font-medium text-gray-700">{genres.length}</span> trên{' '}
          <span className="font-medium text-gray-700">{totalItems}</span> thể loại
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
              {editingGenre ? <Pencil size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingGenre ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên thể loại
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Hành động, Hài hước, Tình cảm..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Tên thể loại nên viết hoa chữ cái đầu
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
            >
              {editingGenre ? "Cập nhật" : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={closeModal}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Film size={20} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý thể loại</h1>
              </div>
              <p className="text-gray-600 ml-13">
                Quản lý các thể loại phim trong hệ thống
              </p>
            </div>
            
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus size={20} />
              Thêm thể loại
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số thể loại</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Hiển thị</p>
                <p className="text-2xl font-bold text-gray-900">{genres.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Số trang</p>
                <p className="text-2xl font-bold text-gray-900">{totalPages}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Grid3x3 size={20} className="text-purple-600" />
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
              placeholder="Tìm kiếm thể loại phim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : genres.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Genres Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {genres.map((genre, index) => (
                <div
                  key={genre.genre_id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Tag size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Hash size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">#{genre.genre_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {genre.genre_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Thể loại {genre.genre_name.toLowerCase()}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(genre)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(genre.genre_id, genre.genre_name)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
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
      {isOpen && <ModalForm />}

      <style jsx>{`
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

        .ml-13 {
          margin-left: 3.25rem;
        }
      `}</style>
    </div>
  );
};

export default GenreManagement;