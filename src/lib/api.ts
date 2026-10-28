import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getDeviceId, getDeviceName } from "./device";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

let accessToken: string | null = null;
let onSessionLost: ((reason: string) => void) | null = null;

export const setAccessToken = (t: string | null) => {
  accessToken = t;
  if (t) {
    localStorage.setItem("admin.access_token", t);
  } else {
    localStorage.removeItem("admin.access_token");
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem("admin.access_token");
  }
  return accessToken;
};

export const setSessionLostHandler = (fn: (reason: string) => void) => {
  onSessionLost = fn;
};

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  cfg.headers.set("X-Device-Id", getDeviceId());
  cfg.headers.set("X-Device-Name", getDeviceName());
  cfg.headers.set("X-Client-Type", "admin");
  const token = getAccessToken();
  if (token) {
    cfg.headers.set("Authorization", `Bearer ${token}`);
  }
  return cfg;
});

let refreshing: Promise<string | null> | null = null;
let lastRefreshError: string | null = null;

async function doRefresh(): Promise<string | null> {
  try {
    lastRefreshError = null;
    const { data } = await axios.post(
      "/auth/refresh",
      {},
      {
        withCredentials: true,
        headers: {
          "X-Device-Id": getDeviceId(),
          "X-Client-Type": "admin",
        },
      }
    );
    const newToken = data?.accessToken ?? null;
    setAccessToken(newToken);
    return newToken;
  } catch (err: any) {
    lastRefreshError = err?.response?.data?.message ?? "REFRESH_FAILED";
    setAccessToken(null);
    return null;
  } finally {
    refreshing = null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<any>) => {
    const cfg = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    const url = cfg?.url ?? "";
    const origMsg = error.response?.data?.message;

    if (status === 401 && origMsg === "SESSION_REVOKED") {
      setAccessToken(null);
      onSessionLost?.("Tài khoản quản trị vừa đăng nhập trên thiết bị khác");
      return Promise.reject(error);
    }

    const skip = ["/auth/login", "/auth/refresh", "/auth/2fa/verify"];
    if (status === 401 && !cfg?._retried && !skip.some((s) => url.includes(s))) {
      cfg._retried = true;
      refreshing ??= doRefresh();
      const token = await refreshing;
      if (token) {
        return api(cfg);
      }
      const isRevoked =
        origMsg === "SESSION_REVOKED" ||
        lastRefreshError === "SESSION_REVOKED";
      onSessionLost?.(
        isRevoked
          ? "Tài khoản quản trị vừa đăng nhập trên thiết bị khác"
          : "Phiên quản trị viên đã hết hạn hoặc bị thu hồi"
      );
    }
    return Promise.reject(error);
  }
);

export const apiError = (e: unknown, fallback = "Có lỗi xảy ra"): string => {
  const err = e as AxiosError<any>;
  if (err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
    return "Không thể kết nối đến máy chủ backend (Port 4000). Vui lòng kiểm tra lại dịch vụ.";
  }
  const msg = err?.response?.data?.message;
  if (msg) {
    return Array.isArray(msg) ? msg.join(", ") : String(msg);
  }
  if (err?.message && !err.message.includes("AxiosError")) {
    return err.message;
  }
  return fallback;
};
