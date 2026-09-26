import {
  memo,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import type {
  AgentActivity,
  ContextCompactionMark,
  UiMessage,
} from "@pi-desktop/shared";
import { formatCompactTokenCount } from "@pi-desktop/shared";
import {
  assistantTurnContent,
  assistantTurnMessages,
  assistantTurnResponseDuration,
  assistantTurnResponseOutputTokens,
  assistantTurnUsage,
  reuseReadonlyMap,
  subagentRunsEqual,
  type AssistantTurnEntry,
  type AssistantTurnPart,
  type TranscriptEntry,
} from "../../../lib/assistant-turns";
import {
  collectDelegationStatuses,
  collectDelegationTimings,
} from "../../../lib/subagent-topology";
import {
  isLastActivityPart,
  projectTurnProcess,
  resolveThinkingDisplayMode,
  shouldGroupTurnProcess,
} from "../../../lib/turn-process";
import { useAppStore } from "../../../stores/app-store";
import { Markdown } from "../../../components/Markdown";
import { IconBranch, IconReview } from "../../../components/icons";
import { TooltipButton } from "../../../components/ui";
import {
  AssistantErrorMessage,
  CopyButton,
  MessageMeta,
  MessageTimestamp,
} from "./shared";
import { activityItemsEqual, ActivityGroup } from "./ActivityGroup";
import { GeneratedImages } from "./GeneratedImages";
import { MessageRow } from "./MessageRow";
import { assistantTurnMenuItems } from "./menu-items";
import {
  useChatTextActions,
  useTranscriptMenu,
} from "./TranscriptMenu";
import { useSmoothText } from "../../../hooks/useSmoothText";
import { TurnProcess } from "./TurnProcess";
import { TurnReviewChangesBar } from "./TurnReviewChangesBar";
import { ImplementationPlanCard } from "./ImplementationPlanCard";
import { SubagentSquadCard, type SquadMemberTask } from "./SubagentSquadCard";
import {
  reviewChangesFromMessages,
  summarizeReviewChanges,

} from "../../../lib/workspace-review";

type AssistantTurnProps = {
  entry: AssistantTurnEntry;
  isActive: boolean;
  runtimeActivity?: AgentActivity;
};

function assistantTurnPropsEqual(
  previous: AssistantTurnProps,
  next: AssistantTurnProps,
) {
  if (
    previous.isActive !== next.isActive ||
    previous.runtimeActivity !== next.runtimeActivity ||
    previous.entry.anchorId !== next.entry.anchorId ||
    previous.entry.parts.length !== next.entry.parts.length
  ) {
    return false;
  }
  return previous.entry.parts.every((part, index) => {
    const nextPart = next.entry.parts[index];
    if (part.kind !== nextPart.kind) return false;
    if (part.kind === "message" && nextPart.kind === "message") {
      return part.message === nextPart.message;
    }
    if (part.kind === "activity" && nextPart.kind === "activity") {
      return (
        part.endedAt === nextPart.endedAt &&
        part.items.length === nextPart.items.length &&
        part.items.every((item, itemIndex) =>
          activityItemsEqual(item, nextPart.items[itemIndex]),
        )
      );
    }
    return false;
  });
}

export function compactionMarksEqual(
  previous: ContextCompactionMark,
  next: ContextCompactionMark,
): boolean {
  return (
    previous.id === next.id &&
    previous.throughMessageId === next.throughMessageId &&
    previous.generation === next.generation &&
    previous.summaryTokens === next.summaryTokens &&
    previous.summarized === next.summarized &&
    previous.fallback === next.fallback
  );
}

/** Compare the data that can change a transcript row's rendered output. */
export function transcriptEntryEqual(
  previous: TranscriptEntry,
  next: TranscriptEntry,
): boolean {
  if (previous === next) return true;
  if (previous.kind !== next.kind) return false;
  if (previous.kind === "message" && next.kind === "message") {
    return previous.message === next.message;
  }
  if (previous.kind === "compaction" && next.kind === "compaction") {
    return compactionMarksEqual(previous.mark, next.mark);
  }
  if (previous.kind === "assistant-turn" && next.kind === "assistant-turn") {
    return assistantTurnPropsEqual(
      { entry: previous, isActive: false },
      { entry: next, isActive: false },
    );
  }
  return false;
}

export function TranscriptEntryView({
  entry,
  isRunning,
  isActive,
  runtimeActivity,
}: {
  entry: TranscriptEntry;
  isRunning: boolean;
  isActive: boolean;
  runtimeActivity?: AgentActivity;
}) {
  if (entry.kind === "assistant-turn") {
    return (
      <AssistantTurn
        entry={entry}
        isActive={isActive}
        runtimeActivity={runtimeActivity}
      />
    );
  }
  if (entry.kind === "compaction") {
    return <CompactionRow mark={entry.mark} />;
  }
  return <MessageRow message={entry.message} isRunning={isRunning} />;
}

function transcriptEntryKey(entry: TranscriptEntry): string {
  if (entry.kind === "compaction") return entry.mark.id;
  if (entry.kind === "assistant-turn") return entry.id;
  return entry.message.id;
}

type TranscriptHistoryProps = {
  entries: TranscriptEntry[];
  isRunning: boolean;
};

/**
 * Keep the completed transcript out of the streaming reconciliation path.
 * The projection is still rebuilt for correctness, but React can now bail out
 * before walking every historical row when only the active tail changed.
 */
export const TranscriptHistory = memo(function TranscriptHistory({
  entries,
  isRunning,
}: TranscriptHistoryProps) {
  return (
    <>
      {entries.map((entry) => (
        <TranscriptEntryView
          key={transcriptEntryKey(entry)}
          entry={entry}
          isRunning={isRunning}
          isActive={false}
        />
      ))}
    </>
  );
}, (previous, next) => {
  if (
    previous.isRunning !== next.isRunning ||
    previous.entries.length !== next.entries.length
  ) {
    return false;
  }
  return previous.entries.every((entry, index) =>
    transcriptEntryEqual(entry, next.entries[index]),
  );
});

export const TranscriptTail = memo(function TranscriptTail({
  entry,
  isRunning,
  isActive,
  runtimeActivity,
}: {
  entry: TranscriptEntry;
  isRunning: boolean;
  isActive: boolean;
  runtimeActivity?: AgentActivity;
}) {
  return (
    <TranscriptEntryView
      entry={entry}
      isRunning={isRunning}
      isActive={isActive}
      runtimeActivity={runtimeActivity}
    />
  );
}, (previous, next) =>
  previous.isRunning === next.isRunning &&
  previous.isActive === next.isActive &&
  previous.runtimeActivity === next.runtimeActivity &&
  transcriptEntryEqual(previous.entry, next.entry)
);

/** Message bubble that optionally applies smooth text release. */
const SmoothMessageBubble = memo(function SmoothMessageBubble({
  message,
  streaming,
}: {
  message: UiMessage;
  streaming: boolean;
}) {
  const smoothStreaming = useAppStore(
    (s) => s.settings?.smoothStreaming !== false,
  );
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const enabled = smoothStreaming && !prefersReducedMotion;
  const displayContent = useSmoothText(
    message.content || "",
    streaming,
    enabled,
  );
  const showCursor = streaming && enabled && (displayContent.length < (message.content || "").length);

  return (
    <div
      className={`message-bubble assistant-turn-fragment${
        streaming ? " streaming" : ""
      }${showCursor ? " smooth-cursor" : ""}`}
      data-message-id={message.id}
    >
      {displayContent ? (
        <div className="prose-chat">
          <Markdown source={displayContent} />
        </div>
      ) : null}
      {message.error ? (
        <AssistantErrorMessage message={message} />
      ) : null}
    </div>
  );
});

export const AssistantTurn = memo(function AssistantTurn({
  entry,
  isActive,
  runtimeActivity,
}: AssistantTurnProps) {
  const { t } = useTranslation();
  const openTranscriptMenu = useTranscriptMenu();
  const { copyText, selectText } = useChatTextActions();
  const retryAssistantMessage = useAppStore((s) => s.retryAssistantMessage);
  const forkAssistantMessage = useAppStore((s) => s.forkAssistantMessage);
  const messages = assistantTurnMessages(entry);
  const content = assistantTurnContent(entry);
  const actionMessage = [...messages]
    .reverse()
    .find((message) => (message.content || "").trim());
  const metaMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message.modelId ||
        message.usage ||
        message.responseDurationMs ||
        message.responseOutputTokens,
    );
  const latestUsageMessage = [...messages]
    .reverse()
    .find((message) => message.usage);
  const usage = assistantTurnUsage(entry);
  const responseDurationMs = assistantTurnResponseDuration(entry);
  const responseOutputTokens = assistantTurnResponseOutputTokens(entry);
  const modelId = metaMessage?.modelId ?? latestUsageMessage?.modelId;
  const hasError = messages.some((message) => Boolean(message.error));
  const complete =
    !isActive && !hasError && Boolean(content) && Boolean(actionMessage);
  const streaming =
    isActive && messages.some((message) => message.status === "streaming");
  /*
    The turn owns the menu for its whole subtree, the answer rows it renders
    included: Regenerate and Branch act on the turn's answer message, so a menu
    owned by a single message part could not offer them honestly.
  */
  const onContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    openTranscriptMenu(event, {
      label: t("chat.messageMenu"),
      items: assistantTurnMenuItems({
        t,
        answer: content,
        selectTarget:
          [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              ".message-bubble",
            ),
          ].at(-1) ?? null,
        complete: complete && Boolean(actionMessage),
        actions: { copyText, selectText },
        onRegenerate: () => {
          if (actionMessage) void retryAssistantMessage(actionMessage.id);
        },
        onBranch: () => {
          if (actionMessage) void forkAssistantMessage(actionMessage.id);
        },
      }),
    });
  };

  // Collect delegation statuses across ALL activity parts of this turn so that
  // a TaskWait in one part can inform the Task cards in a different part.
  const turnAllActivityItems = useMemo(
    () =>
      entry.parts.flatMap((part) =>
        part.kind === "activity" ? part.items : [],
      ),
    [entry.parts],
  );
  const rawDelegationStatuses = useMemo(
    () =>
      collectDelegationStatuses(turnAllActivityItems, { turnLive: isActive }),
    [turnAllActivityItems, isActive],
  );
  const rawDelegationTimings = useMemo(
    () => collectDelegationTimings(turnAllActivityItems),
    [turnAllActivityItems],
  );
  const statusesRef = useRef(rawDelegationStatuses);
  const timingsRef = useRef(rawDelegationTimings);
  const turnDelegationStatuses = reuseReadonlyMap(
    statusesRef.current,
    rawDelegationStatuses,
  );
  const turnDelegationTimings = reuseReadonlyMap(
    timingsRef.current,
    rawDelegationTimings,
    (left, right) =>
      left.startedAt === right.startedAt && left.completedAt === right.completedAt,
  );
  statusesRef.current = turnDelegationStatuses;
  timingsRef.current = turnDelegationTimings;

  const turnReviewChanges = useMemo(() => {
    const toolMessages: UiMessage[] = [];
    for (const item of turnAllActivityItems) {
      if (item.kind === "tool") {
        toolMessages.push(item.message);
        if (item.delegate) {
          for (const subItem of item.delegate.items) {
            if (subItem.kind === "tool") {
              toolMessages.push(subItem.message);
            }
          }
        }
      }
    }
    return reviewChangesFromMessages(toolMessages);
  }, [turnAllActivityItems]);

  const turnReviewSummary = useMemo(
    () => summarizeReviewChanges(turnReviewChanges),
    [turnReviewChanges],
  );

  const groupProcess = useAppStore((state) =>
    shouldGroupTurnProcess(
      resolveThinkingDisplayMode(state.settings?.thinkingDisplayMode),
    ),
  );
  const activeSessionId = useAppStore((state) => state.activeSessionId);
  const pendingPlan = useAppStore((state) =>
    activeSessionId ? state.pendingPlans[activeSessionId] : undefined,
  );
  const planCheckpoint = useAppStore((state) =>
    activeSessionId ? state.planCheckpoints[activeSessionId] : undefined,
  );

  const turnPlan = useMemo(() => {
    // 1. Check if there's a SubmitPlan / SubmitGoal tool call in this turn
    for (const item of turnAllActivityItems) {
      if (
        item.kind === "tool" &&
        (item.message.toolName === "SubmitPlan" ||
          item.message.toolName === "SubmitGoal")
      ) {
        const args = (item.message.toolArgs || {}) as Record<string, any>;
        const title = args.title || "Implementation Plan";
        const markdown = args.markdown || "";
        const question = args.question || "";
        const summary =
          args.summary ||
          question ||
          markdown
            .split("\n\n")
            .find((p: string) => p.trim() && !p.trim().startsWith("#"))
            ?.replace(/[#*`_]/g, "")
            .trim() ||
          "";

        const proposal =
          pendingPlan?.toolCallId === item.message.toolCallId ||
          pendingPlan?.turnId === entry.id
            ? pendingPlan
            : planCheckpoint?.toolCallId === item.message.toolCallId ||
                planCheckpoint?.turnId === entry.id
              ? planCheckpoint
              : undefined;

        return {
          title,
          summary,
          markdown,
          artifactPath: proposal?.artifact?.relativePath,
          status: proposal?.status ?? "pending",
          proposalId: proposal?.id,
          sessionId: proposal?.sessionId || activeSessionId || "",
          turnId: entry.id,
          toolCallId: item.message.toolCallId || item.message.id,
          version: proposal?.version,
        };
      }
    }

    // 2. Check if the active pendingPlan or planCheckpoint belongs to this turn
    const proposal =
      pendingPlan?.turnId === entry.id
        ? pendingPlan
        : planCheckpoint?.turnId === entry.id
          ? planCheckpoint
          : undefined;

    if (proposal) {
      const summary =
        proposal.question ||
        proposal.markdown
          .split("\n\n")
          .find((p) => p.trim() && !p.trim().startsWith("#"))
          ?.replace(/[#*`_]/g, "")
          .trim() ||
        "";
      return {
        title: proposal.title || "Implementation Plan",
        summary,
        markdown: proposal.markdown,
        artifactPath: proposal.artifact?.relativePath,
        status: proposal.status,
        proposalId: proposal.id,
        sessionId: proposal.sessionId,
        turnId: proposal.turnId,
        toolCallId: proposal.toolCallId,
        version: proposal.version,
      };
    }

    // 3. Check for write_to_file or edit tool creating an implementation_plan or plan.md
    for (const item of turnAllActivityItems) {
      if (item.kind === "tool") {
        const args = (item.message.toolArgs || {}) as Record<string, any>;
        const filePath =
          args.TargetFile || args.path || args.filePath || args.targetFile || "";
        if (
          typeof filePath === "string" &&
          (filePath.endsWith("implementation_plan.md") ||
            filePath.endsWith("plan.md") ||
            filePath.includes("/.pi/plan/"))
        ) {
          const content = args.CodeContent || args.content || "";
          const firstHeading =
            content.match(/^#+\s+(.+)$/m)?.[1]?.trim() || "Implementation Plan";
          const summary =
            content
              .split("\n\n")
              .find((p: string) => p.trim() && !p.trim().startsWith("#"))
              ?.replace(/[#*`_]/g, "")
              .trim() || "";

          return {
            title: firstHeading,
            summary,
            markdown: content,
            artifactPath: filePath,
            status: "approved" as const,
            sessionId: activeSessionId || "",
            turnId: entry.id,
            toolCallId: item.message.toolCallId || item.message.id,
          };
        }
      }
    }

    return null;
  }, [turnAllActivityItems, pendingPlan, planCheckpoint, activeSessionId, entry.id]);

  // Group multiple parallel/sequential task delegations by subagent role (e.g. Fixer Squad, Explorer Squad)
  const turnSquadGroups = useMemo(() => {
    const roleGroups = new Map<string, SquadMemberTask[]>();
    for (const item of turnAllActivityItems) {
      if (item.kind === "tool" && item.message.toolName?.toLowerCase() === "task") {
        const args = (item.message.toolArgs || {}) as Record<string, any>;
        const agentRaw = String(args.agent || args.subagent || "fixer").trim();
        const roleKey = agentRaw.charAt(0).toUpperCase() + agentRaw.slice(1).toLowerCase();
        const promptText = String(args.prompt || args.task || args.instruction || "").trim();
        const status = item.message.toolStatus === "error"
          ? "failed"
          : item.message.toolStatus === "running"
            ? "running"
            : "completed";

        const currentTasks = roleGroups.get(roleKey) || [];
        currentTasks.push({
          id: item.message.toolCallId || item.message.id,
          role: agentRaw,
          label: `${roleKey} ${currentTasks.length + 1}`,
          taskDescription: promptText.split("\n")[0] || "Menjalankan sub-tugas implementasi",
          status,
        });
        roleGroups.set(roleKey, currentTasks);
      }
    }
    return Array.from(roleGroups.entries()).map(([role, tasks]) => ({
      role,
      tasks,
      isLive: isActive && tasks.some((t) => t.status === "running"),
    }));
  }, [turnAllActivityItems, isActive]);

  const { process, responses } = projectTurnProcess(entry);
  const activePart = isActive ? entry.parts.at(-1) : undefined;


  const renderPart = (part: AssistantTurnPart) =>
    part.kind === "activity" ? (
      <ActivityGroup
        embedded
        key={`activity-${part.items[0].message.id}-${part.items[0].kind}${part.items[0].kind === "hostedSearch" ? `-${part.items[0].round.id}` : ""}`}
        items={part.items}
        endedAt={part.endedAt}
        isActive={part === activePart}
        isLast={isLastActivityPart(entry.parts, part)}
        runtimeActivity={part === activePart ? runtimeActivity : undefined}
        turnDelegationStatuses={turnDelegationStatuses}
        turnDelegationTimings={turnDelegationTimings}
      />
    ) : (
      <SmoothMessageBubble
        key={part.message.id}
        message={part.message}
        streaming={isActive && part.message.status === "streaming"}
      />
    );

  return (
    <div
      className={`message-row assistant assistant-turn${streaming ? " streaming" : ""}`}
      data-minimap-id={entry.anchorId}
      data-row-role="assistant"
      onContextMenu={onContextMenu}
      role="article"
      aria-label={t("chat.assistantMessage")}
    >
      <div className="message-col">
        {groupProcess ? (
          <>
            <TurnProcess turnId={entry.id} processParts={process} turnParts={entry.parts} isActive={isActive} delegationStatuses={turnDelegationStatuses}>
              {process.map(renderPart)}
            </TurnProcess>
            {responses.map(renderPart)}
          </>
        ) : (
          entry.parts.map(renderPart)
        )}
        {turnPlan && (
          <ImplementationPlanCard
            title={turnPlan.title}
            summary={turnPlan.summary}
            markdown={turnPlan.markdown}
            artifactPath={turnPlan.artifactPath}
            status={turnPlan.status}
            proposalId={turnPlan.proposalId}
            sessionId={turnPlan.sessionId}
            turnId={turnPlan.turnId}
            toolCallId={turnPlan.toolCallId}
            version={turnPlan.version}
          />
        )}
        {turnAllActivityItems.filter((item) => item.kind === "tool" && item.message.toolName === "GenerateImages").map((item) => (
          <GeneratedImages key={item.message.id} message={item.message} />
        ))}
        {turnSquadGroups.map((squad) => (
          <SubagentSquadCard
            key={squad.role}
            squadRole={squad.role}
            tasks={squad.tasks}
            isLive={squad.isLive}
          />
        ))}
        {turnReviewChanges.length > 0 && (

          <TurnReviewChangesBar
            entries={turnReviewChanges}
            summary={turnReviewSummary}
          />
        )}
        {!isActive && metaMessage ? (
          <MessageMeta
            modelId={modelId}
            usage={usage}
            responseDurationMs={responseDurationMs}
            responseOutputTokens={responseOutputTokens}
          />
        ) : null}
        {complete && actionMessage ? (
          <div className="message-actions">
            <MessageTimestamp createdAt={actionMessage.createdAt} />
            <CopyButton text={content} label={t("chat.copy")} />
            <TooltipButton
              className="copy-btn icon"
              tooltip={t("chat.forkResponse")}
              ariaLabel={t("chat.forkResponse")}
              onClick={() => void forkAssistantMessage(actionMessage.id)}
            >
              <IconBranch size={13} />
            </TooltipButton>
            <TooltipButton
              className="copy-btn icon"
              tooltip={t("chat.retry")}
              ariaLabel={t("chat.retry")}
              onClick={() => void retryAssistantMessage(actionMessage.id)}
            >
              <IconReview size={13} />
            </TooltipButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}, assistantTurnPropsEqual);

/**
 * The transcript trace of one compaction, matching Codex's `ContextCompaction`
 * turn item: a divider that says the earlier turns above it are now a summary.
 * It carries no actions — nothing about a persisted checkpoint is undoable.
 */
export function CompactionRow({ mark }: { mark: ContextCompactionMark & { summary?: string } }) {
  const { t } = useTranslation();
  return (
    <div className="transcript-compaction-row" role="separator">
      <span className="transcript-compaction-label">
        {t("chat.compactionRow", { times: mark.generation })}
      </span>
      <span className="transcript-compaction-detail" title={mark.summarized && !mark.fallback && mark.summary?.trim() ? mark.summary : undefined}>
        {mark.fallback
          ? t("chat.compactionRowSummaryFailed")
          : mark.summarized
            ? t("chat.compactionRowSummary", {
                tokens: formatCompactTokenCount(mark.summaryTokens),
              })
            : t("chat.compactionRowNoSummary")}
      </span>
    </div>
  );
}
