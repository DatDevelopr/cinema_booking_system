import { useState, useEffect } from "react";
import { cinemaApi } from "../../../api/cinema.api";
import UploadApi from "../../../api/upload.api";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  Building2,
  MapPin,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  Map,
  Navigation,
  AlertCircle,
  Globe,
  Trash2,
  Loader2,
  CheckCircle
} from "lucide-react";

const center = [21.0285, 105.8542];

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationMarker = ({ form, setForm }) => {
  useMapEvents({
    click(e) {
      setForm((prev) => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      }));
    },
  });

  return form.latitude && form.longitude ? (
    <Marker position={[form.latitude, form.longitude]} icon={customIcon} draggable />
  ) : null;
};

const EditCinema = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [regions, setRegions] = useState([]);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    cinema_name: "",
    address: "",
    region_id: "",
    description: "",
    latitude: "",
    longitude: "",
    image: "",
  });

  useEffect(() => {
    fetchRegions();
    fetchCinema();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await cinemaApi.getRegions();
      setRegions(res.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCinema = async () => {
    try {
      setFetching(true);
      const res = await cinemaApi.getById(id);
      const cinema = res.data || res;
      setForm(cinema);
      setPreview(cinema.image);
    } catch (err) {
      console.error(err);
      alert("Không thể tải thông tin rạp");
      navigate("/admin/cinemas");
    } finally {
      setFetching(false);
    }
  };

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "cinema_name":
        if (!value.trim()) error = "Tên rạp không được để trống";
        else if (value.length < 2) error = "Tên rạp phải có ít nhất 2 ký tự";
        break;
      case "region_id":
        if (!value) error = "Vui lòng chọn khu vực";
        break;
      case "address":
        if (!value.trim()) error = "Địa chỉ không được để trống";
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  /* ================= UPLOAD ================= */
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh phải nhỏ hơn 5MB");
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const res = await UploadApi.uploadFile(file);
      setForm((prev) => ({ ...prev, image: res.url }));
    } catch {
      alert("Upload ảnh thất bại");
      setPreview(form.image);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setForm(prev => ({ ...prev, image: "" }));
  };

  /* ================= SUBMIT ================= */
  const validateForm = () => {
    const fields = ["cinema_name", "region_id", "address"];
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await cinemaApi.update(id, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert("Cập nhật rạp thành công! 🎉");
      navigate("/admin/cinemas");
    } catch (error) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa rạp này? Hành động này không thể hoàn tác.");
    if (!confirm) return;

    try {
      await cinemaApi.delete(id);
      alert("Xóa rạp thành công!");
      navigate("/admin/cinemas");
    } catch (error) {
      alert(error?.response?.data?.message || "Không thể xóa rạp. Vui lòng kiểm tra lại.");
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải thông tin rạp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa rạp chiếu</h1>
                </div>
                <p className="text-gray-600 ml-13">Cập nhật thông tin chi tiết về rạp chiếu phim</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-3">Các thông tin chính của rạp</p>
                </div>
                
                <div className="p-6 space-y-5">
                  {/* Cinema Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600" />
                      Tên rạp <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="cinema_name"
                      value={form.cinema_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="VD: CGV Vincom Center, Lotte Cinema..."
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.cinema_name && touched.cinema_name
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    />
                    {errors.cinema_name && touched.cinema_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.cinema_name}
                      </p>
                    )}
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe size={16} className="text-blue-600" />
                      Khu vực <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="region_id"
                        value={form.region_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer ${
                          errors.region_id && touched.region_id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-blue-400"
                        }`}
                      >
                        <option value="">Chọn khu vực</option>
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
                    {errors.region_id && touched.region_id && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.region_id}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={3}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                        errors.address && touched.address
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    />
                    {errors.address && touched.address && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" />
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Mô tả về rạp chiếu, tiện ích, quy mô..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none hover:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Image Upload Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Hình ảnh rạp</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Cập nhật ảnh đại diện cho rạp</p>
                </div>
                
                <div className="p-6">
                  {preview ? (
                    <div className="relative group">
                      <img
                        src={preview}
                        alt="Cinema preview"
                        className="w-full h-48 object-cover rounded-xl shadow-md"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <label className="cursor-pointer bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-lg hover:bg-white transition">
                          <Upload size={18} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
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
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 bg-gray-50 hover:bg-blue-50/20"
                      onClick={() => document.getElementById("imageInput").click()}
                    >
                      <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">
                        Click để chọn ảnh
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, JPEG (Tối đa 5MB)
                      </p>
                      <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                      />
                    </div>
                  )}
                  {uploading && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                      <span className="text-sm">Đang tải lên...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <Map size={18} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Vị trí trên bản đồ</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Click để chọn vị trí rạp trên bản đồ</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <MapContainer
                      center={form.latitude ? [form.latitude, form.longitude] : center}
                      zoom={13}
                      style={{ height: "320px", width: "100%" }}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker form={form} setForm={setForm} />
                    </MapContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Vĩ độ</label>
                      <div className="relative">
                        <Navigation size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          value={form.latitude || ""}
                          readOnly
                          placeholder="Chọn trên bản đồ"
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Kinh độ</label>
                      <div className="relative">
                        <Navigation size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          value={form.longitude || ""}
                          readOnly
                          placeholder="Chọn trên bản đồ"
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <AlertCircle size={10} />
                    Click trực tiếp trên bản đồ để thay đổi vị trí
                  </p>
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
                        Đang lưu...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle size={18} />
                        Đã lưu
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Cập nhật rạp
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/cinemas")}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-all"
                  >
                    <X size={18} />
                    Hủy bỏ
                  </button>
                </div>
              </div>

              {/* Delete Card */}
              <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Trash2 size={18} className="text-red-600" />
                        <h3 className="font-semibold text-red-700">Xóa rạp chiếu</h3>
                      </div>
                      <p className="text-sm text-red-600/70">
                        Chỉ có thể xóa khi rạp chưa có phòng chiếu
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                      Xóa rạp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCinema;