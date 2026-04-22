import axiosClient from "./axiosClient";

export const orderApi = {
  getById: (id) => {
    return axiosClient.get(`/orders/${id}`);
  },

};

export default orderApi;
