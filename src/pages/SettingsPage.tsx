import React, { useState } from "react";
import { adminApi } from "../api/admin.api";
import { apiError } from "../lib/api";
import { Alert } from "../components/ui/Alert";
import { useI18nStore } from "../store/i18n.store";

export function SettingsPage() {
  const { t } = useI18nStore();
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [pingError, setPingError] = useState("");

  const handleTestPing = async () => {
    setPinging(true);
    setPingError("");
    setPingStatus(null);
    try {
      const res = await adminApi.getOverview();
      setPingStatus(
        `${t("pingSuccess")} ${res.health.database.latencyMs} ms | ${t("aiStatus")} ${res.health.aiEngine.status}`
      );
    } catch (e) {
      setPingError(apiError(e));
    } finally {
      setPinging(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ════════════ HEADER BAR ════════════ */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {t("settingsTitle")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
          {t("settingsSubtitle")}
        </p>
      </div>

      {pingStatus && <Alert variant="success">{pingStatus}</Alert>}
      {pingError && <Alert variant="error">{pingError}</Alert>}

      {/* ════════════ DEPLOYMENT & NETWORK TOPOLOGY ════════════ */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🌐</span> {t("topologyHeading")}
        </h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
          {t("topologySubheading")}
        </p>

        {/* Two Columns: Dev vs Prod */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
          {/* Column 1: Local Development */}
          <div className="glass-card" style={{ padding: "20px", borderTop: "3px solid #06b6d4" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)" }}>
                {t("devEnvTitle")}
              </span>
              <span className="badge badge-active">{t("currentBadge")}</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {t("devEnvDesc")}
            </p>

            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Client Frontend:</span>
                <strong style={{ color: "var(--primary)", fontFamily: "var(--font-mono)" }}>Port 5174</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Admin Portal:</span>
                <strong style={{ color: "#06b6d4", fontFamily: "var(--font-mono)" }}>Port 5175</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Backend NestJS API:</span>
                <strong style={{ color: "#a855f7", fontFamily: "var(--font-mono)" }}>Port 4000</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>PostgreSQL & AI Engine:</span>
                <strong style={{ color: "#10b981", fontFamily: "var(--font-mono)" }}>Port 5433 & 8000</strong>
              </div>
            </div>
          </div>

          {/* Column 2: Production Deployment */}
          <div className="glass-card" style={{ padding: "20px", borderTop: "3px solid #10b981" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#10b981" }}>
                {t("prodEnvTitle")}
              </span>
              <span className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                {t("enterpriseBadge")}
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {t("prodEnvDesc")}
            </p>

            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{t("clientDomain")}</span>
                <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>https://shrimp.ai</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{t("adminDomain")}</span>
                <strong style={{ color: "var(--primary)", fontFamily: "var(--font-mono)" }}>https://admin.shrimp.ai</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{t("apiDomain")}</span>
                <strong style={{ color: "#a855f7", fontFamily: "var(--font-mono)" }}>https://api.shrimp.ai</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                <span style={{ color: "#10b981", fontWeight: 600 }}>{t("dbIsolated")}</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>{t("privateNetworkTag")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ DIAGNOSTIC TOOLS ════════════ */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚡</span> {t("pingTitle")}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {t("pingSubtitle")}
            </p>
          </div>

          <button
            onClick={handleTestPing}
            disabled={pinging}
            className="btn-primary"
            style={{ padding: "10px 20px" }}
          >
            {pinging ? t("pingingBtn") : t("runPingBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
