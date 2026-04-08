import axiosClient from "./axiosClient";

export const showtimeApi = {
  /* ================= PUBLIC ================= */

  getByCinema: async (params) => {
    const res = await axiosClient.get("/showtimes/by-cinema", { params });
    return res.data;
  },
  // Lấy danh sách suất chiếu
  getAll: (params) => {
    return axiosClient.get("/showtimes", { params });
  },

  // Lấy chi tiết suất chiếu
  getById: (id) => {
    return axiosClient.get(`/showtimes/${id}`);
  },

  // Lấy sơ đồ ghế theo suất chiếu
  getSeats: (id) => {
    return axiosClient.get(`/showtimes/${id}/seats`);
  },

  /* ================= ADMIN ================= */

  // Tạo suất chiếu
  create: (data) => {
    return axiosClient.post("/showtimes", data);
  },

  // Cập nhật suất chiếu
  update: (id, data) => {
    return axiosClient.put(`/showtimes/${id}`, data);
  },

  // Huỷ suất chiếu (soft delete)
  remove: (id) => {
    return axiosClient.delete(`/showtimes/${id}`);
  },

  // Toggle trạng thái (UPCOMING / CANCELLED / ...)
  toggleStatus: (id) => {
    return axiosClient.patch(`/showtimes/${id}/status`);
  },
};

export default showtimeApi;
