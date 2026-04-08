import { useState, useEffect } from "react";
import "./style/movie_tabs.css";

export default function MovieTabs({ active = "now", onChange }) {
  const [currentActive, setCurrentActive] = useState(active);

  useEffect(() => {
    setCurrentActive(active);
  }, [active]);

  const handleTabClick = (type) => {
    setCurrentActive(type);
    onChange?.(type);
  };

  return (
    <div className="movie-tabs">
      <button
        className={`tab-item ${currentActive === "soon" ? "active" : ""}`}
        onClick={() => handleTabClick("soon")}
      >
        Phim sắp chiếu
      </button>

      <button
        className={`tab-item ${currentActive === "now" ? "active" : ""}`}
        onClick={() => handleTabClick("now")}
      >
        Phim đang chiếu
      </button>
    </div>
  );
}