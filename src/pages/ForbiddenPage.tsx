import React from "react";
import { useAdminAuthStore } from "../store/admin-auth.store";
import { useThemeStore } from "../store/theme.store";
import { useI18nStore } from "../store/i18n.store";

export function ForbiddenPage() {
  const { user, logout } = useAdminAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { lang, toggleLang, t } = useI18nStore();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "var(--bg-app)",
        position: "relative",
      }}
    >
      {/* Top Controls: Theme & Language Switchers */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={toggleLang}
          className="btn-secondary"
          style={{
            padding: "6px 12px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          title={t("language")}
        >
          <span>{lang === "vi" ? "🇻🇳" : "🇬🇧"}</span>
          <span>{lang.toUpperCase()}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{
            padding: "6px 12px",
            fontSize: "0.8125rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          title={theme === "dark" ? t("lightTheme") : t("darkTheme")}
        >
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          <span style={{ textTransform: "capitalize" }}>{theme}</span>
        </button>
      </div>

      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "36px 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "var(--shadow-elevation)",
        }}
      >
        <div style={{ fontSize: "3rem" }}>🛑</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f43f5e" }}>
          {t("forbiddenTitle")}
        </h1>

        <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
          {t("forbiddenDescPrefix")} <strong style={{ color: "var(--primary)" }}>{user?.email}</strong>{" "}
          {t("forbiddenDescSuffix")}
        </p>

        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          {t("forbiddenHelp")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          <button onClick={() => logout()} className="btn-primary" style={{ width: "100%" }}>
            {t("logoutThisAccount")}
          </button>
          <a
            href={import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5174"}
            className="btn-secondary"
            style={{ width: "100%", textDecoration: "none", textAlign: "center" }}
          >
            {t("backToUserAppAction")}
          </a>
        </div>
      </div>
    </div>
  );
}
