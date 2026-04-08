import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Search, ChevronLeft, ChevronRight, Clock, Film, MapPin, Tv, Languages, Eye, Edit, Trash2 } from 'lucide-react';
import showtimeApi from '../../../api/showtime.api';
import cinemaApi from '../../../api/cinema.api';
import roomApi from '../../../api/room.api';
import { useNavigate } from 'react-router-dom';

const ShowtimeManagement = () => {
  const navigate = useNavigate();

  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  /* ================= INIT ================= */
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);

    const res = await cinemaApi.getAll();
    const cinemaList = res.data || [];
    setCinemas(cinemaList);

    if (cinemaList.length > 0) {
      const firstCinema = cinemaList[0];
      setSelectedCinema(firstCinema.cinema_id);
      await fetchRooms(firstCinema.cinema_id);
    }
  };

  const fetchRooms = async (cinemaId) => {
    const res = await roomApi.getByCinema(cinemaId);
    const roomList = res.data || [];

    setRooms(roomList);
    setSelectedRoom(roomList?.[0]?.room_id || '');
  };

  const fetchShowtimes = async (cinemaId, date, roomId, page = 1) => {
    if (!cinemaId || !date) return;

    setLoading(true);
    try {
      const res = await showtimeApi.getByCinema({
        cinema_id: cinemaId,
        room_id: roomId,
        date,
        page,
        limit: pagination.limit,
      });

      setData(res.data || []);
      setPagination(res.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO SEARCH ================= */
  useEffect(() => {
    fetchShowtimes(selectedCinema, selectedDate, selectedRoom, 1);
  }, [selectedCinema, selectedRoom, selectedDate]);

  const handleCinemaChange = async (id) => {
    setSelectedCinema(id);
    await fetchRooms(id);
  };

  const handlePageChange = (page) => {
    fetchShowtimes(selectedCinema, selectedDate, selectedRoom, page);
  };

  const formatTime = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);

    const f = (d) =>
      `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

    return `${f(s)} - ${f(e)}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'NOW_SHOWING':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'UPCOMING':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Đã chiếu';
      case 'NOW_SHOWING':
        return 'Đang chiếu';
      case 'UPCOMING':
        return 'Sắp chiếu';
      default:
        return status;
    }
  };

  const cinemaName = cinemas.find(c => c.cinema_id == selectedCinema)?.cinema_name;
  const roomName = rooms.find(r => r.room_id == selectedRoom)?.room_name;

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
          <div className="p-4 bg-gray-50 border-b">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <th key={j} className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((k) => (
                  <tr key={k} className="border-t">
                    {[1, 2, 3, 4, 5].map((l) => (
                      <td key={l} className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có suất chiếu</h3>
      <p className="text-gray-500 mb-6">Hiện tại chưa có suất chiếu nào cho ngày đã chọn</p>
      <button
        onClick={() => navigate('/admin/showtimes/create')}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
      >
        <Plus size={20} />
        Thêm lịch chiếu mới
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý suất chiếu</h1>
          <p className="text-gray-600">Quản lý lịch chiếu phim theo rạp, phòng và thời gian</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <MapPin size={16} className="inline mr-1" />
                Rạp chiếu
              </label>
              <select 
                value={selectedCinema} 
                onChange={(e) => handleCinemaChange(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {cinemas.map((c) => (
                  <option key={c.cinema_id} value={c.cinema_id}>{c.cinema_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Tv size={16} className="inline mr-1" />
                Phòng chiếu
              </label>
              <select 
                value={selectedRoom} 
                onChange={(e) => setSelectedRoom(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {rooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>{r.room_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar size={16} className="inline mr-1" />
                Ngày chiếu
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/admin/showtimes/create')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Thêm lịch chiếu
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {cinemaName && roomName && selectedDate && !loading && data.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{cinemaName}</h2>
                <p className="text-blue-100 flex items-center gap-2">
                  <Tv size={16} />
                  Phòng {roomName}
                  <span className="mx-2">•</span>
                  <Calendar size={16} />
                  {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="font-semibold">{data[0]?.rooms?.reduce((total, room) => total + room.showtimes.length, 0) || 0}</span> suất chiếu
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Showtimes List */}
            <div className="space-y-6">
              {data.map((cinema) => (
                <div key={cinema.cinema_id}>
                  {cinema.rooms.map((room) => (
                    <div key={room.room_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                      {/* Room Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <Tv size={20} className="text-blue-600" />
                              {room.room_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {room.showtimes.length} suất chiếu
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Showtimes Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phim</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Định dạng</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Ngôn ngữ</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Thời gian</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {room.showtimes.map((s, index) => (
                              <tr key={s.showtime_id} className="hover:bg-gray-50 transition-colors duration-150 group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                      <Film size={18} className="text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-900">{s.movie_title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                    {s.format}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center gap-1 text-sm">
                                    <Languages size={14} className="text-gray-500" />
                                    {s.language === 'SUB' ? 'Phụ đề' : 'Lồng tiếng'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2 text-orange-600 font-medium">
                                    <Clock size={16} />
                                    {formatTime(s.start_time, s.end_time)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(s.status)}`}>
                                    {getStatusText(s.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button 
                                      onClick={() => navigate(`/admin/showtimes/${s.showtime_id}/edit`)}
                                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Chỉnh sửa"
                                    >
                                      <Edit size={18} className="text-blue-600" />
                                    </button>
                                    <button 
                                      onClick={() => navigate(`/admin/showtimes/${s.showtime_id}`)}
                                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Xem chi tiết"
                                    >
                                      <Eye size={18} className="text-gray-600" />
                                    </button>
                                    <button 
                                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Xóa"
                                    >
                                      <Trash2 size={18} className="text-red-500" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShowtimeManagement;