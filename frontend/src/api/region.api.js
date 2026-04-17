import axiosClient from "./axiosClient";

export const regionApi = {
  getAll: () => axiosClient.get("/regions"),
  getAllRegion: (params) => axiosClient.get("/regions/get-all", { params }),

  // ===============================
  // GET REGION BY ID
  // ===============================
  getById: (id) => axiosClient.get(`/regions/${id}`),

  // ===============================
  // CREATE REGION
  // ===============================
  create: (data) => axiosClient.post("/regions", data),

  // ===============================
  // UPDATE REGION
  // ===============================
  update: (id, data) => axiosClient.put(`/regions/${id}`, data),

  // ===============================
  // DELETE REGION
  // ===============================
  remove: (id) => axiosClient.delete(`/regions/${id}`),
};
export default regionApi;
