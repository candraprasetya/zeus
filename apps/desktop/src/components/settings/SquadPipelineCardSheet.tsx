import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Field, Input, Textarea, TooltipButton, portalOverlay } from "../ui";
import { IconX } from "../icons";
import { SettingsMenuSelect } from "./SettingsMenuSelect";
import {
  useSquadWorkspace,
  type SquadPipelineCard,
  type SquadPipelineCardDraft,
} from "../../features/zeus-squad/use-zeus-squad";

/**
 * One pipeline stage: what it is, what it produces, and who does it — the
 * team and the member the user assigns, plus Goal Ancestry and Approval Gates.
 */
export function SquadPipelineCardSheet({
  card,
  pipelineTeamId,
  otherCards = [],
  onClose,
  onSubmit,
}: {
  /** `null` appends a new card to the pipeline. */
  card: SquadPipelineCard | null;
  pipelineTeamId: string;
  otherCards?: SquadPipelineCard[];
  onClose: () => void;
  onSubmit: (draft: SquadPipelineCardDraft) => void;
}) {
  const { t } = useTranslation();
  const { teams, members } = useSquadWorkspace();
  const [title, setTitle] = useState(card?.title ?? "");
  const [goal, setGoal] = useState(card?.goal ?? "");
  const [detail, setDetail] = useState(card?.detail ?? "");
  const [teamId, setTeamId] = useState(card?.teamId || pipelineTeamId);
  const [assigneeId, setAssigneeId] = useState(card?.assigneeId ?? "");
  const [requiresApproval, setRequiresApproval] = useState(Boolean(card?.requiresApproval));
  const [blockedBy, setBlockedBy] = useState<string[]>(card?.blockedBy ?? []);
  const created = card === null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const teamMembers = members.filter(
    (member) => member.teamId === teamId && member.enabled,
  );
  // A member moved teams after this card picked them: drop the stale id
  // instead of showing a select whose value is not in the list.
  const selectedAssignee = teamMembers.some((member) => member.id === assigneeId)
    ? assigneeId
    : "";

  const toggleBlockedBy = (targetCardId: string) => {
    setBlockedBy((prev) =>
      prev.includes(targetCardId)
        ? prev.filter((id) => id !== targetCardId)
        : [...prev, targetCardId],
    );
  };

  const submit = () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSubmit({
      title: nextTitle,
      goal: goal.trim() || undefined,
      detail: detail.trim(),
      teamId,
      assigneeId: selectedAssignee,
      requiresApproval,
      blockedBy,
    });
  };

  const selectGroup = (label: string, control: ReactNode) => (
    <div className="ext-field-group">
      <div className="ext-field-label">{label}</div>
      {control}
    </div>
  );

  return portalOverlay(
    <div
      className="overlay ext-sheet-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog ext-sheet is-narrow"
        role="dialog"
        aria-modal
        aria-labelledby="squad-card-sheet-title"
      >
        <div className="ext-sheet-head">
          <div>
            <h3 id="squad-card-sheet-title" className="ext-sheet-title">
              {created ? t("settings.zeusSquad.newCardTitle") : t("settings.zeusSquad.editCardTitle")}
            </h3>
          </div>
          <TooltipButton
            type="button"
            className="ext-sheet-close"
            ariaLabel={t("common.close")}
            tooltip={t("common.close")}
            onClick={onClose}
          >
            <IconX size={14} />
          </TooltipButton>
        </div>

        <div className="ext-sheet-body">
          <Field label={t("settings.zeusSquad.cardTitle")}>
            <Input
              value={title}
              autoFocus={created}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>

          <Field label={t("settings.zeusSquad.cardGoal")}>
            <Input
              value={goal}
              placeholder={t("settings.zeusSquad.cardGoalPlaceholder")}
              onChange={(event) => setGoal(event.target.value)}
            />
          </Field>

          <Field label={t("settings.zeusSquad.cardDetails")}>
            <Textarea
              value={detail}
              rows={3}
              placeholder={t("settings.zeusSquad.cardDetailsPlaceholder")}
              onChange={(event) => setDetail(event.target.value)}
            />
          </Field>

          {teams.length > 1
            ? selectGroup(
                t("settings.zeusSquad.cardTeam"),
                <SettingsMenuSelect
                  fullWidth
                  label={t("settings.zeusSquad.cardTeam")}
                  value={teamId}
                  options={teams.map((team) => ({ id: team.id, label: team.name }))}
                  onChange={(next) => {
                    setTeamId(next);
                    setAssigneeId("");
                  }}
                />,
              )
            : null}

          {selectGroup(
            t("settings.zeusSquad.cardAssignee"),
            <SettingsMenuSelect
              fullWidth
              label={t("settings.zeusSquad.cardAssignee")}
              value={selectedAssignee}
              disabled={teamMembers.length === 0}
              options={[
                { id: "", label: t("settings.zeusSquad.unassigned") },
                ...teamMembers.map((member) => ({
                  id: member.id,
                  label: member.badge ? `${member.name} — ${member.badge}` : member.name,
                })),
              ]}
              onChange={setAssigneeId}
            />,
          )}

          <div style={{ marginTop: "4px" }}>
            <Checkbox
              checked={requiresApproval}
              label={
                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                  {t("settings.zeusSquad.cardRequiresApproval")}
                </span>
              }
              onChange={(event) => setRequiresApproval(event.target.checked)}
            />
          </div>

          {otherCards.length > 0 ? (
            <div className="ext-field-group" style={{ marginTop: "6px" }}>
              <div className="ext-field-label" style={{ marginBottom: "6px" }}>
                {t("settings.zeusSquad.cardBlockedBy")}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  maxHeight: "120px",
                  overflowY: "auto",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "var(--ds-bg-hover)",
                  border: "1px solid var(--ds-border-subtle)",
                }}
              >
                {otherCards.map((other) => (
                  <Checkbox
                    key={other.id}
                    checked={blockedBy.includes(other.id)}
                    label={<span style={{ fontSize: "12px" }}>{other.title}</span>}
                    onChange={() => toggleBlockedBy(other.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="ext-sheet-actions">
          <div className="ext-sheet-actions-end">
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={submit} disabled={!title.trim()}>
              {created ? t("settings.zeusSquad.addCard") : t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>,
  );
}
