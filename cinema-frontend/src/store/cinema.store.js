import { create } from "zustand";

export const useCinemaStore = create((set) => ({
  selectedCinema: null,

  setCinema: (cinema) =>
    set({
      selectedCinema: cinema
    })
}));