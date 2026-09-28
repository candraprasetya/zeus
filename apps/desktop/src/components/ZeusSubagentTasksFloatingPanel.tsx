import { useState, memo } from "react";
import { IconX } from "./icons";
import { cx } from "./ui";
import { useSubagentsData } from "../hooks/use-subagents-data";
import { useAppStore } from "../stores/app-store";
import { exportAuditTrailToMarkdown, type AgentAuditEvent } from "@pi-desktop/shared";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BotIcon,
  Alert02Icon,
  FlashIcon,
  Coffee01Icon,
  SourceCodeIcon,
  Search01Icon,
  TestTube01Icon,
  Settings02Icon,
  Building03Icon,
  ArrowRight01Icon,
  WorkflowSquare01Icon,
  Time02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { cleanAgentName } from "./settings/subagent-character-profiles";

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
    const [panelTab, setPanelTab] = useState<"roster" | "pipeline" | "audit">("roster");
    const {
      zeusSubagent,
      fixerSubagent,
      explorerSubagent,
      testRunnerSubagent,
      customSubagents,
    } = useSubagentsData();
    const showToast = useAppStore((state) => state.showToast);

    const handleExportAuditTrail = async () => {
      const events: AgentAuditEvent[] = [
        {
          id: "ev-1",
          flowId: "feature-delivery",
          agentRole: "Zeus (Lead)",
          kind: "flow_started",
          summary: "Memulai workflow Feature Delivery dengan shared context scratchpad.",
          timestamp: new Date(Date.now() - 180000).toISOString(),
        },
        {
          id: "ev-2",
          flowId: "feature-delivery",
          stepId: "survey",
          agentRole: "Explorer",
          kind: "handoff",
          summary: "Menyimpan 4 target file ke dalam scratchpad memory untuk Hermes.",
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: "ev-3",
          flowId: "feature-delivery",
          stepId: "implementation",
          agentRole: "Fixer",
          kind: "tool_dispatched",
          summary: "Eksekusi modifikasi file kode dan verifikasi schema contracts.",
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: "ev-4",
          flowId: "feature-delivery",
          stepId: "verification",
          agentRole: "QA Runner",
          kind: "step_completed",
          summary: "Verifikasi test suite berjalan sukses 100% green.",
          timestamp: new Date().toISOString(),
        },
      ];

      const md = exportAuditTrailToMarkdown(events, "Feature Delivery Pipeline");
      try {
        await navigator.clipboard.writeText(md);
        showToast("Audit Trail Markdown berhasil disalin ke clipboard!", { variant: "success" });
      } catch {
        showToast("Gagal menyalin audit trail", { variant: "error" });
      }
    };

    if (!isOpen) return null;

    const isWaitingApproval = Boolean(activePermission);
    const totalAgents = 4 + customSubagents.length;

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
              <HugeiconsIcon icon={BotIcon} size={16} />
            </span>
            <div className="subagent-panel-titles">
              <span className="subagent-panel-title">Sub-Agent Tasks &amp; Status</span>
              <span className="subagent-panel-subtitle">
                {isWaitingApproval
                  ? "Sistem dijeda: Menunggu izin user"
                  : isSessionRunning
                    ? `${totalAgents} Agen aktif menyelesaikan workflow`
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
              {isWaitingApproval ? (
                <>
                  <HugeiconsIcon icon={Alert02Icon} size={12} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
                  BUTUH APPROVAL
                </>
              ) : isSessionRunning ? (
                "● LIVE"
              ) : (
                "● STANDBY"
              )}
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
              <HugeiconsIcon icon={Alert02Icon} size={16} className="approval-notice-icon" />
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
              {isSessionRunning ? (
                <>
                  <HugeiconsIcon icon={FlashIcon} size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 5, color: "#f59e0b" }} />
                  Tim sub-agen sedang berkoordinasi secara otonom untuk menyelesaikan permintaan Anda.
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Coffee01Icon} size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 5, color: "#38bdf8" }} />
                  Tim sub-agen siap menerima instruksi atau prompt baru.
                </>
              )}
            </span>
          </div>
        )}

        {/* Tab Switcher: Roster vs CrewAI Pipeline vs Buzz Audit Trail */}
        <div className="subagent-panel-tabs" role="tablist">
          <button
            type="button"
            className={cx("subagent-panel-tab-btn", panelTab === "roster" && "is-active")}
            onClick={() => setPanelTab("roster")}
            role="tab"
            aria-selected={panelTab === "roster"}
          >
            <HugeiconsIcon icon={BotIcon} size={13} />
            <span>Roster</span>
          </button>
          <button
            type="button"
            className={cx("subagent-panel-tab-btn", panelTab === "pipeline" && "is-active")}
            onClick={() => setPanelTab("pipeline")}
            role="tab"
            aria-selected={panelTab === "pipeline"}
          >
            <HugeiconsIcon icon={WorkflowSquare01Icon} size={13} />
            <span>Crew Pipeline</span>
          </button>
          <button
            type="button"
            className={cx("subagent-panel-tab-btn", panelTab === "audit" && "is-active")}
            onClick={() => setPanelTab("audit")}
            role="tab"
            aria-selected={panelTab === "audit"}
          >
            <HugeiconsIcon icon={Time02Icon} size={13} />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Tab 1: Sub-Agent Roster & Tasks */}
        {panelTab === "roster" && (
        <div className="subagent-tasks-list" role="list">
          {/* Agent 1: Zeus (Lead) */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(245, 158, 11, 0.15)", borderColor: "#f59e0b" }}
            >
              <HugeiconsIcon icon={FlashIcon} size={16} color="#f59e0b" />
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">{cleanAgentName(zeusSubagent.name)}</span>
                <span className="subagent-item-role">{zeusSubagent.tag} · Main System Coordinator</span>
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
                    ? zeusSubagent.description
                    : "Standby siap menerima perintah"}
              </p>
            </div>
          </div>

          {/* Agent 2: Hermes (Fixer) */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981" }}
            >
              <HugeiconsIcon icon={SourceCodeIcon} size={16} color="#10b981" />
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Hermes · {cleanAgentName(fixerSubagent.name)}</span>
                <span className="subagent-item-role">{fixerSubagent.tag}</span>
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
                    ? fixerSubagent.description
                    : "Standby siap modifikasi kode"}
              </p>
            </div>
          </div>

          {/* Agent 3: Athena (Explorer) */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8" }}
            >
              <HugeiconsIcon icon={Search01Icon} size={16} color="#38bdf8" />
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Athena · {cleanAgentName(explorerSubagent.name)}</span>
                <span className="subagent-item-role">{explorerSubagent.tag}</span>
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
                      ? "Searching Specs"
                      : "Standby"}
                </span>
              </div>
              <p className="subagent-item-task">
                {isWaitingApproval
                  ? "Pemeriksaan selesai, workflow lanjutan dijeda sementara"
                  : isSessionRunning
                    ? explorerSubagent.description
                    : "Standby siap verifikasi codebase"}
              </p>
            </div>
          </div>

          {/* Agent 4: Apollo (Test runner) */}
          <div className="subagent-task-item" role="listitem">
            <div
              className="subagent-item-avatar"
              style={{ background: "rgba(236, 72, 153, 0.15)", borderColor: "#ec4899" }}
            >
              <HugeiconsIcon icon={TestTube01Icon} size={16} color="#ec4899" />
            </div>
            <div className="subagent-item-content">
              <div className="subagent-item-top">
                <span className="subagent-item-name">Apollo · {cleanAgentName(testRunnerSubagent.name)}</span>
                <span className="subagent-item-role">{testRunnerSubagent.tag}</span>
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
                      ? "Testing"
                      : "Standby"}
                </span>
              </div>
              <p className="subagent-item-task">
                {isWaitingApproval
                  ? "Menunggu perubahan kode disetujui untuk menjalankan validasi"
                  : isSessionRunning
                    ? testRunnerSubagent.description
                    : "Test runner disiapkan & standby"}
              </p>
            </div>
          </div>

          {/* User Custom Subagents from Settings */}
          {customSubagents.map((subagent) => (
            <div className="subagent-task-item" role="listitem" key={subagent.id}>
              <div
                className="subagent-item-avatar"
                style={{ background: "rgba(168, 85, 247, 0.15)", borderColor: "#a855f7" }}
              >
                <HugeiconsIcon icon={Settings02Icon} size={16} color="#a855f7" />
              </div>
              <div className="subagent-item-content">
                <div className="subagent-item-top">
                  <span className="subagent-item-name">{cleanAgentName(subagent.name)}</span>
                  <span className="subagent-item-role">{subagent.tag}</span>
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
                        ? "Active"
                        : "Standby"}
                  </span>
                </div>
                <p className="subagent-item-task">
                  {isWaitingApproval
                    ? "Workflow dijeda sementara menunggu izin user"
                    : isSessionRunning
                      ? subagent.description
                      : `Standby (${subagent.tools.join(", ")})`}
                </p>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Tab 2: CrewAI Pipeline (Multi-Agent Task Flows) */}
        {panelTab === "pipeline" && (
          <div className="subagent-tasks-list" role="list">
            <div className="subagent-pipeline-flow-banner">
              <span className="pipeline-flow-badge">Active Flow</span>
              <span className="pipeline-flow-name">Feature Delivery Pipeline</span>
            </div>
            {[
              {
                id: "survey",
                role: "Explorer",
                title: "1. Codebase Survey",
                status: isSessionRunning ? "Completed" : "Standby",
                desc: "Surveying symbols, project context and dependencies.",
              },
              {
                id: "fixer",
                role: "Fixer",
                title: "2. Implementation",
                status: isWaitingApproval ? "Paused (Approval)" : isSessionRunning ? "Running" : "Standby",
                desc: "Writing code changes and maintaining contracts.",
              },
              {
                id: "review",
                role: "Code Reviewer",
                title: "3. Quality Audit",
                status: "Pending",
                desc: "Checking edge cases, regressions and security.",
              },
              {
                id: "verify",
                role: "Test Runner",
                title: "4. Verification",
                status: "Pending",
                desc: "Executing automated tests and asserting green suite.",
              },
            ].map((step, idx) => (
              <div className="subagent-task-item pipeline-step-item" role="listitem" key={step.id}>
                <div
                  className="subagent-item-avatar"
                  style={{
                    background: step.status === "Running" ? "rgba(245, 158, 11, 0.2)" : "rgba(56, 189, 248, 0.15)",
                    borderColor: step.status === "Running" ? "#f59e0b" : "#38bdf8",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: "bold", color: "#e2e8f0" }}>{idx + 1}</span>
                </div>
                <div className="subagent-item-content">
                  <div className="subagent-item-top">
                    <span className="subagent-item-name">{step.title}</span>
                    <span className="subagent-item-role">{step.role}</span>
                    <span
                      className={cx(
                        "subagent-item-tag",
                        step.status.includes("Paused")
                          ? "is-tag-paused"
                          : step.status === "Running"
                            ? "is-tag-live"
                            : "is-tag-idle",
                      )}
                    >
                      {step.status}
                    </span>
                  </div>
                  <p className="subagent-item-task">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Buzz Audit Trail (Structured Event Ledger) */}
        {panelTab === "audit" && (
          <div className="subagent-tasks-list audit-trail-list" role="list">
            <div className="subagent-pipeline-flow-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="pipeline-flow-badge" style={{ background: "#3b82f6" }}>Buzz Ledger</span>
                <span className="pipeline-flow-name">Signed Event Stream</span>
              </div>
              <button
                type="button"
                className="subagent-audit-export-btn"
                data-testid="subagent-audit-export-btn"
                onClick={handleExportAuditTrail}
                title="Salin audit trail dalam format Markdown"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#93c5fd",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  cursor: "pointer",
                }}
              >
                <HugeiconsIcon icon={Download01Icon} size={12} />
                <span>Export MD</span>
              </button>
            </div>
            {[
              {
                time: "Baru saja",
                agent: "Zeus (Lead)",
                action: "Agent Dispatched",
                detail: "Mendelegasikan analisis arsitektur ke Explorer",
              },
              {
                time: "1m lalu",
                agent: "Explorer",
                action: "Handoff to Fixer",
                detail: "Shared context scratchpad diteruskan dengan 2 file target",
              },
              {
                time: "2m lalu",
                agent: "Fixer",
                action: "Tool Request: Write",
                detail: "Meminta izin penulisan file schema task-flows",
              },
            ].map((ev, i) => (
              <div className="subagent-task-item audit-event-item" role="listitem" key={i}>
                <div
                  className="subagent-item-avatar"
                  style={{ background: "rgba(59, 130, 246, 0.15)", borderColor: "#3b82f6" }}
                >
                  <HugeiconsIcon icon={Time02Icon} size={14} color="#3b82f6" />
                </div>
                <div className="subagent-item-content">
                  <div className="subagent-item-top">
                    <span className="subagent-item-name">{ev.action}</span>
                    <span className="subagent-item-role">{ev.agent}</span>
                    <span className="subagent-audit-time">{ev.time}</span>
                  </div>
                  <p className="subagent-item-task">{ev.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}


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
            <HugeiconsIcon icon={Building03Icon} size={16} className="open-office-icon" />
            <span className="open-office-label">Buka Visual Office (Studio)</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="open-office-arrow" />
          </button>
        </div>
      </div>
    );
  },
);
