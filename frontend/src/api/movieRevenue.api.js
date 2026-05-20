// src/api/movieRevenue.api.js

import axiosClient from "./axiosClient";

export const movieRevenueApi = {
  /*
  ==================================================
  1. DOANH THU TỔNG THEO PHIM
  GET /api/movie-revenue/summary
  ==================================================
  */

  getSummary: (params = {}) => {
    return axiosClient.get(
      "/movie-revenue/summary",
      { params }
    );
  },

  /*
  ==================================================
  2. TOP PHIM DOANH THU CAO NHẤT
  GET /api/movie-revenue/top
  ==================================================
  */

  getTopMovies: (params = {}) => {
    return axiosClient.get(
      "/movie-revenue/top",
      { params }
    );
  },

  /*
  ==================================================
  3. BIỂU ĐỒ DOANH THU THEO PHIM
  GET /api/movie-revenue/chart
  ==================================================
  */

  getChart: (params = {}) => {
    return axiosClient.get(
      "/movie-revenue/chart",
      { params }
    );
  },

  /*
  ==================================================
  4. CHI TIẾT DOANH THU 1 PHIM
  GET /api/movie-revenue/:movieId
  ==================================================
  */

  getDetail: (movieId, params = {}) => {
    return axiosClient.get(
      `/movie-revenue/${movieId}`,
      { params }
    );
  },

  /*
  ==================================================
  5. EXPORT DOANH THU THEO PHIM RA EXCEL
  GET /api/movie-revenue/export
  ==================================================
  */
  exportExcel: (params = {}) => {
    return axiosClient.get("/movie-revenue/export", {
      params,
      responseType: "blob", // Đảm bảo nhận về file dưới dạng blob
    });
  }
};

export default movieRevenueApi;