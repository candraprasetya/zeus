import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Field, Input, Textarea, TooltipButton, portalOverlay } from "../ui";
import { SettingsMenuSelect } from "./SettingsMenuSelect";
import { CHARACTER_ARCHETYPES, getCharacterArchetype, getArchetypeHugeIcon } from "./subagent-character-profiles";
import { SquadSkillPicker } from "./SquadSkillPicker";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BotIcon,
  PaletteIcon,
  UserRoundIcon,
  Shield01Icon,
  ListChecksIcon,
  Target01Icon,
  PaintBoardIcon,
  SmartPhone01Icon,
  Compass01Icon,
  SourceCodeIcon,
  CloudServerIcon,
  CheckmarkBadge01Icon,
  CheckmarkCircle01Icon,
  Layers01Icon,
  Search01Icon,
  ArrowRight01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import {
  SQUAD_BUILTIN_TEMPLATES,
  ZEUS_SQUAD_COLORS,
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

const HUGE_ICON_MAP: Record<ZeusSquadIconId, typeof BotIcon> = {
  bot: BotIcon,
  palette: PaletteIcon,
  person: UserRoundIcon,
  shield: Shield01Icon,
  checks: ListChecksIcon,
  target: Target01Icon,
};

function getTemplateHugeIcon(template: SquadMemberTemplate): typeof BotIcon {
  const tplId = template.id?.toLowerCase() ?? "";
  const name = template.name?.toLowerCase() ?? "";
  if (tplId.includes("ui") || name.includes("ui") || template.iconId === "palette") {
    return PaintBoardIcon;
  }
  if (tplId.includes("ux") || name.includes("ux")) {
    return Compass01Icon;
  }
  if (tplId.includes("android") || tplId.includes("ios") || name.includes("android") || name.includes("ios")) {
    return SmartPhone01Icon;
  }
  if (tplId.includes("security") || name.includes("security") || template.iconId === "shield") {
    return Shield01Icon;
  }
  if (tplId.includes("qa") || name.includes("qa") || template.iconId === "checks") {
    return CheckmarkBadge01Icon;
  }
  if (tplId.includes("backend") || tplId.includes("infra") || name.includes("backend") || name.includes("infra")) {
    return CloudServerIcon;
  }
  if (template.character) {
    return getArchetypeHugeIcon(template.character);
  }
  return HUGE_ICON_MAP[template.iconId] ?? BotIcon;
}

/**
 * Intuitive & Immersive 2-Panel Zeus Squad Setup Dialog.
 *
 * Left Panel:
 *  - Character Avatar & Visual Style (Archetype, Icon, Color Swatches)
 *  - Quick Role Templates with instant pre-filling
 *
 * Right Panel:
 *  - Role identity (Name & Badge)
 *  - Task Description
 *  - Rounded-full SquadSkillPicker
 *  - Target team selector
 *  - Collapsible Prompt & Acceptance Checklist
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

  const [name, setName] = useState(member?.name ?? "");
  const [badge, setBadge] = useState(member?.badge ?? "");
  const [description, setDescription] = useState(member?.description ?? "");
  const [iconId, setIconId] = useState<ZeusSquadIconId>(member?.iconId ?? "bot");
  const [color, setColor] = useState<string>(member?.color ?? ZEUS_SQUAD_COLORS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(member?.skills ?? []);
  const [teamId, setTeamId] = useState(member?.teamId ?? activeTeamId);
  const [samplePrompt, setSamplePrompt] = useState(member?.samplePrompt ?? "");
  const [checklist, setChecklist] = useState<string[]>(member?.checklist ?? []);
  const [promptOpen, setPromptOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");

  /**
   * `null` means "follow the icon": character tracks icon until explicit pick.
   */
  const [character, setCharacter] = useState<string | null>(member?.character ?? null);
  const created = member === null;
  const resolvedCharacter = character ?? ZEUS_SQUAD_ICON_CHARACTERS[iconId];

  const suggestions = useMemo(() => {
    if (!created) return [];
    const resolved = resolveSquadMemberTemplates(teamId, templates);
    const taken = new Set(resolved.map((item) => item.name.toLowerCase()));
    const extras = SQUAD_BUILTIN_TEMPLATES.filter(
      (tpl) => !taken.has(tpl.name.toLowerCase()),
    );
    return [...resolved, ...extras];
  }, [created, teamId, templates]);

  /** Pre-fills all properties when a user clicks a template chip */
  const applyTemplate = (template: SquadMemberTemplate) => {
    setName(template.name);
    setBadge(template.badge);
    setDescription(template.description);
    setSelectedSkills([...template.skills]);
    setIconId(template.iconId);
    setColor(template.color);
    setCharacter(template.character ?? null);
    if (template.samplePrompt) setSamplePrompt(template.samplePrompt);
    if (template.checklist) setChecklist([...template.checklist]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const save = () => {
    const nextName = name.trim();
    if (!nextName) return;
    const draft = {
      name: nextName,
      badge: badge.trim(),
      description: description.trim(),
      iconId,
      color,
      skills: selectedSkills.filter(Boolean),
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
  const currentArchetype = getCharacterArchetype(resolvedCharacter);
  const ArchetypeIcon = getArchetypeHugeIcon(resolvedCharacter);

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
        style={{
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 24px 64px -12px rgba(0, 0, 0, 0.45)",
          border: "1px solid var(--ds-border-default)",
          overflow: "hidden",
          fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
          maxWidth: 960,
        }}
      >
        {/* Header Bar */}
        <div
          className="ext-sheet-head"
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--ds-border-subtle)",
            background: "color-mix(in oklab, var(--ds-bg-elevated) 60%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h3 id="zeus-squad-sheet-title" className="ext-sheet-title" style={{ fontSize: "var(--text-md-plus)", letterSpacing: "-0.01em" }}>
              {created ? t("settings.zeusSquad.addTitle") : t("settings.zeusSquad.editTitle")}
            </h3>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--ds-text-secondary)" }}>
              {created
                ? "Configure squad member specialization, archetype, and skills."
                : "Edit squad member role, archetype, and execution parameters."}
            </span>
          </div>
          <TooltipButton
            type="button"
            className="ext-sheet-close"
            style={{ borderRadius: "var(--radius-full)" }}
            ariaLabel={t("common.close")}
            tooltip={t("common.close")}
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </TooltipButton>
        </div>

        {/* 2-Panel Immersive Body */}
        <div
          className="ext-sheet-body"
          style={{
            display: "grid",
            gridTemplateColumns: "310px 1fr",
            gap: 22,
            padding: "20px 22px",
            minHeight: 480,
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >
          {/* ── LEFT PANEL: [Karakter] & Visual Identity ── */}
          <div
            className="squad-sheet-left-pane"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              borderRight: "1px solid var(--ds-border-subtle)",
              paddingRight: 18,
            }}
          >
            {/* Quick Template Picker Trigger */}
            {created && suggestions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ds-text-secondary)" }}>
                    <HugeiconsIcon icon={SparklesIcon} size={13} style={{ color: color }} />
                    <span>{templatesLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateSearch("");
                      setTemplatePickerOpen(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: `color-mix(in oklab, ${color} 14%, transparent)`,
                      border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`,
                      color: color,
                      cursor: "pointer",
                      transition: "all var(--motion-duration-fast)",
                    }}
                  >
                    <span>Choose Template</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                  </button>
                </div>

                {/* Compact preview of picked template or quick picker prompt */}
                {(() => {
                  const activeTemplate = suggestions.find((t) => t.name === name);
                  const displayIcon = activeTemplate
                    ? getTemplateHugeIcon(activeTemplate)
                    : SparklesIcon;
                  return (
                    <div
                      onClick={() => {
                        setTemplateSearch("");
                        setTemplatePickerOpen(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-lg)",
                        background: activeTemplate
                          ? `color-mix(in oklab, ${color} 8%, transparent)`
                          : "var(--ds-tile)",
                        border: activeTemplate
                          ? `1px solid color-mix(in oklab, ${color} 24%, transparent)`
                          : "1px dashed var(--ds-border-subtle)",
                        cursor: "pointer",
                        transition: "all var(--motion-duration-fast)",
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--radius-full)",
                          background: `color-mix(in oklab, ${color} 18%, transparent)`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: color,
                          flexShrink: 0,
                        }}
                      >
                        <HugeiconsIcon icon={displayIcon} size={14} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ds-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {activeTemplate ? activeTemplate.name : "Use Role Template"}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--ds-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {activeTemplate ? activeTemplate.badge : `${suggestions.length} ready-to-use templates (UI, UX, Mobile, QA...)`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            {/* Character Archetypes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ds-text-secondary)" }}>
                <HugeiconsIcon icon={Layers01Icon} size={13} style={{ color: "var(--ds-text-muted)" }} />
                <span>{characterLabel}</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 6,
                  maxHeight: 170,
                  overflowY: "auto",
                  padding: "1px",
                }}
                role="group"
                aria-label={characterLabel}
              >
                {CHARACTER_ARCHETYPES.map((archetype) => {
                  const selected = resolvedCharacter === archetype.id;
                  const Icon = getArchetypeHugeIcon(archetype.id);
                  return (
                    <button
                      key={archetype.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCharacter(archetype.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "6px 11px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--text-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        background: selected
                          ? `color-mix(in oklab, ${archetype.color} 16%, transparent)`
                          : "var(--ds-tile)",
                        border: selected
                          ? `1px solid ${archetype.color}`
                          : "1px solid var(--ds-border-subtle)",
                        color: selected ? archetype.color : "var(--ds-text-secondary)",
                        cursor: "pointer",
                        transition: "all var(--motion-duration-fast)",
                        textAlign: "left",
                      }}
                      title={`${archetype.name}: ${archetype.description}`}
                    >
                      <span style={{ display: "inline-flex", color: archetype.color, flexShrink: 0 }}>
                        <HugeiconsIcon icon={Icon} size={14} />
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {archetype.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icon & Theme Color (Rounded Full) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ds-text-secondary)" }}>
                {appearanceLabel}
              </span>
              {/* HugeIcons Selector */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ZEUS_SQUAD_ICON_IDS.map((id) => {
                  const Icon = HUGE_ICON_MAP[id];
                  const selected = iconId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setIconId(id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-full)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: selected
                          ? `color-mix(in oklab, ${color} 20%, transparent)`
                          : "var(--ds-tile)",
                        border: selected
                          ? `1.5px solid ${color}`
                          : "1px solid var(--ds-border-subtle)",
                        color: selected ? color : "var(--ds-text-muted)",
                        cursor: "pointer",
                        transition: "all var(--motion-duration-fast)",
                      }}
                      title={id}
                      aria-label={id}
                    >
                      <HugeiconsIcon icon={Icon} size={15} />
                    </button>
                  );
                })}
              </div>
              {/* Color Swatches */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {ZEUS_SQUAD_COLORS.map((swatch) => {
                  const selected = color === swatch;
                  return (
                    <button
                      key={swatch}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setColor(swatch)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: swatch,
                        cursor: "pointer",
                        border: selected
                          ? "2.5px solid var(--ds-text-primary)"
                          : "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: selected ? `0 0 10px ${swatch}` : "none",
                        transition: "all var(--motion-duration-fast)",
                      }}
                      aria-label={swatch}
                      title={swatch}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: [Properti] & Skills ── */}
          <div
            className="squad-sheet-right-pane"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Sleek Character Hero Emblem (Clean HugeIcons aesthetic, no emojis) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: "var(--radius-lg)",
                background: `color-mix(in oklab, ${color} 8%, transparent)`,
                border: `1px solid color-mix(in oklab, ${color} 22%, transparent)`,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "var(--radius-full)",
                  background: `color-mix(in oklab, ${color} 18%, transparent)`,
                  border: `1.5px solid ${color}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: color,
                  flexShrink: 0,
                  boxShadow: `0 0 16px color-mix(in oklab, ${color} 25%, transparent)`,
                }}
              >
                <HugeiconsIcon icon={ArchetypeIcon} size={22} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--ds-text-primary)", letterSpacing: "-0.01em" }}>
                    {name.trim() || "New Member Name"}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 9px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "10px",
                      fontWeight: 600,
                      background: `color-mix(in oklab, ${color} 14%, transparent)`,
                      border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`,
                      color: color,
                    }}
                  >
                    {badge.trim() || currentArchetype.badge}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--ds-text-muted)" }}>
                  {currentArchetype.name} · {currentArchetype.description}
                </span>
              </div>
            </div>

            {/* Form Fields: Name & Role */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label={t("settings.zeusSquad.name")}>
                <Input
                  value={name}
                  autoFocus={created}
                  placeholder="e.g. UI Designer / Alex"
                  style={{
                    borderRadius: "var(--radius-full)",
                    paddingLeft: 14,
                    fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
                  }}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field label={t("settings.zeusSquad.role")}>
                <Input
                  value={badge}
                  placeholder="e.g. Design Tokens & System"
                  style={{
                    borderRadius: "var(--radius-full)",
                    paddingLeft: 14,
                    fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
                  }}
                  onChange={(event) => setBadge(event.target.value)}
                />
              </Field>
            </div>

            {/* Description */}
            <Field label={t("extensions.subagents.description")}>
              <Textarea
                value={description}
                rows={2}
                placeholder="Specialization and key responsibilities for this role..."
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "10px 14px",
                  fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
                }}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>

            {/* Squad Skill Picker (Rounded Full Pills) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ds-text-secondary)" }}>
                {t("settings.zeusSquad.skills")}
              </span>
              <SquadSkillPicker
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
                accentColor={color}
              />
            </div>

            {/* Team Picker (if multiple teams exist) */}
            {teams.length > 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ds-text-secondary)" }}>
                  {t("settings.zeusSquad.team")}
                </span>
                <SettingsMenuSelect
                  fullWidth
                  label={t("settings.zeusSquad.team")}
                  value={teamId}
                  options={teams.map((team) => ({ id: team.id, label: team.name }))}
                  onChange={setTeamId}
                />
              </div>
            ) : null}

            {/* Prompt & Acceptance Criteria Collapsible */}
            {(samplePrompt || checklist.length > 0) ? (
              <div
                style={{
                  borderRadius: "var(--radius-md)",
                  background: "var(--ds-tile)",
                  border: "1px solid var(--ds-border-subtle)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPromptOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 12px",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    color: "var(--ds-text-secondary)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <HugeiconsIcon icon={SparklesIcon} size={13} style={{ color }} />
                    Prompt Instructions & Acceptance Criteria
                  </span>
                  <HugeiconsIcon icon={promptOpen ? ChevronDownIcon : ChevronRightIcon} size={14} />
                </button>

                {promptOpen ? (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderTop: "1px solid var(--ds-border-subtle)",
                      fontSize: "var(--text-xs)",
                      color: "var(--ds-text-secondary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      maxHeight: 150,
                      overflowY: "auto",
                    }}
                  >
                    {samplePrompt ? (
                      <div>
                        <span style={{ fontWeight: 600, color: "var(--ds-text-primary)" }}>Sample Prompt:</span>
                        <div style={{ fontStyle: "italic", marginTop: 2, background: "var(--ds-tile-hover)", padding: "4px 8px", borderRadius: "var(--radius-xs)" }}>
                          "{samplePrompt}"
                        </div>
                      </div>
                    ) : null}
                    {checklist.length > 0 ? (
                      <div>
                        <span style={{ fontWeight: 600, color: "var(--ds-text-primary)" }}>Acceptance Criteria:</span>
                        <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                          {checklist.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="ext-sheet-actions"
          style={{
            padding: "12px 22px",
            borderTop: "1px solid var(--ds-border-subtle)",
            background: "color-mix(in oklab, var(--ds-bg-elevated) 40%, transparent)",
          }}
        >
          <div className="ext-sheet-actions-end">
            <Button
              variant="ghost"
              onClick={onClose}
              style={{ borderRadius: "var(--radius-full)", padding: "0 18px" }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={save}
              disabled={!name.trim()}
              style={{
                borderRadius: "var(--radius-full)",
                padding: "0 22px",
                background: name.trim() ? color : undefined,
                borderColor: name.trim() ? color : undefined,
              }}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>

        {/* ── DEDICATED TEMPLATE SELECTION DIALOG (Anti-AI Slop, High Contrast, Intuitive UX) ── */}
        {templatePickerOpen ? (
          <div
            className="overlay"
            role="presentation"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: 24,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setTemplatePickerOpen(false);
            }}
          >
            <div
              className="dialog"
              role="dialog"
              aria-modal
              aria-label={templatesLabel}
              style={{
                width: "100%",
                maxWidth: 620,
                maxHeight: "85%",
                borderRadius: "var(--radius-xl)",
                background: "var(--ds-bg-elevated)",
                border: "1px solid var(--ds-border-default)",
                boxShadow: "0 24px 64px -12px rgba(0, 0, 0, 0.6)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
              }}
            >
              {/* Dialog Header */}
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--ds-border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "var(--radius-full)",
                      background: `color-mix(in oklab, ${color} 18%, transparent)`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: color,
                    }}
                  >
                    <HugeiconsIcon icon={SparklesIcon} size={16} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--ds-text-primary)" }}>
                      Role Templates
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--ds-text-muted)" }}>
                      Choose a specialist template to auto-populate role parameters, skills, and prompts.
                    </span>
                  </div>
                </div>
                <TooltipButton
                  type="button"
                  className="ext-sheet-close"
                  style={{ borderRadius: "var(--radius-full)" }}
                  ariaLabel={t("common.close")}
                  tooltip={t("common.close")}
                  onClick={() => setTemplatePickerOpen(false)}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={15} />
                </TooltipButton>
              </div>

              {/* Search input in dialog */}
              <div style={{ padding: "12px 20px 8px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 14px",
                    height: 38,
                    borderRadius: "var(--radius-full)",
                    background: "var(--ds-tile)",
                    border: "1px solid var(--ds-border-subtle)",
                  }}
                >
                  <HugeiconsIcon icon={Search01Icon} size={14} style={{ color: "var(--ds-text-muted)" }} />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search roles (UI, Kotlin, QA, DevOps...)..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: 0,
                      outline: "none",
                      color: "var(--ds-text-primary)",
                      fontSize: "var(--text-xs)",
                      fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
                    }}
                    autoFocus
                  />
                  {templateSearch ? (
                    <button
                      type="button"
                      onClick={() => setTemplateSearch("")}
                      style={{
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        color: "var(--ds-text-muted)",
                        padding: 2,
                        display: "inline-flex",
                      }}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Template List / Grid */}
              <div
                style={{
                  padding: "10px 20px 20px 20px",
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 10,
                }}
              >
                {suggestions
                  .filter((t) => {
                    if (!templateSearch.trim()) return true;
                    const query = templateSearch.toLowerCase();
                    return (
                      t.name.toLowerCase().includes(query) ||
                      (t.badge && t.badge.toLowerCase().includes(query)) ||
                      (t.description && t.description.toLowerCase().includes(query)) ||
                      t.skills.some((s) => s.toLowerCase().includes(query))
                    );
                  })
                  .map((template) => {
                    const isPicked = name === template.name;
                    const TemplateIcon = getTemplateHugeIcon(template);
                    const templateColor = template.color || color;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          applyTemplate(template);
                          setTemplatePickerOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: "var(--radius-lg)",
                          background: isPicked
                            ? `color-mix(in oklab, ${templateColor} 14%, transparent)`
                            : "var(--ds-tile)",
                          border: isPicked
                            ? `1.5px solid ${templateColor}`
                            : "1px solid var(--ds-border-subtle)",
                          cursor: "pointer",
                          transition: "all var(--motion-duration-fast)",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "var(--radius-full)",
                            background: `color-mix(in oklab, ${templateColor} 18%, transparent)`,
                            border: `1px solid color-mix(in oklab, ${templateColor} 35%, transparent)`,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: templateColor,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <HugeiconsIcon icon={TemplateIcon} size={16} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, gap: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: "var(--text-xs)", color: "var(--ds-text-primary)" }}>
                              {template.name}
                            </span>
                            {isPicked ? (
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} style={{ color: templateColor }} />
                            ) : null}
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              color: templateColor,
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {template.badge}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--ds-text-muted)",
                              lineHeight: 1.35,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {template.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
  );
}
