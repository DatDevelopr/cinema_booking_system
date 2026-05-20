// Home.jsx
import { useEffect, useState } from "react";
import Banner from "./components/Banner";
import MovieTabs from "./components/MovieTabs";
import AIRecommendationModal from "./components/AIRecommendationModal";
import FloatingAIButton from "./components/FloatingAIButton";
import recommendationApi from "../../../api/recommendation.api";
import { useAuthStore } from "../../../store/auth.store";
import "./home.css";

const Home = () => {
  const { user } = useAuthStore();

  const [openAI, setOpenAI] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // thêm state cho lời dẫn AI
  const [intro, setIntro] = useState("");
  const [reason, setReason] = useState("");
  const [closing, setClosing] = useState("");

  /*
  ==========================================
  Fetch AI Recommendation
  ==========================================
  */
  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      let response;

      /*
      ==========================================
      Nếu đã đăng nhập -> lấy AI recommendation
      Nếu lỗi -> fallback phim hot
      ==========================================
      */
      if (user?.user_id) {
        try {
          response = await recommendationApi.getAIMovies(
            user.user_id
          );
        } catch (err) {
          console.log(
            "AI recommendation failed, fallback hot movies"
          );

          response =
            await recommendationApi.getHotMovies();

          response.intro = `Xin chào ${
            user?.full_name || user?.username || "bạn"
          } 👋`;

          response.reason =
            "Hiện tại hệ thống AI chưa đủ dữ liệu cá nhân hóa, vì vậy chúng tôi đang gợi ý những bộ phim hot nhất tuần này dành cho bạn.";

          response.closing =
            "Chúc bạn có những phút giây xem phim thật tuyệt vời tại rạp 🎬";
        }
      } else {
        /*
        ==========================================
        Chưa đăng nhập -> phim hot
        ==========================================
        */
        response =
          await recommendationApi.getHotMovies();

        response.intro =
          "Xin chào bạn 👋";

        response.reason =
          "Đây là những bộ phim đang được yêu thích nhất tuần này. Đăng nhập để nhận gợi ý cá nhân hóa tốt hơn.";

        response.closing =
          "Cảm ơn bạn đã ghé thăm hệ thống của chúng tôi 🎬";
      }

      /*
      ==========================================
      Set data
      ==========================================
      */
      setMovies(response?.data || []);

      setIntro(
        response?.intro ||
          `Xin chào ${
            user?.full_name || user?.username || "bạn"
          } 👋`
      );

      setReason(
        response?.reason ||
          "Dựa trên lịch sử đặt vé và hành vi xem phim của bạn, AI đã chọn ra những bộ phim phù hợp nhất."
      );

      setClosing(
        response?.closing ||
          "Chúc bạn có trải nghiệm xem phim thật tuyệt vời 🎥"
      );
    } catch (error) {
      console.error(
        "Fetch recommendations error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ==========================================
  Popup auto open lần đầu
  ==========================================
  */
  useEffect(() => {
    const popupSeen = localStorage.getItem(
      "ai_popup_seen"
    );

    if (!popupSeen) {
      setOpenAI(true);
      localStorage.setItem(
        "ai_popup_seen",
        "true"
      );
    }
  }, []);

  /*
  ==========================================
  Fetch khi mở modal
  ==========================================
  */
  useEffect(() => {
    if (openAI) {
      fetchRecommendations();
    }
  }, [openAI]);

  return (
    <div className="home-page min-h-screen bg-gray-50">
      <Banner />
      <MovieTabs />

      {/* AI Recommendation Modal */}
      <AIRecommendationModal
        open={openAI}
        onClose={() => setOpenAI(false)}
        intro={intro}
        reason={reason}
        closing={closing}
        movies={movies}
        loading={loading}
      />

      {/* Floating AI Button */}
      <FloatingAIButton
        onClick={() => setOpenAI(true)}
      />
    </div>
  );
};

export default Home;