import { create } from "zustand";
import { adminApi, type CurrentAdminUser } from "../api/admin.api";
import { setAccessToken, getAccessToken } from "../lib/api";

interface AdminAuthState {
  user: CurrentAdminUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isNonAdmin: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  status: "loading",
  isNonAdmin: false,

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
    } catch {
      set({ user: null, status: "unauthenticated", isNonAdmin: false });
    }
  },

  login: async (email: string, pass: string) => {
    set({ status: "loading" });
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

  logout: async () => {
    try {
      await adminApi.logout();
    } catch {}
    setAccessToken(null);
    set({ user: null, status: "unauthenticated", isNonAdmin: false });
  },
}));
