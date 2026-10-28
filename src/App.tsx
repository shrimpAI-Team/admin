import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAdminAuthStore } from "./store/admin-auth.store";
import { setSessionLostHandler } from "./lib/api";
import { AdminLayout } from "./components/layout/AdminLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { UsersPage } from "./pages/UsersPage";
import { SessionsPage } from "./pages/SessionsPage";
import { AiCenterPage } from "./pages/AiCenterPage";
import { ChatMonitorPage } from "./pages/ChatMonitorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { ForbiddenPage } from "./pages/ForbiddenPage";

import { useThemeStore } from "./store/theme.store";
import { useI18nStore } from "./store/i18n.store";

function AdminProtectedRoute() {
  const { status, isNonAdmin } = useAdminAuthStore();
  const { t } = useI18nStore();

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-app)",
          color: "var(--primary)",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "2.5rem" }} className="pulse-glow">
          🦐
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          {t("loading")}
        </p>
      </div>
    );
  }

  if (isNonAdmin) {
    return <ForbiddenPage />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

export function App() {
  const { bootstrap, logout, status } = useAdminAuthStore();
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    setSessionLostHandler((reason) => {
      void logout(reason);
    });
    void bootstrap();
  }, [bootstrap, logout, initTheme]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const checkSession = () => {
      void bootstrap().catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    const timer = setInterval(checkSession, 10_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", checkSession);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", checkSession);
    };
  }, [status, bootstrap]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/ai-center" element={<AiCenterPage />} />
          <Route path="/chat-monitor" element={<ChatMonitorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
