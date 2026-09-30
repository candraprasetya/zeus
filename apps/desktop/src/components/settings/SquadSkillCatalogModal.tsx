import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Search01Icon,
  SparklesIcon,
  CheckmarkCircle01Icon,
  BookOpen01Icon,
  Layers01Icon,
  Add01Icon,
  Github01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { TooltipButton, portalOverlay } from "../ui";
import {
  PREDEFINED_SKILL_CATEGORIES,
  getSquadSkillDetail,
  type SquadSkillDetail,
} from "../../features/zeus-squad/use-zeus-squad";

export interface SquadSkillCatalogModalProps {
  selectedSkills: string[];
  onToggleSkill: (skillName: string) => void;
  onClose: () => void;
  accentColor?: string;
}

export function SquadSkillCatalogModal({
  selectedSkills,
  onToggleSkill,
  onClose,
  accentColor = "#38bdf8",
}: SquadSkillCatalogModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Flatten all predefined skills
  const allSkillsList = useMemo(() => {
    const list: Array<{ name: string; category: string }> = [];
    for (const cat of PREDEFINED_SKILL_CATEGORIES) {
      for (const skill of cat.skills) {
        list.push({ name: skill, category: cat.category });
      }
    }
    return list;
  }, []);

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allSkillsList.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const detail = getSquadSkillDetail(item.name);
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        detail.summary.toLowerCase().includes(q)
      );
    });
  }, [allSkillsList, search, activeCategory]);

  const [inspectedSkillName, setInspectedSkillName] = useState<string>(
    filteredSkills[0]?.name ?? "Design Tokens",
  );

  const inspectedDetail: SquadSkillDetail = useMemo(
    () => getSquadSkillDetail(inspectedSkillName),
    [inspectedSkillName],
  );

  const isInspectedSelected = selectedSkills.includes(inspectedDetail.name);

  return portalOverlay(
    <div
      className="overlay"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 120,
        padding: "16px",
        boxSizing: "border-box",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal
        aria-label="Skills Catalog & Documentation"
        style={{
          width: "100%",
          maxWidth: 920,
          maxHeight: "min(680px, calc(100vh - 32px))",
          height: "min(680px, calc(100vh - 32px))",
          borderRadius: "var(--radius-xl)",
          background: "var(--ds-bg-elevated)",
          border: "1px solid var(--ds-border-default)",
          boxShadow: "0 24px 64px -12px rgba(0, 0, 0, 0.65)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
          fontFamily: "'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            flexShrink: 0,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--ds-border-subtle)",
            background: "color-mix(in oklab, var(--ds-bg-elevated) 80%, transparent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-full)",
                background: `color-mix(in oklab, ${accentColor} 18%, transparent)`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: accentColor,
              }}
            >
              <HugeiconsIcon icon={SparklesIcon} size={18} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "var(--text-md)",
                  fontWeight: 600,
                  color: "var(--ds-text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Skills Catalog &amp; Specification
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--ds-text-muted)" }}>
                Inspect execution instructions, architectural boundaries, and assign skills to your squad member.
              </p>
            </div>
          </div>
          <TooltipButton
            type="button"
            className="ext-sheet-close"
            style={{ borderRadius: "var(--radius-full)" }}
            ariaLabel="Close"
            tooltip="Close"
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </TooltipButton>
        </div>

        {/* Search & Category Filter Strip */}
        <div
          style={{
            flexShrink: 0,
            padding: "10px 20px",
            borderBottom: "1px solid var(--ds-border-subtle)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "color-mix(in oklab, var(--ds-tile) 60%, transparent)",
          }}
        >
          <div
            style={{
              flex: "0 0 280px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              height: 36,
              borderRadius: "var(--radius-full)",
              background: "var(--ds-tile)",
              border: "1px solid var(--ds-border-subtle)",
            }}
          >
            <HugeiconsIcon icon={Search01Icon} size={14} style={{ color: "var(--ds-text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill by name or keyword..."
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
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  color: "var(--ds-text-muted)",
                  padding: 2,
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, paddingBottom: 2 }}>
            {["All", ...PREDEFINED_SKILL_CATEGORIES.map((c: { category: string }) => c.category)].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "11px",
                    fontWeight: active ? 600 : 500,
                    border: active
                      ? `1px solid ${accentColor}`
                      : "1px solid var(--ds-border-subtle)",
                    background: active
                      ? `color-mix(in oklab, ${accentColor} 16%, transparent)`
                      : "var(--ds-tile)",
                    color: active ? accentColor : "var(--ds-text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all var(--motion-duration-fast)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Panel Body: Left List + Right Markdown Documentation */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "310px 1fr",
            overflow: "hidden",
          }}
        >
          {/* Left Panel: Skill List */}
          <div
            style={{
              borderRight: "1px solid var(--ds-border-subtle)",
              overflowY: "auto",
              minHeight: 0,
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {filteredSkills.length === 0 ? (
              <div
                style={{
                  padding: "30px 16px",
                  textAlign: "center",
                  color: "var(--ds-text-muted)",
                  fontSize: "var(--text-xs)",
                }}
              >
                No matching skills found in catalog.
              </div>
            ) : (
              filteredSkills.map(({ name, category }) => {
                const detail = getSquadSkillDetail(name);
                const isSelected = selectedSkills.includes(name);
                const isInspected = inspectedSkillName === name;
                return (
                  <div
                    key={name}
                    onClick={() => setInspectedSkillName(name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      border: isInspected
                        ? `1.5px solid ${accentColor}`
                        : "1px solid var(--ds-border-subtle)",
                      background: isInspected
                        ? `color-mix(in oklab, ${accentColor} 10%, transparent)`
                        : "var(--ds-tile)",
                      transition: "all var(--motion-duration-fast)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          color: isInspected ? accentColor : "var(--ds-text-primary)",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "10px", color: "var(--ds-text-muted)" }}>
                          {category}
                        </span>
                        {detail.stars ? (
                          <span
                            style={{
                              fontSize: "9.5px",
                              color: "#eab308",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 2,
                              fontWeight: 600,
                            }}
                          >
                            <HugeiconsIcon icon={StarIcon} size={9} />
                            <span>{detail.stars}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSkill(name);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "10px",
                        fontWeight: 600,
                        border: isSelected
                          ? `1px solid ${accentColor}`
                          : "1px solid var(--ds-border-subtle)",
                        background: isSelected
                          ? accentColor
                          : "color-mix(in oklab, var(--ds-text-primary) 6%, transparent)",
                        color: isSelected ? "#ffffff" : "var(--ds-text-secondary)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all var(--motion-duration-fast)",
                      }}
                    >
                      {isSelected ? (
                        <>
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                          <span>Assigned</span>
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon icon={Add01Icon} size={12} />
                          <span>Assign</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Panel: Skill Detail & Markdown Specification */}
          <div
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "color-mix(in oklab, var(--ds-bg-elevated) 40%, transparent)",
            }}
          >
            {/* Detail Top Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--ds-border-subtle)",
                paddingBottom: 14,
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "var(--text-lg)",
                      fontWeight: 600,
                      color: "var(--ds-text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {inspectedDetail.name}
                  </h4>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: `color-mix(in oklab, ${accentColor} 15%, transparent)`,
                      color: accentColor,
                      border: `1px solid color-mix(in oklab, ${accentColor} 30%, transparent)`,
                    }}
                  >
                    {inspectedDetail.category}
                  </span>
                  {inspectedDetail.sourceRepo ? (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 500,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        background: "color-mix(in oklab, var(--ds-text-primary) 6%, transparent)",
                        color: "var(--ds-text-secondary)",
                        border: "1px solid var(--ds-border-subtle)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <HugeiconsIcon icon={Github01Icon} size={11} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px" }}>
                        {inspectedDetail.sourceRepo}
                      </span>
                      {inspectedDetail.stars ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                            color: "#eab308",
                            fontWeight: 600,
                            marginLeft: 2,
                          }}
                        >
                          <HugeiconsIcon icon={StarIcon} size={10} />
                          <span>{inspectedDetail.stars}</span>
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </div>
                <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--ds-text-secondary)", lineHeight: 1.5 }}>
                  {inspectedDetail.summary}
                </p>
              </div>

              {/* Action Button: Assign / Remove */}
              <button
                type="button"
                onClick={() => onToggleSkill(inspectedDetail.name)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 18px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  border: isInspectedSelected
                    ? `1px solid ${accentColor}`
                    : `1px solid ${accentColor}`,
                  background: isInspectedSelected ? accentColor : `color-mix(in oklab, ${accentColor} 15%, transparent)`,
                  color: isInspectedSelected ? "#ffffff" : accentColor,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all var(--motion-duration-fast)",
                }}
              >
                <HugeiconsIcon icon={isInspectedSelected ? CheckmarkCircle01Icon : Add01Icon} size={14} />
                <span>{isInspectedSelected ? "Assigned to Member" : "Assign to Member"}</span>
              </button>
            </div>

            {/* Markdown Document Content */}
            <div
              style={{
                background: "var(--ds-tile)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                border: "1px solid var(--ds-border-subtle)",
                fontSize: "12px",
                lineHeight: 1.6,
                color: "var(--ds-text-primary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--ds-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 12,
                  borderBottom: "1px solid var(--ds-border-subtle)",
                  paddingBottom: 6,
                }}
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={13} />
                <span>Skill Documentation &amp; Prompt Directive</span>
              </div>

              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--ds-text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {inspectedDetail.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
  );
}
