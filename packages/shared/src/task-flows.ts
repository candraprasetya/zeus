/**
 * Task Flow schema and contracts inspired by CrewAI workflows and Block Buzz
 * collaborative multi-agent execution.
 *
 * Provides structured multi-step handoffs, shared context buffers (scratchpad),
 * and guardrail output verification for agent teams.
 */

export type TaskFlowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export type GuardrailRule = {
  /** Type of guardrail validation */
  type: "contains_text" | "not_empty" | "regex_match" | "max_length";
  /** Target text, pattern or threshold depending on rule type */
  value?: string | number;
  /** Custom warning message if validation fails */
  failureMessage: string;
};

export type TaskFlowStep = {
  /** Unique identifier for the step within a flow */
  id: string;
  /** Name of the subagent preset or definition (e.g. explorer, fixer, code-reviewer) */
  agentRole: string;
  /** Step title / objective */
  title: string;
  /** Detailed instruction prompt template for this agent step */
  instruction: string;
  /** Optional dependency step IDs that must complete before this step runs */
  dependsOn?: readonly string[];
  /** Optional expected output format or guardrail description */
  expectedOutput?: string;
  /** Guardrails to validate output before passing to next agent */
  guardrails?: readonly GuardrailRule[];
  /** Whether execution must pause for explicit user approval before running this step */
  requiresUserApproval?: boolean;
};


export type TaskFlowDefinition = {
  /** Unique flow identifier (e.g. "feature-delivery-flow", "bugfix-pipeline") */
  id: string;
  /** Human-readable flow name */
  name: string;
  /** Summary of what this multi-agent team workflow accomplishes */
  description: string;
  /** Ordered or dependency-graph sequence of steps */
  steps: readonly TaskFlowStep[];
};

export type TaskFlowStepResult = {
  stepId: string;
  agentRole: string;
  status: TaskFlowStepStatus;
  output?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
};

export type TaskFlowContext = {
  flowId: string;
  goal: string;
  /** Shared scratchpad memory accessible by all subagents in this flow */
  scratchpad: Record<string, string>;
  /** History of completed step results */
  stepResults: Record<string, TaskFlowStepResult>;
};

/**
 * Structured Agent Audit Trail Events inspired by Block Buzz signed event protocol.
 * Tracks full multi-agent collaborative execution lifecycle.
 */
export type AgentAuditEventKind =
  | "flow_started"
  | "agent_assigned"
  | "step_started"
  | "tool_dispatched"
  | "step_completed"
  | "step_failed"
  | "handoff"
  | "flow_completed";

export type AgentAuditEvent = {
  id: string;
  flowId: string;
  stepId?: string;
  agentRole: string;
  kind: AgentAuditEventKind;
  summary: string;
  payload?: Record<string, unknown>;
  timestamp: string;
};


/**
 * Built-in standard multi-agent workflows inspired by CrewAI.
 */
export const BUILTIN_TASK_FLOWS: readonly TaskFlowDefinition[] = [
  {
    id: "feature-delivery",
    name: "Feature Delivery Flow",
    description:
      "Full cycle feature implementation: codebase survey -> code fix/implementation -> code review -> test execution.",
    steps: [
      {
        id: "survey",
        agentRole: "explorer",
        title: "Codebase Survey & Context Gathering",
        instruction:
          "Locate all relevant source files, dependencies, and architectural contracts needed for the goal: {{goal}}.",
        expectedOutput: "List of relevant files and notes on existing architecture.",
      },
      {
        id: "implementation",
        agentRole: "fixer",
        title: "Feature Implementation",
        instruction:
          "Implement the requested feature based on the survey findings: {{scratchpad.survey}}.",
        dependsOn: ["survey"],
        expectedOutput: "Summary of changes made across affected files.",
      },
      {
        id: "review",
        agentRole: "code-reviewer",
        title: "Code Quality & Regression Audit",
        instruction:
          "Audit the implemented changes for correctness, edge cases, and architectural integrity: {{scratchpad.implementation}}.",
        dependsOn: ["implementation"],
        expectedOutput: "Audit report with findings or confirmation of soundness.",
      },
      {
        id: "verification",
        agentRole: "test-runner",
        title: "Test Execution & Validation",
        instruction:
          "Run the test suite or target tests to verify that the changes pass without breaking existing tests.",
        dependsOn: ["review"],
        expectedOutput: "Test execution results and confirmation of passing suite.",
      },
    ],
  },
  {
    id: "rapid-bugfix",
    name: "Rapid Bugfix Flow",
    description:
      "Diagnose failing behavior -> fix implementation -> verify with test runner.",
    steps: [
      {
        id: "diagnose",
        agentRole: "explorer",
        title: "Locate Defect Root Cause",
        instruction:
          "Trace the defect or failing symptom: {{goal}}. Find the root cause and failing files.",
        expectedOutput: "Root cause analysis and file citations.",
      },
      {
        id: "fix",
        agentRole: "fixer",
        title: "Apply Surgical Patch",
        instruction:
          "Apply minimal surgical fix addressing the root cause: {{scratchpad.diagnose}}.",
        dependsOn: ["diagnose"],
        expectedOutput: "Diff or description of patch applied.",
      },
      {
        id: "verify",
        agentRole: "test-runner",
        title: "Verify Fix via Tests",
        instruction:
          "Run relevant regression tests to prove that the bug is resolved.",
        dependsOn: ["fix"],
        expectedOutput: "Test output showing green/passing status.",
      },
    ],
  },
];

/**
 * Render prompt template with shared flow context
 */
export function formatFlowStepPrompt(
  template: string,
  context: TaskFlowContext,
): string {
  let prompt = template.replace(/\{\{goal\}\}/g, context.goal);
  for (const [key, value] of Object.entries(context.scratchpad)) {
    const regex = new RegExp(`\\{\\{scratchpad\\.${key}\\}\\}`, "g");
    prompt = prompt.replace(regex, value);
  }
  return prompt;
}

/**
 * Validate agent output against step guardrails (CrewAI inspired)
 */
export function validateStepGuardrails(
  output: string,
  guardrails?: readonly GuardrailRule[],
): { isValid: boolean; error?: string } {
  if (!guardrails || guardrails.length === 0) {
    return { isValid: true };
  }

  for (const rule of guardrails) {
    switch (rule.type) {
      case "not_empty":
        if (!output || output.trim().length === 0) {
          return { isValid: false, error: rule.failureMessage };
        }
        break;
      case "contains_text":
        if (typeof rule.value === "string" && !output.includes(rule.value)) {
          return { isValid: false, error: rule.failureMessage };
        }
        break;
      case "regex_match":
        if (typeof rule.value === "string") {
          const re = new RegExp(rule.value);
          if (!re.test(output)) {
            return { isValid: false, error: rule.failureMessage };
          }
        }
        break;
      case "max_length":
        if (typeof rule.value === "number" && output.length > rule.value) {
          return { isValid: false, error: rule.failureMessage };
        }
        break;
    }
  }

  return { isValid: true };
}

/**
 * Format Block Buzz signed audit events into structured Markdown document.
 */
export function exportAuditTrailToMarkdown(
  events: readonly AgentAuditEvent[],
  flowName = "Multi-Agent Task Flow",
): string {
  const lines: string[] = [
    `# Block Buzz Audit Trail: ${flowName}`,
    `Generated: ${new Date().toISOString()}`,
    `Total Events: ${events.length}`,
    "",
    "| Timestamp | Agent / Role | Event Kind | Summary |",
    "|---|---|---|---|",
  ];

  for (const ev of events) {
    const time = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "-";
    const agent = ev.agentRole || "System";
    const kind = ev.kind;
    const summary = (ev.summary || "").replace(/\|/g, "\\|");
    lines.push(`| ${time} | ${agent} | \`${kind}\` | ${summary} |`);
  }

  return lines.join("\n");
}

/**
 * Serialize audit events to pretty-printed JSON.
 */
export function exportAuditTrailToJson(
  events: readonly AgentAuditEvent[],
): string {
  return JSON.stringify(events, null, 2);
}

