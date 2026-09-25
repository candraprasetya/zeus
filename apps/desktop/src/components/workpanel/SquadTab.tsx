import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/app-store";
import {
  IconBot,
  IconPalette,
  IconPerson,
  IconShield,
  IconListChecks,
  IconPencil,
  IconPlus,
  IconExternal,
  IconCheck,
} from "../icons";

type SquadRole = {
  id: string;
  name: string;
  title: string;
  category: "Design" | "Mobile Dev" | "Quality & Security";
  description: string;
  skillId: string;
  badge: string;
  icon: typeof IconBot;
  color: string;
  checklist: string[];
  samplePrompt: string;
};

const DEFAULT_SQUAD_ROLES: SquadRole[] = [
  {
    id: "ui-designer",
    name: "UI Designer",
    title: "Banking Design System Specialist",
    category: "Design",
    description: "Mengonversi blueprint & wireframe ke Design Tokens bank (Light/Dark mode), skala tipografi, 4/8pt grid, dan komponen siap pakai untuk Compose & SwiftUI.",
    skillId: "zeus-ui-designer",
    badge: "Design Tokens & System",
    icon: IconPalette,
    color: "#06b6d4",
    checklist: [
      "Zero hardcoded color (Wajib semantic token bank)",
      "Typography scale baku (Display, Headline, Body, Caption)",
      "8pt/4pt Spacing & Radius grid",
      "Asset vector & Icon spec siap import",
    ],
    samplePrompt: "Tolong susun token warna semantik dan spesifikasi komponen Compose & SwiftUI untuk fitur: ",
  },
  {
    id: "ux-designer",
    name: "UX Designer",
    title: "Banking Customer Journey & Flow Architect",
    category: "Design",
    description: "Merancang alur perjalanan nasabah, diagram flow interaktif Mermaid, handling 5 state layar (Shimmer, Empty, Partial/Offline 2G, Error), dan kepatuhan a11y WCAG AAA.",
    skillId: "zeus-ux-designer",
    badge: "User Flow & a11y",
    icon: IconPerson,
    color: "#8b5cf6",
    checklist: [
      "5 Interactive States (Shimmer, Populated, Empty, Offline, Error)",
      "Diagram alur Mermaid (Happy path & Negative branch)",
      "Touch target min 48x48dp (Android) & 44x44pt (iOS)",
      "Screen Reader label accessibility (a11y)",
    ],
    samplePrompt: "Rancang Customer Journey dan matriks 5 state interaktif lengkap dengan diagram Mermaid untuk fitur: ",
  },
  {
    id: "android-lead",
    name: "Evan",
    title: "Team Lead Android Native (Kotlin & Compose)",
    category: "Mobile Dev",
    description: "Spesialis Android Native Kotlin, Clean Architecture (Domain, Data, Presentation), Coroutines StateFlow, Hilt DI, Room DB, dan enkripsi AndroidKeyStore.",
    skillId: "zeus-squad",
    badge: "Android Native / Kotlin",
    icon: IconBot,
    color: "#10b981",
    checklist: [
      "Clean Architecture (Domain/Data/Presentation)",
      "Jetpack Compose UI dengan BankTheme tokens",
      "Coroutines & StateFlow unidirectional data flow",
      "AndroidKeyStore & FLAG_SECURE window protection",
    ],
    samplePrompt: "Evan, tolong implementasikan modul Android Native Kotlin dengan Clean Architecture untuk fitur: ",
  },
  {
    id: "ios-lead",
    name: "Candra",
    title: "Team Lead iOS Native (Swift & SwiftUI)",
    category: "Mobile Dev",
    description: "Spesialis iOS Native Swift, Clean Architecture, SwiftUI declarative views, Swift Concurrency (async/await), Combine/Observation, dan Keychain Services.",
    skillId: "zeus-squad",
    badge: "iOS Native / SwiftUI",
    icon: IconBot,
    color: "#3b82f6",
    checklist: [
      "Clean Architecture (Domain/Data/Presentation)",
      "SwiftUI declarative views dengan ThemeModifier",
      "Swift Concurrency (async/await & Task lifecycle)",
      "Keychain Services & background snapshot masking",
    ],
    samplePrompt: "Candra, tolong implementasikan modul iOS Native SwiftUI dengan Clean Architecture untuk fitur: ",
  },
  {
    id: "security-checker",
    name: "Security Checker",
    title: "Banking Security & OWASP MASVS Auditor",
    category: "Quality & Security",
    description: "Audit kepatuhan standar bank PCI-DSS & MASVS: Keystore/Keychain, Certificate Pinning, Anti-Root/Jailbreak, Anti-tamper, memory wipe, dan zero plain-text logging.",
    skillId: "zeus-security",
    badge: "OWASP MASVS & PCI-DSS",
    icon: IconShield,
    color: "#ef4444",
    checklist: [
      "MASVS-STORAGE (No plain credentials, Hardware Keystore/Keychain)",
      "MASVS-CRYPTO (AES-GCM, Bcrypt $2b$, Argon2id)",
      "MASVS-NETWORK (TLS 1.3 & Certificate Pinning)",
      "Anti-Root / Jailbreak & Memory Sensitive Data Wipe",
    ],
    samplePrompt: "Audit celah keamanan arsitektur, proteksi keystore/keychain, dan sertifikasi MASVS untuk kode berikut: ",
  },
  {
    id: "qa-specialist",
    name: "Quality Assurance (QA)",
    title: "Banking QA & Data Dictionary Validator",
    category: "Quality & Security",
    description: "Memvalidasi kesesuaian implementasi terhadap Excel Data Dictionary & Blueprint, BDD Gherkin scenarios, skenario boundary testing, dan resilient error handling.",
    skillId: "zeus-qa",
    badge: "BDD & Data Dictionary",
    icon: IconListChecks,
    color: "#f59e0b",
    checklist: [
      "Validasi field & regex terhadap Excel Data Dictionary",
      "BDD Gherkin scenario (Given-When-Then)",
      "Boundary Value Testing (Saldo 0, max limit, invalid chars)",
      "Simulasi Timeout 504 & Session Expiry",
    ],
    samplePrompt: "Buatkan skenario pengujian BDD Gherkin dan test cases komprehensif berdasarkan Data Dictionary untuk fitur: ",
  },
];

export function SquadTab() {
  const { t } = useTranslation();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("android-lead");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const showToast = useAppStore((state) => state.showToast);

  const selectedRole = useMemo(
    () => DEFAULT_SQUAD_ROLES.find((r) => r.id === selectedRoleId) ?? DEFAULT_SQUAD_ROLES[0],
    [selectedRoleId],
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
      setCopiedId(selectedRole.id);
      setTimeout(() => setCopiedId(null), 1500);
      showToast("Prompt template disalin ke clipboard!", { variant: "success" });
    }
  };

  return (
    <div className="squad-tab-container" style={{ padding: "16px", display: "flex", flexDirection: "column", height: "100%", gap: "16px", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--ds-border-subtle)", paddingBottom: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--ds-text-primary)" }}>
            Mobile Banking Squad Roles
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--ds-text-muted)" }}>
            Ekosistem multi-agent & skill spesialisasi native mobile banking
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
        {DEFAULT_SQUAD_ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = role.id === selectedRoleId;
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
                  {selectedRole.name} — {selectedRole.title}
                </h3>
                <span style={{ fontSize: "11px", color: selectedRole.color, fontWeight: "500" }}>
                  Skill ID: `{selectedRole.skillId}`
                </span>
              </div>
            </div>
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
          </div>

          <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5", color: "var(--ds-text-secondary)" }}>
            {selectedRole.description}
          </p>

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

          <div style={{ background: "var(--ds-bg-composer)", borderRadius: "6px", padding: "10px", border: "1px solid var(--ds-border-subtle)" }}>
            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--ds-text-muted)", fontWeight: "600", display: "block", marginBottom: "4px" }}>
              Template Prompt Cepat:
            </span>
            <code style={{ fontSize: "11px", color: "var(--ds-text-primary)", wordBreak: "break-word" }}>
              {selectedRole.samplePrompt}[nama-fitur/blueprint]
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
