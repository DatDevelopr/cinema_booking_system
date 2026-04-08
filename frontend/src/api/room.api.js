import axiosClient from "./axiosClient";

export const roomApi = {

  // ✅ GET ALL (pagination + filter + sort)
  getAll: (params) => {
    return axiosClient.get("/rooms", { params });
  },

  // ✅ GET BY CINEMA
  getByCinema: (cinemaId) => {
    return axiosClient.get(`/rooms/cinema/${cinemaId}`);
  },

  // ✅ GET DETAIL
  getById: (id) => {
    return axiosClient.get(`/rooms/${id}`);
  },

  // ✅ CREATE ROOM
  create: (data) => {
    return axiosClient.post("/rooms", data);
  },

  // ✅ UPDATE ROOM
  update: (id, data) => {
    return axiosClient.put(`/rooms/${id}`, data);
  },

  // ✅ DELETE ROOM
  delete: (id) => {
    return axiosClient.delete(`/rooms/${id}`);
  },

};

export default roomApi;