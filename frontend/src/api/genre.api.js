import axiosClient from "./axiosClient";

export const genreApi = {
  
  get10Genres: (params) => axiosClient.get("/genres", { params }),
  createGenre: (data) => axiosClient.post("/genres", data),
  getGenreById: (id) => axiosClient.get(`/genres/${id}`),
  updateGenre: (id, data) => axiosClient.put(`/genres/${id}`, data),
  deleteGenre: (id) => axiosClient.delete(`/genres/${id}`),
  getAll: async () => {
    const res = await axiosClient.get("/genres/all");
    return res.data.data; 
  },
};
export default genreApi;