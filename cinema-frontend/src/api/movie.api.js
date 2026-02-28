import axiosClient from "./axiosClient";

export const movieApi = {
  getAll: () => axiosClient.get("/movies")
};
