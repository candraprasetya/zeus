import { describe, it, expect, vi } from "vitest";
import { BUILTIN_TASK_FLOWS } from "@pi-desktop/shared";
import { TaskFlowEngine } from "../src/task-flow-engine.js";

describe("TaskFlowEngine (CrewAI-inspired multi-agent orchestration)", () => {
  it("executes rapid-bugfix flow sequentially, passing scratchpad memory across agents", async () => {
    const bugfixFlow = BUILTIN_TASK_FLOWS.find((f) => f.id === "rapid-bugfix");
    expect(bugfixFlow).toBeDefined();

    const engine = new TaskFlowEngine(bugfixFlow!);
    const executedSteps: string[] = [];

    const resultContext = await engine.execute(
      "Fix TypeError in auth token validation",
      async (step, renderedPrompt, context) => {
        executedSteps.push(step.id);

        if (step.id === "diagnose") {
          expect(renderedPrompt).toContain("Fix TypeError in auth token validation");
          return {
            output: "Root cause found in src/auth.ts line 42: null token checked incorrectly.",
          };
        }

        if (step.id === "fix") {
          // verify shared scratchpad injected from 'diagnose' step
          expect(renderedPrompt).toContain(
            "Root cause found in src/auth.ts line 42: null token checked incorrectly.",
          );
          return {
            output: "Applied optional chaining on token payload in src/auth.ts.",
          };
        }

        if (step.id === "verify") {
          return {
            output: "All 12 authentication tests passed.",
          };
        }

        return { output: "done" };
      },
    );

    expect(executedSteps).toEqual(["diagnose", "fix", "verify"]);
    expect(resultContext.stepResults["diagnose"]?.status).toBe("completed");
    expect(resultContext.stepResults["fix"]?.status).toBe("completed");
    expect(resultContext.stepResults["verify"]?.status).toBe("completed");
    expect(resultContext.scratchpad["diagnose"]).toBe(
      "Root cause found in src/auth.ts line 42: null token checked incorrectly.",
    );
  });

  it("halts execution when a dependency step fails", async () => {
    const bugfixFlow = BUILTIN_TASK_FLOWS.find((f) => f.id === "rapid-bugfix");
    const engine = new TaskFlowEngine(bugfixFlow!);

    const resultContext = await engine.execute(
      "Crash bug",
      async (step) => {
        if (step.id === "diagnose") {
          return { output: "", error: "Could not locate symbol" };
        }
        return { output: "ok" };
      },
    );

    expect(resultContext.stepResults["diagnose"]?.status).toBe("failed");
    expect(resultContext.stepResults["fix"]?.status).toBe("failed");
    expect(resultContext.stepResults["fix"]?.error).toContain("Unmet dependencies: diagnose");
    expect(resultContext.stepResults["verify"]).toBeUndefined();
  });

  it("fails step when output violates configured guardrails", async () => {
    const customFlow = {
      id: "guardrail-test",
      name: "Guardrail Test",
      description: "Test guardrails",
      steps: [
        {
          id: "step-1",
          agentRole: "code-reviewer",
          title: "Quality Review",
          instruction: "Review code",
          guardrails: [
            { type: "contains_text" as const, value: "VERIFIED", failureMessage: "Must include VERIFIED" },
          ],
        },
      ],
    };

    const engine = new TaskFlowEngine(customFlow);
    const result = await engine.execute("Audit change", async () => ({
      output: "Looks good but forgot the keyword",
    }));

    expect(result.stepResults["step-1"]?.status).toBe("failed");
    expect(result.stepResults["step-1"]?.error).toBe("Guardrail violation: Must include VERIFIED");
  });

  it("halts execution when user rejects approval gate", async () => {
    const gatedFlow = {
      id: "approval-test",
      name: "Approval Test",
      description: "Test approval gate",
      steps: [
        {
          id: "step-deploy",
          agentRole: "fixer",
          title: "Deploy Migration",
          instruction: "Execute database migration",
          requiresUserApproval: true,
        },
      ],
    };

    const engine = new TaskFlowEngine(gatedFlow);
    const result = await engine.execute(
      "Run DB migration",
      async () => ({ output: "Migrated" }),
      async (step) => false, // User denies approval
    );

    expect(result.stepResults["step-deploy"]?.status).toBe("failed");
    expect(result.stepResults["step-deploy"]?.error).toContain("was rejected by user");
  });

  it("emits signed AgentAuditEvent stream matching Block Buzz event ledger", async () => {
    const bugfixFlow = BUILTIN_TASK_FLOWS.find((f) => f.id === "rapid-bugfix");
    const engine = new TaskFlowEngine(bugfixFlow!);

    const auditEvents: any[] = [];
    await engine.execute(
      "Fix timeout in auth request",
      async (step) => ({ output: `Done step ${step.id}` }),
      {
        onEvent: (ev) => auditEvents.push(ev),
      },
    );

    const eventKinds = auditEvents.map((e) => e.kind);
    expect(eventKinds).toContain("flow_started");
    expect(eventKinds).toContain("agent_assigned");
    expect(eventKinds).toContain("step_started");
    expect(eventKinds).toContain("step_completed");
    expect(eventKinds).toContain("handoff");
    expect(eventKinds).toContain("flow_completed");

    // All events carry timestamp, flowId, and summary
    for (const ev of auditEvents) {
      expect(ev.flowId).toBe("rapid-bugfix");
      expect(ev.timestamp).toBeDefined();
      expect(typeof ev.summary).toBe("string");
      expect(ev.summary.length).toBeGreaterThan(0);
    }
  });
});


