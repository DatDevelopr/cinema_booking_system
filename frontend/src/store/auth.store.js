import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthLoading: true,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      login: (data) =>
        set({
          accessToken: data.access_token,   // giữ nguyên key access_token như bạn đang dùng
          user: data.user,
          isAuthLoading: false,
        }),

      logout: () =>
        set({
          accessToken: null,
          user: null,
          isAuthLoading: false,
        }),

      // Hàm tiện lợi (tùy chọn): kiểm tra đã đăng nhập chưa
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      // Tên key lưu trong localStorage (có thể đổi tùy ý)
      name: 'auth-storage',

      // Sử dụng localStorage (hoặc sessionStorage nếu muốn)
      storage: createJSONStorage(() => localStorage),

      // Chỉ lưu những field cần thiết (tránh lưu dữ liệu nhạy cảm nếu có)
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        // KHÔNG lưu isAuthLoading vì nó nên reset về true khi reload
      }),

      // Optional: debug khi khôi phục state từ storage
      onRehydrateStorage: () => {
        console.log('Auth store đã được khôi phục từ localStorage');
        return (state, error) => {
          if (error) {
            console.error('Lỗi khi khôi phục auth store:', error);
          }
          if (state) {
            // Nếu cần reset loading sau khi khôi phục
            setTimeout(() => {
              useAuthStore.getState().setAuthLoading(false);
            }, 100);
          }
        };
      },
    }
  )
);