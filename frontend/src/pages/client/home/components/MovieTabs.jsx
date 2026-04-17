import { useEffect, useMemo, useState } from "react";
import movieApi from "../../../../api/movie.api";
import MovieCard from "./MovieCard";
import { useCinemaStore } from "../../../../store/cinema.store";

/* ================= TABS ================= */
function MovieTabs({ active, onChange }) {
  const tabs = [
    { id: "now", label: "PHIM ĐANG CHIẾU" },
    { id: "soon", label: "PHIM SẮP CHIẾU" },
  ];

  return (
    <div className="flex justify-center border-b border-gray-200">
      <div className="flex gap-10">
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative py-4 text-lg font-bold uppercase tracking-wide transition
                ${
                  isActive
                    ? "text-orange-500"
                    : "text-gray-400 hover:text-orange-500"
                }`}
            >
              {tab.label}

              <span
                className={`absolute bottom-0 left-0 h-[3px] w-full transition
                  ${isActive ? "bg-orange-500" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================= MAIN ================= */
export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("now");
  const [loading, setLoading] = useState(true);

  // ✅ LẤY cinemaId từ zustand
  const { cinemaId } = useCinemaStore();

  /* ================= FETCH ================= */
  useEffect(() => {
    if (cinemaId) {
      fetchMovies();
    }
  }, [cinemaId]);

  const fetchMovies = async () => {
    try {
      setLoading(true);

      const res = await movieApi.getAllForUser({
        cinema_id: cinemaId, // ✅ QUAN TRỌNG
      });

      setMovies(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const { nowMovies, comingMovies } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 🔥 reset giờ

    const nowMovies = [];
    const comingMovies = [];

    movies.forEach((m) => {
      const releaseDate = new Date(m.release_date);
      releaseDate.setHours(0, 0, 0, 0); // 🔥 reset giờ

      if (releaseDate <= today) {
        nowMovies.push(m); // ✅ đang chiếu
      } else {
        comingMovies.push(m); // ✅ sắp chiếu
      }
    });

    return { nowMovies, comingMovies };
  }, [movies]);
  const renderMovies = activeTab === "now" ? nowMovies : comingMovies;

  /* ================= UI ================= */
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Title */}
      <div className="text-center pt-10">
        <h2 className="text-2xl md:text-3xl font-bold">DANH SÁCH PHIM</h2>
      </div>

      {/* Tabs */}
      <MovieTabs active={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-20 py-10">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải phim...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {renderMovies.map((movie) => (
                <MovieCard key={movie.movie_id} movie={movie} />
              ))}
            </div>

            {renderMovies.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                Không có phim nào
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
