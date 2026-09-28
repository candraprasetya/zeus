import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserSkillRecord } from "@pi-desktop/shared";
import { api } from "../../lib/api";
import { Button, CheckboxGroup, Field, Input, TooltipButton, portalOverlay } from "../ui";
import { IconX } from "../icons";

/**
 * Multi-select for the skills a squad member carries. Lists every skill the
 * Skills page owns (global plus the current project), and accepts free text
 * for anything that is not a skill yet — a bare capability like "WCAG AAA"
 * stays exactly that, comma-separated, with no document created behind it.
 */
export function SquadMemberSkillsDialog({
  selected,
  projectPath,
  onApply,
  onClose,
}: {
  selected: readonly string[];
  projectPath?: string;
  onApply: (skills: string[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [catalog, setCatalog] = useState<UserSkillRecord[] | null>(null);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([...selected]);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const levels: Array<"global" | "project"> = ["global"];
      if (projectPath) levels.push("project");
      const rows = (
        await Promise.all(
          levels.map((level) =>
            api
              .listUserSkills({ level, ...(projectPath ? { projectPath } : {}) })
              .then((result) => result.skills ?? [])
              .catch(() => []),
          ),
        )
      ).flat();
      if (!cancelled) {
        const seen = new Set<string>();
        setCatalog(
          rows.filter((row) => {
            if (seen.has(row.id)) return false;
            seen.add(row.id);
            return true;
          }),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectPath]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  /**
   * Once the catalog is in, fold every picked entry onto its canonical skill
   * name so a free-text match and its catalog row are one selection, not two.
   */
  useEffect(() => {
    if (!catalog) return;
    setPicked((current) => {
      const next = current
        .map((name) => {
          const trimmed = name.trim();
          return (
            catalog.find((entry) => entry.name.toLowerCase() === trimmed.toLowerCase())
              ?.name ?? trimmed
          );
        })
        .filter(Boolean);
      return next.filter(
        (name, index, all) =>
          all.findIndex((entry) => entry.toLowerCase() === name.toLowerCase()) === index,
      );
    });
  }, [catalog]);

  const query = search.trim().toLowerCase();
  /** Catalog entries first, then anything already picked, then free text. */
  const options = useMemo<{ value: string; label: string }[]>(() => {
    const matches = (text: string) => !query || text.toLowerCase().includes(query);
    const fromCatalog = (catalog ?? [])
      .filter((entry) => matches(entry.name) || matches(entry.description ?? ""))
      .map((entry) => ({ value: entry.name, label: entry.name }));
    const mine = picked
      .map((name) => name.trim())
      .filter(Boolean)
      .filter((name) => matches(name))
      .map((name) => ({ value: name, label: name }))
      .filter(
        (option) =>
          !fromCatalog.some((catalogOption) => catalogOption.value.toLowerCase() === option.value.toLowerCase()),
      );
    return [...fromCatalog, ...mine].filter(
      (option, index, all) =>
        all.findIndex((entry) => entry.value.toLowerCase() === option.value.toLowerCase()) ===
        index,
    );
  }, [catalog, picked, query]);

  const addCustom = () => {
    const next = custom.trim();
    if (!next) return;
    setPicked((current) =>
      current.some((entry) => entry.toLowerCase() === next.toLowerCase())
        ? current
        : [...current, next],
    );
    setCustom("");
  };

  const save = () => {
    onApply(
      picked
        .map((name) => name.trim())
        .filter(Boolean)
        .filter((name, index, all) => all.findIndex((entry) => entry.toLowerCase() === name.toLowerCase()) === index),
    );
    onClose();
  };

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
        aria-labelledby="squad-skills-title"
      >
        <div className="ext-sheet-head">
          <div>
            <h3 id="squad-skills-title" className="ext-sheet-title">
              {t("settings.zeusSquad.skillsDialogTitle")}
            </h3>
            <p className="ext-sheet-sub">{t("settings.zeusSquad.skillsDialogSubtitle")}</p>
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
          <Field label={t("extensions.skills.searchPlaceholder")}>
            <Input
              value={search}
              autoFocus
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>

          <div>
            {catalog === null ? (
              <p className="ext-sheet-note">{t("common.loading")}</p>
            ) : (
              <CheckboxGroup
                label={t("settings.zeusSquad.skills")}
                values={picked}
                options={options}
                onChange={(next) => setPicked(next)}
              />
            )}
          </div>

          <div className="ext-field-pair">
            <Field label={t("settings.zeusSquad.skillsCustom")}>
              <Input
                value={custom}
                placeholder={t("settings.zeusSquad.skillsCustomPlaceholder")}
                onChange={(event) => setCustom(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustom();
                  }
                }}
              />
            </Field>
            <div className="ext-field-empty">
              <Button variant="ghost" onClick={addCustom} disabled={!custom.trim()}>
                {t("settings.zeusSquad.skillsAdd")}
              </Button>
            </div>
          </div>
        </div>

        <div className="ext-sheet-actions">
          <span className="ext-sheet-note">
            {t("settings.zeusSquad.skillsSelected", { count: picked.length })}
          </span>
          <div className="ext-sheet-actions-end">
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={save}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>,
  );
}
