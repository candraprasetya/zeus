import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Field, Input, Textarea, TooltipButton, portalOverlay } from "../ui";
import { IconX } from "../icons";
import { SettingsMenuSelect } from "./SettingsMenuSelect";
import {
  useSquadWorkspace,
  type SquadPipelineCard,
  type SquadPipelineCardDraft,
} from "../../features/zeus-squad/use-zeus-squad";

/**
 * One pipeline stage: what it is, what it produces, and who does it — the
 * team and the member the user assigns. The assignee list only offers the
 * chosen team's members, so a card can never point at someone invisible.
 */
export function SquadPipelineCardSheet({
  card,
  pipelineTeamId,
  onClose,
  onSubmit,
}: {
  /** `null` appends a new card to the pipeline. */
  card: SquadPipelineCard | null;
  pipelineTeamId: string;
  onClose: () => void;
  onSubmit: (draft: SquadPipelineCardDraft) => void;
}) {
  const { t } = useTranslation();
  const { teams, members } = useSquadWorkspace();
  const [title, setTitle] = useState(card?.title ?? "");
  const [detail, setDetail] = useState(card?.detail ?? "");
  const [teamId, setTeamId] = useState(card?.teamId || pipelineTeamId);
  const [assigneeId, setAssigneeId] = useState(card?.assigneeId ?? "");
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

  const submit = () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSubmit({ title: nextTitle, detail: detail.trim(), teamId, assigneeId: selectedAssignee });
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
