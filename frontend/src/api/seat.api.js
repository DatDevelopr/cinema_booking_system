import axiosClient from "./axiosClient";

export const seatApi = {
  // ✅ GET SEATS BY ROOM
  getByRoom: (roomId) => {
    return axiosClient.get(`/seats/room/${roomId}`);
  },

  // ✅ UPDATE 1 SEAT TYPE
  updateType: (seatId, seat_type) => {
    return axiosClient.put(`/seats/${seatId}/type`, { seat_type });
  },

  // ✅ UPDATE MULTIPLE SEATS
  updateMultiple: (seat_ids, seat_type) => {
    return axiosClient.put(`/seats/bulk`, {
      seat_ids,
      seat_type,
    });
  },

  // ✅ RESET ALL SEATS IN ROOM
  resetByRoom: (roomId) => {
    return axiosClient.put(`/seats/room/${roomId}/reset`);
  },

  // ✅ GET SEAT STATS (optional)
  getStats: (roomId) => {
    return axiosClient.get(`/seats/room/${roomId}/stats`);
  },
};

export default seatApi;