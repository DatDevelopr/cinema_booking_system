import axiosClient from "./axiosClient";

export const cinemaApi = {
  /* ===== REGION ===== */
  getRegions: async () => {
    const res = await axiosClient.get("/regions");
    return res.data;
  },

  /* ===== CINEMA ===== */
  getByRegion: async (regionId) => {
    const res = await axiosClient.get("/cinemas", {
      params: { region: regionId },
    });
    return res.data;
  },
};
