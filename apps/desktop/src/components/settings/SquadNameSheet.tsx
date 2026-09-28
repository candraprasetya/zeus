import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Field, Input, TooltipButton, portalOverlay } from "../ui";
import { IconX } from "../icons";

/**
 * One name, one submit: the same dialog creates a team or a pipeline and
 * renames one. Naming is the only field those two share, so one sheet keeps
 * both flows identical instead of growing two nearly-equal copies.
 */
export function SquadNameSheet({
  title,
  label,
  submitLabel,
  initial,
  placeholder,
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  /** The caller's own action label, so "Add team" and "Save" both stay local. */
  submitLabel: string;
  /** `null` creates a new entry; a string opens it for renaming. */
  initial: string | null;
  placeholder?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial ?? "");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = () => {
    const next = name.trim();
    if (!next) return;
    onSubmit(next);
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
        aria-labelledby="squad-name-sheet-title"
      >
        <div className="ext-sheet-head">
          <div>
            <h3 id="squad-name-sheet-title" className="ext-sheet-title">
              {title}
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
          <Field label={label}>
            <Input
              value={name}
              autoFocus
              placeholder={placeholder}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
            />
          </Field>
        </div>

        <div className="ext-sheet-actions">
          <div className="ext-sheet-actions-end">
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={submit} disabled={!name.trim()}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
  );
}
