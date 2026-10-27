import React, { useState } from "react";
import { useI18nStore } from "../../store/i18n.store";

interface HourlyPoint {
  hour: string;
  queries: number;
}

interface HourlyActivityChartProps {
  data: HourlyPoint[];
}

export function HourlyActivityChart({ data }: HourlyActivityChartProps) {
  const { t } = useI18nStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 15, bottom: 35, left: 25 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.queries), 10);
  const maxY = Math.ceil(maxVal * 1.2);

  const colW = chartW / data.length;
  const barW = Math.min(colW * 0.55, 18);

  const getY = (val: number) => padding.top + chartH - (val / maxY) * chartH;
  const getH = (val: number) => (val / maxY) * chartH;

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>⏰</span> {t("hourlyActivityChart")}
        </h4>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Cao điểm: <strong style={{ color: "var(--primary)" }}>08:00 & 16:00</strong> (Kiểm tra & cho ăn)
        </span>
      </div>

      <div style={{ width: "100%", position: "relative" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Subtle horizontal mid line */}
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke="var(--border-subtle)"
            strokeDasharray="3 3"
          />

          {data.map((d, idx) => {
            const x = padding.left + idx * colW + (colW - barW) / 2;
            const y = getY(d.queries);
            const h = getH(d.queries);
            const isHovered = hoveredIdx === idx;
            const isPeak = d.queries >= 30;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="3"
                  fill={isPeak ? "url(#peakBarGradient)" : isHovered ? "var(--primary)" : "var(--primary-glow)"}
                  stroke={isPeak ? "#06b6d4" : "transparent"}
                  strokeWidth="1"
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Value on hover */}
                {isHovered && (
                  <text
                    x={x + barW / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--primary)"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    {d.queries}
                  </text>
                )}

                {/* X axis hour label */}
                <text
                  x={x + barW / 2}
                  y={padding.top + chartH + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isHovered ? "var(--text-primary)" : "var(--text-muted)"}
                  fontWeight={isHovered ? 700 : 400}
                  fontFamily="var(--font-mono)"
                >
                  {d.hour}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="peakBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
