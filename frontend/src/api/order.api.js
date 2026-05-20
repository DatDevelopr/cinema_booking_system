import axiosClient from "./axiosClient";

export const orderApi = {
  getById: (id) => {
    return axiosClient.get(`/orders/${id}`);
  },
  getMyOrders: () => {
    return axiosClient.get("/orders/my-orders");
  },
};

export default orderApi;
