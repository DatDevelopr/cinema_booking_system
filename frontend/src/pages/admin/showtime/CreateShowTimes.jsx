import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import showtimeApi from "../../../api/showtime.api";
import { movieApi } from "../../../api/movie.api";
import roomApi from "../../../api/room.api";
import cinemaApi from "../../../api/cinema.api";
import useToast from "../../../hooks/useToastSimple";
import {
  Film,
  Monitor,
  Clock,
  Calendar,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Ticket,
  Video,
  Languages,
  Calendar as CalendarIcon,
  X,
  Building2,
  ChevronDown,
  Sunrise,
  Sun,
  SunMedium,
  SunDim,
  Moon,
  Star,
  CloudMoon,
  Coffee
} from "lucide-react";

const CreateShowtime = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preRoomId = searchParams.get("room_id");
  const preCinemaId = searchParams.get("cinema_id");
  
  const hasRedirected = useRef(false);

  const [movies, setMovies] = useState([]);
  const [room, setRoom] = useState(null);
  const [cinema, setCinema] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    movie_id: "",
    room_id: preRoomId || "",
    start_time: "",
    format: "2D",
    language: "SUB",
  });

  // Quick time slots (chỉ để gợi ý)
  const quickTimeSlots = [
    { label: "Sáng sớm", time: "08:00", icon: Sunrise, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Buổi sáng", time: "10:00", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Buổi trưa", time: "12:00", icon: SunMedium, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Buổi chiều", time: "14:00", icon: SunDim, color: "text-orange-400", bg: "bg-orange-50" },
    { label: "Xế chiều", time: "16:00", icon: Coffee, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Buổi tối", time: "18:00", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Tối muộn", time: "20:00", icon: Star, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Khuya", time: "22:00", icon: CloudMoon, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  /* ================= CHECK PARAM ================= */
  useEffect(() => {
    if (!preRoomId && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.warning("Vui lòng chọn phòng từ trang quản lý suất chiếu");
      navigate("/admin/showtimes", { replace: true });
    }
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);

        const movieRes = await movieApi.getAll({ limit: 1000 });
        const movieList = movieRes?.data?.data || [];
        setMovies(movieList);

        if (preRoomId) {
          const roomRes = await roomApi.getById(preRoomId);
          const roomData = roomRes?.data || roomRes;
          setRoom(roomData);
          
          const cinemaId = preCinemaId || roomData?.cinema_id;
          if (cinemaId) {
            const cinemaRes = await cinemaApi.getById(cinemaId);
            const cinemaData = cinemaRes?.data || cinemaRes;
            setCinema(cinemaData);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [preRoomId, preCinemaId]);

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

  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, start_time: value }));
    if (touched.start_time) {
      validateField("start_time", value);
    }
  };

  const handleQuickTimeSelect = (time) => {
    if (!form.start_time) return;
    
    // Lấy phần date từ start_time hiện tại
    const currentDate = form.start_time.split("T")[0];
    if (currentDate) {
      const newDateTime = `${currentDate}T${time}:00`;
      setForm(prev => ({ ...prev, start_time: newDateTime }));
      if (touched.start_time) {
        validateField("start_time", newDateTime);
      }
    }
  };

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "movie_id":
        if (!value) error = "Vui lòng chọn phim";
        break;
      case "start_time":
        if (!value) {
          error = "Vui lòng chọn thời gian bắt đầu";
        } else {
          const selected = new Date(value);
          const now = new Date();
          
          if (isNaN(selected.getTime())) {
            error = "Thời gian không hợp lệ";
          } else if (selected < now) {
            error = "Không thể chọn thời gian trong quá khứ";
          }
          if (selectedMovie?.release_date && !error) {
            const releaseDate = new Date(selectedMovie.release_date);
            releaseDate.setHours(0, 0, 0, 0);
            if (selected < releaseDate) {
              error = "Phim chưa đến ngày khởi chiếu";
            }
          }
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validate = () => {
    const newTouched = { movie_id: true, start_time: true };
    const movieError = validateField("movie_id", form.movie_id);
    const timeError = validateField("start_time", form.start_time);
    
    setTouched(newTouched);
    return !movieError && !timeError;
  };

  /* ================= COMPUTED ================= */
  const selectedMovie = useMemo(
    () => movies.find((m) => m.movie_id == form.movie_id),
    [movies, form.movie_id]
  );

  const endTime = useMemo(() => {
    if (!selectedMovie || !form.start_time) return null;
    return new Date(
      new Date(form.start_time).getTime() + selectedMovie.duration * 60000
    );
  }, [selectedMovie, form.start_time]);

  // Lấy ngày hiện tại cho datetime-local (YYYY-MM-DDThh:mm)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = getCurrentDateTime();
  
  // Get datetime 30 days from now
  const getMaxDateTime = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T23:59`;
  };
  
  const maxDateTime = getMaxDateTime();

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.warning("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await showtimeApi.create({
        ...form,
        room_id: preRoomId,
      });
      toast.success("Tạo suất chiếu thành công");
      setTimeout(() => {
        navigate("/admin/showtimes");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Lấy phần date để hiển thị quick time slots
  const selectedDate = form.start_time?.split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
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
                  <Ticket size={20} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo suất chiếu mới</h1>
              </div>
              <p className="text-gray-600 ml-13">Thêm lịch chiếu phim vào hệ thống</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin suất chiếu</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-3">Nhập thông tin chi tiết của suất chiếu</p>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Movie Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Film size={16} className="text-blue-600" />
                    Chọn phim <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="movie_id"
                      value={form.movie_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer ${
                        errors.movie_id && touched.movie_id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <option value="">-- Chọn phim --</option>
                      {movies.map((m) => (
                        <option key={m.movie_id} value={m.movie_id}>
                          {m.title} ({m.duration} phút)
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                  {errors.movie_id && touched.movie_id && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.movie_id}
                    </p>
                  )}
                </div>

                {/* Start Time - DateTime Local */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CalendarIcon size={16} className="text-blue-600" />
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleDateTimeChange}
                      onBlur={handleBlur}
                      min={minDateTime}
                      max={maxDateTime}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.start_time && touched.start_time
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    />
                  </div>

                  {/* Quick Time Slots - chỉ hiển thị khi đã chọn ngày */}
                  {selectedDate && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Clock size={12} />
                        Chọn nhanh khung giờ:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickTimeSlots.map((slot) => {
                          const Icon = slot.icon;
                          const isActive = form.start_time?.includes(slot.time);
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => handleQuickTimeSelect(slot.time)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                isActive
                                  ? "bg-blue-600 text-white shadow-md"
                                  : `${slot.bg} ${slot.color} hover:shadow-sm`
                              }`}
                            >
                              <Icon size={14} className={isActive ? "text-white" : slot.color} />
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {errors.start_time && touched.start_time && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.start_time}
                    </p>
                  )}
                </div>

                {/* Format & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Video size={16} className="text-blue-600" />
                      Định dạng
                    </label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <select
                        name="format"
                        value={form.format}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer hover:border-blue-400"
                      >
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="IMAX">IMAX</option>
                        <option value="4DX">4DX</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Languages size={16} className="text-blue-600" />
                      Ngôn ngữ
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <select
                        name="language"
                        value={form.language}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer hover:border-blue-400"
                      >
                        <option value="SUB">Phụ đề</option>
                        <option value="DUB">Lồng tiếng</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Room Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Monitor size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Phòng chiếu</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Thông tin phòng được chọn</p>
              </div>
              
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Monitor size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{room?.room_name || "Không xác định"}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Building2 size={12} />
                        <span>{cinema?.cinema_name || "Đang tải..."}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-100">
                    <div>
                      <p className="text-xs text-gray-500">Số hàng</p>
                      <p className="text-sm font-semibold text-gray-900">{room?.rows || 0} hàng</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ghế / hàng</p>
                      <p className="text-sm font-semibold text-gray-900">{room?.seats_per_row || 0} ghế</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Tổng số ghế</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(room?.rows || 0) * (room?.seats_per_row || 0)} ghế
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {selectedMovie && form.start_time && endTime && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Thông tin suất chiếu</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Xem trước thông tin</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <Film size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedMovie.title}</p>
                      <p className="text-xs text-gray-500">{selectedMovie.duration} phút</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Ngày chiếu:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(form.start_time).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Giờ chiếu:</span>
                      <span className="font-medium text-blue-600">
                        {new Date(form.start_time).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Kết thúc:</span>
                      <span className="font-medium text-gray-700">
                        {endTime.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Định dạng:</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                        {form.format}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Ngôn ngữ:</span>
                      <span className="text-gray-700">{form.language === "SUB" ? "Phụ đề" : "Lồng tiếng"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
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
                      Tạo suất chiếu
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/showtimes")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-all"
                >
                  <X size={18} />
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateShowtime;