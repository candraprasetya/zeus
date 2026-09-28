import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/app-store";
import {
  useZeusSquad,
  type ZeusSquadTeamMember,
} from "../../features/zeus-squad/use-zeus-squad";
import { IconPencil, IconPlus, IconCheck } from "../icons";

export function SquadTab() {
  const { t } = useTranslation();
  // Same roster Settings edits and the chat team strip renders — one squad,
  // one function, no second copy of the member list to keep in sync.
  const squadMembers = useZeusSquad();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("android-lead");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const showToast = useAppStore((state) => state.showToast);

  const selectedRole: ZeusSquadTeamMember | undefined = useMemo(
    () => squadMembers.find((r) => r.id === selectedRoleId) ?? squadMembers[0],
    [squadMembers, selectedRoleId],
  );

  const handleUsePrompt = (prompt: string) => {
    const composerInput = document.querySelector<HTMLTextAreaElement>(".composer-input");
    if (composerInput) {
      composerInput.value = prompt;
      composerInput.dispatchEvent(new Event("input", { bubbles: true }));
      composerInput.focus();
      showToast("Prompt template role dimasukkan ke composer!", { variant: "success" });
    } else {
      void navigator.clipboard.writeText(prompt);
      setCopiedId(selectedRole?.id ?? null);
      setTimeout(() => setCopiedId(null), 1500);
      showToast("Prompt template disalin ke clipboard!", { variant: "success" });
    }
  };

  return (
    <div className="squad-tab-container" style={{ padding: "16px", display: "flex", flexDirection: "column", height: "100%", gap: "16px", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--ds-border-subtle)", paddingBottom: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--ds-text-primary)" }}>
            Zeus Squad Roles
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--ds-text-muted)" }}>
            Roster tim kamu — tambah, ubah, atau sembunyikan member di Settings › Subagents
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "12px", background: "var(--ds-tile-deep)", color: "var(--ds-text-secondary)" }}>
            Qwen 3.6 On-Premise Ready
          </span>
        </div>
      </div>

      {/* Role Selector Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
        {squadMembers.map((role) => {
          const Icon = role.icon;
          const isSelected = role.id === selectedRole?.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px",
                borderRadius: "8px",
                border: isSelected ? `2px solid ${role.color}` : "1px solid var(--ds-border-subtle)",
                background: isSelected ? "var(--ds-bg-hover)" : "var(--ds-tile-shallow)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                opacity: role.enabled ? 1 : 0.55,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", marginBottom: "6px" }}>
                <span style={{ color: role.color }}>
                  <Icon size={16} />
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--ds-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {role.name}
                </span>
              </div>
              <span style={{ fontSize: "10px", color: "var(--ds-text-muted)", lineHeight: "1.2" }}>
                {role.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Role Detail Card */}
      {selectedRole && (
        <div style={{ background: "var(--ds-tile-deep)", borderRadius: "10px", padding: "16px", border: "1px solid var(--ds-border-subtle)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${selectedRole.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: selectedRole.color }}>
                <selectedRole.icon size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--ds-text-primary)" }}>
                  {selectedRole.title
                    ? `${selectedRole.name} — ${selectedRole.title}`
                    : selectedRole.name}
                </h3>
                {selectedRole.skillId ? (
                  <span style={{ fontSize: "11px", color: selectedRole.color, fontWeight: "500" }}>
                    Skill ID: `{selectedRole.skillId}`
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", color: selectedRole.color, fontWeight: "500" }}>
                    {selectedRole.badge}
                  </span>
                )}
              </div>
            </div>
            {selectedRole.samplePrompt ? (
            <button
              type="button"
              onClick={() => handleUsePrompt(selectedRole.samplePrompt)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                background: selectedRole.color,
                color: "#ffffff",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {copiedId === selectedRole.id ? <IconCheck size={13} /> : <IconPencil size={13} />}
              <span>Pakai di Composer</span>
            </button>
            ) : null}
          </div>

          {selectedRole.description ? (
          <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5", color: "var(--ds-text-secondary)" }}>
            {selectedRole.description}
          </p>
          ) : null}

          {selectedRole.checklist.length > 0 ? (
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "600", color: "var(--ds-text-primary)" }}>
              Governance & Quality Checklist:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {selectedRole.checklist.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--ds-text-secondary)" }}>
                  <span style={{ color: selectedRole.color }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          ) : null}

          {selectedRole.samplePrompt ? (
          <div style={{ background: "var(--ds-bg-composer)", borderRadius: "6px", padding: "10px", border: "1px solid var(--ds-border-subtle)" }}>
            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--ds-text-muted)", fontWeight: "600", display: "block", marginBottom: "4px" }}>
              Template Prompt Cepat:
            </span>
            <code style={{ fontSize: "11px", color: "var(--ds-text-primary)", wordBreak: "break-word" }}>
              {selectedRole.samplePrompt}[nama-fitur/blueprint]
            </code>
          </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
