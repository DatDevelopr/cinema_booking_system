import { useEffect, useState } from "react";
import { cinemaApi } from "../../api/cinema.api";
import { useCinemaStore } from "../../store/cinema.store";
import "./style/cinema_dropdown.css";
import "./style/mobile_responsive.css";

const CinemaDropdown = () => {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);

  const { selectedCinema, setCinema } = useCinemaStore();

  useEffect(() => {
    const fetchData = async () => {
      const regions = await cinemaApi.getRegions();

      const data = await Promise.all(
        regions.map(async (r) => {
          const cinemas = await cinemaApi.getByRegion(r.region_id);
          return { ...r, cinemas };
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

  return (
    <div
      className="cinema-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="cinema-btn">
        {selectedCinema?.cinema_name || "Chọn rạp"}
      </button>

      {open && (
        <div className="dropdown-menu">
          {/* REGION */}
          <ul className="region-list">
            {regions.map((r) => (
              <li key={r.region_id} onMouseEnter={() => setActiveRegion(r)}>
                {r.region_name}
              </li>
            ))}
          </ul>

          {/* CINEMA */}
          <ul className="cinema-list">
            {activeRegion?.cinemas?.map((c) => (
              <li
                key={c.cinema_id}
                onClick={() => {
                  setCinema(c);
                  setOpen(false);
                }}
              >
                {c.cinema_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CinemaDropdown;
