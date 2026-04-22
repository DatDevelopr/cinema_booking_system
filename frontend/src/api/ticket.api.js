import axiosClient from "./axiosClient";

export const ticketApi = {
  /* ================= BOOK TICKET ================= */
  book: (data) => {
    return axiosClient.post("/tickets/book", data);
  },

  /* ================= MY TICKETS ================= */
  getMyTickets: () => {
    return axiosClient.get("/tickets/my");
  },

  /* ================= TICKET DETAIL ================= */
  getById: (ticketId) => {
    return axiosClient.get(`/tickets/${ticketId}`);
  },

  /* ================= CANCEL TICKET ================= */
  cancel: (ticketId) => {
    return axiosClient.post(`/tickets/${ticketId}/cancel`);
  },
};

export default ticketApi;