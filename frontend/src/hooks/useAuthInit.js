import { useEffect } from "react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export const useAuthInit = () => {
  const login = useAuthStore((s) => s.login);
  const setAuthLoading = useAuthStore((s) => s.setAuthLoading);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authApi.refresh();

        // ⭐ Login lại bằng refresh token
        login({
          access_token: res.data.accessToken,
          user: res.data.user,
        });

      } catch {
        console.log("Chưa đăng nhập");
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, [login, setAuthLoading]);
};
