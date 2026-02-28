import axiosClient from "./axiosClient";

export const userApi = {
  getProfile: () => axiosClient.get("/user/profile"),
  getUserAll: () => axiosClient.get("/user"),
  createUser: (data) => axiosClient.post("/user", data),
  getUserById: (id) => axiosClient.get(`/user/${id}`),
  updateUser: (id, data) => axiosClient.put(`/user/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/user/${id}`),

  updateProfile: (data) =>
    axiosClient.put("/user/profile", data),
};