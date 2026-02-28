import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthLoading: true, // ⭐ thêm trạng thái loading

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  login: ({ accessToken, user }) =>
    set({
      accessToken,
      user,
      isAuthLoading: false,
    }),

  logout: () =>
    set({
      accessToken: null,
      user: null,
      isAuthLoading: false,
    }),
}));
