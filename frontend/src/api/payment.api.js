import axiosClient from "./axiosClient";

export const paymentApi = {
  /**
   * =========================
   * CREATE PAYMENT
   * =========================
   * Tạo link thanh toán → BE trả về paymentUrl
   */
  createPayment: async ({ order_id, payment_method }) => {
    const res = await axiosClient.post("/payment/create", {
      order_id,
      payment_method, // "vnpay" | "momo"
    });

    return res.data;
  },

  /**
   * =========================
   * REDIRECT TO PAYMENT
   * =========================
   * Helper: gọi createPayment rồi redirect luôn
   */
  pay: async ({ order_id, payment_method }) => {
    const res = await paymentApi.createPayment({
      order_id,
      payment_method,
    });

    if (res?.paymentUrl) {
      window.location.href = res.paymentUrl;
    } else {
      throw new Error("Không lấy được link thanh toán");
    }
  },
};