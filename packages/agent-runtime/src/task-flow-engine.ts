/**
 * Orchestrator for Task Flows (CrewAI style multi-agent pipelines with shared memory
 * and Block Buzz event audit logging).
 * Runs steps sequentially or via dependencies, injecting shared scratchpad context.
 */

import {
  formatFlowStepPrompt,
  validateStepGuardrails,
  type AgentAuditEvent,
  type AgentAuditEventKind,
  type TaskFlowContext,
  type TaskFlowDefinition,
  type TaskFlowStep,
  type TaskFlowStepResult,
} from "@pi-desktop/shared";

export type StepExecutor = (
  step: TaskFlowStep,
  renderedPrompt: string,
  context: Readonly<TaskFlowContext>,
) => Promise<{ output: string; error?: string }>;

export type ApprovalHandler = (
  step: TaskFlowStep,
  renderedPrompt: string,
) => Promise<boolean>;

export type FlowExecutionOptions = {
  onApprovalRequest?: ApprovalHandler;
  onEvent?: (event: AgentAuditEvent) => void;
  initialScratchpad?: Record<string, string>;
};

export class TaskFlowEngine {
  constructor(private readonly flow: TaskFlowDefinition) {}

  /**
   * Run the entire flow pipeline, managing dependencies, user approvals,
   * guardrails validation, Block Buzz audit event logging, and populating
   * the shared scratchpad context.
   */
  async execute(
    goal: string,
    executeStep: StepExecutor,
    optionsOrApproval?: ApprovalHandler | FlowExecutionOptions,
  ): Promise<TaskFlowContext> {
    const options: FlowExecutionOptions =
      typeof optionsOrApproval === "function"
        ? { onApprovalRequest: optionsOrApproval }
        : optionsOrApproval || {};

    const emitEvent = (
      kind: AgentAuditEventKind,
      agentRole: string,
      summary: string,
      stepId?: string,
      payload?: Record<string, unknown>,
    ) => {
      if (options.onEvent) {
        options.onEvent({
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          flowId: this.flow.id,
          stepId,
          agentRole,
          kind,
          summary,
          payload,
          timestamp: new Date().toISOString(),
        });
      }
    };

    const context: TaskFlowContext = {
      flowId: this.flow.id,
      goal,
      scratchpad: { ...(options.initialScratchpad || {}) },
      stepResults: {},
    };

    emitEvent(
      "flow_started",
      "zeus",
      `Flow '${this.flow.name}' started for goal: ${goal}`,
      undefined,
      { goal, totalSteps: this.flow.steps.length },
    );

    let allCompleted = true;

    for (const step of this.flow.steps) {
      // Check dependencies
      if (step.dependsOn && step.dependsOn.length > 0) {
        const unmet = step.dependsOn.filter(
          (depId) => context.stepResults[depId]?.status !== "completed",
        );
        if (unmet.length > 0) {
          const errMsg = `Unmet dependencies: ${unmet.join(", ")}`;
          context.stepResults[step.id] = {
            stepId: step.id,
            agentRole: step.agentRole,
            status: "failed",
            error: errMsg,
            completedAt: new Date().toISOString(),
          };
          emitEvent("step_failed", step.agentRole, errMsg, step.id);
          allCompleted = false;
          break;
        }
      }

      emitEvent(
        "agent_assigned",
        step.agentRole,
        `Assigned step '${step.title}' to ${step.agentRole}`,
        step.id,
      );

      const startedAt = new Date().toISOString();
      const renderedPrompt = formatFlowStepPrompt(step.instruction, context);

      emitEvent(
        "step_started",
        step.agentRole,
        `Step '${step.title}' started by ${step.agentRole}`,
        step.id,
      );

      // Check if user approval is required before execution (CrewAI Human-in-the-loop)
      if (step.requiresUserApproval && options.onApprovalRequest) {
        const isApproved = await options.onApprovalRequest(step, renderedPrompt);
        if (!isApproved) {
          const rejectMsg = `Step '${step.title}' was rejected by user.`;
          context.stepResults[step.id] = {
            stepId: step.id,
            agentRole: step.agentRole,
            status: "failed",
            error: rejectMsg,
            startedAt,
            completedAt: new Date().toISOString(),
          };
          emitEvent("step_failed", step.agentRole, rejectMsg, step.id);
          allCompleted = false;
          break;
        }
      }

      try {
        const executionResult = await executeStep(step, renderedPrompt, context);

        if (executionResult.error) {
          context.stepResults[step.id] = {
            stepId: step.id,
            agentRole: step.agentRole,
            status: "failed",
            error: executionResult.error,
            startedAt,
            completedAt: new Date().toISOString(),
          };
          emitEvent(
            "step_failed",
            step.agentRole,
            `Step '${step.title}' failed: ${executionResult.error}`,
            step.id,
          );
          allCompleted = false;

          // Mark remaining dependent steps
          for (const remaining of this.flow.steps) {
            if (remaining.id !== step.id && !context.stepResults[remaining.id]) {
              if (remaining.dependsOn?.includes(step.id)) {
                context.stepResults[remaining.id] = {
                  stepId: remaining.id,
                  agentRole: remaining.agentRole,
                  status: "failed",
                  error: `Unmet dependencies: ${step.id}`,
                  completedAt: new Date().toISOString(),
                };
              }
            }
          }
          break;
        }

        // Validate output using Guardrails
        const guardrailCheck = validateStepGuardrails(
          executionResult.output,
          step.guardrails,
        );
        if (!guardrailCheck.isValid) {
          const guardrailError = `Guardrail violation: ${guardrailCheck.error}`;
          context.stepResults[step.id] = {
            stepId: step.id,
            agentRole: step.agentRole,
            status: "failed",
            error: guardrailError,
            startedAt,
            completedAt: new Date().toISOString(),
          };
          emitEvent("step_failed", step.agentRole, guardrailError, step.id);
          allCompleted = false;
          break;
        }

        const result: TaskFlowStepResult = {
          stepId: step.id,
          agentRole: step.agentRole,
          status: "completed",
          output: executionResult.output,
          startedAt,
          completedAt: new Date().toISOString(),
        };

        context.stepResults[step.id] = result;
        // Share output in scratchpad for subsequent agents (CrewAI Shared Memory)
        context.scratchpad[step.id] = executionResult.output;

        emitEvent(
          "step_completed",
          step.agentRole,
          `Step '${step.title}' completed successfully`,
          step.id,
          { outputPreview: executionResult.output.slice(0, 120) },
        );

        emitEvent(
          "handoff",
          step.agentRole,
          `Context handoff: '${step.id}' output stored into shared scratchpad`,
          step.id,
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        context.stepResults[step.id] = {
          stepId: step.id,
          agentRole: step.agentRole,
          status: "failed",
          error: errorMsg,
          startedAt,
          completedAt: new Date().toISOString(),
        };
        emitEvent("step_failed", step.agentRole, `Error: ${errorMsg}`, step.id);
        allCompleted = false;
        break;
      }
    }

    if (allCompleted) {
      emitEvent(
        "flow_completed",
        "zeus",
        `Workflow flow '${this.flow.name}' completed all steps`,
        undefined,
        { completedSteps: Object.keys(context.stepResults).length },
      );
    }

    return context;
  }
}
