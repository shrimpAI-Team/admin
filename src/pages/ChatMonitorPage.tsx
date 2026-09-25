import React, { useEffect, useState } from "react";
import { adminApi, type ChatSessionRow } from "../api/admin.api";
import { apiError } from "../lib/api";
import { Alert } from "../components/ui/Alert";
import { Modal } from "../components/ui/Modal";
import { useI18nStore } from "../store/i18n.store";

export function ChatMonitorPage() {
  const { t } = useI18nStore();
  const [sessions, setSessions] = useState<ChatSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [q, setQ] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatSessionRow | null>(null);

  const loadChats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getChatSessions();
      setSessions(data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    setError("");
    try {
      await adminApi.deleteChatSession(deleteTarget.id);
      setSuccess(`${t("deleteSuccess")} "${deleteTarget.title}"`);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await loadChats();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const filtered = sessions.filter((s) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.user.email.toLowerCase().includes(term) ||
      (s.user.name && s.user.name.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ════════════ HEADER BAR ════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {t("chatTitle")}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>
            {t("chatSubtitle")}
          </p>
        </div>

        <button onClick={loadChats} disabled={loading} className="btn-secondary" style={{ fontSize: "0.8125rem" }}>
          <span>🔄</span> {t("refresh")}
        </button>
      </div>

      {error && <Alert variant="error" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")}>{success}</Alert>}

      {/* ════════════ SEARCH BAR ════════════ */}
      <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchChatPlaceholder")}
          className="input-field"
          style={{ maxWidth: "360px" }}
        />
        <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          {t("totalConversations")} <strong style={{ color: "var(--primary)" }}>{filtered.length}</strong> {t("conversationsUnit")}
        </span>
      </div>

      {/* ════════════ CHAT SESSIONS TABLE ════════════ */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("conversationTitleCol")}</th>
                <th>{t("userCol")}</th>
                <th>{t("messagesCountCol")}</th>
                <th>{t("createdCol")}</th>
                <th>{t("updatedTimeCol")}</th>
                <th style={{ textAlign: "right" }}>{t("moderationCol")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>💬</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.title}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.user.name || "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {s.user.email}
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(168, 85, 247, 0.15)",
                        color: "#a855f7",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {s._count.messages} {t("messagesUnit")}
                    </span>
                  </td>

                  <td style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>

                  <td style={{ fontSize: "0.75rem", color: "var(--primary)" }}>
                    {new Date(s.updatedAt).toLocaleString()}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => {
                        setDeleteTarget(s);
                        setDeleteModalOpen(true);
                      }}
                      className="btn-danger"
                      style={{ padding: "6px 12px" }}
                    >
                      {t("deleteChatBtn")}
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                    {t("noChats")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════ MODAL: DELETE CONFIRMATION ════════════ */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("deleteChatModalTitle")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
            {t("deleteChatModalPrompt")} "{deleteTarget?.title}" ({deleteTarget?.user.email})?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">
              {t("cancel")}
            </button>
            <button onClick={handleDeleteSubmit} className="btn-danger" style={{ padding: "8px 16px" }}>
              {t("confirmDeleteAction")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
