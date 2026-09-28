import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  messageHasTranscriptContent,
  vendorAccountOmitsSessionModel,
} from "../lib/chat-launch-error";
import { Composer } from "./Composer";
import { HomeMascotLogo } from "./HomeMascotLogo";
import { YoungZeusMascot, type YoungZeusState } from "./YoungZeusMascot";
import { HomeProjectSwitcher } from "./HomeProjectSwitcher";
import { IconX } from "./icons";
import { TooltipButton, cx } from "./ui";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { SessionPane } from "./SessionPane";
import { ConversationWidthHandles } from "./ConversationWidthHandles";
import { useAppStore } from "../stores/app-store";
import { headPermission } from "../lib/pending-permissions";
import { headAsk } from "../lib/pending-asks";
import { PixelAgentsOffice, PixelAgentsOfficeModal } from "../features/chat/transcript/PixelAgentsOffice";
import { TeamRosterBar } from "../features/chat/transcript/TeamRosterBar";
import { MindmapTab } from "./workpanel/MindmapTab";
import { useWorkspaceViewStore } from "../stores/workspace-view-store";
import { ZeusSubagentTasksFloatingPanel } from "./ZeusSubagentTasksFloatingPanel";
import { useSubagentsData } from "../hooks/use-subagents-data";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building03Icon,
  BotIcon,
  Alert02Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  Folder01Icon,
  Route01Icon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";

const StableComposer = memo(Composer);

function i18nHasError(t: (key: string) => string, code: string) {
  const key = `errors.${code}`;
  return t(key) !== key;
}

function projectName(path?: string | null, name?: string | null) {
  if (name) return name;
  if (!path) return null;
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] || path;
}

/**
 * Top-level chat page surface.
 *
 * Holds the retained session panes (ADR 0137). Every session the user has
 * visited recently keeps its own mounted `SessionPane`, bounded by
 * `RETAINED_SESSION_PANE_LIMIT`; switching reveals the destination pane and
 * hides the others, so no transcript is rebuilt and no frame is dimmed. Only a
 * session with no retained pane has to wait, and that wait is marked by the
 * progress track alone while the current pane stays on screen.
 *
 * The composer is mounted once for the surface rather than per branch: it owns
 * per-session drafts already, and remounting it on every switch discarded its
 * measured metrics and focus.
 */
export const ChatSurface = memo(function ChatSurface({
  visible = true,
}: {
  visible?: boolean;
}) {
  const { t } = useTranslation();
  const activeSessionId = useAppStore((state) => state.activeSessionId);
  const selectingSessionId = useAppStore((state) => state.selectingSessionId);
  const retainedSessionIds = useAppStore((state) => state.retainedSessionIds);
  const messages = useAppStore((state) => state.messages);
  // Only the error layer's retry affordance needs the run state here; each pane
  // reads its own session's flag.
  const isRunning = useAppStore((state) => state.isRunning);
  const runningSessions = useAppStore((state) => state.runningSessions);
  const workspace = useAppStore((state) => state.workspace);
  const error = useAppStore((state) => state.error);
  const errorCode = useAppStore((state) => state.errorCode);
  const errorRetriable = useAppStore((state) => state.errorRetriable);
  const openProject = useAppStore((state) => state.openProject);
  const activeWorkspaceView = useWorkspaceViewStore((s) => s.activeView);
  const setWorkspaceActiveView = useWorkspaceViewStore((s) => s.setActiveView);
  const selectedAgentId = useWorkspaceViewStore((s) => s.selectedAgentId);
  const [hiddenVendorModelKey, setHiddenVendorModelKey] = useState<string | null>(
    null,
  );
  const providers = useAppStore((state) => state.providers);
  const activeSession = useAppStore((state) =>
    state.activeSessionId
      ? state.sessions.find((session) => session.id === state.activeSessionId)
      : undefined,
  );

  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleInput = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(".composer-shell") ||
        target?.classList.contains("composer-input") ||
        target?.tagName === "TEXTAREA"
      ) {
        setIsTyping(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setIsTyping(false);
        }, 1400);
      }
    };
    window.addEventListener("input", handleInput, true);
    return () => {
      window.removeEventListener("input", handleInput, true);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isSubagentsPanelOpen, setIsSubagentsPanelOpen] = useState(false);
  const { officeSubagents } = useSubagentsData();
  const workerCount = Math.max(1, officeSubagents.filter((a) => a.id !== "zeus").length);

  // A pending permission or ask is itself transcript content, so the empty
  // state must yield to it. Each pane subscribes to its own queues; the surface
  // only needs the visible session's to choose between empty state and panes.
  const activePermission = useAppStore((state) =>
    state.activeSessionId
      ? headPermission(state.pendingPermissions, state.activeSessionId)
      : undefined,
  );
  const askPending = useAppStore((state) =>
    Boolean(
      state.activeSessionId &&
        headAsk(state.pendingAsks, state.activeSessionId),
    ),
  );

  const heroProject = useMemo(
    () =>
      activeSession?.projectPath?.trim()
        ? projectName(activeSession.projectPath, workspace?.name)
        : null,
    [activeSession?.projectPath, workspace?.name],
  );
  const isTemporarySession = Boolean(
    activeSessionId && activeSession && !activeSession.projectPath?.trim(),
  );
  const emptyTitleParts = useMemo(() => {
    const marker = "__PROJECT__";
    const template = t("chat.emptyTitleInProject", { project: marker });
    const [before = "", after = ""] = template.split(marker);
    return { before, after };
  }, [t]);

  // The head of the retained order is the session on screen. It equals
  // `activeSessionId` except during a cold switch, where the destination has no
  // pane yet: the surface then keeps showing the pane it already has instead of
  // blanking or dimming it, and the store promotes the destination once its
  // transcript commits.
  const visibleSessionId = retainedSessionIds[0];
  const isSessionRunning = Boolean(
    (visibleSessionId && runningSessions[visibleSessionId]) ||
      (activeSessionId && runningSessions[activeSessionId]) ||
      isRunning,
  );
  // Only a cold switch is a wait worth marking. Once the destination is the
  // visible pane the user is already reading it, so a warm switch (including
  // re-selecting the session already on screen) shows no progress track even
  // though revalidation may still be in flight.
  const sessionSwitching =
    Boolean(selectingSessionId) && selectingSessionId !== visibleSessionId;

  const hasTranscript =
    Boolean(activePermission) ||
    askPending ||
    messages.some((message) => messageHasTranscriptContent(message));
  // The empty state belongs to the session on screen. While a cold switch is
  // still resolving, the visible pane keeps its own transcript, so the hero must
  // not take over just because the destination projection is still empty.
  const showEmptyState =
    !hasTranscript && (!visibleSessionId || visibleSessionId === activeSessionId);
  const vendorModelMissing = vendorAccountOmitsSessionModel(
    activeSession,
    providers,
  );
  const vendorModelKey = vendorModelMissing
    ? `${activeSession?.providerId ?? ""}:${activeSession?.modelId ?? ""}`
    : null;
  const showVendorModelError =
    vendorModelKey !== null && hiddenVendorModelKey !== vendorModelKey;
  const noticeError =
    error ?? (showVendorModelError ? t("errors.MODEL_NOT_CONFIGURED") : null);
  const noticeCode = error
    ? errorCode
    : showVendorModelError
      ? "MODEL_NOT_CONFIGURED"
      : null;
  return (
    <div
      className={`chat-surface route-surface${sessionSwitching ? " session-switching" : ""}`}
      aria-busy={sessionSwitching}
    >
      {sessionSwitching ? (
        <div className="session-switch-progress" aria-hidden>
          <span />
        </div>
      ) : null}
      <ConversationWidthHandles />
      {showEmptyState ? (
        <div
          className="home-main-content"
          data-testid="home-empty"
          data-home-session-kind={
            heroProject ? "project" : isTemporarySession ? "temporary" : "empty"
          }
        >
          <div className="home-scroll">
            <div className="home-stack-inner">
              <div className="empty-hero">
                <div
                  className="empty-hero-icon"
                  data-testid="home-icon"
                  aria-hidden
                >
                  <HomeMascotLogo />
                  <YoungZeusMascot size={130} state={isTyping ? "typing" : undefined} />
                </div>
                <h1>
                  {heroProject ? (
                    <>
                      {emptyTitleParts.before}
                      <HomeProjectSwitcher name={heroProject} path={workspace?.path || activeSession?.projectPath || null} />
                      {emptyTitleParts.after}
                    </>
                  ) : isTemporarySession ? (
                    t("chat.emptyTitleTemporary")
                  ) : (
                    t("chat.emptyTitle")
                  )}
                </h1>
                <div className="home-zeus-thought" aria-live="polite">
                  <div className="home-zeus-badge">
                    <span className="home-zeus-dot" />
                    <span>
                      {isTyping
                        ? "STATUS: MENDENGARKAN & MENYIMAK..."
                        : "STATUS: SEDANG MENUNGGU PERTANYAAN..."}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="zeus-view-office-btn is-idle"
                    onClick={() => {
                      setWorkspaceActiveView("office");
                      setIsOfficeModalOpen(true);
                    }}
                    title="Buka AI Agent Office (Standby / Idle)"
                    style={{ marginTop: "8px" }}
                  >
                    <HugeiconsIcon icon={Building03Icon} size={14} className="office-btn-icon" />
                    <span className="office-btn-text">View AI Agent Office</span>
                    <span className="office-btn-idle">IDLE</span>
                  </button>
                </div>

                {/* Quick Launch Cards for Mindmap & Live Office */}
                <div className="home-quick-launch-grid" role="group" aria-label="Project Actions">
                  <button
                    type="button"
                    className="home-quick-launch-card"
                    onClick={() => setWorkspaceActiveView("office")}
                    title="Lihat Meja Kerja Tim Agen"
                  >
                    <div className="quick-launch-icon-badge" style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.15)" }}>
                      <HugeiconsIcon icon={Building03Icon} size={15} />
                    </div>
                    <div className="quick-launch-text">
                      <span className="quick-launch-title">Live Office Studio</span>
                      <span className="quick-launch-sub">Visual tim agen &amp; status</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="home-quick-launch-card"
                    onClick={() => setWorkspaceActiveView("mindmap")}
                    title="Jelajahi Peta Arsitektur Proyek"
                  >
                    <div className="quick-launch-icon-badge" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)" }}>
                      <HugeiconsIcon icon={Route01Icon} size={15} />
                    </div>
                    <div className="quick-launch-text">
                      <span className="quick-launch-title">Project Mindmap</span>
                      <span className="quick-launch-sub">Peta arsitektur &amp; token</span>
                    </div>
                  </button>
                </div>
              </div>
              <OnboardingChecklist />
            </div>
          </div>
          <div className="home-composer-wrap">
            <StableComposer variant="home" />
          </div>
        </div>
      ) : (
        <>
          <TeamRosterBar isStreaming={isSessionRunning} />

          <div
            className="session-panes"
            style={{ display: activeWorkspaceView === "chat" ? undefined : "none" }}
          >
            {retainedSessionIds.map((id) => (
              <SessionPane
                key={id}
                sessionId={id}
                visible={visible && id === visibleSessionId}
              />
            ))}
          </div>

          <div
            className="dynamic-workspace-canvas"
            style={{ display: activeWorkspaceView === "chat" ? "none" : "flex" }}
          >
            <div
              className="workspace-view-pane"
              style={{
                display:
                  activeWorkspaceView === "office" || activeWorkspaceView === "pipeline"
                    ? "flex"
                    : "none",
                width: "100%",
                height: "100%",
                flex: 1,
                minHeight: 0,
              }}
            >
              <PixelAgentsOffice
                isModal={false}
                streaming={isSessionRunning}
                pendingPermission={activePermission}
                initialViewMode={activeWorkspaceView === "pipeline" ? "pipeline" : "canvas"}
                focusedAgentId={selectedAgentId}
                sessionId={visibleSessionId}
              />
            </div>

            <div
              className="workspace-view-pane"
              style={{
                display: activeWorkspaceView === "mindmap" ? "flex" : "none",
                width: "100%",
                height: "100%",
                flex: 1,
                minHeight: 0,
              }}
            >
              <MindmapTab />
            </div>
          </div>

          <ZeusSubagentTasksFloatingPanel
            isOpen={isSubagentsPanelOpen}
            onClose={() => setIsSubagentsPanelOpen(false)}
            onOpenOffice={() => setWorkspaceActiveView("office")}
            isSessionRunning={isSessionRunning}
            activePermission={activePermission}
          />

          {activeWorkspaceView === "chat" && (
            <div
              className={cx(
                "zeus-floating-worker",
                !isSessionRunning && !activePermission && "is-idle",
                Boolean(activePermission) && "is-waiting",
              )}
              data-testid="zeus-floating-worker"
              aria-live="polite"
            >
            <YoungZeusMascot
              size={isSessionRunning || activePermission ? 26 : 22}
              state={activePermission ? "waiting" : isSessionRunning ? "working" : "waiting"}
              interactive={false}
            />

            {activePermission ? (
              <div className="zeus-floating-label is-waiting-approval">
                <span className="zeus-floating-title is-warning">
                  <HugeiconsIcon icon={Alert02Icon} size={13} className="zeus-warning-icon" />
                  Menunggu izin: {activePermission.toolName || "Approval"}
                </span>
              </div>
            ) : isSessionRunning ? (
              <div className="zeus-floating-label">
                <span className="zeus-floating-title">
                  Zeus sedang berpikir
                  <span className="zeus-floating-dots" aria-hidden="true">
                    <span className="zeus-floating-dot" />
                    <span className="zeus-floating-dot" />
                    <span className="zeus-floating-dot" />
                  </span>
                </span>
              </div>
            ) : null}

            {(isSessionRunning || Boolean(activePermission)) && (
              <span className="zeus-floating-divider" aria-hidden="true" />
            )}

            {/* Floating Sub-Agent Tasks Button */}
            <button
              type="button"
              className={cx(
                "zeus-subagents-pill-btn",
                isSubagentsPanelOpen && "is-open",
                Boolean(activePermission) && "is-warning",
              )}
              onClick={() => setIsSubagentsPanelOpen((v) => !v)}
              title="Klik untuk melihat tugas & status detail sub-agent"
              aria-label="Sub-Agent Tasks"
              aria-expanded={isSubagentsPanelOpen}
            >
              <HugeiconsIcon icon={BotIcon} size={13} className="subagent-pill-icon" />
              <span className="subagent-pill-label">
                {activePermission
                  ? "1 Butuh Izin"
                  : `${workerCount} Sub-Agent`}
              </span>
              <HugeiconsIcon
                icon={isSubagentsPanelOpen ? ChevronUpIcon : ChevronDownIcon}
                size={11}
                className="subagent-pill-arrow"
              />
            </button>

            <button
              type="button"
              className={cx(
                "zeus-view-office-btn",
                !isSessionRunning && !activePermission && "is-idle",
                Boolean(activePermission) && "is-waiting",
              )}
              onClick={() => setWorkspaceActiveView("office")}
              title={
                activePermission
                  ? "Buka AI Agent Office (Status: Paused Menunggu Approval)"
                  : isSessionRunning
                    ? "Buka AI Agent Office (Sedang Bekerja)"
                    : "Buka AI Agent Office (Standby / Idle)"
              }
              aria-label="View Office"
            >
              <HugeiconsIcon icon={Building03Icon} size={13} className="office-btn-icon" />
              <span className="office-btn-text">View Office</span>
              <span
                className={
                  activePermission
                    ? "office-btn-paused"
                    : isSessionRunning
                      ? "office-btn-live"
                      : "office-btn-idle"
                }
              >
                {activePermission ? "PAUSED" : isSessionRunning ? "LIVE" : "IDLE"}
              </span>
            </button>
          </div>
        )}
        {activeWorkspaceView === "chat" && <StableComposer variant="docked" />}
      </>
      )}

      {noticeError ? (
        <div className="chat-error-layer">
          <div className="chat-error-notice">
            <span title={noticeError}>
              {noticeCode && i18nHasError(t, noticeCode)
                ? t(`errors.${noticeCode}`)
                : noticeError}
              {showVendorModelError && !error && activeSession?.modelId ? (
                <>
                  {" "}
                  <code>{activeSession.modelId}</code>
                </>
              ) : null}
            </span>
            {(noticeCode === "MODEL_NOT_CONFIGURED" ||
              noticeCode === "PROVIDER_SECRET_MISSING" ||
              noticeCode === "PROVIDER_UNAUTHORIZED") && (
              <button
                type="button"
                className="chat-error-action"
                onClick={() => {
                  const store = useAppStore.getState();
                  store.setSettingsTab("agent");
                  store.setPage("settings");
                }}
              >
                {t("errors.action.openSettings")}
              </button>
            )}
            {errorRetriable && !isRunning ? (
              <button
                type="button"
                className="chat-error-action"
                onClick={() =>
                  void useAppStore.getState().retryLastPrompt()
                }
              >
                {t("errors.action.retry")}
              </button>
            ) : null}
            <TooltipButton
              type="button"
              tooltip={t("errors.action.dismiss")}
              ariaLabel={t("errors.action.dismiss")}
              className="chat-error-dismiss"
              onClick={() => {
                if (error) {
                  useAppStore.getState().clearError();
                  return;
                }
                if (vendorModelKey) setHiddenVendorModelKey(vendorModelKey);
              }}
            >
              <IconX size={13} />
            </TooltipButton>
          </div>
        </div>
      ) : null}

      <PixelAgentsOfficeModal
        isOpen={isOfficeModalOpen}
        onClose={() => setIsOfficeModalOpen(false)}
        streaming={isSessionRunning}
        pendingPermission={activePermission}
        sessionId={visibleSessionId}
      />
    </div>
  );
});
