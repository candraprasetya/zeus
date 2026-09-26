import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Pixel Agents Office and View Office button adhere to repository contracts", async () => {
  const [pixelOfficeSrc, chatSurfaceSrc, sharedSrc, chatShellCss] = await Promise.all([
    read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
    read("../src/components/ChatSurface.tsx"),
    read("../src/features/chat/transcript/shared.tsx"),
    read("../src/styles/chat-shell.css"),
  ]);

  // 1. Verify 4 agents exist in PixelAgentsOffice
  assert.match(pixelOfficeSrc, /id:\s*"zeus"/);
  assert.match(pixelOfficeSrc, /id:\s*"hermes"/);
  assert.match(pixelOfficeSrc, /id:\s*"athena"/);
  assert.match(pixelOfficeSrc, /id:\s*"apollo"/);

  // 2. Verify walking & inquiring sub-agent behavior for Athena
  assert.match(pixelOfficeSrc, /athenaIsWalking/);
  assert.match(pixelOfficeSrc, /athenaBubble/);
  assert.match(pixelOfficeSrc, /hermesBubble/);
  assert.match(pixelOfficeSrc, /zeusBubble/);

  // 3. Verify modal export exists
  assert.match(pixelOfficeSrc, /export function PixelAgentsOfficeModal/);

  // 4. Verify ChatSurface has "View Office" button with live & idle indicator
  assert.match(chatSurfaceSrc, /zeus-view-office-btn/);
  assert.match(chatSurfaceSrc, /View Office/);
  assert.match(chatSurfaceSrc, /office-btn-idle/);
  assert.match(chatSurfaceSrc, /<PixelAgentsOfficeModal/);

  // 5. Verify AI AGENT TEAM hub and idle state support
  assert.match(pixelOfficeSrc, /AI AGENT TEAM/);
  assert.match(pixelOfficeSrc, /isWorking/);

  // 5. Verify Thinking transcript row integrates PixelAgentsOffice
  assert.match(sharedSrc, /<PixelAgentsOffice\s+streaming=\{streaming\}/);
  assert.match(sharedSrc, /Pixel Agents Office/);

  // 6. Verify CSS definitions and ensure no backdrop-filter or pixelated literals in css
  assert.match(chatShellCss, /\.zeus-view-office-btn/);
  assert.match(chatShellCss, /\.pixel-office-modal-backdrop/);
  assert.match(chatShellCss, /\.pixel-office-container/);
  assert.match(chatShellCss, /\.pixel-agent-card/);
  assert.match(chatShellCss, /\.pixel-action-log-panel/);
  assert.doesNotMatch(chatShellCss, /backdrop-filter:\s*blur/);
});

test("PixelAgentsOffice and ZeusSubagentTasksFloatingPanel use dynamic settings subagent data", async () => {
  const [pixelOfficeSrc, floatingPanelSrc, subagentsHookSrc, subagentsPageSrc] = await Promise.all([
    read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
    read("../src/components/ZeusSubagentTasksFloatingPanel.tsx"),
    read("../src/hooks/use-subagents-data.ts"),
    read("../src/components/settings/AgentSubagentsPage.tsx"),
  ]);

  // Hook exports useSubagentsData and handles zeus, presets & custom subagents
  assert.match(subagentsHookSrc, /export function useSubagentsData/);
  assert.match(subagentsHookSrc, /zeusSubagent/);
  assert.match(subagentsHookSrc, /Task\(fixer\)/);
  assert.match(subagentsHookSrc, /Task\(explorer\)/);
  assert.match(subagentsHookSrc, /Task\(test-runner\)/);

  // Both PixelAgentsOffice and floating panel consume useSubagentsData
  assert.match(pixelOfficeSrc, /useSubagentsData\(\)/);
  assert.match(floatingPanelSrc, /useSubagentsData\(\)/);

  // Role Zeus as Main System Coordinator
  assert.match(pixelOfficeSrc, /Main System Coordinator/);
  assert.match(floatingPanelSrc, /Main System Coordinator/);

  // Dynamic tag references
  assert.match(floatingPanelSrc, /fixerSubagent\.tag/);
  assert.match(floatingPanelSrc, /explorerSubagent\.tag/);
  assert.match(floatingPanelSrc, /testRunnerSubagent\.tag/);

  // Settings page provides Lead Orchestrator group and Zeus customization
  assert.match(subagentsPageSrc, /Lead Orchestrator/);
  assert.match(subagentsPageSrc, /⚡ Zeus \(Lead Agent\)/);
  assert.match(subagentsPageSrc, /Main Orchestrator/);
  assert.match(subagentsPageSrc, /openEditZeus/);

  // Settings page displays CrewAI & Buzz Multi-Agent Task Flow Pipelines
  assert.match(subagentsPageSrc, /Multi-Agent Task Flow Pipelines \(CrewAI & Buzz\)/);
  assert.match(subagentsPageSrc, /BUILTIN_TASK_FLOWS/);
  assert.match(subagentsPageSrc, /Steps Pipeline/);
});


test("Virtual Office renders walking subagent on permission request with interactive approval HUD and settings archetypes", async () => {
  const [pixelOfficeSrc, subagentsHookSrc, subagentEditorSrc, characterProfilesSrc, chatShellCss, floatingPanelSrc, taskFlowsSrc, assistantTurnSrc, squadCardSrc, messagesCss] = await Promise.all([
    read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
    read("../src/hooks/use-subagents-data.ts"),
    read("../src/components/settings/SubagentEditorSheet.tsx"),
    read("../src/components/settings/subagent-character-profiles.ts"),
    read("../src/styles/chat-shell.css"),
    read("../src/components/ZeusSubagentTasksFloatingPanel.tsx"),
    read("../../../packages/shared/src/task-flows.ts"),
    read("../src/features/chat/transcript/AssistantTurn.tsx"),
    read("../src/features/chat/transcript/SubagentSquadCard.tsx"),
    read("../src/styles/messages.css"),
  ]);

  // 1. Dynamic Office Subagents count matching Settings
  assert.match(subagentsHookSrc, /officeSubagents/);
  assert.match(pixelOfficeSrc, /officeSubagents\.map/);
  assert.match(pixelOfficeSrc, /officeSubagents\.length/);

  // 2. Character Archetypes definitions & picker in Settings
  assert.match(characterProfilesSrc, /CHARACTER_ARCHETYPES/);
  assert.match(characterProfilesSrc, /zeus/);
  assert.match(characterProfilesSrc, /athena/);
  assert.match(characterProfilesSrc, /hermes/);
  assert.match(characterProfilesSrc, /apollo/);
  assert.match(characterProfilesSrc, /hephaestus/);
  assert.match(characterProfilesSrc, /artemis/);
  assert.match(characterProfilesSrc, /iris/);
  assert.match(subagentEditorSrc, /ext-archetype-pick/);
  assert.match(subagentEditorSrc, /ext-archetype-chip/);
  assert.match(subagentEditorSrc, /CHARACTER_ARCHETYPES/);

  // 3. Permission Walking Animation & reporting sprite
  assert.match(pixelOfficeSrc, /isWaitingPermission/);
  assert.match(pixelOfficeSrc, /reportingWorker/);
  assert.match(pixelOfficeSrc, /isWorkerReporting/);
  assert.match(pixelOfficeSrc, /Zeus, butuh izin/);
  assert.match(pixelOfficeSrc, /BUTUH IZIN/);

  // 4. Interactive Permission HUD in Virtual Office with Allow Once, Session & Reject
  assert.match(pixelOfficeSrc, /pixel-office-permission-hud/);
  assert.match(pixelOfficeSrc, /handleResolvePermission/);
  assert.match(pixelOfficeSrc, /resolvePermission/);
  assert.match(pixelOfficeSrc, /"allow-once"/);
  assert.match(pixelOfficeSrc, /"allow-session"/);
  assert.match(pixelOfficeSrc, /"deny"/);

  // 5. CSS definitions for HUD and Archetypes
  assert.match(chatShellCss, /\.pixel-office-permission-hud/);
  assert.match(chatShellCss, /\.hud-target-row/);
  assert.match(chatShellCss, /\.hud-target-path/);
  assert.match(chatShellCss, /\.hud-btn-allow/);
  assert.match(chatShellCss, /\.hud-btn-session/);
  assert.match(chatShellCss, /\.hud-btn-deny/);
  assert.match(chatShellCss, /\.ext-archetype-pick/);
  assert.match(chatShellCss, /\.ext-archetype-chip/);

  // 6. Structured presentation with ToolDetailBlocks and prominent target
  assert.match(pixelOfficeSrc, /ToolDetailBlocks/);
  assert.match(pixelOfficeSrc, /permArgBlocks/);
  assert.match(pixelOfficeSrc, /hud-target-row/);
  assert.match(pixelOfficeSrc, /PERSETUJUAN DIPERLUKAN DI VIRTUAL OFFICE/);

  // 7. Per-agent activity log upon selecting an agent
  assert.match(pixelOfficeSrc, /handleSelectAgent/);
  assert.match(pixelOfficeSrc, /selectedAgentCalls/);
  assert.match(pixelOfficeSrc, /displayedLogItems/);
  assert.match(pixelOfficeSrc, /pixel-log-filter-tabs/);
  assert.match(chatShellCss, /\.pixel-log-filter-tabs/);
  assert.match(chatShellCss, /\.log-filter-btn/);
  assert.match(chatShellCss, /\.pixel-log-tool-tag/);

  // 8. Child helper mini chibi sprites ("anak buah") & squad indicators
  assert.match(pixelOfficeSrc, /renderMiniHelperSprite/);
  assert.match(pixelOfficeSrc, /mini-helper-sprite/);
  assert.match(pixelOfficeSrc, /SQUAD \+1/);
  assert.match(pixelOfficeSrc, /SUB-SQUAD \/ ANAK BUAH/);

  // 9. Parallel subagents delegation support & multi-instance indicators
  assert.match(pixelOfficeSrc, /activeDelegationsPerAgent/);
  assert.match(pixelOfficeSrc, /PARALLEL/);

  // 10. CrewAI Multi-Agent Pipeline & Buzz Audit Trail in Floating Panel
  assert.match(floatingPanelSrc, /subagent-panel-tabs/);
  assert.match(floatingPanelSrc, /Crew Pipeline/);
  assert.match(floatingPanelSrc, /Audit Trail/);
  assert.match(floatingPanelSrc, /Feature Delivery Pipeline/);
  assert.match(floatingPanelSrc, /Buzz Ledger/);
  assert.match(chatShellCss, /\.subagent-panel-tabs/);
  assert.match(chatShellCss, /\.subagent-pipeline-flow-banner/);
  assert.match(chatShellCss, /\.subagent-audit-time/);

  // 11. Virtual Office Studio View Modes (Studio Canvas, Crew Pipeline, Buzz War Room)
  assert.match(pixelOfficeSrc, /officeViewMode/);
  assert.match(pixelOfficeSrc, /pixel-office-pipeline-view/);
  assert.match(pixelOfficeSrc, /pixel-office-war-room-view/);
  assert.match(pixelOfficeSrc, /Block Buzz Collaborative War Room/);
  assert.match(chatShellCss, /\.pixel-office-pipeline-view/);
  assert.match(chatShellCss, /\.pixel-office-war-room-view/);
  assert.match(chatShellCss, /\.pipeline-steps-grid/);
  assert.match(chatShellCss, /\.war-room-timeline/);

  // 12. CrewAI Guardrails and Human-In-The-Loop Approval Gates
  assert.match(taskFlowsSrc, /GuardrailRule/);
  assert.match(taskFlowsSrc, /validateStepGuardrails/);
  assert.match(taskFlowsSrc, /requiresUserApproval/);

  // 13. Block Buzz Audit Trail Export (Markdown & JSON)
  assert.match(floatingPanelSrc, /subagent-audit-export-btn/);
  assert.match(floatingPanelSrc, /exportAuditTrailToMarkdown/);
  assert.match(pixelOfficeSrc, /war-room-export-btn/);
  assert.match(pixelOfficeSrc, /exportAuditTrailToMarkdown/);
  assert.match(taskFlowsSrc, /exportAuditTrailToMarkdown/);
  assert.match(taskFlowsSrc, /exportAuditTrailToJson/);

  // 14. Multi-Agent Squad / Parallel Subagent Delegation Card in Chat
  assert.match(assistantTurnSrc, /SubagentSquadCard/);
  assert.match(assistantTurnSrc, /turnSquadGroups/);
  assert.match(squadCardSrc, /subagent-squad-card/);
  assert.match(squadCardSrc, /squad-task-items/);
  assert.match(messagesCss, /\.subagent-squad-card/);
  assert.match(messagesCss, /\.squad-card-header/);
  assert.match(messagesCss, /\.squad-task-item/);

  // 15. Dock-to-Side Split View & PiP Layout Modes (Anti-Modal-Fatigue)
  assert.match(pixelOfficeSrc, /PixelOfficeDisplayMode/);
  assert.match(pixelOfficeSrc, /pixel-dock-mode-toggles/);
  assert.match(pixelOfficeSrc, /SEQUENTIAL TASK PIPELINE/);
  assert.match(chatShellCss, /\.pixel-office-modal-backdrop\.is-docked/);
  assert.match(chatShellCss, /\.pixel-office-modal-dialog\.is-docked/);
  assert.match(chatShellCss, /\.pixel-dock-mode-toggles/);
});





