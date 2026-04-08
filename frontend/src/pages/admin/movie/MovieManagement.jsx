import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { movieApi } from "../../../api/movie.api";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  Search,
  Film,
  Clock,
  Calendar,
  User,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Clapperboard,
  X,
  Image as ImageIcon,
  Play,
  Youtube,
  XCircle
} from "lucide-react";

// ==================== MOVIE POSTER COMPONENT ====================
const MoviePoster = memo(({ movie, onOpenTrailer, onEdit }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const hasTrailer = movie.trailer_url && movie.trailer_url?.trim() !== "";

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    onOpenTrailer();
  };

  return (
    <div className="relative w-24 h-32 flex-shrink-0 group">
      {/* Loading Skeleton */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse flex flex-col items-center justify-center shadow-md">
          <Film size={28} className="text-gray-400 animate-pulse" />
          <div className="mt-2 w-12 h-1.5 bg-gray-300 rounded-full animate-pulse" />
        </div>
      )}

      {/* Actual Image */}
      {!imageError && movie.poster_url ? (
        <img
          src={movie.poster_url}
          alt={movie.title}
          className={`w-full h-full object-cover rounded-xl shadow-md transition-all duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-105 group-hover:shadow-xl'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
            <ImageIcon size={28} className="text-white relative z-10" />
          </div>
          <span className="text-white text-[10px] font-medium mt-2 px-2 text-center line-clamp-2">
            {movie.title}
          </span>
        </div>
      )}

      {/* Status Badge on Image */}
      {movie.status == 0 && (
        <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-lg font-medium z-10">
          Ẩn
        </div>
      )}

      {/* Duration Badge on Image */}
      {movie.duration && (
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-lg flex items-center gap-1 z-10">
          <Clock size={10} />
          {movie.duration}'
        </div>
      )}

      {/* Play Trailer Badge */}
      {hasTrailer && (
        <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-lg flex items-center gap-1 z-10">
          <Play size={10} />
          Trailer
        </div>
      )}

      {/* Hover Overlay with Quick Actions */}
      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={handleEditClick}
          className="bg-white/90 backdrop-blur-sm text-blue-600 p-1.5 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:bg-white"
          title="Chỉnh sửa phim"
        >
          <Eye size={14} />
        </button>
        
        {hasTrailer && (
          <button
            onClick={handleTrailerClick}
            className="bg-red-500/90 backdrop-blur-sm text-white p-1.5 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:bg-red-600"
            title="Xem trailer"
          >
            <Play size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

MoviePoster.displayName = 'MoviePoster';

// ==================== TRAILER MODAL COMPONENT ====================
const TrailerModal = memo(({ isOpen, movie, onClose, onEdit }) => {
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    if (isOpen && movie?.trailer_url) {
      const id = getYouTubeVideoId(movie.trailer_url);
      setVideoId(id);
    }
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;

  const handleClose = () => {
    onClose();
    setVideoId(null);
  };

  const handleEdit = () => {
    handleClose();
    onEdit(movie.movie_id);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div 
        className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
              <Youtube size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Trailer phim: {movie.title}
              </h3>
              <p className="text-xs text-gray-400">Xem trước giới thiệu phim</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XCircle size={24} className="text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
        
        {/* Video Player */}
        <div className="relative bg-black">
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={`Trailer phim ${movie.title}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                <Youtube size={40} className="text-red-500" />
              </div>
              <p className="text-gray-400 text-center mb-2">
                Không thể tải video trailer
              </p>
              <p className="text-gray-500 text-sm text-center max-w-md">
                {movie.trailer_url || "Chưa có trailer cho phim này"}
              </p>
              {movie.trailer_url && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Youtube size={18} />
                  Xem trên YouTube
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Movie Info */}
        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-300">{movie.duration} phút</span>
              </div>
              {movie.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Chỉnh sửa phim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TrailerModal.displayName = 'TrailerModal';

// ==================== HELPER FUNCTIONS ====================
const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    
    if (urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }
    
    if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1];
    }
    
    if (urlObj.pathname.includes('/shorts/')) {
      return urlObj.pathname.split('/shorts/')[1];
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
  }
  
  return null;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// ==================== MAIN COMPONENT ====================
const MovieManagement = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [updatingId, setUpdatingId] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await movieApi.getAll({
        page,
        limit,
        search: debouncedSearch,
        sortField,
        sortOrder,
      });
      setMovies(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalItems(res.data?.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats with useMemo
  const stats = useMemo(() => ({
    total: totalItems,
    showing: movies.filter(m => m.status == 1).length,
    hidden: movies.filter(m => m.status == 0).length,
    hasTrailer: movies.filter(m => m.trailer_url?.trim()).length,
  }), [movies, totalItems]);

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
    setPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }
    const Icon = sortOrder === "ASC" ? ArrowUp : ArrowDown;
    return <Icon size={14} className="text-blue-600" />;
  };

  // Actions
  const handleToggleStatus = async (movie, e) => {
    e.stopPropagation();
    
    const confirmMessage = `Bạn có chắc muốn ${movie.status == 1 ? 'ẩn' : 'hiển thị'} phim "${movie.title}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdatingId(movie.movie_id);
      await movieApi.toggleStatus(movie.movie_id);
      setMovies((prev) =>
        prev.map((m) =>
          m.movie_id === movie.movie_id
            ? { ...m, status: m.status == 1 ? 0 : 1 }
            : m
        )
      );
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const goToEdit = (id) => {
    navigate(`/admin/movies/${id}/edit`);
  };

  const openTrailerModal = (movie) => {
    setSelectedMovie(movie);
    setShowTrailerModal(true);
  };

  const closeTrailerModal = () => {
    setShowTrailerModal(false);
    setSelectedMovie(null);
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 bg-gray-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <div className="flex gap-4">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Film size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có phim</h3>
      <p className="text-gray-500 mb-6">
        {search ? "Không tìm thấy phim phù hợp" : "Chưa có phim nào được thêm vào hệ thống"}
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
          onClick={() => navigate("/admin/movies/create")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Thêm phim mới
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
          Hiển thị <span className="font-medium text-gray-700">{movies.length}</span> trên{' '}
          <span className="font-medium text-gray-700">{totalItems}</span> phim
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Clapperboard size={20} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý phim</h1>
              </div>
              <p className="text-gray-600 ml-13">
                Quản lý danh sách phim, trạng thái và thông tin chi tiết
              </p>
            </div>
            
            <button
              onClick={() => navigate("/admin/movies/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus size={20} />
              Thêm phim mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng số phim</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Film size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang hiển thị</p>
                <p className="text-2xl font-bold text-green-600">{stats.showing}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đã ẩn</p>
                <p className="text-2xl font-bold text-orange-600">{stats.hidden}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <EyeOff size={20} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Có trailer</p>
                <p className="text-2xl font-bold text-red-600">{stats.hasTrailer}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Youtube size={20} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Sort Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tìm kiếm phim
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên phim, đạo diễn..."
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

            <div className="flex gap-2 items-end">
              <button
                onClick={() => handleSort("title")}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  sortField === "title" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Tên phim
                {renderSortIcon("title")}
              </button>
              <button
                onClick={() => handleSort("release_date")}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  sortField === "release_date" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Ngày chiếu
                {renderSortIcon("release_date")}
              </button>
              <button
                onClick={() => handleSort("duration")}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  sortField === "duration" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Thời lượng
                {renderSortIcon("duration")}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : movies.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Movies Grid */}
            <div className="grid grid-cols-1 gap-4">
              {movies.map((movie) => (
                <div
                  key={movie.movie_id}
                  onClick={() => goToEdit(movie.movie_id)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <MoviePoster 
                        movie={movie} 
                        onOpenTrailer={() => openTrailerModal(movie)}
                        onEdit={() => goToEdit(movie.movie_id)}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {movie.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {movie.director && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <User size={14} />
                                  <span>{movie.director}</span>
                                </div>
                              )}
                              {movie.duration && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock size={14} />
                                  <span>{movie.duration} phút</span>
                                </div>
                              )}
                              {movie.release_date && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar size={14} />
                                  <span>{formatDate(movie.release_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleToggleStatus(movie, e)}
                              disabled={updatingId === movie.movie_id}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                                movie.status == 1 ? "bg-green-500" : "bg-gray-300"
                              } ${updatingId === movie.movie_id ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                  movie.status == 1 ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span
                              className={`px-3 py-1 text-xs rounded-full ${
                                movie.status == 1
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {movie.status == 1 ? "Đang hiển thị" : "Đã ẩn"}
                            </span>
                          </div>
                        </div>

                        {movie.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {movie.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {movie.genres?.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <Star size={14} className="text-yellow-500 flex-shrink-0" />
                              <span className="text-xs text-gray-500">
                                {movie.genres.map(g => g.genre_name).join(' • ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
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

      {/* Trailer Modal */}
      <TrailerModal 
        isOpen={showTrailerModal}
        movie={selectedMovie}
        onClose={closeTrailerModal}
        onEdit={goToEdit}
      />

      {/* Global Styles */}
      <style>{`
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

        .ml-13 {
          margin-left: 3.25rem;
        }
      `}</style>
    </div>
  );
};

export default MovieManagement;