import axiosClient from "./axiosClient";

export const regionApi = {
  getAll: () => axiosClient.get("/regions")
};
