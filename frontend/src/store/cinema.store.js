import { create } from "zustand";

export const useCinemaStore = create((set) => ({
  selectedCinema: null,
  cinemaId: null,

  setCinema: (cinema) =>
    set({
      selectedCinema: cinema,
      cinemaId: cinema?.cinema_id || null,
    })
}));