import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roomApi } from "../../../api/room.api";
import { cinemaApi } from "../../../api/cinema.api";
import {
  ArrowLeft,
  Building2,
  LayoutGrid,
  Pencil,
  Save,
  X,
  Monitor,
  Info,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit3
} from "lucide-react";

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    cinema_id: "",
    room_name: "",
    rows: 0,
    seats_per_row: 0,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);

        const [roomRes, cinemaRes] = await Promise.all([
          roomApi.getById(id),
          cinemaApi.getAll({ limit: 1000 }),
        ]);

        const room = roomRes.data;

        setForm({
          cinema_id: room.cinema_id,
          room_name: room.room_name,
          rows: room.rows,
          seats_per_row: room.seats_per_row,
        });

        setCinemas(cinemaRes.data?.data || cinemaRes.data || []);
      } catch (err) {
        console.error(err);
        alert("Không thể tải thông tin phòng");
        navigate("/admin/rooms");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  /* ================= HANDLE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  /* ================= VALIDATE ================= */
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "room_name":
        if (!value.trim()) error = "Tên phòng không được để trống";
        else if (value.length < 2) error = "Tên phòng phải có ít nhất 2 ký tự";
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validate = () => {
    const newTouched = { room_name: true };
    const error = validateField("room_name", form.room_name);
    setTouched(newTouched);
    return !error;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await roomApi.update(id, { room_name: form.room_name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert("Cập nhật thành công! 🎉");
      navigate("/admin/rooms");
    } catch (err) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REDIRECT ================= */
  const goToSeatEditor = () => {
    navigate(`/admin/rooms/${id}/seats`);
  };

  /* ================= PREVIEW ================= */
  const renderSeats = () => {
    const rows = Number(form.rows);
    const cols = Number(form.seats_per_row);
    const displayRows = Math.min(rows, 10);
    const displayCols = Math.min(cols, 12);

    return (
      <div className="space-y-2">
        {Array.from({ length: displayRows }).map((_, i) => {
          const rowChar = String.fromCharCode(65 + i);

          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 text-center">
                <span className="text-xs font-semibold text-gray-400">{rowChar}</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: displayCols }).map((_, j) => {
                  const seatNumber = j + 1;
                  
                  return (
                    <div
                      key={j}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200 transition-all hover:bg-gray-200 hover:scale-105"
                    >
                      {seatNumber}
                    </div>
                  );
                })}
                {cols > displayCols && (
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] bg-gray-100 text-gray-400">
                    ...
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {rows > displayRows && (
          <div className="text-center text-xs text-gray-400 pt-2">
            ... và {rows - displayRows} hàng khác
          </div>
        )}
      </div>
    );
  };

  const totalSeats = form.rows * form.seats_per_row;
  const selectedCinema = cinemas.find(c => c.cinema_id === form.cinema_id);

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin phòng...</p>
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
                    <Monitor size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa phòng chiếu</h1>
                </div>
                <p className="text-gray-600 ml-13">Cập nhật thông tin và cấu hình ghế ngồi</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/admin/rooms")}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition-all"
              >
                <X size={18} />
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT - FORM */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin phòng chiếu</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-3">Thông tin cơ bản của phòng</p>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Cinema Display */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" />
                    Rạp chiếu
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={selectedCinema?.cinema_name || "Đang tải..."}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Không thể thay đổi rạp sau khi tạo</p>
                </div>

                {/* Room Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Monitor size={16} className="text-blue-600" />
                    Tên phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="room_name"
                    value={form.room_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="VD: Phòng VIP 1, Phòng Chiếu 2D..."
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.room_name && touched.room_name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  />
                  {errors.room_name && touched.room_name && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.room_name}
                    </p>
                  )}
                </div>

                {/* Room Info Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Cấu hình ghế</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{totalSeats.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-100">
                    <div>
                      <p className="text-xs text-gray-500">Số hàng</p>
                      <p className="text-sm font-semibold text-gray-900">{form.rows} hàng</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ghế / hàng</p>
                      <p className="text-sm font-semibold text-gray-900">{form.seats_per_row} ghế</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Info size={12} />
                    <span>Cấu hình ghế không thể thay đổi sau khi tạo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - PREVIEW & ACTIONS */}
          <div className="space-y-6">
            {/* Seat Editor Button */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Quản lý ghế ngồi</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Tùy chỉnh ghế VIP và cấu hình chi tiết</p>
              </div>
              
              <div className="p-6">
                <button
                  onClick={goToSeatEditor}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
                >
                  <Pencil size={18} />
                  Chỉnh sửa sơ đồ ghế
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Tùy chỉnh ghế VIP, xem trước sơ đồ chi tiết
                </p>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Sơ đồ ghế (Preview)</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Xem trước cấu hình ghế ngồi</p>
              </div>
              
              <div className="p-6">
                {/* Screen */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-48 h-1.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full"></div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                      MÀN HÌNH CHIẾU
                    </div>
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="flex justify-center overflow-x-auto">
                  {renderSeats()}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                      <span className="text-gray-500">Ghế thường</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Info size={12} />
                      <span>Chi tiết ghế VIP xem trong trang chỉnh sửa ghế</span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Info size={12} />
                    <span>Preview hiển thị tối đa 10 hàng và 12 cột</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoom;