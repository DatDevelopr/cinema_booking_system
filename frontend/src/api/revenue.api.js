import axiosClient from "./axiosClient";

const revenueApi = {
  /*
  ==================================================
  1. Tổng quan doanh thu
  GET /api/revenue/summary
  ==================================================
  */
  getSummary: (params = {}) => {
    return axiosClient.get("/revenue/summary", {
      params: {
        type: params.type || "day",
        from: params.from || "",
        to: params.to || "",
      },
    });
  },

  /*
  ==================================================
  2. Biểu đồ doanh thu
  GET /api/revenue/chart
  params:
  - from
  - to
  - type: day | month | year
  ==================================================
  */
  getChart: (params = {}) => {
    return axiosClient.get("/revenue/chart", {
      params: {
        type: params.type || "day",
        from: params.from || "",
        to: params.to || "",
      },
    });
  },

  /*
  ==================================================
  3. Top phim doanh thu cao nhất
  GET /api/revenue/top-movies
  ==================================================
  */
  getTopMovies: (params) => {
    return axiosClient.get("/revenue/top-movies", {
      params,
    });
  },

  /*
  ==================================================
  4. Top dịch vụ doanh thu cao nhất
  GET /api/revenue/top-services
  ==================================================
  */
  getTopServices: (params) => {
    return axiosClient.get("/revenue/top-services", {
      params,
    });
  },

  /*
  ==================================================
  5. Danh sách giao dịch
  GET /api/revenue/transactions
  ==================================================
  */
  getTransactions: (params) => {
    return axiosClient.get("/revenue/transactions", {
      params,
    });
  },

  /*
  ==================================================
  6. Doanh thu theo rạp
  GET /api/revenue/by-cinema
  ==================================================
  */
  getByCinema: (params) => {
    return axiosClient.get("/revenue/by-cinema", {
      params,
    });
  },

  /*
  ==================================================
  7. Đơn hàng gần đây
  GET /api/revenue/recent-orders
  ==================================================
  */
  getRecentOrders: (params) => {
    return axiosClient.get("/revenue/recent-orders", {
      params,
    });
  },

  /*
  ==================================================
  8. Xuất Excel doanh thu
  GET /api/revenue/export
  ==================================================
  */
  exportExcel: (params) => {
    return axiosClient.get("/revenue/export", {
      params,
      responseType: "blob",
    });
  },
};

export default revenueApi;
