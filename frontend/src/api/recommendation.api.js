import axiosClient from "./axiosClient";

const recommendationApi = {
  /*
  ==========================================
  PHIM HOT TUẦN NÀY
  GET /api/recommendations/hot
  ==========================================
  */
  getHotMovies: async () => {
    const res = await axiosClient.get(
      "/recommendations/hot"
    );
    return res.data;
  },

  /*
  ==========================================
  LƯU SỞ THÍCH NGƯỜI DÙNG
  POST /api/recommendations/preferences

  body:
  {
    genre_ids: [1, 2, 3]
  }
  ==========================================
  */
  saveUserPreferences: async (genre_ids) => {
    const res = await axiosClient.post(
      "/recommendations/preferences",
      {
        genre_ids,
      }
    );
    return res.data;
  },

  /*
  ==========================================
  TRACK USER VIEW MOVIE
  POST /api/recommendations/track-view

  body:
  {
    movie_id: 12
  }
  ==========================================
  */
  trackMovieView: async (movie_id) => {
    const res = await axiosClient.post(
      "/recommendations/track-view",
      {
        movie_id,
      }
    );
    return res.data;
  },

  /*
  ==========================================
  AI GỢI Ý PHIM CHO USER
  GET /api/recommendations/for-you
  ==========================================
  */
  getForYouMovies: async () => {
    const res = await axiosClient.get(
      "/recommendations/for-you"
    );
    return res.data;
  },
  
  /*
  ==========================================
  AI RECOMMENDATION
  Node.js -> Python FastAPI
  ==========================================
  */

  // 🤖 AI gợi ý phim thật sự
  getAIMovies: async (user_id) => {
    const res = await axiosClient.get(
      `/recommendations/ai/${user_id}`
    );
    return res.data;
  },
};

export default recommendationApi;