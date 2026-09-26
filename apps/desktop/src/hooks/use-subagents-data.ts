import { useEffect, useState } from "react";
import {
  fetchSubagentPageData,
  type SubagentPageData,
} from "../components/settings/subagent-settings";
import {
  fallbackBuiltinDefinitions,
  SUBAGENT_PRESETS,
  type SubagentPreset,
} from "@pi-desktop/shared";

export interface ResolvedSubagent {
  id: string;
  name: string;
  tag: string;
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

  useEffect(() => {
    let unmounted = false;
    fetchSubagentPageData()
      .then((data) => {
        if (!unmounted && data) {
          setPageData(data);
        }
      })
      .catch(() => {
        // Keeps fallback data
      });
    return () => {
      unmounted = true;
    };
  }, []);

  const getPreset = (handle: string): SubagentPreset | undefined =>
    SUBAGENT_PRESETS.find((p) => p.id === handle);

  // Dynamic Lead Agent: Zeus
  const zeusSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "zeus");
    return {
      id: "zeus",
      name: custom?.name || "⚡ Zeus (Lead Agent)",
      tag: "Main Orchestrator",
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
    return {
      id: "fixer",
      name: custom?.name || preset?.name || "Fixer",
      tag: "Task(fixer)",
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
    return {
      id: "explorer",
      name: custom?.name || preset?.name || "Explorer",
      tag: "Task(explorer)",
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
    return {
      id: "test-runner",
      name: custom?.name || preset?.name || "Test runner",
      tag: "Task(test-runner)",
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
    return {
      id: "code-reviewer",
      name: custom?.name || preset?.name || "Code reviewer",
      tag: "Task(code-reviewer)",
      description:
        custom?.description ||
        builtin?.description ||
        preset?.description ||
        "Review specific code for defects",
      tools:
        custom?.tools ||
        builtin?.tools ||
        preset?.tools || ["Read", "Glob", "Grep"],
      enabled: custom?.enabled ?? builtin?.enabled ?? true,
      isCustom: Boolean(custom),
    };
  })();

  // Dynamic Built-in Subagent 5: UI designer
  const uiDesignerSubagent: ResolvedSubagent = (() => {
    const custom = pageData.owned.find((o) => o.id === "ui-designer");
    const builtin = pageData.builtins.find((b) => b.name === "ui-designer");
    const preset = getPreset("ui-designer");
    return {
      id: "ui-designer",
      name: custom?.name || preset?.name || "UI designer",
      tag: "Task(ui-designer)",
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
      enabled: custom?.enabled ?? builtin?.enabled ?? true,
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
    .map((o) => ({
      id: o.id,
      name: o.name,
      tag: `Task(${o.id})`,
      description: o.description,
      tools: o.tools,
      enabled: o.enabled,
      isCustom: true,
    }));

  return {
    pageData,
    zeusSubagent,
    fixerSubagent,
    explorerSubagent,
    testRunnerSubagent,
    reviewerSubagent,
    uiDesignerSubagent,
    customSubagents,
  };
}
