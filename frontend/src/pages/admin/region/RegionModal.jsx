// components/RegionModal.jsx
import React, { forwardRef } from "react";
import { Pencil, Plus, X, MapPin, Loader2 } from "lucide-react";

const RegionModal = forwardRef(({
  show,
  onClose,
  onSubmit,
  editingRegion,
  regionName,
  setRegionName,
  isSubmitting,
}, ref) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
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
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khu vực
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={ref}
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="VD: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Tên khu vực nên viết hoa chữ cái đầu
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin mx-auto" />
              ) : (
                editingRegion ? "Cập nhật" : "Tạo mới"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-all"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

RegionModal.displayName = "RegionModal";

export default React.memo(RegionModal);