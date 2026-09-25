import React from "react";

interface AlertProps {
  variant?: "error" | "success" | "warning" | "info";
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = "info", children, onClose }: AlertProps) {
  const styles = {
    error: "bg-rose-950/50 border-rose-500/40 text-rose-200",
    success: "bg-emerald-950/50 border-emerald-500/40 text-emerald-200",
    warning: "bg-amber-950/50 border-amber-500/40 text-amber-200",
    info: "bg-cyan-950/50 border-cyan-500/40 text-cyan-200",
  }[variant];

  const icons = {
    error: "⚠️",
    success: "✅",
    warning: "⚡",
    info: "ℹ️",
  }[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid",
        fontSize: "0.875rem",
        marginBottom: "14px",
      }}
      className={styles}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{icons}</span>
        <span>{children}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "currentColor",
            cursor: "pointer",
            fontSize: "1.1rem",
            opacity: 0.7,
            padding: "2px 6px",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
