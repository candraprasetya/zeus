import { memo } from "react";
import { IconX } from "./icons";
import { cx } from "./ui";

export interface ZeusSubagentTasksFloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOffice: () => void;
  isSessionRunning: boolean;
  activePermission?: {
    toolName?: string;
    risk?: string;
    agentName?: string;
    reason?: string;
  } | null;
}

export const ZeusSubagentTasksFloatingPanel = memo(
  function ZeusSubagentTasksFloatingPanel({
    isOpen,
    onClose,
    onOpenOffice,
    isSessionRunning,
    activePermission,
  }: ZeusSubagentTasksFloatingPanelProps) {
    if (!isOpen) return null;

    const isWaitingApproval = Boolean(activePermission);

    return (
      <div
        className={cx(
          "zeus-subagents-floating-panel",
          isWaitingApproval && "is-waiting-panel",
        )}
        role="dialog"
        aria-label="Sub-Agent Tasks & Status"
        data-testid="zeus-subagents-floating-panel"
      >
        {/* Panel Header */}
        <div className="subagent-panel-header">
          <div className="subagent-panel-header-left">
            <span className="subagent-panel-icon" aria-hidden="true">
              🤖
            </span>
            <div className="subagent-panel-titles">
              <span className="subagent-panel-title">Sub-Agent Tasks &amp; Status</span>
              <span className="subagent-panel-subtitle">
                {isWaitingApproval
                  ? "Sistem dijeda: Menunggu izin user"
                  : isSessionRunning
                    ? "4 Agen aktif menyelesaikan workflow"
                    : "Seluruh agen dalam mode standby"}
              </span>
            </div>
          </div>
          <div className="subagent-panel-header-right">
            <span
              className={cx(
                "subagent-status-badge",
                isWaitingApproval && "is-warning",
                !isWaitingApproval && isSessionRunning && "is-live",
                !isWaitingApproval && !isSessionRunning && "is-idle",
              )}
            >
              {isWaitingApproval
                ? "⚠️ BUTUH APPROVAL"
                : isSessionRunning
                  ? "● LIVE"
                  : "● STANDBY"}
            </span>
            <button
              type="button"
              className="subagent-panel-close-btn"
              onClick={onClose}
              aria-label="Tutup panel sub-agent"
              title="Tutup (Esc)"
            >
              <IconX size={14} />
            </button>
          </div>
        </div>

        {/* Informative Callout: Resolves User Confusion between Chat and Office */}
        {isWaitingApproval ? (
          <div className="subagent-approval-notice" role="alert">
            <div className="approval-notice-title">
              <span className="approval-notice-icon" aria-hidden="true">
                ⚠️
              </span>
              <strong>Menunggu Persetujuan Anda di Chat</strong>
            </div>
            <p className="approval-notice-desc">
              Tool <code>{activePermission?.toolName || "Action"}</code> memerlukan izin manual untuk
              memodifikasi workspace. Sub-agen <strong>otomatis dijeda</strong> demi keamanan
              hingga Anda menekan <em>&quot;Allow once&quot;</em> atau <em>&quot;Allow for this chat&quot;</em> pada kartu permission di chat.
            </p>
          </div>
        ) : (
          <div className="subagent-status-notice">
            <span className="status-notice-text">
              {isSessionRunning
                ? "⚡ Tim sub-agen sedang berkoordinasi secara otonom untuk menyelesaikan permintaan Anda."
                : "☕ Tim sub-agen siap menerima instruksi atau prompt baru."}
            </span>
          </div>
        )}

        {/* Sub-Agent Roster & Tasks */}
        <div className="subagent-tasks-list" role="list">
          {/* Agent 1: Zeus */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(245, 158, 11, 0.15)", borderColor: "#f59e0b" }}
            >
              ⚡
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Zeus (Lead)</span>
                <span className="subagent-item-role">Central Orchestrator</span>
                <span
                  className={cx(
                    "subagent-item-tag",
                    isWaitingApproval
                      ? "is-tag-warning"
                      : isSessionRunning
                        ? "is-tag-live"
                        : "is-tag-idle",
                  )}
                >
                  {isWaitingApproval
                    ? "Menunggu Approval"
                    : isSessionRunning
                      ? "Orchestrating"
                      : "Standby"}
                </span>
              </div>
              <p className="subagent-item-task">
                {isWaitingApproval
                  ? `Menunggu persetujuan user untuk eksekusi tool "${activePermission?.toolName || "action"}"`
                  : isSessionRunning
                    ? "Mengoordinasikan alur kerja sub-agen & pembagian tugas"
                    : "Standby siap menerima perintah"}
              </p>
            </div>
          </div>

          {/* Agent 2: Hermes */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981" }}
            >
              💻
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Hermes (Builder)</span>
                <span className="subagent-item-role">Code Implementation</span>
                <span
                  className={cx(
                    "subagent-item-tag",
                    isWaitingApproval
                      ? "is-tag-paused"
                      : isSessionRunning
                        ? "is-tag-live"
                        : "is-tag-idle",
                  )}
                >
                  {isWaitingApproval
                    ? "Paused (Izin Tertahan)"
                    : isSessionRunning
                      ? "Writing Code"
                      : "Standby"}
                </span>
              </div>
              <p className="subagent-item-task">
                {isWaitingApproval
                  ? `Eksekusi modifikasi (${activePermission?.toolName || "action"}) ditahan hingga disetujui`
                  : isSessionRunning
                    ? "Menulis komponen, logika arsitektur & modifikasi kode"
                    : "Standby siap implementasi"}
              </p>
            </div>
          </div>

          {/* Agent 3: Athena */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8" }}
            >
              🔍
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Athena (Coordinator)</span>
                <span className="subagent-item-role">Architecture &amp; Schema</span>
                <span
                  className={cx(
                    "subagent-item-tag",
                    isWaitingApproval
                      ? "is-tag-paused"
                      : isSessionRunning
                        ? "is-tag-live"
                        : "is-tag-idle",
                  )}
                >
                  {isWaitingApproval
                    ? "Paused"
                    : isSessionRunning
                      ? "Sync Specs"
                      : "Standby"}
                </span>
              </div>
              <p className="subagent-item-task">
                {isWaitingApproval
                  ? "Pemeriksaan selesai, workflow lanjutan dijeda sementara"
                  : isSessionRunning
                    ? "Sinkronisasi spesifikasi & validasi schema DTO"
                    : "Standby siap verifikasi kontrak"}
              </p>
            </div>
          </div>

          {/* Agent 4: Apollo */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(236, 72, 153, 0.15)", borderColor: "#ec4899" }}
            >
              🧪
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Apollo (QA Runner)</span>
                <span className="subagent-item-role">Testing &amp; Security</span>
                <span
                  className={cx(
                    "subagent-item-tag",
                    isWaitingApproval
                      ? "is-tag-paused"
                      : isSessionRunning
                        ? "is-tag-live"
                        : "is-tag-idle",
                  )}
                >
                  {isWaitingApproval
                    ? "Paused"
                    : isSessionRunning
                      ? "Validating"
                      : "Standby"}
                </span>
              </div>
              <p className="subagent-item-task">
                {isWaitingApproval
                  ? "Menunggu perubahan kode disetujui untuk menjalankan validasi"
                  : isSessionRunning
                    ? "Menjalankan assertions, lint check & integritas sistem"
                    : "Test runner disiapkan & standby"}
              </p>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="subagent-panel-footer">
          <button
            type="button"
            className="subagent-open-office-action"
            onClick={() => {
              onClose();
              onOpenOffice();
            }}
          >
            <span className="open-office-icon" aria-hidden="true">
              🏢
            </span>
            <span className="open-office-label">Buka Visual Office (Studio)</span>
            <span className="open-office-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    );
  },
);
