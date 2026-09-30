import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GLOBAL_SCOPE,
  resolveScope,
  type ActivationScope,
  type AgentCapabilityLevel,
  type UserSkillRecord,
} from "@pi-desktop/shared";
import { Button, Field, HelpIcon, Input, SettingsToggle, Textarea, TooltipButton, portalOverlay } from "../ui";
import { IconFolderOpen, IconX } from "../icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  BookOpen01Icon,
  FileCodeIcon,
  Search01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

/** Hard cap host-core enforces on a skill document. */
export const MAX_SKILL_BYTES = 128 * 1024;

export type SkillDraft = {
  id: string;
  name: string;
  description: string;
  body: string;
  enabled: boolean;
  scope: ActivationScope;
};

/**
 * The starter document, written so the first thing the user sees is a skill that
 * would already work. An empty editor teaches nothing about the format; a
 * heading plus steps is the shape every good skill has.
 */
export function skillTemplate(name: string): string {
  const title = name.trim() || "New skill";
  return `# ${title}

## When to use this
Describe the situation that should make the model reach for this skill.

## Steps
1. ...
2. ...

## Notes
Anything the model would otherwise guess wrong.
`;
}

export function emptySkillDraft(): SkillDraft {
  return {
    id: "",
    name: "",
    description: "",
    body: "",
    enabled: true,
    scope: GLOBAL_SCOPE,
  };
}

export function draftFromSkill(record: UserSkillRecord, body: string): SkillDraft {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? "",
    body,
    enabled: record.enabled,
    scope: resolveScope(record.scope),
  };
}

/** Mirror of host-core's `slugify`, so the id shown matches the one stored. */
export function skillSlug(value: string): string {
  let slug = "";
  let lastDash = false;
  for (const char of value.trim().toLocaleLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
      slug += char;
      lastDash = false;
    } else if (slug && !lastDash) {
      slug += "-";
      lastDash = true;
    }
  }
  return slug.slice(0, 64).replace(/-+$/, "");
}

/** Returns an i18n key for the first problem, or null when the draft can save. */
export function skillDraftError(draft: SkillDraft): string | null {
  if (!draft.name.trim()) return "extensions.skills.errorName";
  if (!skillSlug(draft.name) && !draft.id) return "extensions.skills.errorSlug";
  if (!draft.description.trim()) return "extensions.skills.errorDescription";
  if (!draft.body.trim()) return "extensions.skills.errorBody";
  if (new TextEncoder().encode(draft.body).length > MAX_SKILL_BYTES) {
    return "extensions.skills.errorTooBig";
  }
  return null;
}

/**
 * Where the document will be written. Settings owns the level, so this states
 * it instead of offering a second, conflicting scope control; the only decision
 * left here is whether the skill is active.
 */
function ManagementScope({
  draft,
  setDraft,
  level,
  projectName,
}: {
  draft: SkillDraft;
  setDraft: (next: SkillDraft) => void;
  level: AgentCapabilityLevel;
  projectName?: string;
}) {
  const { t } = useTranslation();
  const label =
    level === "global"
      ? t("settings.globalScope")
      : t("settings.projectScope", { project: projectName || t("settings.currentProject") });
  return (
    <div className="agent-mcp-scope">
      <div className="agent-mcp-scope-copy">
        <span className="agent-mcp-scope-label">
          {label}
          {/* Which level the document lands in is the label's own question, so
              the answer rides on it instead of taking a second line. */}
          <HelpIcon
            label={
              level === "global"
                ? t("settings.globalScopeDescription")
                : t("settings.projectScopeDescription")
            }
          />
        </span>
      </div>
      <SettingsToggle
        checked={draft.enabled}
        label={t("settings.enableCapability", { name: draft.name || draft.id })}
        onChange={() => setDraft({ ...draft, enabled: !draft.enabled })}
      />
    </div>
  );
}

/**
 * Create/edit sheet for user skills with a 2-panel split layout:
 * Left panel: Skills list & quick filter
 * Right panel: Metadata editor and SKILL.md body
 */
export function SkillEditorSheet({
  draft,
  setDraft,
  editing,
  saving,
  level,
  projectName,
  skills,
  onSelectSkill,
  onNewSkill,
  onClose,
  onSave,
  onReveal,
}: {
  draft: SkillDraft;
  setDraft: (next: SkillDraft) => void;
  editing: UserSkillRecord | null;
  saving: boolean;
  level: AgentCapabilityLevel;
  projectName?: string;
  skills?: UserSkillRecord[];
  onSelectSkill?: (skill: UserSkillRecord) => void;
  onNewSkill?: () => void;
  onClose: () => void;
  onSave: () => void;
  onReveal?: () => void;
}) {
  const { t } = useTranslation();
  const [nameTouched, setNameTouched] = useState(!!editing);
  const [filterQuery, setFilterQuery] = useState("");
  const errorKey = skillDraftError(draft);
  const pristine = !editing && !draft.name.trim() && !draft.description.trim();
  const bytes = new TextEncoder().encode(draft.body).length;
  const slug = draft.id || skillSlug(draft.name);

  useEffect(() => {
    setNameTouched(!!editing);
  }, [editing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, onClose]);

  const set = <K extends keyof SkillDraft>(key: K, value: SkillDraft[K]) =>
    setDraft({ ...draft, [key]: value });

  const setName = (value: string) => {
    const next: SkillDraft = { ...draft, name: value };
    if (!nameTouched && !editing && !draft.body.trim()) next.body = skillTemplate(value);
    setDraft(next);
  };

  const filteredSkills = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    if (!filterQuery.trim()) return skills;
    const q = filterQuery.toLowerCase();
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q),
    );
  }, [skills, filterQuery]);

  return portalOverlay(
    <div
      className="overlay ext-sheet-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="dialog ext-sheet is-wide"
        role="dialog"
        aria-modal
        aria-labelledby="skill-sheet-title"
        style={{
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          border: "1px solid var(--ds-border-default)",
          overflow: "hidden",
          maxWidth: "920px",
          fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
        }}
      >
        {/* Header Bar */}
        <div
          className="ext-sheet-head"
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--ds-border-subtle)",
            background: "color-mix(in oklab, var(--ds-bg-elevated) 40%, transparent)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h3 id="skill-sheet-title" className="ext-sheet-title" style={{ fontSize: "var(--text-md-plus)" }}>
              {editing ? t("extensions.skills.editTitle") : t("extensions.skills.addTitle")}
            </h3>
            <p className="ext-sheet-sub" style={{ fontSize: "var(--text-xs)", margin: 0 }}>
              {t("extensions.skills.sheetSubtitle")}
            </p>
          </div>
          <TooltipButton
            type="button"
            className="ext-sheet-close"
            style={{ borderRadius: "var(--radius-full)" }}
            ariaLabel={t("common.close")}
            tooltip={t("common.close")}
            onClick={onClose}
          >
            <IconX size={14} />
          </TooltipButton>
        </div>

        {/* 2-Panel Immersive Body */}
        <div
          className="ext-sheet-body"
          style={{
            display: "grid",
            gridTemplateColumns: skills && skills.length > 0 ? "260px 1fr" : "1fr",
            gap: 20,
            padding: "18px 22px",
            minHeight: 520,
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
          }}
        >
          {/* ── LEFT PANEL: Skills Navigator ── */}
          {skills && skills.length > 0 ? (
            <div
              className="skill-sheet-sidebar"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                borderRight: "1px solid var(--ds-border-subtle)",
                paddingRight: 16,
              }}
            >
              {/* Action: Add New Skill */}
              {onNewSkill ? (
                <button
                  type="button"
                  onClick={onNewSkill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "7px 14px",
                    borderRadius: "var(--radius-full)",
                    background: "color-mix(in oklab, var(--ds-accent) 15%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--ds-accent) 30%, transparent)",
                    color: "var(--ds-accent)",
                    fontSize: "var(--text-xs-plus)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
                  }}
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  <span>{t("extensions.skills.addTitle")}</span>
                </button>
              ) : null}

              {/* Search Filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--ds-tile-hover)",
                  border: "1px solid var(--ds-border-subtle)",
                }}
              >
                <HugeiconsIcon icon={Search01Icon} size={14} style={{ color: "var(--ds-text-faint)" }} />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter skills..."
                  style={{
                    flex: 1,
                    border: 0,
                    background: "transparent",
                    color: "var(--ds-text-primary)",
                    fontSize: "var(--text-xs)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Skills List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  overflowY: "auto",
                  paddingRight: 4,
                  flex: 1,
                }}
              >
                {filteredSkills.map((skill) => {
                  const isCurrent = editing?.id === skill.id;
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => onSelectSkill?.(skill)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        background: isCurrent
                          ? "color-mix(in oklab, var(--ds-accent) 12%, transparent)"
                          : "transparent",
                        border: isCurrent
                          ? "1px solid color-mix(in oklab, var(--ds-accent) 25%, transparent)"
                          : "1px solid transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "var(--radius-full)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          background: isCurrent
                            ? "var(--ds-accent)"
                            : "color-mix(in oklab, var(--ds-text-primary) 6%, transparent)",
                          color: isCurrent ? "var(--ds-bg-primary)" : "var(--ds-text-secondary)",
                          marginTop: 1,
                        }}
                      >
                        <HugeiconsIcon icon={BookOpen01Icon} size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span
                          style={{
                            fontSize: "var(--text-xs-plus)",
                            fontWeight: isCurrent ? 600 : 500,
                            color: isCurrent ? "var(--ds-text-primary)" : "var(--ds-text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {skill.name}
                        </span>
                        {skill.description ? (
                          <span
                            style={{
                              fontSize: "var(--text-3xs)",
                              color: "var(--ds-text-faint)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {skill.description}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ── RIGHT PANEL: Skill Form & SKILL.md Editor ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field
              label={t("extensions.skills.name")}
              hint={
                slug
                  ? t("extensions.skills.slugHint", { id: slug })
                  : t("extensions.skills.nameHint")
              }
            >
              <Input
                value={draft.name}
                autoFocus={!editing}
                placeholder={t("extensions.skills.namePlaceholder")}
                style={{
                  borderRadius: "var(--radius-full)",
                  fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
                }}
                onChange={(event) => {
                  setNameTouched(true);
                  setName(event.target.value);
                }}
              />
            </Field>

            <Field
              label={t("extensions.skills.description")}
              hint={t("extensions.skills.descriptionHint")}
            >
              <Textarea
                value={draft.description}
                rows={2}
                placeholder={t("extensions.skills.descriptionPlaceholder")}
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "10px 14px",
                  fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
                }}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>

            <div className="ext-field-group">
              <div className="ext-field-label ext-field-label-row">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <HugeiconsIcon icon={FileCodeIcon} size={14} style={{ color: "var(--ds-accent)" }} />
                  {t("extensions.skills.body")}
                  <HelpIcon label={t("extensions.skills.bodyHint")} />
                </span>
                <span
                  className={
                    bytes > MAX_SKILL_BYTES
                      ? "ext-byte-count is-over"
                      : bytes > MAX_SKILL_BYTES * 0.8
                        ? "ext-byte-count is-near"
                        : "ext-byte-count"
                  }
                  style={{ borderRadius: "var(--radius-full)", padding: "2px 8px" }}
                >
                  {t("extensions.skills.bytes", {
                    used: Math.round(bytes / 1024),
                    max: Math.round(MAX_SKILL_BYTES / 1024),
                  })}
                </span>
              </div>
              <Textarea
                className="ext-skill-body"
                value={draft.body}
                rows={12}
                spellCheck={false}
                placeholder={skillTemplate("")}
                aria-label={t("extensions.skills.body")}
                style={{ borderRadius: "var(--radius-md)" }}
                onChange={(event) => set("body", event.target.value)}
              />
            </div>

            <div className="ext-field-group">
              <div className="ext-field-label">
                {t("settings.scope")}
                <HelpIcon label={t("settings.scopeHint")} />
              </div>
              <ManagementScope
                draft={draft}
                setDraft={setDraft}
                level={level}
                projectName={projectName}
              />
            </div>
          </div>
        </div>

        {errorKey && !pristine ? (
          <p className="ext-sheet-error" style={{ margin: "0 22px 10px" }}>
            {t(errorKey)}
          </p>
        ) : null}

        {/* Footer Actions */}
        <div
          className="ext-sheet-actions"
          style={{
            padding: "14px 22px",
            borderTop: "1px solid var(--ds-border-subtle)",
            background: "color-mix(in oklab, var(--ds-bg-elevated) 30%, transparent)",
          }}
        >
          {editing && onReveal ? (
            <Button
              variant="ghost"
              onClick={onReveal}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              <IconFolderOpen size={13} />
              {t("extensions.skills.reveal")}
            </Button>
          ) : (
            <span className="ext-sheet-note" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <HugeiconsIcon icon={SparklesIcon} size={13} style={{ color: "var(--ds-accent)" }} />
              {t("extensions.skills.sheetNote")}
            </span>
          )}
          <div className="ext-sheet-actions-end">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={saving}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              disabled={saving || !!errorKey}
              title={errorKey ? t(errorKey) : undefined}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

