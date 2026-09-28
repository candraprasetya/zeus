import { useEffect, useState } from "react";
import {
  fetchSubagentPageData,
  SUBAGENT_CHANGE_EVENT,
  type SubagentPageData,
} from "../components/settings/subagent-settings";
import {
  fallbackBuiltinDefinitions,
  SUBAGENT_PRESETS,
  type SubagentPreset,
} from "@pi-desktop/shared";
import {
  getSubagentProfile,
  PROFILE_CHANGE_EVENT,
  type CharacterArchetypeId,
} from "../components/settings/subagent-character-profiles";

export interface ResolvedSubagent {
  id: string;
  name: string;
  tag: string;
  role: string;
  archetype: CharacterArchetypeId;
  description: string;
  tools: readonly string[];
  enabled: boolean;
  isCustom: boolean;
}

export function useSubagentsData() {
  const [pageData, setPageData] = useState<SubagentPageData>(() => ({
    owned: [],
    builtins: fallbackBuiltinDefinitions().map((item) => ({ ...item, enabled: true })),
  }));
  const [profileRevision, setProfileRevision] = useState(0);

  useEffect(() => {
    let unmounted = false;
    const load = () => {
      fetchSubagentPageData()
        .then((data) => {
          if (!unmounted && data) {
            setPageData(data);
          }
        })
        .catch(() => {
          // Keeps the last known roster over a failed refresh.
        });
    };
    load();

    const handleProfileChange = () => {
      setProfileRevision((r) => r + 1);
    };

    // Settings writes through the host, so a toggle made there has to pull the
    // catalog again here — the office and the strip are still mounted and
    // would otherwise keep the roster the user just switched off.
    window.addEventListener(SUBAGENT_CHANGE_EVENT, load);
    window.addEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
    window.addEventListener("storage", handleProfileChange);

    return () => {
      unmounted = true;
      window.removeEventListener(SUBAGENT_CHANGE_EVENT, load);
      window.removeEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
      window.removeEventListener("storage", handleProfileChange);
    };
  }, []);

  const getPreset = (handle: string): SubagentPreset | undefined =>
    SUBAGENT_PRESETS.find((p) => p.id === handle);

  // Dynamic Lead Agent: Zeus
  const zeusSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "zeus");
    const profile = getSubagentProfile("zeus");
    const name = profile.customName || custom?.name || "⚡ Zeus (Lead Agent)";
    const role = profile.customRole || "Main Orchestrator";
    return {
      id: "zeus",
      name,
      tag: "Main Orchestrator",
      role,
      archetype: profile.archetype || "zeus",
      description:
        custom?.description ||
        "Mengoordinasikan alur kerja, mendistribusikan task ke sub-agent",
      tools:
        custom?.tools || ["Read", "Glob", "Grep", "Bash", "Edit", "Write"],
      enabled: custom?.enabled ?? true,
      isCustom: Boolean(custom),
    };
  })();

  // Dynamic Built-in Subagent 1: Fixer
  const fixerSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "fixer");
    const builtin = pageData.builtins.find((b) => b.name === "fixer");
    const preset = getPreset("fixer");
    const profile = getSubagentProfile("fixer");
    const name = profile.customName || custom?.name || preset?.name || "Fixer";
    const role = profile.customRole || "Fixer";
    return {
      id: "fixer",
      name,
      tag: "Task(fixer)",
      role,
      archetype: profile.archetype || "hermes",
      description:
        custom?.description ||
        builtin?.description ||
        preset?.description ||
        "Implement a complete multi-file change from a spec",
      tools:
        custom?.tools ||
        builtin?.tools ||
        preset?.tools || ["Read", "Glob", "Grep", "Edit", "Write", "Bash"],
      enabled: custom?.enabled ?? builtin?.enabled ?? true,
      isCustom: Boolean(custom),
    };
  })();

  // Dynamic Built-in Subagent 2: Explorer
  const explorerSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "explorer");
    const builtin = pageData.builtins.find((b) => b.name === "explorer");
    const preset = getPreset("explorer");
    const profile = getSubagentProfile("explorer");
    const name = profile.customName || custom?.name || preset?.name || "Explorer";
    const role = profile.customRole || "Explorer";
    return {
      id: "explorer",
      name,
      tag: "Task(explorer)",
      role,
      archetype: profile.archetype || "athena",
      description:
        custom?.description ||
        builtin?.description ||
        preset?.description ||
        "Fast codebase search and pattern matching",
      tools:
        custom?.tools ||
        builtin?.tools ||
        preset?.tools || ["Read", "Glob", "Grep", "Bash"],
      enabled: custom?.enabled ?? builtin?.enabled ?? true,
      isCustom: Boolean(custom),
    };
  })();

  // Dynamic Built-in Subagent 3: Test runner
  const testRunnerSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "test-runner");
    const builtin = pageData.builtins.find((b) => b.name === "test-runner");
    const preset = getPreset("test-runner");
    const profile = getSubagentProfile("test-runner");
    const name = profile.customName || custom?.name || preset?.name || "Test runner";
    const role = profile.customRole || "Test runner";
    return {
      id: "test-runner",
      name,
      tag: "Task(test-runner)",
      role,
      archetype: profile.archetype || "apollo",
      description:
        custom?.description ||
        builtin?.description ||
        preset?.description ||
        "Run a specific test or build command",
      tools:
        custom?.tools ||
        builtin?.tools ||
        preset?.tools || ["Read", "Glob", "Grep", "Bash"],
      enabled: custom?.enabled ?? builtin?.enabled ?? true,
      isCustom: Boolean(custom),
    };
  })();

  // Dynamic Built-in Subagent 4: Code reviewer
  const reviewerSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "code-reviewer");
    const builtin = pageData.builtins.find((b) => b.name === "code-reviewer");
    const preset = getPreset("code-reviewer");
    const profile = getSubagentProfile("code-reviewer");
    const name = profile.customName || custom?.name || preset?.name || "Code reviewer";
    const role = profile.customRole || "Code Reviewer";
    return {
      id: "code-reviewer",
      name,
      tag: "Task(code-reviewer)",
      role,
      archetype: profile.archetype || "artemis",
      description:
        custom?.description ||
        builtin?.description ||
        preset?.description ||
        "Review specific code for defects",
      tools:
        custom?.tools ||
        builtin?.tools ||
        preset?.tools || ["Read", "Glob", "Grep"],
      enabled: custom?.enabled ?? builtin?.enabled ?? false,
      isCustom: Boolean(custom),
    };
  })();

  // Dynamic Built-in Subagent 5: UI designer
  const uiDesignerSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "ui-designer");
    const builtin = pageData.builtins.find((b) => b.name === "ui-designer");
    const preset = getPreset("ui-designer");
    const profile = getSubagentProfile("ui-designer");
    const name = profile.customName || custom?.name || preset?.name || "UI designer";
    const role = profile.customRole || "UI Designer";
    return {
      id: "ui-designer",
      name,
      tag: "Task(ui-designer)",
      role,
      archetype: profile.archetype || "iris",
      description:
        custom?.description ||
        builtin?.description ||
        preset?.description ||
        "Design and implement a web interface",
      tools:
        custom?.tools ||
        builtin?.tools ||
        preset?.tools || [
          "Read",
          "Glob",
          "Grep",
          "BrowserPreview",
          "Bash",
          "Edit",
          "Write",
        ],
      enabled: custom?.enabled ?? builtin?.enabled ?? false,
      isCustom: Boolean(custom),
    };
  })();

  // User-created custom subagents from Settings
  const builtinHandles = new Set([
    "zeus",
    "fixer",
    "explorer",
    "test-runner",
    "code-reviewer",
    "ui-designer",
  ]);

  const customSubagents: ResolvedSubagent[] = pageData.owned
    .filter((o) => !builtinHandles.has(o.id) && o.enabled)
    .map((o) => {
      const profile = getSubagentProfile(o.id);
      return {
        id: o.id,
        name: profile.customName || o.name,
        tag: `Task(${o.id})`,
        role: profile.customRole || "Specialist",
        archetype: profile.archetype || "hephaestus",
        description: o.description,
        tools: o.tools,
        enabled: o.enabled,
        isCustom: true,
      };
    });

  // Active office worker subagents: strictly all enabled subagents configured in Settings
  const candidates: ResolvedSubagent[] = [
    fixerSubagent,
    explorerSubagent,
    testRunnerSubagent,
    reviewerSubagent,
    uiDesignerSubagent,
    ...customSubagents,
  ];
  const officeSubagents = candidates.filter((agent) => agent.enabled);

  return {
    pageData,
    zeusSubagent,
    fixerSubagent,
    explorerSubagent,
    testRunnerSubagent,
    reviewerSubagent,
    uiDesignerSubagent,
    customSubagents,
    officeSubagents,
    profileRevision,
  };
}
