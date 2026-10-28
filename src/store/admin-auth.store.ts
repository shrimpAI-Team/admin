import { create } from "zustand";
import { adminApi, type CurrentAdminUser } from "../api/admin.api";
import { setAccessToken, getAccessToken } from "../lib/api";

interface AdminAuthState {
  user: CurrentAdminUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isNonAdmin: boolean;
  notice: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  setNotice: (n: string | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  status: "loading",
  isNonAdmin: false,
  notice: null,

  setNotice: (notice) => set({ notice }),

  bootstrap: async () => {
    try {
      const me = await adminApi.me();
      if (me && me.role === "ADMIN") {
        set({ user: me, status: "authenticated", isNonAdmin: false });
      } else if (me) {
        // Có tài khoản nhưng không phải role ADMIN
        set({ user: me, status: "unauthenticated", isNonAdmin: true });
      } else {
        set({ user: null, status: "unauthenticated", isNonAdmin: false });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      const notice =
        msg === "SESSION_REVOKED"
          ? "Tài khoản quản trị vừa đăng nhập trên thiết bị khác"
          : null;
      set({ user: null, status: "unauthenticated", isNonAdmin: false, notice });
    }
  },

  login: async (email: string, pass: string) => {
    set({ status: "loading", notice: null });
    try {
      const res = await adminApi.login({ email, password: pass });
      if (res.accessToken) {
        setAccessToken(res.accessToken);
      }
      await get().bootstrap();
    } catch (err) {
      set({ status: "unauthenticated" });
      throw err;
    }
  },

  logout: async (reason?: string) => {
    try {
      await adminApi.logout();
    } catch {}
    setAccessToken(null);
    set({
      user: null,
      status: "unauthenticated",
      isNonAdmin: false,
      notice: reason ?? null,
    });
  },
}));
