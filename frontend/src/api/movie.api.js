import axiosClient from "./axiosClient";

export const movieApi = {
  /* ================= GET ALL ================= */
  getAllForUser: (params) => {
    return axiosClient.get("/movies/user", {
      params,
    });
  },
  getBySlug: (slug, cinemaId) => {
    return axiosClient.get(`/movies/movie-showtimes/${slug}`, {
      params: { cinema_id: cinemaId },
    });
  },

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

export default movieApi;
