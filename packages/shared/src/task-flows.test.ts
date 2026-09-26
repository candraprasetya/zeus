import { describe, it, expect } from "vitest";
import {
  BUILTIN_TASK_FLOWS,
  formatFlowStepPrompt,
  type TaskFlowContext,
} from "./task-flows.js";

describe("Task Flows (CrewAI inspired)", () => {
  it("provides built-in flows like feature-delivery and rapid-bugfix", () => {
    expect(BUILTIN_TASK_FLOWS.length).toBeGreaterThanOrEqual(2);
    const featureFlow = BUILTIN_TASK_FLOWS.find((f) => f.id === "feature-delivery");
    expect(featureFlow).toBeDefined();
    expect(featureFlow?.steps.map((s) => s.agentRole)).toEqual([
      "explorer",
      "fixer",
      "code-reviewer",
      "test-runner",
    ]);
  });

  it("correctly interpolates goal and scratchpad values into step prompt", () => {
    const context: TaskFlowContext = {
      flowId: "feature-delivery",
      goal: "Implement OAuth2 login with GitHub",
      scratchpad: {
        survey: "Found packages/shared/src/auth.ts and apps/desktop/src/auth.ts",
      },
      stepResults: {},
    };

    const template =
      "Implement the feature for goal '{{goal}}' using findings: {{scratchpad.survey}}.";
    const rendered = formatFlowStepPrompt(template, context);

    expect(rendered).toBe(
      "Implement the feature for goal 'Implement OAuth2 login with GitHub' using findings: Found packages/shared/src/auth.ts and apps/desktop/src/auth.ts.",
    );
  });

  it("validates output against step guardrails", async () => {
    const { validateStepGuardrails } = await import("./task-flows.js");


    const rules = [
      { type: "not_empty" as const, failureMessage: "Output cannot be empty" },
      { type: "contains_text" as const, value: "PASS", failureMessage: "Must contain PASS" },
      { type: "max_length" as const, value: 50, failureMessage: "Too long" },
    ];

    expect(validateStepGuardrails("PASS: all tests green", rules)).toEqual({ isValid: true });
    expect(validateStepGuardrails("", rules)).toEqual({ isValid: false, error: "Output cannot be empty" });
    expect(validateStepGuardrails("FAILED", rules)).toEqual({ isValid: false, error: "Must contain PASS" });
    expect(
      validateStepGuardrails("PASS: but this explanation string is way too long to pass the max length guardrail limit", rules),
    ).toEqual({ isValid: false, error: "Too long" });
  });

  it("exports Block Buzz signed audit events to Markdown table and JSON", async () => {
    const { exportAuditTrailToMarkdown, exportAuditTrailToJson } = await import("./task-flows.js");

    const events = [
      {
        id: "ev-1",
        flowId: "feature-delivery",
        stepId: "survey",
        agentRole: "explorer",
        kind: "step_started" as const,
        summary: "Surveying codebase",
        timestamp: "2026-09-27T04:00:00.000Z",
      },
      {
        id: "ev-2",
        flowId: "feature-delivery",
        stepId: "survey",
        agentRole: "explorer",
        kind: "handoff" as const,
        summary: "Context handoff to scratchpad",
        timestamp: "2026-09-27T04:01:00.000Z",
      },
    ];

    const md = exportAuditTrailToMarkdown(events, "Feature Delivery");
    expect(md).toContain("# Block Buzz Audit Trail: Feature Delivery");
    expect(md).toContain("| explorer | `step_started` | Surveying codebase |");
    expect(md).toContain("| explorer | `handoff` | Context handoff to scratchpad |");

    const json = exportAuditTrailToJson(events);
    expect(JSON.parse(json)).toHaveLength(2);
  });
});


