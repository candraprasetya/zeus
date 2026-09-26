import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadStyles } from "./helpers/styles.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [
  turnReviewBarSource,
  stickyChatBarSource,
  implementationPlanCardSource,
  assistantTurnSource,
  chatTranscriptSource,
  styles,
] = await Promise.all([
  read("../src/features/chat/transcript/TurnReviewChangesBar.tsx"),
  read("../src/features/chat/transcript/StickyChatContextBar.tsx"),
  read("../src/features/chat/transcript/ImplementationPlanCard.tsx"),
  read("../src/features/chat/transcript/AssistantTurn.tsx"),
  read("../src/features/chat/transcript/ChatTranscript.tsx"),
  loadStyles(),
]);

test("TurnReviewChangesBar displays files changed and toggles review diffs", () => {
  // Test bar markup and attributes
  assert.match(turnReviewBarSource, /data-testid="turn-review-bar"/);
  assert.match(turnReviewBarSource, /filesLabel/);
  assert.match(turnReviewBarSource, /diff-count-add/);
  assert.match(turnReviewBarSource, /diff-count-del/);
  assert.match(turnReviewBarSource, /turn-review-action-btn/);
  assert.match(turnReviewBarSource, /<ReviewChangeCard/);
  assert.match(turnReviewBarSource, /openWorkPanelTab/);

  // Test integration into AssistantTurn
  assert.match(assistantTurnSource, /<TurnReviewChangesBar/);
  assert.match(assistantTurnSource, /turnReviewChanges\.length > 0/);
  assert.match(assistantTurnSource, /summarizeReviewChanges\(turnReviewChanges\)/);
});

test("StickyChatContextBar supports multi-chat tracking and pager navigation", () => {
  // Test sticky bar structure
  assert.match(stickyChatBarSource, /data-testid="chat-sticky-context"/);
  assert.match(stickyChatBarSource, /data-active-index=/);
  assert.match(stickyChatBarSource, /data-total-chats=/);
  assert.match(stickyChatBarSource, /chat-sticky-context-thumb/);
  assert.match(stickyChatBarSource, /chat-sticky-context-badge/);
  assert.match(stickyChatBarSource, /chat-sticky-context-text/);

  // Multi-chat navigation pager
  assert.match(stickyChatBarSource, /data-testid="chat-sticky-pager"/);
  assert.match(stickyChatBarSource, /data-testid="chat-sticky-prev"/);
  assert.match(stickyChatBarSource, /data-testid="chat-sticky-next"/);
  assert.match(stickyChatBarSource, /data-testid="chat-sticky-pager-count"/);
  assert.match(stickyChatBarSource, /handleJumpToIndex/);
  assert.match(stickyChatBarSource, /activeIndex \+ 1\} \/ \{userMessages\.length/);

  // Test mounting in ChatTranscript
  assert.match(chatTranscriptSource, /<StickyChatContextBar/);
  assert.match(chatTranscriptSource, /scrollRef=\{scrollRef\}/);
});

test("ImplementationPlanCard renders Antigravity summary, View modal, and Proceed banner", () => {
  // Card elements
  assert.match(implementationPlanCardSource, /data-testid="implementation-plan-card"/);
  assert.match(implementationPlanCardSource, /data-testid="plan-card-view-btn"/);
  assert.match(implementationPlanCardSource, /data-testid="plan-card-proceed-btn"/);
  assert.match(implementationPlanCardSource, /implementation-plan-title/);
  assert.match(implementationPlanCardSource, /implementation-plan-summary/);

  // Proceed confirmation banner
  assert.match(implementationPlanCardSource, /data-testid="implementation-plan-proceeded"/);
  assert.match(implementationPlanCardSource, /Proceeded with/);
  assert.match(implementationPlanCardSource, /handleProceed/);
  assert.match(implementationPlanCardSource, /resolvePlan/);

  // View modal with markdown
  assert.match(implementationPlanCardSource, /data-testid="plan-artifact-modal-backdrop"/);
  assert.match(implementationPlanCardSource, /<Markdown source=/);
  assert.match(implementationPlanCardSource, /portalOverlay/);

  // Integration into AssistantTurn
  assert.match(assistantTurnSource, /<ImplementationPlanCard/);
  assert.match(assistantTurnSource, /turnPlan/);
  assert.match(assistantTurnSource, /SubmitPlan/);
});

test("Styles support Antigravity review bar, sticky multi-chat context, and plan card/banner", () => {
  // Review changes bar styles
  assert.match(styles, /\.turn-review-bar-container/);
  assert.match(styles, /\.turn-review-bar/);
  assert.match(styles, /\.turn-review-action-btn/);
  assert.match(styles, /\.turn-review-details/);

  // Sticky chat & pager styles
  assert.match(styles, /\.chat-sticky-context-bar/);
  assert.match(styles, /\.chat-sticky-context-bar\.is-visible/);
  assert.match(styles, /\.chat-sticky-context-thumb/);
  assert.match(styles, /\.chat-sticky-context-badge/);
  assert.match(styles, /\.chat-sticky-context-text/);
  assert.match(styles, /\.chat-sticky-pager/);
  assert.match(styles, /\.chat-sticky-pager-btn/);
  assert.match(styles, /\.chat-sticky-pager-count/);

  // Implementation plan card & banner styles
  assert.match(styles, /\.implementation-plan-card/);
  assert.match(styles, /\.implementation-plan-title/);
  assert.match(styles, /\.implementation-plan-summary/);
  assert.match(styles, /\.implementation-plan-actions/);
  assert.match(styles, /\.implementation-plan-proceeded-banner/);
  assert.match(styles, /\.implementation-plan-proceeded-label/);
  assert.match(styles, /\.plan-artifact-modal/);
  assert.match(styles, /\.plan-artifact-modal-backdrop/);
});
