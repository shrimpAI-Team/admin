import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, type OverviewData } from "../api/admin.api";
import { apiError } from "../lib/api";
import { Alert } from "../components/ui/Alert";
import { RoleBadge, StatusBadge } from "../components/ui/Badge";
import { useI18nStore } from "../store/i18n.store";

export function OverviewPage() {
  const { t } = useI18nStore();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getOverview();
      setData(res);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ════════════ HEADER BAR ════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {t("overviewTitle")}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
            {t("overviewSubtitle")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {t("lastUpdated")} {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary"
            style={{ fontSize: "0.8125rem", padding: "7px 14px" }}
          >
            <span>🔄</span> {loading ? t("loading") : t("refresh")}
          </button>
        </div>
      </div>

      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}

      {/* ════════════ KPI CARDS ════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
        {/* Card 1: Users */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>{t("totalUsers")}</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(6, 182, 212, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              👥
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
            {data?.kpis.totalUsers ?? "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span style={{ color: "#10b981", fontWeight: 600 }}>{data?.kpis.activeUsers ?? 0} {t("activeUsers")}</span>
            <span>•</span>
            <span style={{ color: "#f43f5e" }}>{data?.kpis.lockedUsers ?? 0} {t("lockedUsers")}</span>
          </div>
        </div>

        {/* Card 2: Admins */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>{t("adminCount")}</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              👑
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
            {data?.kpis.adminCount ?? "—"}
          </div>
          <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {t("systemShare")}: <strong style={{ color: "#a855f7" }}>
              {data?.kpis.totalUsers ? Math.round(((data.kpis.adminCount) / data.kpis.totalUsers) * 100) : 0}%
            </strong>
          </div>
        </div>

        {/* Card 3: 2FA Adoption */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>{t("twoFactor")}</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              🔐
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
            {data?.kpis.twoFactorRate ?? "—"}%
          </div>
          <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "#10b981" }}>{data?.kpis.twoFactorCount ?? 0}</strong> {t("twoFactorActive")}
          </div>
        </div>

        {/* Card 4: AI Chat Conversations */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>{t("chatSessions")}</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              💬
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
            {data?.kpis.totalChatSessions ?? "—"}
          </div>
          <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "#3b82f6" }}>{data?.kpis.totalChatMessages ?? 0}</strong> {t("chatMessages")}
          </div>
        </div>
      </div>

      {/* ════════════ SERVICE HEALTH TELEMETRY ════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🩺</span> {t("infraTitle")}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {/* Service 1: PostgreSQL */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.4rem" }}>🐘</span>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{t("dbTitle")}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("dbDesc")}</p>
                </div>
              </div>
              <span className={`badge ${data?.health.database.status === "ONLINE" ? "badge-active" : "badge-locked"}`}>
                <span className={`badge-status-dot ${data?.health.database.status === "ONLINE" ? "dot-green" : "dot-red"}`} />
                {data?.health.database.status ?? "..."}
              </span>
            </div>

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{t("dbLatency")}</span>
              <strong style={{ color: "var(--primary)" }}>{data?.health.database.latencyMs !== undefined ? `${data.health.database.latencyMs} ms` : "—"}</strong>
            </div>
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{t("dbModel")}</span>
              <span style={{ color: "var(--text-primary)" }}>Prisma Engine (schema: public)</span>
            </div>
          </div>

          {/* Service 2: AI Vision Engine */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.4rem" }}>🧠</span>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{t("aiTitle")}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("aiDesc")}</p>
                </div>
              </div>
              <span className="badge badge-active">
                <span className="badge-status-dot dot-green" />
                {data?.health.aiEngine.status ?? "READY"}
              </span>
            </div>

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{t("aiInference")}</span>
              <strong style={{ color: "#10b981" }}>{data?.health.aiEngine.type ?? "Python Engine"}</strong>
            </div>
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{t("aiComms")}</span>
              <span style={{ color: "var(--text-primary)" }}>Microservice Pipeline Online</span>
            </div>
          </div>

          {/* Service 3: Server Telemetry */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.4rem" }}>⚙️</span>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{t("serverTitle")}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>NestJS (Node {data?.health.system.nodeVersion ?? "v20"})</p>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                {data?.health.system.environment === "production" ? "Production" : "Active Service"}
              </span>
            </div>

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{t("uptime")}</span>
              <strong style={{ color: "var(--text-primary)" }}>
                {data?.health.system.uptimeSeconds !== undefined ? formatUptime(data.health.system.uptimeSeconds) : "—"}
              </strong>
            </div>
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{t("memoryUsage")}</span>
              <span style={{ color: "var(--text-primary)" }}>
                {data?.health.system.memoryHeapUsedMb ?? 0} MB / {data?.health.system.memoryRssMb ?? 0} MB RSS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ RECENT ACTIVITY ════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
        {/* Recent Registered Users */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🆕</span> {t("recentUsers")}
            </h3>
            <Link to="/users" style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
              {t("viewAll")}
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("account")}</th>
                  <th>{t("role")}</th>
                  <th>{t("status")}</th>
                  <th style={{ textAlign: "right" }}>{t("time")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{u.email}</div>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><StatusBadge active={u.isActive} /></td>
                    <td style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {!data?.recentUsers.length && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🛡️</span> {t("recentSessions")}
            </h3>
            <Link to="/sessions" style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
              {t("manageSessions")}
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("account")}</th>
                  <th>{t("device")}</th>
                  <th>{t("ipAddress")}</th>
                  <th style={{ textAlign: "right" }}>{t("lastUsed")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentSessions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.user.name || s.user.email}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}><RoleBadge role={s.user.role} /></div>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                      {s.deviceName || "Device"}
                    </td>
                    <td style={{ fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>
                      {s.ip || "127.0.0.1"}
                    </td>
                    <td style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(s.lastUsedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {!data?.recentSessions.length && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
