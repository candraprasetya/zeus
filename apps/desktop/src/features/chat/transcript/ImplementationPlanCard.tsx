import { memo, useEffect, useState } from "react";
import {
  IconCircleCheck,
  IconClose,
  IconExternal,
  IconFileText,
  IconPlay,
  IconEye,
} from "../../../components/icons";
import type { PlanApprovalStatus } from "@pi-desktop/shared";
import { portalOverlay, TooltipButton } from "../../../components/ui";
import { Markdown } from "../../../components/Markdown";
import { useAppStore } from "../../../stores/app-store";
import { preferredFileWorkPanelTab } from "../../../lib/work-panel-tabs";

export type ImplementationPlanProps = {
  title: string;
  summary?: string;
  markdown?: string;
  artifactPath?: string;
  status?: PlanApprovalStatus;
  proposalId?: string;
  sessionId?: string;
  turnId?: string;
  toolCallId?: string;
  version?: number;
  onProceed?: () => void | Promise<void>;
  onView?: () => void;
};

export const ImplementationPlanCard = memo(function ImplementationPlanCard({
  title,
  summary,
  markdown,
  artifactPath,
  status = "pending",
  proposalId,
  sessionId,
  turnId,
  toolCallId,
  version,
  onProceed,
  onView,
}: ImplementationPlanProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [isProceeded, setIsProceeded] = useState(status === "approved");

  const resolvePlan = useAppStore((state) => state.resolvePlan);
  const showToast = useAppStore((state) => state.showToast);
  const pluginViews = useAppStore((state) => state.pluginViews);
  const openWorkPanelTabForSession = useAppStore(
    (state) => state.openWorkPanelTabForSession,
  );

  useEffect(() => {
    if (status === "approved") {
      setIsProceeded(true);
    }
  }, [status]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleOpenArtifact = () => {
    if (!artifactPath || !sessionId) return;
    openWorkPanelTabForSession(
      sessionId,
      preferredFileWorkPanelTab(artifactPath, pluginViews),
    );
  };

  const handleProceed = async () => {
    if (isProceeding) return;
    setIsProceeding(true);
    try {
      if (proposalId && sessionId) {
        await resolvePlan({
          proposalId,
          sessionId,
          turnId: turnId || "",
          toolCallId: toolCallId || "",
          version: version ?? 1,
          action: "approve",
          targetPermissionMode: "auto",
        });
      }
      if (onProceed) {
        await onProceed();
      }
      setIsProceeded(true);
      showToast("Rencana implementasi disetujui. Memulai eksekusi...", {
        variant: "success",
      });
    } catch {
      // If already resolved or approved, mark as proceeded
      setIsProceeded(true);
    } finally {
      setIsProceeding(false);
      setIsModalOpen(false);
    }
  };

  const handleOpenView = () => {
    if (onView) {
      onView();
    }
    setIsModalOpen(true);
  };

  return (
    <>
      {isProceeded ? (
        <div
          className="implementation-plan-proceeded-banner"
          data-testid="implementation-plan-proceeded"
        >
          <div className="implementation-plan-proceeded-content">
            <IconCircleCheck size={16} className="implementation-plan-check-icon" />
            <span className="implementation-plan-proceeded-label">Proceeded with</span>
            <IconFileText size={15} className="implementation-plan-file-icon" />
            <span className="implementation-plan-proceeded-title">{title}</span>
          </div>
          <button
            type="button"
            className="implementation-plan-view-mini-btn"
            data-testid="plan-card-view-btn"
            onClick={handleOpenView}
            title="Lihat isi rencana implementasi"
            aria-label="View plan"
          >
            <IconEye size={13} />
            <span>View</span>
          </button>
        </div>
      ) : (
        <div
          className="implementation-plan-card"
          data-testid="implementation-plan-card"
        >
          <div className="implementation-plan-header">
            <IconFileText size={16} className="implementation-plan-icon" />
            <span className="implementation-plan-title">{title}</span>
          </div>
          {summary && <p className="implementation-plan-summary">{summary}</p>}
          <div className="implementation-plan-actions">
            <button
              type="button"
              className="implementation-plan-btn implementation-plan-view-btn"
              data-testid="plan-card-view-btn"
              onClick={handleOpenView}
            >
              <IconEye size={13} />
              <span>View</span>
            </button>
            <button
              type="button"
              className="implementation-plan-btn implementation-plan-proceed-btn"
              data-testid="plan-card-proceed-btn"
              onClick={() => void handleProceed()}
              disabled={isProceeding}
            >
              <IconPlay size={13} />
              <span>{isProceeding ? "Proceeding..." : "Proceed"}</span>
            </button>
          </div>
        </div>
      )}

      {isModalOpen &&
        portalOverlay(
          <div
            className="plan-artifact-modal-backdrop"
            onClick={() => setIsModalOpen(false)}
            data-testid="plan-artifact-modal-backdrop"
          >
            <div
              className="plan-artifact-modal"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="plan-artifact-modal-head">
                <div className="plan-artifact-modal-title-group">
                  <IconFileText size={16} />
                  <h3 className="plan-artifact-modal-title">{title}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {artifactPath && (
                    <TooltipButton
                      type="button"
                      className="icon-btn"
                      tooltip="Buka di tab WorkPanel"
                      onClick={handleOpenArtifact}
                    >
                      <IconExternal size={14} />
                    </TooltipButton>
                  )}
                  <TooltipButton
                    type="button"
                    className="icon-btn"
                    tooltip="Tutup"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <IconClose size={15} />
                  </TooltipButton>
                </div>
              </header>

              <div className="plan-artifact-modal-body prose-chat">
                <Markdown source={markdown || summary || "Tidak ada detail konten tambahan."} />
              </div>

              <footer className="plan-artifact-modal-footer">
                <button
                  type="button"
                  className="implementation-plan-btn implementation-plan-view-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Tutup
                </button>
                {!isProceeded && (
                  <button
                    type="button"
                    className="implementation-plan-btn implementation-plan-proceed-btn"
                    onClick={() => void handleProceed()}
                    disabled={isProceeding}
                  >
                    <IconPlay size={13} />
                    <span>{isProceeding ? "Proceeding..." : "Proceed"}</span>
                  </button>
                )}
              </footer>
            </div>
          </div>,
        )}
    </>
  );
});
