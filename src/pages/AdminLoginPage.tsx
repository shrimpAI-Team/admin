import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../store/admin-auth.store";
import { useThemeStore } from "../store/theme.store";
import { useI18nStore } from "../store/i18n.store";
import { apiError } from "../lib/api";
import { Alert } from "../components/ui/Alert";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminAuthStore((s) => s.login);
  const notice = useAdminAuthStore((s) => s.notice);
  const setNotice = useAdminAuthStore((s) => s.setNotice);
  const { theme, toggleTheme } = useThemeStore();
  const { lang, toggleLang, t } = useI18nStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("loginValidationErr"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(apiError(err, t("loginFailedErr")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "var(--bg-app)",
        backgroundImage:
          theme === "dark"
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6, 182, 212, 0.15), transparent), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(59, 130, 246, 0.1), transparent)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6, 182, 212, 0.1), transparent), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(59, 130, 246, 0.05), transparent)",
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
          maxWidth: "440px",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "var(--shadow-elevation)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              boxShadow: "0 0 24px rgba(6, 182, 212, 0.4)",
              marginBottom: "16px",
            }}
          >
            🦐
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {t("loginPortalTitle")}
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("loginSubtitle")}
          </p>

          <div
            style={{
              marginTop: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              backgroundColor: "rgba(168, 85, 247, 0.12)",
              color: "#a855f7",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {t("adminRequiredBadge")}
          </div>
        </div>

        {notice && (
          <Alert variant="warning" onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        )}
        {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              {t("adminEmailLabel")}
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shrimp.ai"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              {t("adminPassLabel")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "6px" }}
          >
            {loading ? t("authenticatingBtn") : t("loginSubmitBtn")}
          </button>
        </form>

        {/* Link back to Main App */}
        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "18px" }}>
          <a
            href={import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5174"}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}
          >
            {t("backToClientApp")}
          </a>
        </div>
      </div>
    </div>
  );
}
