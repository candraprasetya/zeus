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

  // 1. The lead desk is fixed; the floor itself is the configured squad, so a
  // member the user switches off in Settings stops advertising a desk.
  assert.match(pixelOfficeSrc, /id:\s*"zeus"/);
  assert.match(pixelOfficeSrc, /useZeusSquad\(\)/);
  assert.match(pixelOfficeSrc, /squadWorkers/);
  assert.doesNotMatch(pixelOfficeSrc, /const AGENTS: AgentMember\[\]/);

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
  const [pixelOfficeSrc, floatingPanelSrc, subagentsHookSrc, subagentsPageSrc, subagentSettingsSrc] =
    await Promise.all([
      read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
      read("../src/components/ZeusSubagentTasksFloatingPanel.tsx"),
      read("../src/hooks/use-subagents-data.ts"),
      read("../src/components/settings/AgentSubagentsPage.tsx"),
      read("../src/components/settings/subagent-settings.ts"),
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

  // A switch flipped in Settings reaches the mounted office without a reload:
  // the page notifies, the hook refetches the catalog it read once on mount.
  assert.match(subagentSettingsSrc, /export const SUBAGENT_CHANGE_EVENT/);
  assert.match(subagentSettingsSrc, /export function notifySubagentsChanged/);
  assert.match(subagentsHookSrc, /SUBAGENT_CHANGE_EVENT, load/);
  assert.match(subagentsPageSrc, /notifySubagentsChanged\(\)/);

  // Settings page provides Lead Orchestrator group and Zeus customization
  assert.match(subagentsPageSrc, /Lead Orchestrator/);
  assert.match(subagentsPageSrc, /⚡ Zeus \(Lead Agent\)/);
  assert.match(subagentsPageSrc, /Main Orchestrator/);
  assert.match(subagentsPageSrc, /openEditZeus/);

  // Settings displays the squad workspace (teams, members, pipelines)
  // instead of a static CrewAI pipeline group.
  assert.match(subagentsPageSrc, /settings\.zeusSquad\.teams/);
  assert.match(subagentsPageSrc, /settings\.zeusSquad\.pipelines/);
  assert.match(subagentsPageSrc, /useSquadWorkspace\(\)/);
  assert.doesNotMatch(subagentsPageSrc, /BUILTIN_TASK_FLOWS/);
  assert.doesNotMatch(subagentsPageSrc, /Steps Pipeline/);
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

  // 1. Desks come from the configured squad; runtime subagents still map live
  // activity and permission prompts onto those desks. The floor draws one
  // responsive floor of at most sixteen members instead of paging wings.
  assert.match(subagentsHookSrc, /officeSubagents/);
  assert.match(pixelOfficeSrc, /officeSubagents\.find/);
  assert.match(pixelOfficeSrc, /squad\.filter\(\(member\) => member\.enabled\)/);
  assert.match(pixelOfficeSrc, /MAX_OFFICE_AGENTS = 16/);
  assert.match(pixelOfficeSrc, /layoutDeskSlots/);
  assert.doesNotMatch(pixelOfficeSrc, /WING_CAPACITY/);

  // 2. Character Archetypes definitions & picker in Settings
  assert.match(characterProfilesSrc, /CHARACTER_ARCHETYPES/);
  assert.match(characterProfilesSrc, /zeus/);
  assert.match(characterProfilesSrc, /athena/);
  assert.match(characterProfilesSrc, /hermes/);
  assert.match(characterProfilesSrc, /apollo/);
  assert.match(characterProfilesSrc, /hephaestus/);
  assert.match(characterProfilesSrc, /artemis/);
  assert.match(characterProfilesSrc, /iris/);
  // The extra styles the sheet offers, each drawn with its own outfit.
  for (const archetype of ["poseidon", "hera", "helios", "metis"]) {
    assert.match(characterProfilesSrc, new RegExp(`"${archetype}"`));
    assert.match(pixelOfficeSrc, new RegExp(`archetype === "${archetype}"`));
  }
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
  // The pipeline view draws the squad store's active pipeline (falling back
  // to one stage per enabled member), never a hardcoded feature-delivery flow.
  assert.match(pixelOfficeSrc, /useSquadWorkspace\(\)/);
  assert.match(pixelOfficeSrc, /pipelineStages/);
  assert.match(pixelOfficeSrc, /resolveSquadCharacter\(member\)/);
  assert.doesNotMatch(pixelOfficeSrc, /Codebase Survey & Reconnaissance/);
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
  assert.match(chatShellCss, /\.pixel-office-modal-backdrop\.is-docked/);
  assert.match(chatShellCss, /\.pixel-office-modal-dialog\.is-docked/);
  assert.match(chatShellCss, /\.pixel-dock-mode-toggles/);
});

test("Dynamic Grok-style project workspace seamlessly integrates Team Roster Bar, Mindmap, Pipeline, and Live Office without pop-up modals", async () => {
  const [chatSurfaceSrc, sidebarSrc, workspaceStoreSrc, teamRosterSrc, mindmapSrc, chatShellCss, pixelOfficeSrc] = await Promise.all([
    read("../src/components/ChatSurface.tsx"),
    read("../src/components/Sidebar.tsx"),
    read("../src/stores/workspace-view-store.ts"),
    read("../src/features/chat/transcript/TeamRosterBar.tsx"),
    read("../src/components/workpanel/MindmapTab.tsx"),
    read("../src/styles/chat-shell.css"),
    read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
  ]);

  // 1. Workspace View Store contract
  assert.match(workspaceStoreSrc, /useWorkspaceViewStore/);
  assert.match(workspaceStoreSrc, /WorkspaceViewMode = "chat" \| "office" \| "mindmap" \| "pipeline"/);
  assert.match(workspaceStoreSrc, /activeView:\s*WorkspaceViewMode/);
  assert.match(workspaceStoreSrc, /selectedAgentId/);
  assert.match(workspaceStoreSrc, /setActiveView/);

  // 2. Dynamic Main Panel rendering inside ChatSurface (MindmapTab replaces static ProjectMindmapView)
  assert.match(chatSurfaceSrc, /TeamRosterBar/);
  assert.match(chatSurfaceSrc, /activeWorkspaceView/);
  assert.match(chatSurfaceSrc, /dynamic-workspace-canvas/);
  assert.match(chatSurfaceSrc, /MindmapTab/);
  assert.match(chatSurfaceSrc, /PixelAgentsOffice/);

  // 3. Sidebar workspace view navigation
  assert.match(sidebarSrc, /sidebar-workspace-views-nav/);
  assert.match(sidebarSrc, /activeWorkspaceView/);
  assert.match(sidebarSrc, /setWorkspaceActiveView\("office"\)/);
  assert.match(sidebarSrc, /setWorkspaceActiveView\("mindmap"\)/);
  assert.match(sidebarSrc, /setWorkspaceActiveView\("pipeline"\)/);

  // 4. The bar is only a view switcher: the roster strip moved into the Live
  // Office, so the bar keeps no member chips and reads no roster itself.
  assert.match(teamRosterSrc, /team-roster-container/);
  assert.match(teamRosterSrc, /workspace-view-segmented-tabs/);
  assert.doesNotMatch(teamRosterSrc, /team-member-chip/);
  assert.doesNotMatch(teamRosterSrc, /useZeusSquad/);
  assert.doesNotMatch(teamRosterSrc, /useSubagentsData/);

  // 5. Assign to Team lives in the office: picking a team rewrites the shared
  // active team, and the floor redraws from that team's roster.
  assert.match(pixelOfficeSrc, /TeamAssignPicker/);
  assert.match(pixelOfficeSrc, /office\.assignToTeam/);
  assert.match(pixelOfficeSrc, /setActiveTeamId/);
  assert.match(pixelOfficeSrc, /useSquadWorkspace\(\)/);
  assert.match(pixelOfficeSrc, /useZeusSquad\(\)/);

  // 6. Real project mindmap from MindmapTab reads .knowledge/ data (not static fake)
  assert.match(mindmapSrc, /loadKnowledgeData/);
  assert.match(mindmapSrc, /\.knowledge/);
  assert.match(mindmapSrc, /mindmap-container/);
  assert.match(mindmapSrc, /mindmap-canvas/);

  // 7. CSS styles are clean, responsive, and free of backdrop-filter
  assert.match(chatShellCss, /\.team-roster-container/);
  assert.match(chatShellCss, /\.workspace-view-segmented-tabs/);
  assert.doesNotMatch(chatShellCss, /\.team-member-chip/);
  assert.match(chatShellCss, /\.pixel-office-team-picker/);
  assert.match(chatShellCss, /\.dynamic-workspace-canvas/);
  assert.match(chatShellCss, /\.sidebar-workspace-views-nav/);
});
