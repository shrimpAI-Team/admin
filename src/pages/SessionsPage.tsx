import React, { useEffect, useState } from "react";
import { adminApi, type SessionRow } from "../api/admin.api";
import { apiError } from "../lib/api";
import { Alert } from "../components/ui/Alert";
import { RoleBadge } from "../components/ui/Badge";
import { useI18nStore } from "../store/i18n.store";

export function SessionsPage() {
  const { t } = useI18nStore();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getSessions();
      setSessions(data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (s: SessionRow) => {
    setBusyId(s.id);
    setError("");
    try {
      await adminApi.revokeSession(s.id);
      setSuccess(`Revoked session: ${s.deviceName || s.deviceId}`);
      await loadSessions();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!filterActiveOnly) return true;
    return !s.revokedAt && new Date(s.expiresAt) > new Date();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ════════════ HEADER BAR ════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {t("sessionsTitle")}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
            {t("sessionsSubtitle")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "var(--text-secondary)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              style={{ accentColor: "var(--primary)" }}
            />
            {t("activeOnlyFilter")}
          </label>

          <button onClick={loadSessions} disabled={loading} className="btn-secondary" style={{ fontSize: "0.8125rem" }}>
            <span>🔄</span> {loading ? t("loading") : t("refresh")}
          </button>
        </div>
      </div>

      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* ════════════ SESSIONS TABLE ════════════ */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("account")}</th>
                <th>{t("deviceCol")}</th>
                <th>{t("ipAddress")}</th>
                <th>{t("status")}</th>
                <th>{t("loginTimeCol")}</th>
                <th>{t("lastActiveCol")}</th>
                <th style={{ textAlign: "right" }}>{t("actionsCol")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((s) => {
                const isRevoked = Boolean(s.revokedAt);
                const isExpired = new Date(s.expiresAt) <= new Date();
                const isAlive = !isRevoked && !isExpired;

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {s.user.name || "—"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {s.user.email}
                      </div>
                      <div style={{ marginTop: "2px" }}>
                        <RoleBadge role={s.user.role} />
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.1rem" }}>
                          {s.deviceName?.includes("iOS") || s.deviceName?.includes("iPhone") ? "📱" : "💻"}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {s.deviceName || "Device"}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.userAgent || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--primary)" }}>
                      {s.ip || "127.0.0.1"}
                    </td>

                    <td>
                      {isAlive ? (
                        <span className="badge badge-active">
                          <span className="badge-status-dot dot-green" /> {t("connectedStatus")}
                        </span>
                      ) : isRevoked ? (
                        <span className="badge badge-locked">
                          {t("revokedStatus")} ({s.revokedReason || "LOGOUT"})
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: "var(--btn-secondary-bg)", color: "var(--text-muted)" }}>
                          {t("expiredStatus")}
                        </span>
                      )}
                    </td>

                    <td style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {new Date(s.createdAt).toLocaleString()}
                    </td>

                    <td style={{ fontSize: "0.75rem", color: "var(--primary)" }}>
                      {new Date(s.lastUsedAt).toLocaleString()}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      {isAlive ? (
                        <button
                          onClick={() => handleRevoke(s)}
                          disabled={busyId === s.id}
                          className="btn-danger"
                          style={{ padding: "6px 12px" }}
                        >
                          {busyId === s.id ? t("processing") : t("revokeSessionBtn")}
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!filteredSessions.length && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
