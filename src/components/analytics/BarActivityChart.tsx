import React, { useState } from "react";
import type { TimeSeriesPoint } from "../../api/admin.api";
import { useI18nStore } from "../../store/i18n.store";

interface BarActivityChartProps {
  data: TimeSeriesPoint[];
}

export function BarActivityChart({ data }: BarActivityChartProps) {
  const { t } = useI18nStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Take the last 7 days for clear, spacious bar rendering
  const days = data.slice(-7);

  const width = 480;
  const height = 260;
  const padding = { top: 25, right: 20, bottom: 40, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...days.map((d) => Math.max(d.visionScans, d.chatMessages)), 10);
  const maxY = Math.ceil(maxVal * 1.25);

  const groupWidth = chartW / days.length;
  const barWidth = Math.min(groupWidth * 0.32, 16);
  const barGap = 4;

  const getY = (val: number) => padding.top + chartH - (val / maxY) * chartH;
  const getBarHeight = (val: number) => (val / maxY) * chartH;

  const gridTicks = [0, 0.5, 1].map((pct) => Math.round(maxY * pct));

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header & Legend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📊</span> {t("aiWorkloadChart")}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Vision Scans vs Chat Inquiries (7d)
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#06b6d4" }} />
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{t("chartVisionScans")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#3b82f6" }} />
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{t("chartChatQueries")}</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: "100%", position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block" }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Horizontal Grid */}
          {gridTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-muted)"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {days.map((d, idx) => {
            const groupX = padding.left + idx * groupWidth;
            const centerX = groupX + groupWidth / 2;

            const scanH = getBarHeight(d.visionScans);
            const chatH = getBarHeight(d.chatMessages);

            const scanX = centerX - barWidth - barGap / 2;
            const chatX = centerX + barGap / 2;

            const scanY = getY(d.visionScans);
            const chatY = getY(d.chatMessages);

            const isHovered = hoveredIdx === idx;

            return (
              <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} style={{ cursor: "pointer" }}>
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={groupX + 4}
                    y={padding.top}
                    width={groupWidth - 8}
                    height={chartH}
                    rx="8"
                    fill="var(--btn-secondary-hover)"
                    opacity="0.5"
                  />
                )}

                {/* Bar 1: Vision Scans (Cyan) */}
                <rect
                  x={scanX}
                  y={scanY}
                  width={barWidth}
                  height={scanH}
                  rx="4"
                  fill="#06b6d4"
                  opacity={isHovered ? 1 : 0.85}
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Bar 2: Chat Inquiries (Blue) */}
                <rect
                  x={chatX}
                  y={chatY}
                  width={barWidth}
                  height={chatH}
                  rx="4"
                  fill="#3b82f6"
                  opacity={isHovered ? 1 : 0.85}
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Value labels on hover */}
                {isHovered && (
                  <>
                    <text
                      x={scanX + barWidth / 2}
                      y={scanY - 5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#06b6d4"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {d.visionScans}
                    </text>
                    <text
                      x={chatX + barWidth / 2}
                      y={chatY - 5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#3b82f6"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {d.chatMessages}
                    </text>
                  </>
                )}

                {/* X-axis Label */}
                <text
                  x={centerX}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? "var(--primary)" : "var(--text-muted)"}
                  fontWeight={isHovered ? 700 : 500}
                  fontFamily="var(--font-mono)"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
