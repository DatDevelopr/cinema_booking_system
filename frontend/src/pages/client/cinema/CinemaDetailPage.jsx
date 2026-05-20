import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCinemaStore } from "../../../store/cinema.store";
import cinemaApi from "../../../api/cinema.api";
import recommendationApi from "../../../api/recommendation.api";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  Phone,
  Mail,
  Loader2,
  ChevronRight,
} from "lucide-react";

// Fix icon leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function CinemaDetailPage() {
  const navigate = useNavigate();
  const { cinemaId } = useCinemaStore();
  const [cinema, setCinema] = useState(null);
  const [hotMovies, setHotMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cinemaId) return;
    fetchCinema();
    fetchHotMovies();
  }, [cinemaId]);

  const fetchCinema = async () => {
    try {
      setLoading(true);
      const res = await cinemaApi.getById(cinemaId);
      setCinema(res?.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotMovies = async () => {
    try {
      const res = await recommendationApi.getHotMovies();
      setHotMovies(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!cinema) return null;

  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Tên rạp - Đặt ở trên cùng bên trái */}
        <h1 className="text-2xl font-bold mb-8 text-gray-800">
          {cinema.cinema_name}
        </h1>

        <div className="grid grid-cols-12 gap-12">
          
          {/* CỘT TRÁI - CHI TIẾT RẠP (8 CỘT) */}
          <div className="col-span-12 lg:col-span-8">
            {/* Ảnh lớn */}
            <div className="mb-8">
              <img
                src={cinema.image}
                alt={cinema.cinema_name}
                className="w-full h-auto object-cover rounded-sm"
              />
            </div>

            {/* Nội dung mô tả */}
            <div className="space-y-6 text-[15px] leading-relaxed text-gray-700 italic">
              <p className="whitespace-pre-line">
                {cinema.description || "Đang cập nhật nội dung giới thiệu..."}
              </p>
            </div>

            {/* Thông tin liên hệ - Không dùng card, dùng border-t */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-800">
                Thông tin liên hệ
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-orange-500 mt-1 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Địa chỉ:</strong> {cinema.address}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-orange-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Hotline:</strong> 1900 6467
                  </span>
                </div>
              </div>
            </div>

            {/* Bản đồ - Đơn giản hóa */}
            <div className="mt-10 h-[300px] rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[Number(cinema.latitude || 21.0285), Number(cinema.longitude || 105.8542)]}
                  zoom={15}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[Number(cinema.latitude || 21.0285), Number(cinema.longitude || 105.8542)]} icon={customIcon}>
                    <Popup>{cinema.cinema_name}</Popup>
                  </Marker>
                </MapContainer>
            </div>
          </div>

          {/* CỘT PHẢI - PHIM ĐANG HOT (4 CỘT) */}
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 uppercase tracking-tight">
              PHIM ĐANG HOT
            </h2>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {hotMovies.map((movie, index) => (
                <div key={movie.movie_id || index} className="flex flex-col group cursor-pointer">
                  {/* Poster phim */}
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl mb-3">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Nhãn giới hạn độ tuổi - Giống hình mẫu */}
                    <div className="absolute top-2 left-2">
                      <span className={`
                        px-2 py-0.5 rounded text-white text-[11px] font-bold shadow-sm
                        ${index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-orange-500' : 'bg-red-500'}
                      `}>
                        {index % 3 === 0 ? 'P' : index % 3 === 1 ? 'K' : 'T18'}
                      </span>
                    </div>
                  </div>

                  {/* Tên phim - Căn giữa giống hình mẫu */}
                  <h3 className="text-[15px] font-bold text-center text-blue-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug px-1">
                    {movie.title}
                  </h3>
                </div>
              ))}
            </div>

            {/* Nút xem thêm nếu cần */}
            <div className="mt-10 text-center">
                <button className="text-orange-500 font-bold flex items-center gap-1 mx-auto hover:gap-2 transition-all uppercase text-sm">
                    Xem tất cả phim <ChevronRight size={16} />
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}