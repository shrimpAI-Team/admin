import React from "react";

export function RoleBadge({ role }: { role: "ADMIN" | "USER" }) {
  if (role === "ADMIN") {
    return <span className="badge badge-admin">👑 ADMIN</span>;
  }
  return <span className="badge badge-user">👤 USER</span>;
}

export function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="badge badge-active">
        <span className="badge-status-dot dot-green" /> Hoạt động
      </span>
    );
  }
  return (
    <span className="badge badge-locked">
      <span className="badge-status-dot dot-red" /> Đã khóa
    </span>
  );
}

export function TwoFactorBadge({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return <span className="badge badge-active">🔐 Đã kích hoạt</span>;
  }
  return <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>Chưa bật</span>;
}
