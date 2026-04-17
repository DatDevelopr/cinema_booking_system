import axiosClient from "./axiosClient";

export const serviceApi = {
  /* ================= USER ================= */

  // lấy danh sách service active (cho user chọn combo)
  getActive: () => {
    return axiosClient.get("/services/active");
  },

  /* ================= ADMIN ================= */

  // lấy tất cả (có phân trang, search, filter)
  getAll: (params) => {
    return axiosClient.get("/services", {
      params,
    });
  },

  // lấy chi tiết
  getById: (id) => {
    return axiosClient.get(`/services/${id}`);
  },

  /* ================= CREATE ================= */
  create: (data) => {
    return axiosClient.post("/services", data);
  },

  /* ================= UPDATE ================= */
  update: (id, data) => {
    return axiosClient.put(`/services/${id}`, data);
  },

  /* ================= DELETE ================= */
  delete: (id) => {
    return axiosClient.delete(`/services/${id}`);
  },

  /* ================= TOGGLE STATUS ================= */
  toggleStatus: (id) => {
    return axiosClient.patch(`/services/${id}/toggle`);
  },
};

export default serviceApi;