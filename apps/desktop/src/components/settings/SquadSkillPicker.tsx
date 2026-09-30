import { useState, type KeyboardEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Cancel01Icon,
  SparklesIcon,
  Tag01Icon,
  PaintBoardIcon,
  SmartPhone01Icon,
  Shield01Icon,
  CloudServerIcon,
  Analytics01Icon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";
import { SquadSkillCatalogModal } from "./SquadSkillCatalogModal";
import { PREDEFINED_SKILL_CATEGORIES } from "../../features/zeus-squad/use-zeus-squad";

export { PREDEFINED_SKILL_CATEGORIES };

export interface SquadSkillPickerProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  accentColor?: string;
}

export function SquadSkillPicker({
  selectedSkills,
  onChange,
  accentColor = "#38bdf8",
}: SquadSkillPickerProps) {
  const [customInput, setCustomInput] = useState("");
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  const toggleSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (selectedSkills.includes(trimmed)) {
      onChange(selectedSkills.filter((s) => s !== trimmed));
    } else {
      onChange([...selectedSkills, trimmed]);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(selectedSkills.filter((s) => s !== skill));
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      onChange([...selectedSkills, trimmed]);
    }
    setCustomInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
      }}
    >
      {/* Selected skill chips (Rounded Full) - clickable to inspect! */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          minHeight: 38,
          padding: "6px 10px",
          background: "color-mix(in oklab, var(--ds-text-primary) 3%, transparent)",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--ds-border-subtle)",
        }}
      >
        {selectedSkills.length === 0 ? (
          <span style={{ color: "var(--ds-text-faint)", fontSize: "var(--text-xs)", paddingLeft: 6 }}>
            No active skills selected. Open the catalog to inspect &amp; assign skills.
          </span>
        ) : (
          selectedSkills.map((skill) => (
            <span
              key={skill}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px 3px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--font-weight-medium)",
                background: `color-mix(in oklab, ${accentColor} 14%, transparent)`,
                color: accentColor,
                border: `1px solid color-mix(in oklab, ${accentColor} 30%, transparent)`,
                transition: "all var(--motion-duration-fast)",
              }}
            >
              {/* Click skill text to inspect documentation */}
              <button
                type="button"
                onClick={() => setCatalogModalOpen(true)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                title={`Klik untuk lihat dokumentasi skill ${skill}`}
              >
                <span>{skill}</span>
              </button>

              <button
                type="button"
                onClick={() => removeSkill(skill)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 2,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "inherit",
                  borderRadius: "50%",
                  opacity: 0.7,
                }}
                title={`Hapus ${skill}`}
                aria-label={`Hapus ${skill}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Input custom skill & catalog modal launcher */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--ds-tile)",
            border: "1px solid var(--ds-border-subtle)",
            borderRadius: "var(--radius-full)",
            padding: "0 12px",
            minHeight: 34,
          }}
        >
          <HugeiconsIcon icon={Tag01Icon} size={14} style={{ color: "var(--ds-text-faint)" }} />
          <input
            type="text"
            placeholder="Add custom skill... (Press Enter)"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              outline: "none",
              color: "var(--ds-text-primary)",
              fontSize: "var(--text-xs)",
              fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
            }}
          />
          {customInput.trim() ? (
            <button
              type="button"
              onClick={handleAddCustom}
              style={{
                background: accentColor,
                color: "#ffffff",
                border: 0,
                borderRadius: "var(--radius-full)",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <HugeiconsIcon icon={Add01Icon} size={11} /> Add
            </button>
          ) : null}
        </div>

        {/* Modal Launcher Button with Sparkles Icon */}
        <button
          type="button"
          onClick={() => setCatalogModalOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 34,
            padding: "0 14px",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-weight-medium)",
            borderRadius: "var(--radius-full)",
            background: "color-mix(in oklab, var(--ds-text-primary) 5%, transparent)",
            color: "var(--ds-text-secondary)",
            border: "1px solid var(--ds-border-subtle)",
            cursor: "pointer",
            transition: "all var(--motion-duration-fast)",
            whiteSpace: "nowrap",
          }}
        >
          <HugeiconsIcon icon={SparklesIcon} size={13} style={{ color: accentColor }} />
          <span>Skills Catalog &amp; Docs</span>
        </button>
      </div>

      {/* Dedicated Two-Panel Catalog & Documentation Modal */}
      {catalogModalOpen ? (
        <SquadSkillCatalogModal
          selectedSkills={selectedSkills}
          onToggleSkill={toggleSkill}
          onClose={() => setCatalogModalOpen(false)}
          accentColor={accentColor}
        />
      ) : null}
    </div>
  );
}
