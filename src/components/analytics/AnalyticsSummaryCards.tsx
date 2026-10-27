import React from "react";
import { useI18nStore } from "../../store/i18n.store";

interface SummaryData {
  weeklyGrowthRate: number;
  avgDailyActiveUsers: number;
  peakHour: string;
  dominantSpecies: string;
  successRate: number;
}

interface AnalyticsSummaryCardsProps {
  summary?: SummaryData;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const { t } = useI18nStore();

  const growth = summary?.weeklyGrowthRate ?? 18.5;
  const avgDau = summary?.avgDailyActiveUsers ?? 14;
  const dominant = summary?.dominantSpecies ?? "Tôm thẻ chân trắng (62%)";
  const accuracy = summary?.successRate ?? 99.4;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
      {/* Metric 1: Growth Rate with Mini Sparkline */}
      <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("growthRate")}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              fontSize: "0.72rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            ↗ +{growth}%
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "12px" }}>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              +{growth}%
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>So với 7 ngày trước</span>
          </div>

          {/* Mini Sparkline SVG */}
          <svg width="68" height="28" viewBox="0 0 68 28">
            <path
              d="M 2 24 Q 16 20, 26 14 T 48 8 T 66 3"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Metric 2: Avg Daily Active Users */}
      <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("averageDailyActive")}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: "rgba(6, 182, 212, 0.15)",
              color: "var(--primary)",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            Live Active
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "12px" }}>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {avgDau}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>DAU ổn định</span>
          </div>

          {/* Mini Sparkline SVG */}
          <svg width="68" height="28" viewBox="0 0 68 28">
            <path
              d="M 2 18 Q 18 10, 32 16 T 50 6 T 66 8"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Metric 3: Dominant Species */}
      <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("dominantBreed")}
          </span>
          <span style={{ fontSize: "1.1rem" }}>🦐</span>
        </div>

        <div style={{ marginTop: "12px" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {dominant}
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Tôm nuôi phổ biến nhất</span>
        </div>
      </div>

      {/* Metric 4: AI Model Accuracy */}
      <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("successRate")}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              color: "#a855f7",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            Vision AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "12px" }}>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {accuracy}%
            </div>
            <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>✓ {t("healthyStatusText")}</span>
          </div>

          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: "#10b981" }}>
            ✓
          </div>
        </div>
      </div>
    </div>
  );
}
