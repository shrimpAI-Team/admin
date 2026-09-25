import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../../store/admin-auth.store";
import { useThemeStore } from "../../store/theme.store";
import { useI18nStore } from "../../store/i18n.store";

export function AdminLayout() {
  const { user, logout } = useAdminAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { lang, toggleLang, t } = useI18nStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: t("overview"), icon: "📊", badge: null },
    { to: "/users", label: t("users"), icon: "👥", badge: null },
    { to: "/sessions", label: t("sessions"), icon: "🛡️", badge: "Live" },
    { to: "/ai-center", label: t("aiCenter"), icon: "🦐", badge: null },
    { to: "/chat-monitor", label: t("chatMonitor"), icon: "💬", badge: null },
    { to: "/settings", label: t("settings"), icon: "⚙️", badge: null },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
      {/* Mobile Backdrop */}
      <div
        className={`mobile-backdrop ${mobileMenuOpen ? "backdrop-open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ════════════ SIDEBAR ════════════ */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        {/* Logo & Branding */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                boxShadow: "0 0 16px rgba(6, 182, 212, 0.35)",
              }}
            >
              🦐
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  shrimpAI
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(6, 182, 212, 0.15)",
                    color: "var(--primary)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                  }}
                >
                  ADMIN
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {t("adminConsole")}
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-menu-btn btn-secondary"
            style={{ padding: "4px 8px", fontSize: "0.85rem" }}
            title="Đóng menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "18px 14px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", padding: "0 10px 8px" }}>
            {t("sections")}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "10px",
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "rgba(6, 182, 212, 0.12)" : "transparent",
                border: isActive ? "1px solid rgba(6, 182, 212, 0.25)" : "1px solid transparent",
                fontWeight: isActive ? 600 : 500,
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "all 0.15s ease",
              })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.18)",
                    color: "#10b981",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "9999px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Quick link to Main User App */}
          <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", padding: "0 10px 8px" }}>
              {t("appLinks")}
            </div>
            <a
              href={import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5174"}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--btn-secondary-bg)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontSize: "0.8125rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-highlight)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🌐</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{t("userApp")}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t("switchApp")}</div>
                </div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>↗</span>
            </a>
          </div>
        </nav>

        {/* User Card & Logout */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-hover)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(6, 182, 212, 0.2)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || user?.email}
                </p>
                <p style={{ fontSize: "0.7rem", color: "#a855f7", fontWeight: 700 }}>
                  👑 {t("adminRole")}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title={t("logout")}
              style={{
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                color: "#f43f5e",
                borderRadius: "8px",
                padding: "6px 8px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════ MAIN CONTENT WRAPPER ════════════ */}
      <div className="admin-main-content">
        {/* Top Header Bar */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-header)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            gap: "12px",
            transition: "background-color 0.25s ease, border-color 0.25s ease",
          }}
        >
          {/* Left Title / Badge + Mobile Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn btn-secondary"
              style={{ padding: "6px 10px", fontSize: "1rem" }}
              title="Mở menu điều hướng"
            >
              ☰
            </button>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "9999px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              {t("online")}
            </span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t("gatewayConnected")}
            </span>
          </div>

          {/* Right actions: Theme Switcher + Language Switcher + Client App Link + User Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "6px 10px", gap: "5px" }}
              title={lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              <span>{lang === "vi" ? "🇻🇳" : "🇬🇧"}</span>
              <span>{lang === "vi" ? "VI" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "6px 10px", gap: "5px" }}
              title={theme === "dark" ? "Chuyển sang giao diện Sáng" : "Switch to Dark mode"}
            >
              <span>{theme === "dark" ? "🌙" : "☀️"}</span>
              <span>{theme === "dark" ? t("darkTheme") : t("lightTheme")}</span>
            </button>

            {/* View Client App */}
            <a
              href={import.meta.env.VITE_MAIN_APP_URL || "http://localhost:5174"}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "6px 12px" }}
            >
              🌐 {t("viewClientApp")} ↗
            </a>

            {/* User Chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px",
                backgroundColor: "var(--btn-secondary-bg)",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Admin:</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "28px 24px", maxWidth: "1440px", width: "100%", margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
