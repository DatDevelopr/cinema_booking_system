import axiosClient from "./axiosClient";

export const movieApi = {
  /* ================= GET ALL ================= */
  getAll: (params) => {
    return axiosClient.get("/movies", {
      params,
    });
  },

  /* ================= GET DETAIL ================= */
  getById: (id) => {
    return axiosClient.get(`/movies/${id}`);
  },

  /* ================= CREATE ================= */
  create: (data) => {
    return axiosClient.post("/movies", data);
  },

  /* ================= UPDATE ================= */
  update: (id, data) => {
    return axiosClient.put(`/movies/${id}`, data);
  },

  /* ================= DELETE (SOFT) ================= */
  delete: (id) => {
    return axiosClient.delete(`/movies/${id}`);
  },

  /* ================= TOGGLE STATUS ================= */
  toggleStatus: (id) => {
    return axiosClient.post(`/movies/${id}/toggle-status`);
  },
};