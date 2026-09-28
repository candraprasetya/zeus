import { memo, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReviewChangeEntry, ReviewChangesSummary } from "../../../lib/workspace-review";
import { ReviewChangeCard } from "../../../components/ReviewChangeCard";
import { IconChevronRight, IconDiff, IconExternal } from "../../../components/icons";
import { cx } from "../../../components/ui";
import { useAppStore } from "../../../stores/app-store";
import { toolWorkPanelTab } from "../../../lib/work-panel-tabs";

export type TurnReviewChangesBarProps = {
  entries: ReviewChangeEntry[];
  summary: ReviewChangesSummary;
};

export const TurnReviewChangesBar = memo(function TurnReviewChangesBar({
  entries,
  summary,
}: TurnReviewChangesBarProps) {
  const { t } = useTranslation();
  const detailsId = useId();
  const [open, setOpen] = useState(false);
  const openWorkPanelTab = useAppStore((state) => state.openWorkPanelTab);

  const uniqueFiles = useMemo(() => {
    return new Set(entries.map((entry) => entry.change.path)).size;
  }, [entries]);

  if (entries.length === 0 || uniqueFiles === 0) return null;

  const filesLabel = t("panel.review.filesChanged", {
    count: uniqueFiles,
    defaultValue: `${uniqueFiles} ${uniqueFiles === 1 ? "file" : "files"} changed`,
  });

  const handleOpenWorkPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWorkPanelTab(toolWorkPanelTab("review"));
  };

  return (
    <div
      className={cx("turn-review-bar-container", open && "is-open")}
      data-testid="turn-review-bar"
    >
      <div
        className="turn-review-bar"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <div className="turn-review-bar-left">
          <span className="turn-review-bar-count">{filesLabel}</span>
          <span
            className="turn-review-bar-diffs diff-counts"
            aria-label={`+${summary.additions}, -${summary.deletions}`}
          >
            {summary.additions > 0 && (
              <span className="diff-count-add">+{summary.additions}</span>
            )}
            {summary.deletions > 0 && (
              <span className="diff-count-del">−{summary.deletions}</span>
            )}
          </span>
          <span
            className={cx("turn-review-bar-caret", open && "is-open")}
            aria-hidden="true"
          >
            <IconChevronRight size={13} />
          </span>
        </div>

        <div className="turn-review-bar-right">
          <button
            type="button"
            className="turn-review-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            aria-label={open ? "Sembunyikan review file" : "Review perubahan file"}
          >
            <IconDiff size={13} className="turn-review-btn-icon" />
            <span className="turn-review-btn-text">Review</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="turn-review-details" id={detailsId}>
          <div className="turn-review-details-header">
            <span className="turn-review-details-title">
              Perubahan Berkas ({uniqueFiles})
            </span>
            <button
              type="button"
              className="turn-review-open-panel-btn"
              onClick={handleOpenWorkPanel}
              title="Buka di Panel Review Samping"
            >
              <IconExternal size={12} />
              <span>Buka di Work Panel</span>
            </button>
          </div>
          <div className="turn-review-files-list">
            {entries.map((entry) => (
              <ReviewChangeCard
                key={entry.change.snapshotId}
                message={entry.message}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
