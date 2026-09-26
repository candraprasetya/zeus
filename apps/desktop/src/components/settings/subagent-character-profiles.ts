import {
  FlashIcon,
  Search01Icon,
  SourceCodeIcon,
  TestTube01Icon,
  Wrench01Icon,
  Target01Icon,
  PaintBoardIcon,
  BotIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type CharacterArchetypeId =
  | "zeus"
  | "athena"
  | "hermes"
  | "apollo"
  | "hephaestus"
  | "artemis"
  | "iris";

export interface CharacterArchetype {
  id: CharacterArchetypeId;
  name: string;
  defaultRole: string;
  badge: string;
  avatarEmoji: string;
  color: string;
  accentBg: string;
  hairColor: string;
  outfitColor: string;
  description: string;
}

export function getArchetypeHugeIcon(archetype: string | undefined): IconSvgElement {
  switch (archetype) {
    case "zeus":
      return FlashIcon;
    case "athena":
      return Search01Icon;
    case "hermes":
      return SourceCodeIcon;
    case "apollo":
      return TestTube01Icon;
    case "hephaestus":
      return Wrench01Icon;
    case "artemis":
      return Target01Icon;
    case "iris":
      return PaintBoardIcon;
    default:
      return BotIcon;
  }
}

export function cleanAgentName(name: string): string {
  // Strip emojis like ⚡, 🤖, etc. from agent display names
  return name.replace(/^[\p{Extended_Pictographic}\u2600-\u27BF\s]+/u, "").trim();
}

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  {
    id: "zeus",
    name: "Zeus",
    defaultRole: "Main Orchestrator",
    badge: "Lead Agent",
    avatarEmoji: "⚡",
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.15)",
    hairColor: "#f59e0b",
    outfitColor: "#1e293b",
    description: "Main System Coordinator & workflow orchestrator",
  },
  {
    id: "athena",
    name: "Athena",
    defaultRole: "Explorer",
    badge: "Task(explorer)",
    avatarEmoji: "🧭",
    color: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.15)",
    hairColor: "#0369a1",
    outfitColor: "#0284c7",
    description: "Fast codebase search, pattern matching & spec analysis",
  },
  {
    id: "hermes",
    name: "Hermes",
    defaultRole: "Fixer",
    badge: "Task(fixer)",
    avatarEmoji: "🛠️",
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.15)",
    hairColor: "#0f766e",
    outfitColor: "#059669",
    description: "Multi-file code implementation & surgical fixes",
  },
  {
    id: "apollo",
    name: "Apollo",
    defaultRole: "Test Runner",
    badge: "Task(test-runner)",
    avatarEmoji: "🧪",
    color: "#ec4899",
    accentBg: "rgba(236, 72, 153, 0.15)",
    hairColor: "#ec4899",
    outfitColor: "#f8fafc",
    description: "Test execution, verification & quality validation",
  },
  {
    id: "hephaestus",
    name: "Hephaestus",
    defaultRole: "Architect",
    badge: "Task(architect)",
    avatarEmoji: "🔨",
    color: "#f97316",
    accentBg: "rgba(249, 115, 22, 0.15)",
    hairColor: "#c2410c",
    outfitColor: "#7c2d12",
    description: "Systems architecture, refactoring & database migrations",
  },
  {
    id: "artemis",
    name: "Artemis",
    defaultRole: "Reviewer & Auditor",
    badge: "Task(code-reviewer)",
    avatarEmoji: "🏹",
    color: "#a855f7",
    accentBg: "rgba(168, 85, 247, 0.15)",
    hairColor: "#7e22ce",
    outfitColor: "#3b0764",
    description: "Security boundary audit & rigorous code review",
  },
  {
    id: "iris",
    name: "Iris",
    defaultRole: "UI Designer",
    badge: "Task(ui-designer)",
    avatarEmoji: "🌈",
    color: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.15)",
    hairColor: "#0891b2",
    outfitColor: "#0e7490",
    description: "Web interface design, accessible components & styling",
  },
];

export interface SubagentProfileCustomization {
  id: string;
  archetype: CharacterArchetypeId;
  customName?: string;
  customRole?: string;
}

const STORAGE_KEY = "zeus.subagent_character_profiles.v1";
export const PROFILE_CHANGE_EVENT = "zeus:subagent-profile-changed";

export function getCharacterArchetype(id: string | undefined): CharacterArchetype {
  return (
    CHARACTER_ARCHETYPES.find((a) => a.id === id) ||
    CHARACTER_ARCHETYPES[0]
  );
}

export function getAllSubagentProfiles(): Record<string, SubagentProfileCustomization> {
  if (typeof window === "undefined" || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSubagentProfile(id: string): SubagentProfileCustomization {
  const all = getAllSubagentProfiles();
  if (all[id]) return all[id];

  // Sensible default archetypes by ID
  switch (id) {
    case "zeus":
      return { id: "zeus", archetype: "zeus", customName: "⚡ Zeus (Lead Agent)", customRole: "Main Orchestrator" };
    case "fixer":
      return { id: "fixer", archetype: "hermes", customName: "Hermes", customRole: "Fixer" };
    case "explorer":
      return { id: "explorer", archetype: "athena", customName: "Athena", customRole: "Explorer" };
    case "test-runner":
      return { id: "test-runner", archetype: "apollo", customName: "Apollo", customRole: "Test runner" };
    case "code-reviewer":
      return { id: "code-reviewer", archetype: "artemis", customName: "Artemis", customRole: "Code Reviewer" };
    case "ui-designer":
      return { id: "ui-designer", archetype: "iris", customName: "Iris", customRole: "UI Designer" };
    default:
      return { id, archetype: "hermes" };
  }
}

export function saveSubagentProfile(profile: SubagentProfileCustomization): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const all = getAllSubagentProfiles();
    all[profile.id] = { ...all[profile.id], ...profile };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(PROFILE_CHANGE_EVENT, { detail: profile }));
  } catch {
    // Ignore localStorage write errors
  }
}
