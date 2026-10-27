import React, { useState } from "react";
import type { TimeSeriesPoint } from "../../api/admin.api";
import { useI18nStore } from "../../store/i18n.store";

interface AreaTrendChartProps {
  data: TimeSeriesPoint[];
  timeRange: "7d" | "14d" | "30d";
  onTimeRangeChange: (range: "7d" | "14d" | "30d") => void;
}

export function AreaTrendChart({ data, timeRange, onTimeRangeChange }: AreaTrendChartProps) {
  const { t } = useI18nStore();
  const [activeSeries, setActiveSeries] = useState<"sessions" | "chats" | "both">("both");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter or slice based on timeRange
  const points = timeRange === "7d" ? data.slice(-7) : data;

  if (!points || points.length === 0) {
    return <div style={{ color: "var(--text-muted)", padding: "40px 0", textAlign: "center" }}>{t("noData")}</div>;
  }

  // Chart dimensions & coordinates
  const width = 760;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max value calculation
  const maxSessions = Math.max(...points.map((p) => p.activeSessions), 5);
  const maxChats = Math.max(...points.map((p) => p.chatMessages + p.visionScans), 5);
  const maxY = Math.ceil(Math.max(maxSessions, maxChats) * 1.25);

  const getX = (index: number) => padding.left + (index / (points.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - (val / maxY) * chartH;

  // Generate smooth cubic bezier SVG path
  const makeSmoothPath = (values: number[]) => {
    if (values.length === 0) return "";
    const pts = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const sessionsValues = points.map((p) => p.activeSessions);
  const aiActivityValues = points.map((p) => p.chatMessages + p.visionScans);

  const sessionsLine = makeSmoothPath(sessionsValues);
  const aiLine = makeSmoothPath(aiActivityValues);

  const sessionsArea = `${sessionsLine} L ${getX(points.length - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z`;
  const aiArea = `${aiLine} L ${getX(points.length - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z`;

  // Grid steps (4 horizontal lines)
  const gridTicks = [0, 0.33, 0.66, 1].map((pct) => Math.round(maxY * pct));

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header with Title, Legend & Time Range Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📈</span> {t("userGrowthChart")}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {t("analyticsSubtitle")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Series Toggle Buttons */}
          <div style={{ display: "inline-flex", borderRadius: "8px", border: "1px solid var(--border-subtle)", padding: "2px", backgroundColor: "var(--bg-app)" }}>
            <button
              onClick={() => setActiveSeries("both")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                backgroundColor: activeSeries === "both" ? "var(--btn-secondary-hover)" : "transparent",
                color: activeSeries === "both" ? "var(--primary)" : "var(--text-secondary)",
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveSeries("sessions")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                backgroundColor: activeSeries === "sessions" ? "rgba(6, 182, 212, 0.18)" : "transparent",
                color: activeSeries === "sessions" ? "#06b6d4" : "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#06b6d4" }} />
              {t("chartActiveSessions")}
            </button>
            <button
              onClick={() => setActiveSeries("chats")}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                backgroundColor: activeSeries === "chats" ? "rgba(168, 85, 247, 0.18)" : "transparent",
                color: activeSeries === "chats" ? "#a855f7" : "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#a855f7" }} />
              {t("chartChatQueries")} & AI
            </button>
          </div>

          {/* Time Range Selector */}
          <div style={{ display: "inline-flex", borderRadius: "8px", border: "1px solid var(--border-subtle)", padding: "2px", backgroundColor: "var(--bg-app)" }}>
            {(["7d", "14d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => onTimeRangeChange(r)}
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: timeRange === r ? 700 : 500,
                  backgroundColor: timeRange === r ? "var(--primary)" : "transparent",
                  color: timeRange === r ? "#ffffff" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                {r === "7d" ? t("timeRange7d") : t("timeRange14d")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div style={{ width: "100%", position: "relative", overflow: "hidden" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Linear Gradient for Sessions (Cyan) */}
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Linear Gradient for AI Activity (Purple) */}
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
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
                  x={padding.left - 10}
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

          {/* Area Fills */}
          {(activeSeries === "both" || activeSeries === "sessions") && (
            <path d={sessionsArea} fill="url(#cyanGradient)" />
          )}
          {(activeSeries === "both" || activeSeries === "chats") && (
            <path d={aiArea} fill="url(#purpleGradient)" />
          )}

          {/* Stroke Lines */}
          {(activeSeries === "both" || activeSeries === "chats") && (
            <path
              d={aiLine}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(activeSeries === "both" || activeSeries === "sessions") && (
            <path
              d={sessionsLine}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowCyan)"
            />
          )}

          {/* X-Axis Labels */}
          {points.map((p, idx) => {
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={padding.top + chartH + 20}
                textAnchor="middle"
                fontSize="10.5"
                fill={hoveredIndex === idx ? "var(--primary)" : "var(--text-muted)"}
                fontWeight={hoveredIndex === idx ? 700 : 500}
                fontFamily="var(--font-mono)"
              >
                {p.label}
              </text>
            );
          })}

          {/* Hover Guides & Interactive Rects */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIndex === idx;
            const ySessions = getY(p.activeSessions);
            const yChats = getY(p.chatMessages + p.visionScans);

            return (
              <g key={idx}>
                {/* Transparent hit area for mouse interaction */}
                <rect
                  x={x - chartW / points.length / 2}
                  y={padding.top}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {isHovered && (
                  <>
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartH}
                      stroke="var(--border-highlight)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Cyan Point for Sessions */}
                    {(activeSeries === "both" || activeSeries === "sessions") && (
                      <g>
                        <circle cx={x} cy={ySessions} r="6" fill="#06b6d4" filter="url(#glowCyan)" />
                        <circle cx={x} cy={ySessions} r="3" fill="#ffffff" />
                      </g>
                    )}

                    {/* Purple Point for AI Activity */}
                    {(activeSeries === "both" || activeSeries === "chats") && (
                      <g>
                        <circle cx={x} cy={yChats} r="5.5" fill="#a855f7" />
                        <circle cx={x} cy={yChats} r="2.5" fill="#ffffff" />
                      </g>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: `${Math.min(Math.max(10, (hoveredIndex / (points.length - 1)) * 85), 75)}%`,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-highlight)",
              borderRadius: "10px",
              padding: "10px 14px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
              pointerEvents: "none",
              zIndex: 10,
              fontSize: "0.8125rem",
              minWidth: "160px",
              backdropFilter: "blur(8px)",
              transition: "left 0.1s ease",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
              <span>📅 {hoveredPoint.label}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{hoveredPoint.date}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#06b6d4" }} />
                  {t("chartActiveSessions")}:
                </span>
                <strong style={{ color: "#06b6d4", fontFamily: "var(--font-mono)" }}>
                  {hoveredPoint.activeSessions}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#a855f7" }} />
                  {t("chartChatQueries")}:
                </span>
                <strong style={{ color: "#a855f7", fontFamily: "var(--font-mono)" }}>
                  {hoveredPoint.chatMessages}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                  {t("chartVisionScans")}:
                </span>
                <strong style={{ color: "#10b981", fontFamily: "var(--font-mono)" }}>
                  {hoveredPoint.visionScans}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
