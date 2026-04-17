import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serviceApi } from "../../../api/services.api";
import UploadApi from "../../../api/upload.api";
import useToast from "../../../hooks/useToastSimple";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Package,
  DollarSign,
  Layers,
  Tag,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  Utensils,
  Coffee,
  Pizza,
  Info
} from "lucide-react";

const CreateService = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 0,
    status: 1,
    image: "",
  });

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) error = "Tên dịch vụ không được để trống";
        else if (value.length < 2) error = "Tên dịch vụ phải có ít nhất 2 ký tự";
        break;
      case "price":
        if (!value) error = "Giá không được để trống";
        else if (Number(value) <= 0) error = "Giá phải lớn hơn 0";
        break;
      case "category":
        if (!value) error = "Vui lòng chọn loại dịch vụ";
        break;
      case "stock":
        if (value < 0) error = "Số lượng không được âm";
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const fields = ["name", "price", "category"];
    const newTouched = {};
    let isValid = true;
    
    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, form[field]);
      if (error) isValid = false;
    });
    
    setTouched(newTouched);
    return isValid;
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Ảnh phải nhỏ hơn 2MB");
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const res = await UploadApi.uploadFile(file);
      setForm(prev => ({ ...prev, image: res.url }));
      toast.success("Tải ảnh lên thành công");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload ảnh thất bại");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const removeImage = () => {
    setPreview(null);
    setForm(prev => ({ ...prev, image: "" }));
    toast.info("Đã xóa ảnh");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);

      await serviceApi.create({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });

      toast.success("Tạo dịch vụ thành công! 🎉");
      setTimeout(() => {
        navigate("/admin/services");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi tạo dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  // Category options with real icons
  const categories = [
    { value: "FOOD", label: "Đồ ăn", icon: Utensils, color: "from-orange-500 to-red-500", bgColor: "bg-orange-50", textColor: "text-orange-600" },
    { value: "DRINK", label: "Thức uống", icon: Coffee, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { value: "COMBO", label: "Combo", icon: Pizza, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-50", textColor: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Package size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Thêm dịch vụ mới</h1>
            </div>
            <p className="text-gray-600 ml-13">Thêm đồ ăn, thức uống và combo vào hệ thống</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin dịch vụ</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-3">Nhập thông tin chi tiết của dịch vụ</p>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Service Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Tag size={16} className="text-blue-600" />
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="VD: Bắp rang bơ, Coca Cola, Combo 1..."
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name && touched.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  />
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Package size={16} className="text-blue-600" />
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Mô tả chi tiết về dịch vụ..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none hover:border-blue-400"
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign size={16} className="text-blue-600" />
                      Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.price && touched.price
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    />
                    {errors.price && touched.price && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Layers size={16} className="text-blue-600" />
                      Số lượng tồn
                    </label>
                    <input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.stock && touched.stock
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    />
                    {errors.stock && touched.stock && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Package size={16} className="text-blue-600" />
                    Loại dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = form.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, category: cat.value }));
                            setTouched(prev => ({ ...prev, category: true }));
                            validateField("category", cat.value);
                          }}
                          className={`px-4 py-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                            isActive
                              ? `bg-gradient-to-r ${cat.color} text-white shadow-md scale-105`
                              : `${cat.bgColor} ${cat.textColor} hover:scale-105 border border-gray-200`
                          }`}
                        >
                          <Icon size={24} />
                          <span className="text-sm font-semibold">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.category && touched.category && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" />
                    Trạng thái
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, status: 1 }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        form.status === 1
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <CheckCircle size={16} />
                      Đang bán
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, status: 0 }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        form.status === 0
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <X size={16} />
                      Tạm ngưng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Hình ảnh dịch vụ</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Tải lên ảnh cho dịch vụ</p>
              </div>
              
              <div className="p-6">
                {!preview && !form.image ? (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Kéo thả hoặc click để chọn ảnh
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, JPEG (Tối đa 2MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={preview || form.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl shadow-md"
                      onError={() => setPreview(null)}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <label className="cursor-pointer bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-lg hover:bg-white transition">
                        <Upload size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-lg hover:bg-white transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
                {uploading && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Đang tải lên...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-3">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Tạo dịch vụ
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/services")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-all"
                >
                  <X size={18} />
                  Hủy bỏ
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Info size={14} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Thông tin hữu ích</p>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Tên dịch vụ và giá là bắt buộc
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Có thể thêm ảnh sau khi tạo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Dịch vụ sẽ hiển thị ngay sau khi tạo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Giá bán đã bao gồm VAT
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateService;