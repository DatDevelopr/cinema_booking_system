import axios from "axios";
import { useAuthStore } from "../store/auth.store";

/* ================= BASE INSTANCE ================= */
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

/* ================= REQUEST ================= */
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= RESPONSE ================= */

let isRefreshing = false;
let queue = [];

const resolveQueue = (token) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await refreshClient.post("/auth/refresh-token");
      const newToken = res.data.accessToken;

      useAuthStore.getState().setAccessToken(newToken);

      resolveQueue(newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return axiosClient(originalRequest);
    } catch (err) {
      useAuthStore.getState().logout();
      window.location.href = "/auth";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
