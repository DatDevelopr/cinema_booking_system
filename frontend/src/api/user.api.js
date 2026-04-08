import axiosClient from "./axiosClient";

export const userApi = {
  getUserAll: () => axiosClient.get("/user"),
  createUser: (data) => axiosClient.post("/user", data),
  getUserById: (id) => axiosClient.get(`/user/${id}`),
  updateUser: (id, data) => axiosClient.put(`/user/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/user/${id}`),
  
  getProfile: () => axiosClient.get("/user/profile"),
  updateAvatar: (data) => axiosClient.patch("/user/avatar", data),
  updateProfile: (data) => axiosClient.put("/user/profile", data),
};
export default userApi;
