import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Field, Input, Textarea, TooltipButton, cx, portalOverlay } from "../ui";
import { IconX } from "../icons";
import { SettingsMenuSelect } from "./SettingsMenuSelect";
import { SquadMemberSkillsDialog } from "./SquadMemberSkillsDialog";
import { CHARACTER_ARCHETYPES } from "./subagent-character-profiles";
import { useAppStore } from "../../stores/app-store";
import {
  ZEUS_SQUAD_COLORS,
  ZEUS_SQUAD_ICONS,
  ZEUS_SQUAD_ICON_CHARACTERS,
  ZEUS_SQUAD_ICON_IDS,
  createZeusSquadMember,
  resolveSquadMemberTemplates,
  saveZeusSquadMember,
  useSquadWorkspace,
  type SquadMemberTemplate,
  type ZeusSquadIconId,
  type ZeusSquadMember,
} from "../../features/zeus-squad/use-zeus-squad";

/**
 * Create or edit one squad member. A shipped member edits only its
 * overrides — icon, color, character, and copy fall back to the shipped
 * default — while a new member stores exactly what this sheet fills in.
 *
 * The form is two columns: who the member is (appearance and character) on
 * the left, what the member carries (copy, skills, team) on the right.
 *
 * A new member first shows suggestions: the shipped roles this team does not
 * have yet plus the built-ins the page passes in. Picking one only fills the
 * form below; nothing is stored until the user saves.
 */
export function ZeusSquadMemberSheet({
  member,
  templates = [],
  onClose,
  onSaved,
}: {
  /** `null` creates a new member instead of editing one. */
  member: ZeusSquadMember | null;
  /** Built-in subagents offered as create-mode suggestions. */
  templates?: readonly SquadMemberTemplate[];
  onClose: () => void;
  onSaved: (name: string, created: boolean) => void;
}) {
  const { t } = useTranslation();
  const { teams, activeTeamId } = useSquadWorkspace();
  const projectPath = useAppStore((state) => state.workspace?.path ?? null);
  const [name, setName] = useState(member?.name ?? "");
  const [badge, setBadge] = useState(member?.badge ?? "");
  const [description, setDescription] = useState(member?.description ?? "");
  const [iconId, setIconId] = useState<ZeusSquadIconId>(member?.iconId ?? "bot");
  const [color, setColor] = useState<string>(member?.color ?? ZEUS_SQUAD_COLORS[0]);
  const [skills, setSkills] = useState<string[]>(member?.skills ?? []);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [teamId, setTeamId] = useState(member?.teamId ?? activeTeamId);
  /**
   * `null` means "follow the icon": the character tracks the icon until this
   * sheet picks one, so changing the icon still changes the office chibi.
   */
  const [character, setCharacter] = useState<string | null>(member?.character ?? null);
  const created = member === null;
  const resolvedCharacter = character ?? ZEUS_SQUAD_ICON_CHARACTERS[iconId];

  /**
   * Create mode only: what this team could add — the shipped roles it lacks
   * plus the built-ins the page passed in. The store drops anything the roster
   * already holds, so a suggestion never duplicates a member.
   */
  const suggestions = useMemo(
    () => (created ? resolveSquadMemberTemplates(teamId, templates) : []),
    [created, teamId, templates],
  );

  /** Fills the fields below from one suggestion; the user still saves it. */
  const applyTemplate = (template: SquadMemberTemplate) => {
    setName(template.name);
    setBadge(template.badge);
    setDescription(template.description);
    setSkills([...template.skills]);
    setIconId(template.iconId);
    setColor(template.color);
    setCharacter(template.character ?? null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Escape unwinds one layer at a time: the skills dialog first, then this
      // sheet, so a picker opened here never closes both on one key press.
      if (event.key === "Escape" && !skillsDialogOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, skillsDialogOpen]);

  const save = () => {
    const nextName = name.trim();
    if (!nextName) return;
    const draft = {
      name: nextName,
      badge: badge.trim(),
      description: description.trim(),
      iconId,
      color,
      skills: skills.map((skill) => skill.trim()).filter(Boolean),
      character: resolvedCharacter,
      teamId,
    };
    if (member) saveZeusSquadMember(member.id, draft);
    else createZeusSquadMember(draft);
    onSaved(nextName, created);
  };

  const appearanceLabel = t("settings.zeusSquad.appearance");
  const characterLabel = t("settings.zeusSquad.character");
  const templatesLabel = t("settings.zeusSquad.templates");

  return portalOverlay(
    <div
      className="overlay ext-sheet-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog ext-sheet is-wide"
        role="dialog"
        aria-modal
        aria-labelledby="zeus-squad-sheet-title"
      >
        <div className="ext-sheet-head">
          <div>
            <h3 id="zeus-squad-sheet-title" className="ext-sheet-title">
              {created ? t("settings.zeusSquad.addTitle") : t("settings.zeusSquad.editTitle")}
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
          {suggestions.length > 0 ? (
            <div className="ext-field-group">
              <div className="ext-field-label">{templatesLabel}</div>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                role="group"
                aria-label={templatesLabel}
              >
                {suggestions.map((template) => {
                  const archetype = CHARACTER_ARCHETYPES.find(
                    (candidate) => candidate.id === template.character,
                  );
                  return (
                    <button
                      key={template.id}
                      type="button"
                      className="ext-archetype-chip"
                      onClick={() => applyTemplate(template)}
                      title={template.badge}
                    >
                      <span className="ext-archetype-emoji" aria-hidden="true">
                        {archetype?.avatarEmoji ?? "✨"}
                      </span>
                      {template.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="ext-sheet-columns">
            {/* Left: who the member is — how the Live Office draws it. */}
            <div>
              <div className="ext-field-group">
                <div className="ext-field-label">{appearanceLabel}</div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  role="group"
                  aria-label={appearanceLabel}
                >
                  {ZEUS_SQUAD_ICON_IDS.map((id) => {
                    const Icon = ZEUS_SQUAD_ICONS[id];
                    const selected = iconId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        className={cx("ext-archetype-chip", selected && "is-selected")}
                        style={{
                          width: 36,
                          height: 36,
                          padding: 0,
                          justifyContent: "center",
                          color: selected ? color : undefined,
                          borderColor: selected ? color : undefined,
                        }}
                        onClick={() => setIconId(id)}
                        aria-label={id}
                        title={id}
                      >
                        <span className="ext-archetype-emoji" aria-hidden="true">
                          <Icon size={16} />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}
                  role="group"
                  aria-label={appearanceLabel}
                >
                  {ZEUS_SQUAD_COLORS.map((swatch) => {
                    const selected = color === swatch;
                    return (
                      <button
                        key={swatch}
                        type="button"
                        aria-pressed={selected}
                        aria-label={swatch}
                        title={swatch}
                        onClick={() => setColor(swatch)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: swatch,
                          cursor: "pointer",
                          border: selected
                            ? "2px solid var(--ds-text-primary)"
                            : "1px solid var(--ds-border-subtle)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="ext-field-group">
                <div className="ext-field-label">{characterLabel}</div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  role="group"
                  aria-label={characterLabel}
                >
                  {CHARACTER_ARCHETYPES.map((archetype) => {
                    const selected = resolvedCharacter === archetype.id;
                    return (
                      <button
                        key={archetype.id}
                        type="button"
                        aria-pressed={selected}
                        className={cx("ext-archetype-chip", selected && "is-selected")}
                        style={{
                          color: selected ? archetype.color : undefined,
                          borderColor: selected ? archetype.color : undefined,
                        }}
                        onClick={() => setCharacter(archetype.id)}
                      >
                        <span className="ext-archetype-emoji" aria-hidden="true">
                          {archetype.avatarEmoji}
                        </span>
                        {archetype.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: what the member carries. */}
            <div>
              <div className="ext-field-pair">
                <Field label={t("settings.zeusSquad.name")}>
                  <Input
                    value={name}
                    autoFocus={created}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field label={t("settings.zeusSquad.role")}>
                  <Input value={badge} onChange={(event) => setBadge(event.target.value)} />
                </Field>
              </div>

            <Field label={t("extensions.subagents.description")}>
              <Textarea
                value={description}
                rows={2}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>

            <div className="ext-field-group">
              <div className="ext-field-label">{t("settings.zeusSquad.skills")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.length === 0 ? (
                  <span className="ext-sheet-note">{t("settings.zeusSquad.skillsEmpty")}</span>
                ) : (
                  skills.map((skill) => (
                    <span key={skill} className="agent-capability-badge">
                      {skill}
                    </span>
                  ))
                )}
              </div>
              <Button variant="ghost" onClick={() => setSkillsDialogOpen(true)}>
                {t("settings.zeusSquad.skillsPick")}
              </Button>
            </div>

            {teams.length > 1 ? (
              <div className="ext-field-group">
                <div className="ext-field-label">{t("settings.zeusSquad.team")}</div>
                <SettingsMenuSelect
                  fullWidth
                  label={t("settings.zeusSquad.team")}
                  value={teamId}
                  options={teams.map((team) => ({ id: team.id, label: team.name }))}
                  onChange={setTeamId}
                />
              </div>
            ) : null}

            </div>
          </div>
        </div>

        <div className="ext-sheet-actions">
          <div className="ext-sheet-actions-end">
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={save} disabled={!name.trim()}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>

      {skillsDialogOpen ? (
        <SquadMemberSkillsDialog
          selected={skills}
          projectPath={projectPath ?? undefined}
          onApply={setSkills}
          onClose={() => setSkillsDialogOpen(false)}
        />
      ) : null}
    </div>,
  );
}
