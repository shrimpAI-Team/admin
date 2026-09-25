import React, { useCallback, useEffect, useState } from "react";
import { adminApi, type Role, type UserRow } from "../api/admin.api";
import { apiError } from "../lib/api";
import { useAdminAuthStore } from "../store/admin-auth.store";
import { useI18nStore } from "../store/i18n.store";
import { Alert } from "../components/ui/Alert";
import { Modal } from "../components/ui/Modal";
import { RoleBadge, StatusBadge, TwoFactorBadge } from "../components/ui/Badge";

export function UsersPage() {
  const me = useAdminAuthStore((s) => s.user);
  const { t } = useI18nStore();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "USER" as Role,
  });

  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        q: q.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 15,
      });
      setUsers(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, statusFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Role Change
  const handleChangeRole = async (u: UserRow, newRole: Role) => {
    if (u.id === me?.id) {
      setError("Bạn không thể tự đổi vai trò của chính mình");
      return;
    }
    setBusyId(u.id);
    setError("");
    try {
      await adminApi.setUserRole(u.id, newRole);
      setSuccess(`Đã chuyển vai trò của ${u.email} thành ${newRole}.`);
      await loadUsers();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  // Handle Toggle Active/Locked Status
  const handleToggleStatus = async (u: UserRow) => {
    if (u.id === me?.id) {
      setError("Bạn không thể tự khóa tài khoản của chính mình");
      return;
    }
    setBusyId(u.id);
    setError("");
    try {
      await adminApi.setUserStatus(u.id, !u.isActive);
      setSuccess(`Đã ${u.isActive ? "khoá" : "mở khoá"} tài khoản ${u.email}`);
      await loadUsers();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password) {
      setError("Vui lòng điền email và mật khẩu");
      return;
    }
    setError("");
    try {
      await adminApi.createUser(createForm);
      setSuccess(`Đã tạo thành công: ${createForm.email}`);
      setCreateModalOpen(false);
      setCreateForm({ email: "", password: "", name: "", role: "USER" });
      await loadUsers();
    } catch (err) {
      setError(apiError(err));
    }
  };

  // Handle Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword) return;
    setError("");
    try {
      await adminApi.resetUserPassword(resetTargetUser.id, newPassword);
      setSuccess(`Đã đổi mật khẩu cho ${resetTargetUser.email}.`);
      setResetPassModalOpen(false);
      setNewPassword("");
      setResetTargetUser(null);
    } catch (err) {
      setError(apiError(err));
    }
  };

  // Handle Delete User
  const handleDeleteSubmit = async () => {
    if (!deleteTargetUser) return;
    setError("");
    try {
      await adminApi.deleteUser(deleteTargetUser.id);
      setSuccess(`Đã xóa tài khoản ${deleteTargetUser.email}`);
      setDeleteModalOpen(false);
      setDeleteTargetUser(null);
      await loadUsers();
    } catch (err) {
      setError(apiError(err));
    }
  };

  // Handle Revoke All Sessions of User
  const handleRevokeSessions = async (u: UserRow) => {
    setBusyId(u.id);
    try {
      await adminApi.revokeAllUserSessions(u.id);
      setSuccess(`Đã đăng xuất toàn bộ thiết bị của ${u.email}`);
      await loadUsers();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ════════════ HEADER BAR ════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {t("usersTitle")}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
            {t("usersSubtitle")}
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary"
        >
          <span>➕</span> {t("addUser")}
        </button>
      </div>

      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* ════════════ FILTERS BAR ════════════ */}
      <div className="glass-panel" style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", flex: 1 }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder={t("searchPlaceholder")}
              className="input-field"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{t("role")}:</span>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="select-field"
            >
              <option value="ALL">{t("allRoles")}</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{t("status")}:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="select-field"
            >
              <option value="ALL">{t("allStatuses")}</option>
              <option value="ACTIVE">{t("activeStatus")}</option>
              <option value="LOCKED">{t("lockedStatus")}</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          {t("foundCount")} <strong style={{ color: "var(--primary)" }}>{total}</strong> {t("accountsCount")}
        </div>
      </div>

      {/* ════════════ USERS TABLE ════════════ */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("account")}</th>
                <th>{t("role")}</th>
                <th>{t("status")}</th>
                <th>{t("twoFactorCol")}</th>
                <th>{t("sessionsCol")}</th>
                <th>{t("chatsCol")}</th>
                <th>{t("createdCol")}</th>
                <th style={{ textAlign: "right" }}>{t("actionsCol")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: u.role === "ADMIN" ? "rgba(168, 85, 247, 0.2)" : "rgba(6, 182, 212, 0.15)",
                          color: u.role === "ADMIN" ? "#c084fc" : "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {u.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {u.name || "—"} {u.id === me?.id && <span style={{ color: "var(--primary)", fontSize: "0.75rem" }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      disabled={u.id === me?.id || busyId === u.id}
                      onChange={(e) => handleChangeRole(u, e.target.value as Role)}
                      className="select-field"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <StatusBadge active={u.isActive} />
                  </td>
                  <td>
                    <TwoFactorBadge enabled={u.twoFactorEnabled} />
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>{u._count.sessions}</span> {t("sessionsCount")}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: "#a855f7", fontWeight: 600 }}>{u._count.chatSessions}</span> {t("chatsCount")}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === me?.id || busyId === u.id}
                        className={u.isActive ? "btn-danger" : "btn-success"}
                        title={u.isActive ? t("lock") : t("unlock")}
                      >
                        {u.isActive ? `🔒 ${t("lock")}` : `🔓 ${t("unlock")}`}
                      </button>

                      {/* Reset password */}
                      <button
                        onClick={() => {
                          setResetTargetUser(u);
                          setNewPassword("");
                          setResetPassModalOpen(true);
                        }}
                        className="btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                        title={t("resetPass")}
                      >
                        🔑 {t("resetPass")}
                      </button>

                      {/* Revoke sessions */}
                      <button
                        onClick={() => handleRevokeSessions(u)}
                        disabled={busyId === u.id}
                        className="btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                        title={t("revokeSessions")}
                      >
                        🚪 {t("revokeSessions")}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          setDeleteTargetUser(u);
                          setDeleteModalOpen(true);
                        }}
                        disabled={u.id === me?.id || busyId === u.id}
                        className="btn-danger"
                        style={{ padding: "6px 8px" }}
                        title={t("delete")}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {t("pageInfo")} {page} / {totalPages}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "6px 12px" }}
              >
                {t("prevPage")}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "6px 12px" }}
              >
                {t("nextPage")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════ MODAL: CREATE USER ════════════ */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t("createModalTitle")}
      >
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              {t("emailLabel")} <span style={{ color: "#f43f5e" }}>*</span>
            </label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="user@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              {t("passLabel")} <span style={{ color: "#f43f5e" }}>*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Min 6 characters"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              {t("nameLabel")}
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Nguyen Van A"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              {t("roleLabel")}
            </label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
              className="select-field"
              style={{ width: "100%" }}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary"
            >
              {t("cancel")}
            </button>
            <button type="submit" className="btn-primary">
              {t("createUserBtn")}
            </button>
          </div>
        </form>
      </Modal>

      {/* ════════════ MODAL: RESET PASSWORD ════════════ */}
      <Modal
        isOpen={resetPassModalOpen}
        onClose={() => setResetPassModalOpen(false)}
        title={`${t("resetModalTitle")}: ${resetTargetUser?.email}`}
      >
        <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            {t("resetModalDesc")}
          </p>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              {t("newPassLabel")} <span style={{ color: "#f43f5e" }}>*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="input-field"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => setResetPassModalOpen(false)}
              className="btn-secondary"
            >
              {t("cancel")}
            </button>
            <button type="submit" className="btn-primary">
              {t("confirmResetBtn")}
            </button>
          </div>
        </form>
      </Modal>

      {/* ════════════ MODAL: DELETE CONFIRMATION ════════════ */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("deleteModalTitle")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
            {t("deleteModalPrompt")} <strong style={{ color: "#f43f5e" }}>{deleteTargetUser?.email}</strong>?
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            {t("deleteModalWarning")}
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              className="btn-danger"
              style={{ padding: "8px 16px" }}
            >
              {t("confirmDeleteBtn")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
