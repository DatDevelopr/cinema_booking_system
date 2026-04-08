import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const axiosClient = axios.create({
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

const processQueue = (token) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/refresh-token",
        {},
        { withCredentials: true }
      );

      const newToken = res.data.accessToken;

      useAuthStore.getState().setAccessToken(newToken);

      processQueue(newToken);

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