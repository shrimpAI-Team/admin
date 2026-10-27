import React, { useState } from "react";
import type { SpeciesShare } from "../../api/admin.api";
import { useI18nStore } from "../../store/i18n.store";

interface DonutSpeciesChartProps {
  data: SpeciesShare[];
}

export function DonutSpeciesChart({ data }: DonutSpeciesChartProps) {
  const { t } = useI18nStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // SVG circle calculations
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = data.map((item, idx) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🦐</span> {t("speciesDistributionChart")}
        </h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Phân bố chủng loại tôm quét qua mô hình AI Vision
        </p>
      </div>

      {/* Content: Donut on Left, Legend on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", alignItems: "center" }}>
        {/* Donut SVG with Center Metric */}
        <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--border-subtle)"
              strokeWidth={strokeWidth - 6}
            />

            {/* Colored Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredIdx === seg.idx;
              return (
                <circle
                  key={seg.idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    cursor: "pointer",
                    transition: "stroke-width 0.25s ease, opacity 0.25s ease",
                    opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setHoveredIdx(seg.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Info Overlay */}
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              maxWidth: "110px",
            }}
          >
            {activeItem ? (
              <>
                <span style={{ fontSize: "1.45rem", fontWeight: 800, color: activeItem.color, fontFamily: "var(--font-mono)" }}>
                  {activeItem.percentage}%
                </span>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {activeItem.name}
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {total}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {t("totalScans")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: isHovered ? "var(--btn-secondary-hover)" : "transparent",
                  border: isHovered ? "1px solid var(--border-highlight)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: item.color, fontFamily: "var(--font-mono)" }}>
                      {item.percentage}%
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      ({item.count})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: "100%",
                      backgroundColor: item.color,
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
