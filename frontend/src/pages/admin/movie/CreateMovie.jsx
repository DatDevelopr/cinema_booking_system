import { useEffect, useState } from "react";
import { movieApi } from "../../../api/movie.api";
import { genreApi } from "../../../api/genre.api";
import UploadApi from "../../../api/upload.api";
import { useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToastSimple";
import {
  Film,
  Video,
  Calendar,
  Clock,
  User,
  Globe,
  FileText,
  ArrowLeft,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
  Users,
  Tag,
  Eye,
  EyeOff,
  Youtube,
  Loader2
} from "lucide-react";

const CreateMovie = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreLoading, setGenreLoading] = useState(true);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    title: "",
    director: "",
    actors: "",
    description: "",
    duration: "",
    release_date: "",
    poster_url: "",
    trailer_url: "",
    country: "",
    status: 1,
  });

  /* ================= LOAD GENRES ================= */
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreApi.getAll();
        setGenres(data);
      } catch (err) {
        console.log(err);
        setGenres([]);
        toast.error("Không thể tải danh sách thể loại");
      } finally {
        setGenreLoading(false);
      }
    };

    fetchGenres();
  }, [toast]);

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Tên phim không được để trống";
        if (value.length < 2) return "Tên phim phải có ít nhất 2 ký tự";
        return "";
      case "duration":
        if (!value) return "Thời lượng không được để trống";
        if (value < 1) return "Thời lượng phải lớn hơn 0";
        if (value > 500) return "Thời lượng không hợp lệ (tối đa 500 phút)";
        return "";
      case "release_date":
        if (value && isNaN(new Date(value).getTime())) {
          return "Ngày khởi chiếu không hợp lệ";
        }
        return "";
      case "trailer_url":
        if (value && value.trim() !== "") {
          if (!value.includes("youtube.com") && !value.includes("youtu.be")) {
            return "URL trailer phải là link YouTube hợp lệ";
          }
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.title = validateField("title", form.title);
    newErrors.duration = validateField("duration", form.duration);
    newErrors.release_date = validateField("release_date", form.release_date);
    newErrors.trailer_url = validateField("trailer_url", form.trailer_url);
    
    setErrors(newErrors);
    const isValid = !Object.values(newErrors).some(error => error && error !== "");
    
    if (!isValid) {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return isValid;
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, form[name])
    }));
  };

  /* ================= GENRE ================= */
  const handleGenreChange = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Chỉ chọn file ảnh!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Ảnh phải nhỏ hơn 2MB!");
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const res = await UploadApi.uploadFile(file);
      setForm((prev) => ({
        ...prev,
        poster_url: res.url,
      }));
      toast.success("Tải ảnh lên thành công");
    } catch {
      toast.error("Upload thất bại");
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleUpload(file);
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
    handleUpload(file);
  };

  const removeImage = () => {
    setPreview("");
    setForm(prev => ({ ...prev, poster_url: "" }));
    toast.info("Đã xóa ảnh");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = ["title", "duration", "release_date", "trailer_url"];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    if (!validateForm()) {
      toast.warning("Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (selectedGenres.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một thể loại cho phim");
      return;
    }

    try {
      setLoading(true);

      const createData = {
        ...form,
        duration: Number(form.duration),
        status: Number(form.status),
        genre_ids: selectedGenres,
      };

      if (!createData.trailer_url) delete createData.trailer_url;
      if (!createData.release_date) delete createData.release_date;
      if (!createData.director) delete createData.director;
      if (!createData.actors) delete createData.actors;
      if (!createData.country) delete createData.country;
      if (!createData.description) delete createData.description;

      await movieApi.create(createData);
      toast.success("Tạo phim thành công");
      setTimeout(() => {
        navigate("/admin/movies");
      }, 1500);
    } catch (err) {
      console.error("Create error:", err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi tạo phim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
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
                <Film size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Thêm phim mới</h1>
            </div>
            <p className="text-gray-600 ml-13">Nhập thông tin chi tiết về bộ phim</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN - Main Form */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-3">Các thông tin chính của phim</p>
              </div>
              
              <div className="p-6 space-y-5">
                <Input
                  label="Tên phim *"
                  icon={<Film size={16} />}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && errors.title}
                  placeholder="VD: Avengers: Endgame"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Đạo diễn"
                    icon={<User size={16} />}
                    name="director"
                    value={form.director}
                    onChange={handleChange}
                    placeholder="VD: Anthony Russo, Joe Russo"
                  />

                  <Input
                    label="Quốc gia"
                    icon={<Globe size={16} />}
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="VD: USA, UK, Korea"
                  />
                </div>

                <Input
                  label="Diễn viên"
                  icon={<Users size={16} />}
                  name="actors"
                  value={form.actors}
                  onChange={handleChange}
                  placeholder="VD: Robert Downey Jr., Chris Evans"
                />

                <Textarea
                  label="Mô tả"
                  icon={<FileText size={16} />}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Nhập nội dung mô tả về bộ phim..."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Thời lượng *"
                    icon={<Clock size={16} />}
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.duration && errors.duration}
                    placeholder="phút"
                    required
                  />

                  <Input
                    label="Ngày khởi chiếu"
                    icon={<Calendar size={16} />}
                    type="date"
                    name="release_date"
                    value={form.release_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.release_date && errors.release_date}
                    helperText="Có thể là ngày trong quá khứ hoặc tương lai"
                  />

                  <Input
                    label="Trailer URL"
                    icon={<Youtube size={16} className="text-red-500" />}
                    name="trailer_url"
                    value={form.trailer_url}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.trailer_url && errors.trailer_url}
                    placeholder="https://www.youtube.com/watch?v=... (không bắt buộc)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Poster Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Poster phim</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Tải lên ảnh poster cho phim</p>
              </div>
              
              <div className="p-6">
                {!preview && !form.poster_url ? (
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
                      src={preview || form.poster_url}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                      onError={() => {
                        setPreview("");
                      }}
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

            {/* Genres Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Thể loại</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Chọn thể loại cho phim (có thể chọn nhiều)</p>
              </div>
              
              <div className="p-6">
                {genreLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                  </div>
                ) : genres.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">Không có thể loại</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                    {genres.map((g) => (
                      <button
                        key={g.genre_id}
                        type="button"
                        onClick={() => handleGenreChange(g.genre_id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedGenres.includes(g.genre_id)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {g.genre_name}
                        {selectedGenres.includes(g.genre_id) && (
                          <Check size={12} className="inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {selectedGenres.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Đã chọn: <span className="font-medium text-gray-700">{selectedGenres.length}</span> thể loại
                    </p>
                  </div>
                )}
                {selectedGenres.length === 0 && !genreLoading && (
                  <p className="text-xs text-orange-500 mt-2">
                    Vui lòng chọn ít nhất một thể loại
                  </p>
                )}
              </div>
            </div>

            {/* Status & Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Trạng thái & Hành động</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Trạng thái hiển thị
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
                      <Eye size={16} />
                      Hiển thị
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
                      <EyeOff size={16} />
                      Ẩn
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Tạo phim
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/movies")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-all"
                >
                  <X size={18} />
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */
const Input = ({ label, icon, error, helperText, required, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
      }`}
    />
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
    {helperText && !error && (
      <p className="text-xs text-gray-400 mt-1">{helperText}</p>
    )}
  </div>
);

const Textarea = ({ label, icon, error, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
        error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
      }`}
    />
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

export default CreateMovie;