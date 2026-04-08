import { useState, useEffect } from "react";
import { regionApi } from "../../api/region.api";
import { cinemaApi } from "../../api/cinema.api";
import { movieApi } from "../../api/movie.api";
import "../../assets/styles/quickBooking.css";

export default function QuickBooking({ cinemaId: initialCinemaId }) {
  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCinema, setSelectedCinema] = useState(initialCinemaId || "");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [regions, setRegions] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await regionApi.getAll();
        setRegions(res.data);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };
    fetchRegions();
  }, []);

  // Fetch cinemas when region changes
  useEffect(() => {
    if (selectedRegion) {
      const fetchCinemas = async () => {
        setLoading(true);
        try {
          const res = await cinemaApi.getByRegion(selectedRegion);
          setCinemas(res.data);
        } catch (error) {
          console.error("Error fetching cinemas:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCinemas();
    } else {
      setCinemas([]);
    }
  }, [selectedRegion]);

  // Fetch movies when cinema changes (assuming API supports cinema filter)
  useEffect(() => {
    if (selectedCinema) {
      const fetchMovies = async () => {
        setLoading(true);
        try {
          // Assuming movieApi.getAll can take cinemaId, else use status "now"
          const res = await movieApi.getAll({ status: "now" }); // TODO: Add cinemaId filter if API supports
          setMovies(res.data);
        } catch (error) {
          console.error("Error fetching movies:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMovies();
    } else {
      setMovies([]);
    }
  }, [selectedCinema]);

  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedCinema("");
    setSelectedMovie("");
    setSelectedDate("");
    setSelectedTime("");
    setStep(2);
  };

  const handleCinemaChange = (e) => {
    const cinemaId = e.target.value;
    setSelectedCinema(cinemaId);
    setSelectedMovie("");
    setSelectedDate("");
    setSelectedTime("");
    setStep(3);
  };

  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    setSelectedMovie(movieId);
    setSelectedDate("");
    setSelectedTime("");
    setStep(4);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime("");
    setStep(5);
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRegion && selectedCinema && selectedMovie && selectedDate && selectedTime) {
      // TODO: Call booking API
      console.log("Booking data:", {
        regionId: selectedRegion,
        cinemaId: selectedCinema,
        movieId: selectedMovie,
        date: selectedDate,
        time: selectedTime
      });
      alert("Đặt vé thành công! (Mock)");
      // Reset form
      setStep(1);
      setSelectedRegion("");
      setSelectedCinema("");
      setSelectedMovie("");
      setSelectedDate("");
      setSelectedTime("");
    } else {
      alert("Vui lòng chọn đầy đủ thông tin!");
    }
  };

  const getSelectedCinemaName = () => {
    const cinema = cinemas.find(c => c.id == selectedCinema);
    return cinema ? cinema.name : "";
  };

  const getSelectedMovieName = () => {
    const movie = movies.find(m => m.id == selectedMovie);
    return movie ? movie.title : "";
  };

  return (
    <section className="quick-booking">
      <div className="container">
        <h2>Đặt vé nhanh</h2>
        <div className="booking-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1. Chọn khu vực</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2. Chọn rạp</div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3. Chọn phim</div>
          <div className={`step ${step >= 4 ? "active" : ""}`}>4. Chọn ngày</div>
          <div className={`step ${step >= 5 ? "active" : ""}`}>5. Chọn giờ</div>
        </div>
        <form onSubmit={handleSubmit} className="booking-form">
          {step >= 1 && (
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              required
              disabled={loading}
            >
              <option value="">Chọn khu vực</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          {step >= 2 && (
            <select
              value={selectedCinema}
              onChange={handleCinemaChange}
              required
              disabled={loading || !selectedRegion}
            >
              <option value="">
                {loading ? "Đang tải rạp..." : "Chọn rạp"}
              </option>
              {cinemas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {step >= 3 && (
            <select
              value={selectedMovie}
              onChange={handleMovieChange}
              required
              disabled={loading || !selectedCinema}
            >
              <option value="">
                {loading ? "Đang tải phim..." : "Chọn phim"}
              </option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          )}

          {step >= 4 && (
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          )}

          {step >= 5 && (
            <select
              value={selectedTime}
              onChange={handleTimeChange}
              required
            >
              <option value="">Chọn giờ</option>
              <option value="10:00">10:00</option>
              <option value="12:00">12:00</option>
              <option value="14:00">14:00</option>
              <option value="16:00">16:00</option>
              <option value="18:00">18:00</option>
              <option value="20:00">20:00</option>
            </select>
          )}

          {step >= 5 && selectedTime && (
            <div className="booking-summary">
              <h3>Tóm tắt đặt vé</h3>
              <p><strong>Khu vực:</strong> {regions.find(r => r.id == selectedRegion)?.name}</p>
              <p><strong>Rạp:</strong> {getSelectedCinemaName()}</p>
              <p><strong>Phim:</strong> {getSelectedMovieName()}</p>
              <p><strong>Ngày:</strong> {selectedDate}</p>
              <p><strong>Giờ:</strong> {selectedTime}</p>
            </div>
          )}

          <button type="submit" className="btn-book" disabled={step < 5 || !selectedTime}>
            Đặt vé
          </button>
        </form>
      </div>
    </section>
  );
}