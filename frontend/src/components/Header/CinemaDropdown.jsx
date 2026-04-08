// CinemaDropdown.jsx
import { useEffect, useState } from "react";
import { cinemaApi } from "../../api/cinema.api";
import { useCinemaStore } from "../../store/cinema.store";
import { ChevronDown, MapPin, Film, ChevronRight } from "lucide-react";

const CinemaDropdown = () => {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { selectedCinema, setCinema } = useCinemaStore();

  useEffect(() => {
    const fetchData = async () => {
      const regions = await cinemaApi.getRegions();

      const data = await Promise.all(
        regions.map(async (r) => {
          const res = await cinemaApi.getByRegion(r.region_id);
          return {
            ...r,
            cinemas: res.data || [],
          };
        }),
      );

      setRegions(data);
      setActiveRegion(data[0]);

      if (data[0]?.cinemas?.length > 0) {
        setCinema(data[0].cinemas[0]);
      }
    };

    fetchData();
  }, []);

  const handleSelectCinema = (cinema) => {
    setCinema(cinema);
    setOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Dropdown */}
      <div 
        className="hidden md:block relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-200 group"
          style={{ backgroundColor: '#fff7ed', color: '#fc8905' }}
        >
          <MapPin size={16} className="text-orange-500" />
          <span className="font-medium text-sm max-w-[150px] truncate">
            {selectedCinema?.cinema_name || "Chọn rạp"}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-[500px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
            <div className="flex">
              {/* Regions List */}
              <div className="w-1/2 border-r border-gray-100">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Khu vực</h3>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {regions.map((r) => (
                    <li
                      key={r.region_id}
                      onMouseEnter={() => setActiveRegion(r)}
                      className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                        activeRegion?.region_id === r.region_id
                          ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      style={{ 
                        backgroundColor: activeRegion?.region_id === r.region_id ? '#fff7ed' : '',
                        color: activeRegion?.region_id === r.region_id ? '#fc8905' : ''
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{r.region_name}</span>
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cinemas List */}
              <div className="w-1/2">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Rạp chiếu</h3>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {Array.isArray(activeRegion?.cinemas) && activeRegion.cinemas.length > 0 ? (
                    activeRegion.cinemas.map((c) => (
                      <li
                        key={c.cinema_id}
                        onClick={() => handleSelectCinema(c)}
                        className="px-4 py-3 cursor-pointer hover:bg-orange-50 transition-all duration-200 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <Film size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{c.cinema_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.address}</p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 text-center text-gray-400 text-sm">
                      Không có rạp chiếu
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl"
          style={{ backgroundColor: '#fff7ed', color: '#fc8905' }}
        >
          <MapPin size={16} />
          <span className="text-sm font-medium max-w-[120px] truncate">
            {selectedCinema?.cinema_name || "Chọn rạp"}
          </span>
          <ChevronDown size={14} />
        </button>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden animate-slideLeft overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Chọn rạp chiếu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {regions.map((region) => (
                <div key={region.region_id} className="border-b border-gray-100">
                  <div className="px-4 py-3 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700">{region.region_name}</h3>
                  </div>
                  <div>
                    {region.cinemas?.map((cinema) => (
                      <div
                        key={cinema.cinema_id}
                        onClick={() => handleSelectCinema(cinema)}
                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800">{cinema.cinema_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{cinema.address}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default CinemaDropdown;