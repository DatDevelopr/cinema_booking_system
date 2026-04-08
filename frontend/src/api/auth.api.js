import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),
  sendOTP: (email) => axiosClient.post("/otp/send", { email }),

  verifyOTP: (data) => axiosClient.post("/otp/verify", data),
  logout: () => axiosClient.post("/auth/logout"),
  getMe: () => axiosClient.get("/auth/me"),
  refresh: () => axiosClient.post("/auth/refresh-token"),
  forgotPassword: (email) =>
    axiosClient.post("/auth/forgot-password", { email }),

  resetPassword: (data) =>
    axiosClient.post("/auth/reset-password", data),
};