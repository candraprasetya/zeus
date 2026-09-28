import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building03Icon,
  WorkflowSquare01Icon,
  Route01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { cx } from "../../../components/ui";
import { useWorkspaceViewStore } from "../../../stores/workspace-view-store";

export interface TeamRosterBarProps {
  isStreaming?: boolean;
  className?: string;
}

/**
 * The workspace view switcher: Chat, Live Office, Mindmap, and Pipeline.
 *
 * The member roster it used to carry now lives on the Live Office floor
 * itself, where a team is assigned and drawn, so this strip only routes
 * between views.
 */
export const TeamRosterBar = memo(function TeamRosterBar({
  isStreaming = false,
  className,
}: TeamRosterBarProps) {
  const activeView = useWorkspaceViewStore((s) => s.activeView);
  const setActiveView = useWorkspaceViewStore((s) => s.setActiveView);

  return (
    <div
      className={cx("team-roster-container", className)}
      role="region"
      aria-label="Workspace views"
    >
      <div className="team-roster-top">
        <div className="workspace-view-segmented-tabs" role="tablist" aria-label="Workspace View">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "chat"}
            className={cx("ws-tab-btn", activeView === "chat" && "is-active")}
            onClick={() => setActiveView("chat")}
            title="Percakapan Utama (Chat & Code)"
          >
            <HugeiconsIcon icon={Message01Icon} size={13} className="ws-tab-icon" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "office"}
            className={cx("ws-tab-btn", activeView === "office" && "is-active")}
            onClick={() => setActiveView("office")}
            title="Virtual Office Studio (Animasi & Meja Kerja Agen)"
          >
            <HugeiconsIcon icon={Building03Icon} size={13} className="ws-tab-icon" />
            <span>Live Office</span>
            {isStreaming && <span className="ws-tab-live-pulse" />}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "mindmap"}
            className={cx("ws-tab-btn", activeView === "mindmap" && "is-active")}
            onClick={() => setActiveView("mindmap")}
            title="Arsitektur Fitur & Peta Proyek (Mindmap)"
          >
            <HugeiconsIcon icon={Route01Icon} size={13} className="ws-tab-icon" />
            <span>Mindmap</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "pipeline"}
            className={cx("ws-tab-btn", activeView === "pipeline" && "is-active")}
            onClick={() => setActiveView("pipeline")}
            title="Multi-Agent Task Flow (Kanban Pipeline)"
          >
            <HugeiconsIcon icon={WorkflowSquare01Icon} size={13} className="ws-tab-icon" />
            <span>Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
});
