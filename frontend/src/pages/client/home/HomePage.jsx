
import Banner from "./components/Banner";

// import QuickBooking from "../../../components/QuickBooking/QuickBooking";
import MovieTabs from "./components/MovieTabs";
// import MovieGrid from "../../../components/common/MovieGrid";
import "./home.css";

const Home = () => {
 
  return (
    <div className="home-page">
      <Banner />
      <MovieTabs />
    </div>
  );
};

export default Home;
