import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { seatApi } from "../../../api/seat.api";
import useToast from "../../../hooks/useToastSimple";
import { 
  ArrowLeft, 
  Save, 
  Armchair, 
  Crown, 
  Heart, 
  Monitor,
  Loader2,
  CheckSquare,
  Square,
  Info,
  Sofa,
  Star,
  Sparkles,
  LayoutGrid,
  MousePointerClick
} from "lucide-react";

const SeatEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  useEffect(() => {
    fetchSeats();
  }, [id]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const res = await seatApi.getByRoom(id);
      setSeats(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách ghế");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (seatId) => {
    setSelected((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const selectAll = () => {
    if (selected.length === seats.length) {
      setSelected([]);
    } else {
      setSelected(seats.map(s => s.seat_id));
    }
  };

  const updateType = async (type) => {
    if (selected.length === 0) {
      toast.warning("Vui lòng chọn ghế cần cập nhật");
      return;
    }

    try {
      setUpdating(true);
      await seatApi.updateMultiple(selected, type);
      toast.success(`Đã cập nhật ${selected.length} ghế thành ${getTypeLabel(type)}`);
      setSelected([]);
      await fetchSeats();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật ghế");
    } finally {
      setUpdating(false);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "NORMAL": return "Ghế thường";
      case "VIP": return "Ghế VIP";
      case "COUPLE": return "Ghế đôi";
      default: return type;
    }
  };

  const groupSeats = () => {
    const map = {};
    seats.forEach((s) => {
      if (!map[s.seat_row]) map[s.seat_row] = [];
      map[s.seat_row].push(s);
    });

    return Object.keys(map)
      .sort()
      .map((row) => ({
        row,
        seats: map[row].sort((a, b) => a.seat_number - b.seat_number),
      }));
  };

  const getSeatStyle = (seat) => {
    const isSelected = selected.includes(seat.seat_id);
    const isHovered = hoveredSeat === seat.seat_id;
    
    if (isSelected) {
      return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300 scale-105";
    }
    
    if (isHovered) {
      return "scale-105 shadow-lg";
    }
    
    switch (seat.seat_type) {
      case "VIP":
        return "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md";
      case "COUPLE":
        return "bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-md";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  const getSeatIcon = (seat) => {
    if (seat.seat_type === "VIP") return <Star size={12} className="text-white" />;
    if (seat.seat_type === "COUPLE") return <Heart size={12} className="text-white" />;
    return <Armchair size={12} />;
  };

  const stats = {
    total: seats.length,
    normal: seats.filter(s => s.seat_type === "NORMAL").length,
    vip: seats.filter(s => s.seat_type === "VIP").length,
    couple: seats.filter(s => s.seat_type === "COUPLE").length,
    selected: selected.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse" />
            <Loader2 size={48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-500 mt-4">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  const rows = groupSeats();
  const maxSeatsPerRow = Math.max(...rows.map(r => r.seats.length), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sofa size={22} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Chỉnh sửa sơ đồ ghế
                </h1>
              </div>
              <p className="text-gray-500 ml-16">Tùy chỉnh loại ghế cho từng vị trí trong rạp</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Tổng số ghế</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <LayoutGrid size={18} className="text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Ghế thường</p>
                <p className="text-2xl font-bold text-gray-800">{stats.normal}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Armchair size={18} className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Ghế VIP</p>
                <p className="text-2xl font-bold text-amber-600">{stats.vip}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Star size={18} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Ghế đôi</p>
                <p className="text-2xl font-bold text-pink-600">{stats.couple}</p>
              </div>
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                <Heart size={18} className="text-pink-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400 mb-1">Đang chọn</p>
                <p className="text-2xl font-bold text-blue-600">{stats.selected}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MousePointerClick size={18} className="text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={selectAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-all hover:border-blue-300"
              >
                {selected.length === seats.length ? <Square size={16} /> : <CheckSquare size={16} />}
                <span className="text-sm font-medium">
                  {selected.length === seats.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </span>
              </button>
              
              <div className="h-8 w-px bg-gray-200 mx-1 hidden lg:block" />
              
              <div className="flex gap-2">
                <button
                  onClick={() => updateType("NORMAL")}
                  disabled={updating}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all disabled:opacity-50 overflow-hidden"
                >
                  <Armchair size={16} />
                  <span className="text-sm">Ghế thường</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
                
                <button
                  onClick={() => updateType("VIP")}
                  disabled={updating}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-md"
                >
                  <Star size={16} />
                  <span className="text-sm">VIP</span>
                  <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                </button>
                
                <button
                  onClick={() => updateType("COUPLE")}
                  disabled={updating}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-md"
                >
                  <Heart size={16} />
                  <span className="text-sm">COUPLE</span>
                </button>
              </div>
            </div>
            
            {updating && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Đang cập nhật...</span>
              </div>
            )}
          </div>
        </div>

        {/* Screen */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-80 h-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full" />
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
              <Monitor size={12} />
              MÀN HÌNH CHIẾU
            </div>
          </div>
        </div>

        {/* Seats Grid - Centered */}
        <div className="flex justify-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 overflow-x-auto">
            <div className="space-y-3 min-w-max">
              {rows.map((row) => (
                <div key={row.row} className="flex items-center gap-4">
                  <div className="w-10 text-center">
                    <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                      {row.row}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* Thêm padding trái để căn giữa */}
                    <div style={{ width: `${(maxSeatsPerRow - row.seats.length) * 36}px` }} />
                    {row.seats.map((seat) => (
                      <button
                        key={seat.seat_id}
                        onClick={() => toggleSelect(seat.seat_id)}
                        onMouseEnter={() => setHoveredSeat(seat.seat_id)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className={`
                          relative w-10 h-10 rounded-xl flex flex-col items-center justify-center
                          text-xs font-medium transition-all duration-200
                          hover:scale-105 cursor-pointer shadow-sm
                          ${getSeatStyle(seat)}
                        `}
                      >
                        {getSeatIcon(seat)}
                        <span className="text-[11px] mt-0.5">{seat.seat_number}</span>
                        
                        {/* Tooltip */}
                        {hoveredSeat === seat.seat_id && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                            {seat.seat_type === "VIP" ? "Ghế VIP" : seat.seat_type === "COUPLE" ? "Ghế đôi" : "Ghế thường"}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <Armchair size={12} className="text-gray-600" />
            </div>
            <span className="text-gray-600">Ghế thường</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Star size={10} className="text-white" />
            </div>
            <span className="text-gray-600">Ghế VIP</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart size={10} className="text-white" />
            </div>
            <span className="text-gray-600">Ghế đôi</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={10} className="text-white" />
            </div>
            <span className="text-gray-600">Đang chọn</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
            <Info size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Click vào ghế để chọn / bỏ chọn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatEditor;