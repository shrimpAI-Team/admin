import React, { useState } from "react";
import { useI18nStore } from "../../store/i18n.store";

interface RadarMetric {
  subject: string;
  score: number;
  fullMark: number;
}

interface RadarScoreChartProps {
  metrics: RadarMetric[];
}

export function RadarScoreChart({ metrics }: RadarScoreChartProps) {
  const { t } = useI18nStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!metrics || metrics.length === 0) {
    return null;
  }

  const size = 320;
  const center = size / 2;
  const radius = 100;
  const totalSides = metrics.length;
  const angleStep = (2 * Math.PI) / totalSides;

  // Calculate coordinates for a given index and normalized ratio [0..1]
  const getCoordinates = (index: number, ratio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points for web rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringPolygons = rings.map((ratio) => {
    return Array.from({ length: totalSides })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, ratio);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Calculate coordinates of data points
  const dataPoints = metrics.map((m, i) => {
    const ratio = Math.max(0.1, Math.min(1.0, m.score / m.fullMark));
    return getCoordinates(i, ratio);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Average score
  const avgScore = Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length);

  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🕸️</span> {t("systemRadarChart")}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Đánh giá sức khỏe 6 chiều toàn diện hệ thống
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
            {avgScore}/100
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Điểm trung bình</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
          {/* Web Rings (Spider Grid) */}
          {ringPolygons.map((pts, idx) => (
            <polygon
              key={idx}
              points={pts}
              fill="transparent"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray={idx === rings.length - 1 ? undefined : "3 3"}
            />
          ))}

          {/* Radial Spokes */}
          {metrics.map((_, idx) => {
            const outer = getCoordinates(idx, 1);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--border-subtle)"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Data Polygon */}
          <polygon
            points={dataPolygon}
            fill="rgba(6, 182, 212, 0.2)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Data Vertices */}
          {dataPoints.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: "pointer" }}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4.5}
                  fill={isHovered ? "#38bdf8" : "#06b6d4"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ transition: "all 0.2s ease" }}
                />
              </g>
            );
          })}

          {/* Labels around the perimeter */}
          {metrics.map((m, idx) => {
            const outer = getCoordinates(idx, 1.25);
            const isHovered = hoveredIdx === idx;
            return (
              <text
                key={idx}
                x={outer.x}
                y={outer.y + 4}
                textAnchor="middle"
                fontSize={isHovered ? "11.5" : "10"}
                fill={isHovered ? "var(--primary)" : "var(--text-secondary)"}
                fontWeight={isHovered ? 800 : 500}
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {m.subject} ({m.score})
              </text>
            );
          })}
        </svg>

        {/* Hover detail box */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-highlight)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          >
            {metrics[hoveredIdx].subject}: <strong style={{ color: "#06b6d4" }}>{metrics[hoveredIdx].score}/100</strong>
          </div>
        )}
      </div>
    </div>
  );
}
