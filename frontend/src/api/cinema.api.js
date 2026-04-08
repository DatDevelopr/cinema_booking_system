import axiosClient from "./axiosClient";

export const cinemaApi = {
  /* =========================
        REGION
  ========================== */

  // lấy danh sách khu vực
  getRegions: async () => {
    const res = await axiosClient.get("/regions");
    return res.data;
  },

  /* =========================
        CINEMA PUBLIC
  ========================== */

  // lấy danh sách rạp (pagination + filter)
  getAll: async (params) => {
    const res = await axiosClient.get("/cinemas", {
      params,
    });
    return res.data;
  },

  // lấy rạp theo khu vực
  getByRegion: async (regionId) => {
    const res = await axiosClient.get("/cinemas", {
      params: { region: regionId },
    });
    return res.data;
  },

  // chi tiết rạp
  getById: async (id) => {
    const res = await axiosClient.get(`/cinemas/${id}`);
    return res.data;
  },

  /* =========================
        ADMIN CINEMA
  ========================== */

  // tạo rạp
  create: async (data) => {
    const res = await axiosClient.post("/cinemas", data);
    return res.data;
  },

  // cập nhật rạp
  update: async (id, data) => {
    const res = await axiosClient.put(`/cinemas/${id}`, data);
    return res.data;
  },

  // xoá rạp
  delete: async (id) => {
    const res = await axiosClient.delete(`/cinemas/${id}`);
    return res.data;
  },

  // bật / tắt hoạt động rạp
  toggleStatus: async (id, status) => {
    const res = await axiosClient.put(`/cinemas/${id}`, {
      status,
    });
    return res.data;
  },
};
export default cinemaApi;
