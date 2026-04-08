import { useEffect } from "react";
import { useCinemaStore } from "../../../store/cinema.store";

const ShowtimePage = () => {

  const { selectedCinema } = useCinemaStore();

  useEffect(() => {
    if (selectedCinema) {
      console.log("Fetch showtime theo rạp", selectedCinema.cinema_id);

      // gọi API showtime theo cinema
    }
  }, [selectedCinema]);

  return <div>Showtime Page</div>;
};

export default ShowtimePage;