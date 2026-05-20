import axiosClient from "./axiosClient";

const cinemaRevenueApi = {
  /*
  ==================================================
  API 1
  GET /api/cinema-revenue/summary
  ==================================================
  */
  getSummary: (params = {}) => {
    return axiosClient.get("/cinema-revenue/summary", {
      params,
    });
  },

  /*
  ==================================================
  API 2
  GET /api/cinema-revenue/chart
  ==================================================
  */
  getChart: (params = {}) => {
    return axiosClient.get("/cinema-revenue/chart", {
      params,
    });
  },

  /*
  ==================================================
  API 3
  GET /api/cinema-revenue/top-movies
  ==================================================
  */
  getTopMovies: (params = {}) => {
    return axiosClient.get("/cinema-revenue/top-movies", {
      params,
    });
  },

  /*
  ==================================================
  API 4
  GET /api/cinema-revenue/export-excel
  ==================================================
  */
  exportExcel: (params = {}) => {
    return axiosClient.get("/cinema-revenue/export-excel", {
      params,
      responseType: "blob",
    });
  },

  /*
  ==================================================
  API 5
  GET /api/cinema-revenue/breakdown
  ==================================================
  */
  getBreakdown: (params = {}) => {
    return axiosClient.get("/cinema-revenue/breakdown", {
      params,
    });
  },

  /*
  ==================================================
  API 6
  GET /api/cinema-revenue/top-services
  ==================================================
  */
  getTopServices: (params = {}) => {
    return axiosClient.get("/cinema-revenue/top-services", {
      params,
    });
  },

  /*
  ==================================================
  API 7
  GET /api/cinema-revenue/payment-methods
  ==================================================
  */
  getPaymentMethods: (params = {}) => {
    return axiosClient.get(
      "/cinema-revenue/payment-methods",
      {
        params,
      }
    );
  },

  /*
  ==================================================
  API 8
  GET /api/cinema-revenue/showtime-details
  ==================================================
  */
  getShowtimeDetails: (params = {}) => {
    return axiosClient.get(
      "/cinema-revenue/showtime-details",
      {
        params,
      }
    );
  },
};

export default cinemaRevenueApi;