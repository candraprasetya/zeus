import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SourceCodeIcon,
  Search01Icon,
  TestTube01Icon,
  CheckCheckIcon,
  Alert02Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import { cx } from "../../../components/ui";

export interface SquadMemberTask {
  id: string;
  role: string; // e.g. "fixer", "explorer"
  label: string; // e.g. "Fixer 1"
  taskDescription: string;
  status: "running" | "completed" | "failed";
}

export interface SubagentSquadCardProps {
  squadRole: string; // e.g. "Fixer", "Explorer"
  tasks: SquadMemberTask[];
  isLive?: boolean;
}

export const SubagentSquadCard = memo(function SubagentSquadCard({
  squadRole,
  tasks,
  isLive = false,
}: SubagentSquadCardProps) {
  if (!tasks || tasks.length === 0) return null;

  const roleLower = squadRole.toLowerCase();
  const getRoleIcon = () => {
    if (roleLower.includes("fix") || roleLower.includes("code")) return SourceCodeIcon;
    if (roleLower.includes("explor") || roleLower.includes("search")) return Search01Icon;
    if (roleLower.includes("test")) return TestTube01Icon;
    return FlashIcon;
  };

  const getAccentColor = () => {
    if (roleLower.includes("fix")) return "#10b981";
    if (roleLower.includes("explor")) return "#38bdf8";
    if (roleLower.includes("test")) return "#a855f7";
    return "#f59e0b";
  };

  const accentColor = getAccentColor();

  return (
    <div
      className={cx("subagent-squad-card", isLive && "is-squad-live")}
      style={{
        borderLeft: `3px solid ${accentColor}`,
      }}
      role="region"
      aria-label={`Multi-Agent Squad: ${squadRole}`}
    >
      <div className="squad-card-header">
        <div className="squad-header-left">
          <div
            className="squad-avatar-badge"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
              borderColor: `${accentColor}40`,
            }}
          >
            <HugeiconsIcon icon={getRoleIcon()} size={14} />
          </div>
          <div className="squad-header-text">
            <span className="squad-title">
              {squadRole.toUpperCase()} SQUAD ({tasks.length} sub-agents)
            </span>
            <span className="squad-subtitle">
              {isLive ? "Mengeksekusi tugas secara paralel" : "Tugas paralel selesai"}
            </span>
          </div>
        </div>

        <div className="squad-header-right">
          <span
            className={cx(
              "squad-live-badge",
              isLive ? "is-live" : "is-completed",
            )}
          >
            {isLive ? "● RUNNING" : "✓ COMPLETED"}
          </span>
        </div>
      </div>

      <div className="squad-task-items" role="list">
        {tasks.map((task, idx) => (
          <div key={task.id || idx} className="squad-task-item" role="listitem">
            <div className="squad-task-status-dot">
              {task.status === "completed" ? (
                <HugeiconsIcon icon={CheckCheckIcon} size={12} color="#10b981" />
              ) : task.status === "failed" ? (
                <HugeiconsIcon icon={Alert02Icon} size={12} color="#ef4444" />
              ) : (
                <span className="task-pulsing-dot" style={{ background: accentColor }} />
              )}
            </div>
            <div className="squad-task-content">
              <span className="squad-task-label" style={{ color: accentColor }}>
                {task.label || `${squadRole} ${idx + 1}`}:
              </span>
              <span className="squad-task-desc">{task.taskDescription}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
